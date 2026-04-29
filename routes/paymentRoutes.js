const express =require("express")
const { createOrder, verifyPayment,getPaymentStatus }=require("../controllers/payment")
const auth = require("../middleware/authMiddleware"); // 👈 ADD THIS
const { webhook } = require("../controllers/webhookController");
const router = express.Router();

router.post("/create-order", auth, createOrder); // 👈 FIXED
router.get("/verify/:order_id", auth, verifyPayment);

router.post("/webhook", webhook);

router.get("/status/:order_id", getPaymentStatus);


module.exports=router;