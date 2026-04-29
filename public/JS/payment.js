document.addEventListener("DOMContentLoaded", () => {
  const btn = document.getElementById("buyPremiumBtn");

  btn.addEventListener("click", async () => {
    btn.disabled = true;
    btn.innerText = "Processing...";

    try {
      const token = localStorage.getItem("token");

      const res = await axios.post(
        "http://localhost:3000/payment/create-order",
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const paymentSessionId = res.data.payment_session_id;
      const orderId = res.data.order_id;

      localStorage.setItem("lastOrderId", orderId);

      window.cashfree.checkout({
  paymentSessionId,
  redirectTarget: "_modal",
}).then(() => {
  const orderId = localStorage.getItem("lastOrderId");
  setTimeout(() => {
    checkPaymentStatus(orderId);
  }, 3000);
});

    } catch (err) {
      console.log(err);
      alert("Payment failed to start");
    } finally {
      btn.disabled = false;
      btn.innerText = "Buy Premium";
    }
  });
});


    
async function checkPaymentStatus(orderId) {
  try {
    const token = localStorage.getItem("token");
    const btn = document.getElementById("buyPremiumBtn");
    const res = await axios.get(
      `http://localhost:3000/payment/status/${orderId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const status = res.data.status;
    console.log("STATUS:", status);

    if (status === "SUCCESS") {
      alert("🎉 Payment Successful!");

      
      btn.style.display="none"
      const msg = document.getElementById("premiumMessage");
      msg.style.display = "block"; 
      localStorage.setItem("isPremiumTemp", "true");

    
    } 
    else if (status === "FAILED") {
      alert("❌ Payment Failed");
    } 
    else {
      alert("⏳ Payment is still processing. Please refresh later.");
    }

  } catch (err) {
    console.log("Status Error:", err.response?.data || err.message);
  }
}


