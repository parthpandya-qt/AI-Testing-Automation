"use client";

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function UpgradeButton() {
  const handlePayment = async () => {
    const script = document.createElement("script");

    script.src =
      "https://checkout.razorpay.com/v1/checkout.js";

    script.onload = async () => {
      const res = await fetch(
        "/api/create-order",
        {
          method: "POST",
        }
      );

      const order = await res.json();

      const options = {
        key:
          process.env
            .NEXT_PUBLIC_RAZORPAY_KEY_ID,

        amount: order.amount,
        currency: order.currency,
        order_id: order.id,

        name: "AI Testing Automation",
        description: "Pro Plan",

        handler: async function (
          response: any
        ) {
          const verify = await fetch(
            "/api/verify-payment",
            {
              method: "POST",
              headers: {
                "Content-Type":
                  "application/json",
              },
              body: JSON.stringify(response),
            }
          );

          const result =
            await verify.json();

          if (result.success) {
            alert("Payment Successful");
          } else {
            alert("Verification Failed");
          }
        },
      };

      const payment =
        new window.Razorpay(options);

      payment.open();
    };

    document.body.appendChild(script);
  };

  return (
    <button
      onClick={handlePayment}
      className="rounded-lg bg-black px-4 py-2 text-white"
    >
      Upgrade Now
    </button>
  );
}