"use client";

import { Check } from "lucide-react";
import UpgradeButton from "@/components/custom/UpgradeButton";
import { UserDetailContext } from "@/context/userDetailContext";
import { useContext, useEffect, useState } from "react";

const plans = [
  {
    name: "Free",
    price: "$0",
    description: "Perfect for individuals getting started.",
    features: [
      "1 Repository",
      "100 Test Cases",
      "Less Storage",
      "Basic AI Analysis",
      "Community Support",
    ],
  },
  {
    name: "Pro",
    price: "$9.99",
    description: "Best for developers and small teams.",
    features: [
      "Unlimited Repositories",
      "1000 Test Cases",
      "Advanced AI Analysis",
      "GitHub Integration",
      "Priority Support",
    ],
  },
  {
    name: "Enterprise",
    price: "Custom",
    description: "For organizations with advanced needs.",
    features: [
      "Unlimited Everything",
      "Custom AI Models",
      "Dedicated Infrastructure",
      "SSO Authentication",
      "24/7 Premium Support",
    ],
  },
];

export default function PricingComponent() {
  const { userDetail } = useContext(UserDetailContext);
  const userId = userDetail?.id;

  const [planStored, setPlan] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    const getPlan = async () => {
      try {
        const res = await fetch(
          `/api/users/plan?id=${userId}`
        );

        if (!res.ok) {
          throw new Error(
            "Failed to fetch plan"
          );
        }

        const data = await res.json();

        setPlan(data.plan);

        console.log(
          "Current Plan:",
          data.plan
        );
      } catch (error) {
        console.error(
          "Error fetching user plan:",
          error
        );
      } finally {
        setLoading(false);
      }
    };

    getPlan();
  }, [userId]);

  return (
    <section className="py-5">
      <div className="mx-auto max-w-5xl px-6">
        {/* Header */}
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <h2 className="text-4xl font-bold tracking-tight text-slate-900">
            Pricing Plans
          </h2>

          <p className="mt-3 text-slate-600">
            Choose the plan that best fits your
            testing automation workflow.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid gap-6 md:grid-cols-3">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
            >
              <h3 className="text-xl font-bold text-slate-900">
                {plan.name}
              </h3>

              <p className="mt-2 text-sm text-slate-600">
                {plan.description}
              </p>

              <div className="mt-6 flex items-end">
                <span className="text-4xl font-extrabold text-slate-900">
                  {plan.price}
                </span>

                {plan.price !== "Custom" && (
                  <span className="mb-1 ml-2 text-sm text-slate-500">
                    /month
                  </span>
                )}
              </div>

              <ul className="mt-6 space-y-3">
                {plan.features.map((feature) => (
                  <li
                    key={feature}
                    className="flex items-center gap-2"
                  >
                    <Check className="h-4 w-4 text-green-600" />
                    <span className="text-sm text-slate-700">
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>

              <div className="mt-8">
                {/* FREE PLAN */}
                {plan.name === "Free" && (
                  <button
                    disabled={
                      loading ||
                      planStored === "free"
                    }
                    className={
                      planStored === "free"
                        ? "w-full rounded-lg bg-gray-500 py-2.5 text-sm font-semibold text-white cursor-not-allowed"
                        : "w-full rounded-lg bg-slate-900 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-slate-800"
                    }
                  >
                    {loading
                      ? "Checking Subscription..."
                      : planStored === "free"
                      ? "Current Plan"
                      : "Included Plan"}
                  </button>
                )}

                {/* PRO PLAN */}
                {plan.name === "Pro" && (
                  <UpgradeButton
                    planStored={planStored}
                    disable={loading}
                  />
                )}

                {/* ENTERPRISE PLAN */}
                {plan.name === "Enterprise" && (
                  <button
                    disabled={
                      loading ||
                      planStored === "enterprise"
                    }
                    className={
                      planStored === "enterprise"
                        ? "w-full rounded-lg bg-gray-500 py-2.5 text-sm font-semibold text-white cursor-not-allowed"
                        : "w-full rounded-lg bg-slate-900 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-slate-800"
                    }
                    onClick={() => {
                      console.log(
                        "Enterprise plan clicked"
                      );
                    }}
                  >
                    {loading
                      ? "Checking Subscription..."
                      : planStored ===
                        "enterprise"
                      ? "Current Plan"
                      : "Talk to Sales"}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-10 text-center">
          <p className="text-sm text-slate-500">
            Need a custom solution?
            Contact our sales team for
            enterprise pricing and
            dedicated support.
          </p>
        </div>
      </div>
    </section>
  );
}