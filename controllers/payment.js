// controllers/paymentController.js

const { Cashfree, CFEnvironment }=require("cashfree-pg")

const cashfree = new Cashfree(
  CFEnvironment.SANDBOX,
   process.env.CASHFREE_APP_ID,
  process.env.CASHFREE_SECRET_KEY
);
const orderTable=require("../Models/orderModel")
const createOrder = async (req, res) => {
  try {
      const orderId = "order_" + Date.now();
    const request = {
      order_amount: 100.0,
      order_currency: "INR",
      order_id:orderId,
      customer_details: {
        customer_id: `user_${req.user.id}`,
        customer_phone: "8135962614",
      },
      order_meta: {
        return_url: "http://localhost:3000/payment-success?order_id={order_id}",
      },
    };

    const response = await cashfree.PGCreateOrder(request);

     await orderTable.create({
  userId: req.user.id,
  orderId: orderId,
  amount: request.order_amount,
  currency: request.order_currency,
  status: "PENDING", // ✅ FIXED (NOT CREATED)
  paymentId: null,
});
    res.json(response.data);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
};

const verifyPayment = async (req, res) => {
  try {
    const { order_id } = req.params;

    const response = await cashfree.PGOrderFetchPayments(order_id);

    console.log("CASHFREE RESPONSE:", JSON.stringify(response.data, null, 2));

    const paymentStatus =
      response.data?.payments?.[0]?.payment_status ||
      response.data?.order_status;

    console.log("EXTRACTED STATUS:", paymentStatus);

    if (paymentStatus === "SUCCESS" || paymentStatus === "PAID") {
      const result = await orderTable.update(
        { status: "SUCCESS" },
        { where: { orderId: order_id } }
      );

      console.log("UPDATE RESULT:", result);

        const order = await orderTable.findOne({ where: { orderId: order_id } });

  if (order) {
    await userTable.update(
      { isPremium: true },
      { where: { id: order.userId } }
    );
  }

    }

    if (paymentStatus === "FAILED") {
      await orderTable.update(
        { status: "FAILED" },
        { where: { orderId: order_id } }
      );
    }

    return res.json(response.data);

  } catch (error) {
    console.log(error?.response?.data || error.message);
    res.status(500).json({ message: error.message });
  }
};
const getPaymentStatus = async (req, res) => {
  try {
    const orderId = req.params.order_id;

    const order = await orderTable.findOne({
      where: { orderId },
    });

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    return res.json({
      status: order.status,
      paymentId: order.paymentId,
    });

  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};



module.exports={
  createOrder,verifyPayment,getPaymentStatus
}