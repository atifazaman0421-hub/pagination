const userTable=require("../Models/usersTable")
const forgotPasswordRequestTable=require("../Models/ForgotPasswordRequests")
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");


require("dotenv").config()
const SibApiV3Sdk = require("sib-api-v3-sdk");
const client = SibApiV3Sdk.ApiClient.instance;
const apiKey = client.authentications["api-key"];
apiKey.apiKey = process.env.FORGOT_PASSWORD_API;



const addUser=async(req,res)=>{
  try {
     const {name,email,password}=req.body
      if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }
    const emailNormalized = email.toLowerCase();

 const checkEmail=await userTable.findOne({where:{
     email: emailNormalized 
}})

if(checkEmail){
    return res.status(400).json({ message: "Email already exists" });
}
const hashedPassword = await bcrypt.hash(password.trim(), 10);
const newUser = await userTable.create({
            name,
            email:emailNormalized,
            password:hashedPassword
        });

        res.status(201).json({message: "User created successfully"});

  } catch (error) {
     res.status(500).json({ error: error.message });
  }  
}

const checkUser = async (req, res) => {
  try {
    console.log("LOGIN API HIT");
console.log("REQ BODY:", req.body);
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const emailNormalized = email.trim().toLowerCase();

    const user = await userTable.findOne({
      where: { email: emailNormalized }
    });

    const INVALID_MSG = "Invalid email or password";

    if (!user) {
      return res.status(401).json({ message: INVALID_MSG });
    }
console.log("USER:", user);
console.log("PASSWORD IN DB:", user.password);
    const isMatch = await bcrypt.compare(password.trim(), user.password);
    console.log("Match:", isMatch);
    if (!isMatch) {
      return res.status(401).json({ message: INVALID_MSG });
    }
  

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
         isPremium: user.isPremium
      },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    return res.status(200).json({
      success: true,
      message: "Login successful",
      data: {
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email
        }
      }
    });

  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await userTable.findOne({
      where: { email: email.toLowerCase() }
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

   const request= await forgotPasswordRequestTable.create({
        userId:user.id,
         isActive: true,
         expiresAt: new Date(Date.now() + 15 * 60 * 1000) 
      })

    const resetLink = `https://surfer-leggings-lurch.ngrok-free.dev/HTML/reset.html?token=${request.id}`;

    const tranEmailApi = new SibApiV3Sdk.TransactionalEmailsApi();

    try {
  
      const result = await tranEmailApi.sendTransacEmail({
        sender: {
          email: "atifazaman444@gmail.com",
          name: "MyDailyExpenses"
        },
        to: [{ email: user.email }],
        subject: "Reset Password",
        htmlContent: `
          <h3>Reset Password</h3>
          <a href="${resetLink}">Reset Password</a>
        `
      });

      console.log("EMAIL SENT:", result);

    } catch (error) {
      console.log("EMAIL ERROR:", error.response?.body || error.message);
    }

    return res.status(200).json({
      message: "Reset email sent successfully"
    });

  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message });
  }
};
const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    const request = await forgotPasswordRequestTable.findOne({
      where: { id: token, isActive: true }
    });

    if (!request) {
      return res.status(400).json({ message: "Invalid or expired link" });
    }

    const user = await userTable.findByPk(request.userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const hashedPassword = await bcrypt.hash(newPassword.trim(), 10);

    user.password = hashedPassword;
    await user.save();

    
    request.isActive = false;
    await request.save();

    res.status(200).json({
      message: "Password reset successful"
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
module.exports={
    addUser,checkUser,resetPassword,forgotPassword
}