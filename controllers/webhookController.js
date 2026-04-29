const orderTable = require("../Models/orderModel");
const userTable = require("../Models/usersTable");

const webhook = async (req, res) => {
  try {
    const data = req.body;

    const orderId =
      data?.data?.order_id ||
      data?.data?.order?.order_id;

    const paymentStatus =
      data?.data?.payment_status ||
      data?.data?.payment?.payment_status;

    const paymentId =
      data?.data?.cf_payment_id ||
      data?.data?.payment?.cf_payment_id;

    if (!orderId) {
      return res.status(400).json({ error: "orderId missing" });
    }

    let status = "PENDING";

    if (paymentStatus === "SUCCESS" || paymentStatus === "PAID") {
      status = "SUCCESS";
        const order = await orderTable.findOne({ where: { orderId } });

  if (order) {
    await userTable.update(
      { isPremium: true },
      { where: { id: order.userId } }
    );
  }
    } else if (paymentStatus === "FAILED") {
      status = "FAILED";
    }

    const result = await orderTable.update(
      {
        status,
        paymentId,
      },
      {
        where: { orderId },
      }
    );

    return res.json({ received: true });

  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err.message });
  }
};

module.exports = { webhook };