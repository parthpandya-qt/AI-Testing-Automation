"use client";

import { Mail, MessageSquare } from "lucide-react";
import {
Accordion,
AccordionContent,
AccordionItem,
AccordionTrigger,
} from "@/components/ui/accordion";
import { useState } from "react";
import { UserDetailContext } from "@/context/userDetailContext";
import { useContext} from "react";
import { ArrowUpRight } from "lucide-react";
export default function Support() {
 const context = useContext(UserDetailContext);
  const userDetails = context?.userDetails;
  const userId = userDetails?.id;
  const [subject, setSubject] =
  useState("");

const [category, setCategory] =
  useState("");

const [description, setDescription] =
  useState("");

  const handleSubmit = async (
  e: React.FormEvent
) => {
  e.preventDefault();

  const res = await fetch(
    "/api/support-chat/support-ticket",
    {
      method: "POST",
      headers: {
        "Content-Type":
          "application/json",
      },
      body: JSON.stringify({
        userId,
        subject,
        category,
        description
        
      }),
    }
  );

  if (res.ok) {
    alert(
      "Support request submitted successfully."
    );

    setSubject("");
    setCategory("");
    setDescription("");
  }
};
return ( <section className="py-5"> <div className="container mx-auto max-w-5xl px-6">
{/* Header */} <div className="text-center"> <h1 className="text-4xl font-bold">Support Center</h1>


      <p className="mt-3 text-slate-600">
        Need help? Contact our team and we'll get back to you quickly.
      </p>
    </div>

    {/* Support Cards */}
    


    <div className="mt-6 grid gap-6 sm:grid-cols-2">
      
      {/* Email Support Card */}
      <div className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-blue-500/5">
        <div className="flex flex-col h-full justify-between">
          <div>
            <div className="inline-flex rounded-xl bg-blue-50 p-3 text-blue-600 transition-colors group-hover:bg-blue-100">
              <Mail className="h-6 w-6" />
            </div>
            <h3 className="mt-4 text-lg font-bold text-slate-900 tracking-tight">
              Email Support
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              Prefer writing things out? Send us an email and we'll get right back to you.
            </p>
          </div>
          
          <div className="mt-6">
            <a 
              href="mailto:ppandya573@gmail.com" 
              className="inline-flex items-center gap-1 text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors"
            >
              ppandya573@gmail.com
              <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </a>
          </div>
        </div>
      </div>

      {/* Live Chat Card */}
      <div className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-emerald-500/5">
        <div className="flex flex-col h-full justify-between">
          <div>
            <div className="inline-flex rounded-xl bg-emerald-50 p-3 text-emerald-600 transition-colors group-hover:bg-emerald-100">
              <MessageSquare className="h-6 w-6" />
            </div>
            <h3 className="mt-4 text-lg font-bold text-slate-900 tracking-tight">
              Live Chat
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              Got urgent workspace blockers? Connect instantly with our dedicated support agents.
            </p>
          </div>

          <div className="mt-6">
            <button className="inline-flex items-center justify-center w-full sm:w-auto rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition duration-200 hover:bg-slate-800 focus:outline-none ">
              Start Chat
            </button>
          </div>
        </div>
      </div>

    </div>
  


    {/* FAQ Section */}
    <div className="mt-10 flex flex-col items-center gap-4">
      

      <form
      onSubmit={handleSubmit}
  className="mt-4 w-full max-w-2xl rounded-2xl border bg-white p-6 shadow-sm"
>
  <h3 className="mb-4 text-xl font-semibold">
    Submit a Support Request
  </h3>

  <div className="space-y-4">
    <input
      type="text"
      placeholder="Subject"
      className="w-full rounded-lg border p-3"
      value={subject}
      onChange={(e) =>setSubject(e.target.value)}
    />

    <select
      className="w-full rounded-lg border p-3"
      value={category}
      onChange={(e) =>setCategory(e.target.value)}
    >
      <option value="">
        Select Category
      </option>

      <option value="billing">
        Billing
      </option>

      <option value="repository">
        Repository
      </option>

      <option value="testing">
        Test Generation
      </option>

      <option value="bug">
        Bug Report
      </option>

      <option value="other">
        Other
      </option>
    </select>

    <textarea
      rows={5}
      placeholder="Describe your issue..."
      className="w-full rounded-lg border p-3"
      value={description}
      onChange={(e) => setDescription(e.target.value)}
    />

    <button
      type="submit"
      className="rounded-lg bg-slate-900 px-4 py-2 text-white transition hover:bg-slate-800"
    >
      Submit Ticket
    </button>
  </div>
</form>
      <h2 className="text-2xl font-bold mt-8">
        Frequently Asked Questions
      </h2>  
      <Accordion
        type="single"
        collapsible
        defaultValue="repo"
        className="mt-1 w-full max-w-2xl"
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
