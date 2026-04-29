require("dotenv").config();
const express=require("express")
const cors=require("cors")
const app=express()
const db=require("./Utils/db-connection")
const expenseTable=require("./Models/expensetrackertable")
const userTable=require("./Models/usersTable")
const orderTable=require("./Models/orderModel")
const forgotPasswordTable=require("./Models/ForgotPasswordRequests")
const expenseRouter=require("./routes/expenseRoutes")
const userRouter=require("./routes/signUpRoute")
const paymentRouter = require("./routes/paymentRoutes");
const aiRouter=require("./routes/ai")



userTable.hasMany(expenseTable)
expenseTable.belongsTo(userTable)

userTable.hasMany(orderTable);
orderTable.belongsTo(userTable);

userTable.hasMany(forgotPasswordTable)
forgotPasswordTable.belongsTo(userTable)

app.use(cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"))

app.use("/user",userRouter)
app.use("/expensetracker",expenseRouter)
app.use("/payment", paymentRouter);
app.use("/ai",aiRouter)

db.sync({force:false}).then(()=>{
app.listen(3000,()=>{
    console.log("Server is running")
})
}).catch((err)=>console.log(err))

