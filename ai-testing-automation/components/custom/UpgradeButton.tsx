"use client";

import toast from "react-hot-toast";

declare global {
  interface Window {
    Razorpay: any;
  }
}

type UpgradeButtonProps = {
  planStored: string | null;
  disable: boolean;
};

export default function UpgradeButton({
  planStored,
  disable,
}: UpgradeButtonProps) {
  const handlePayment = async () => {
    try {
      const script = document.createElement("script");

      script.src =
        "https://checkout.razorpay.com/v1/checkout.js";

      script.onload = async () => {
        try {
          const res = await fetch(
            "/api/create-order",
            {
              method: "POST",
            }
          );

          if (!res.ok) {
            throw new Error(
              "Failed to create order"
            );
          }

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

            handler: async (
              response: any
            ) => {
              try {
                const verify =
                  await fetch(
                    "/api/verify-payment",
                    {
                      method: "POST",
                      headers: {
                        "Content-Type":
                          "application/json",
                      },
                      body: JSON.stringify(
                        response
                      ),
                    }
                  );

                const result =
                  await verify.json();

                if (
                  result.success
                ) {
                  toast.success(
                    "Payment Successful! Upgraded to Pro."
                  );

                  setTimeout(() => {
                    window.location.reload();
                  }, 1000);
                } else {
                  toast.error(
                    result.error || "Payment Verification Failed"
                  );
                }
              } catch (error: any) {
                console.error(
                  error
                );
                toast.error(
                  error?.message || "Something went wrong during verification"
                );
              }
            },

            theme: {
              color: "#0f172a",
            },
          };

          const payment =
            new window.Razorpay(
              options
            );

          payment.open();
        } catch (error: any) {
          console.error(error);

          toast.error(
            error?.message || "Unable to create payment order"
          );
        }
      };

      script.onerror = () => {
        toast.error(
          "Failed to load Razorpay SDK"
        );
      };

      document.body.appendChild(
        script
      );
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <button
      disabled={
        disable ||
        planStored === "pro"
      }
      onClick={handlePayment}
      className={
        disable ||
        planStored === "pro"
          ? "w-full rounded-lg bg-slate-900 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-slate-800"
          : "w-full rounded-lg bg-slate-900 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-slate-800"
      }
    >
      {disable
        ? "Checking Subscription..."
        : planStored === "pro"
        ? "Current Plan"
        : "Upgrade to Pro"}
    </button>
  );
}