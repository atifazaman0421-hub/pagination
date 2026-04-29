const express=require("express")
const userRoute=express.Router()
const userController=require("../controllers/signUp.Controller")


userRoute.post("/signup",userController.addUser)
userRoute.post("/login",userController.checkUser)

userRoute.post("/password/forgotpassword", userController.forgotPassword);
userRoute.post("/password/resetpassword", userController.resetPassword);

module.exports=userRoute