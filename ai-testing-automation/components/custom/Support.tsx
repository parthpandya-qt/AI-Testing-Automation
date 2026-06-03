"use client";

import { Mail, MessageSquare } from "lucide-react";
import {
Accordion,
AccordionContent,
AccordionItem,
AccordionTrigger,
} from "@/components/ui/accordion";

export default function Support() {
return ( <section className="py-5"> <div className="container mx-auto max-w-5xl px-6">
{/* Header */} <div className="text-center"> <h1 className="text-4xl font-bold">Support Center</h1>


      <p className="mt-3 text-slate-600">
        Need help? Contact our team and we'll get back to you quickly.
      </p>
    </div>

    {/* Support Cards */}
    <div className="mt-12 grid gap-6 md:grid-cols-2">
      <div className="rounded-2xl border bg-white p-6 shadow-sm">
        <Mail className="h-8 w-8 text-blue-600" />

        <h3 className="mt-4 text-lg font-semibold">
          Email Support
        </h3>

        <p className="mt-2 text-slate-600">
          ppandya573@gmail.com
        </p>
      </div>

      <div className="rounded-2xl border bg-white p-6 shadow-sm">
        <MessageSquare className="h-8 w-8 text-green-600" />

        <h3 className="mt-4 text-lg font-semibold">
          Live Chat
        </h3>

        <button className="mt-3 rounded-lg bg-slate-900 px-4 py-2 text-white transition hover:bg-slate-800">
          Start Chat
        </button>
      </div>
    </div>

    {/* FAQ Section */}
    <div className="mt-10 flex flex-col items-center gap-4">
      <h2 className="text-3xl font-bold">
        Frequently Asked Questions
      </h2>

    

      <Accordion
        type="single"
        collapsible
        defaultValue="repo"
        className="mt-6 w-full max-w-2xl"
      >
        <AccordionItem value="repo">
          <AccordionTrigger>
            How do I connect my GitHub repository?
          </AccordionTrigger>

          <AccordionContent>
            Navigate to your workspace dashboard and click
            "Connect Repository". Authorize GitHub access and
            select the repository you want to analyze.
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="ai-tests">
          <AccordionTrigger>
            How does AI generate test cases?
          </AccordionTrigger>

          <AccordionContent>
            Our AI analyzes your codebase and application
            structure to automatically generate meaningful
            test cases based on your project logic.
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="pricing">
          <AccordionTrigger>
            Can I upgrade or downgrade my plan later?
          </AccordionTrigger>

          <AccordionContent>
            Yes. You can change your subscription plan at any
            time from the billing section of your account.
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="execution">
          <AccordionTrigger>
            How long does test generation take?
          </AccordionTrigger>

          <AccordionContent>
            Most repositories are analyzed within a few minutes.
            Larger projects may take slightly longer depending
            on their size and complexity.
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="support">
          <AccordionTrigger>
            How can I contact support?
          </AccordionTrigger>

          <AccordionContent>
            You can reach our support team through email or live
            chat. We typically respond within 24 hours during
            business days.
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  </div>
</section>


);
}
