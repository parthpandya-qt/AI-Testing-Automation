"use client";

import { Mail, MessageSquare, ArrowUpRight, HelpCircle, Send } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useState, useContext } from "react";
import { UserDetailContext } from "@/context/userDetailContext";

export default function Support() {
  const context = useContext(UserDetailContext);
  const userDetails = context?.userDetails;
  const userId = userDetails?.id;

  const [subject, setSubject] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject || !category || !description) return;

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/support-chat/support-ticket", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId,
          subject,
          category,
          description,
        }),
      });

      if (res.ok) {
        alert("Support request submitted successfully. We'll be in touch soon!");
        setSubject("");
        setCategory("");
        setDescription("");
      } else {
        alert("Failed to submit ticket. Please try again.");
      }
    } catch (err) {
      console.error("Support ticket submit error:", err);
      alert("An error occurred while submitting your ticket.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="py-8 sm:py-12">
      <div className="container mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800/80 text-blue-600 dark:text-blue-400 text-xs font-semibold tracking-wide uppercase mb-3">
            <HelpCircle className="w-3.5 h-3.5" />
            24/7 Dedicated Assistance
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
            Support Center
          </h1>
          <p className="mt-3 text-base text-slate-600 dark:text-slate-400 leading-relaxed">
            Need assistance with test generation, billing, or repository integrations? Our engineering team is here to help.
          </p>
        </div>

        {/* Support Cards */}
        <div className="grid gap-6 sm:grid-cols-2 mb-12">
          {/* Email Support Card */}
          <div className="group relative overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/70 p-6 sm:p-7 shadow-xs hover:shadow-md transition-all duration-300">
            <div className="flex flex-col h-full justify-between">
              <div>
                <div className="inline-flex rounded-xl bg-blue-50 dark:bg-blue-950/60 p-3 text-blue-600 dark:text-blue-400">
                  <Mail className="h-6 w-6" />
                </div>
                <h3 className="mt-4 text-lg font-bold text-slate-900 dark:text-slate-100 tracking-tight">
                  Email Support
                </h3>
                <p className="mt-1.5 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  Prefer writing things out? Send us an inquiry and our team will get back to you within 24 hours.
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800/80">
                <a
                  href="mailto:ppandya573@gmail.com"
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
                >
                  <span>ppandya573@gmail.com</span>
                  <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </a>
              </div>
            </div>
          </div>

          {/* Live Chat Card */}
          <div className="group relative overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/70 p-6 sm:p-7 shadow-xs hover:shadow-md transition-all duration-300">
            <div className="flex flex-col h-full justify-between">
              <div>
                <div className="inline-flex rounded-xl bg-emerald-50 dark:bg-emerald-950/60 p-3 text-emerald-600 dark:text-emerald-400">
                  <MessageSquare className="h-6 w-6" />
                </div>
                <h3 className="mt-4 text-lg font-bold text-slate-900 dark:text-slate-100 tracking-tight">
                  Live Chat
                </h3>
                <p className="mt-1.5 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  Got urgent workspace questions? Tap the live chat bubble in the bottom right for instant AI-assisted guidance.
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800/80">
                <span className="inline-flex items-center gap-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  Support agents online
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Ticket Form Section */}
        <div className="max-w-2xl mx-auto mb-14">
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/70 p-6 sm:p-8 shadow-xs">
            <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100 mb-1">
              Submit a Support Request
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
              Fill out the details below and our team will investigate promptly.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                  Subject
                </label>
                <input
                  type="text"
                  required
                  placeholder="Brief summary of the issue..."
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/60 px-4 py-2.5 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                  Category
                </label>
                <select
                  required
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/60 px-4 py-2.5 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition cursor-pointer"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  <option value="">Select Category</option>
                  <option value="billing">Billing & Subscriptions</option>
                  <option value="repository">Repository Connection</option>
                  <option value="testing">Test Generation & Execution</option>
                  <option value="bug">Bug Report</option>
                  <option value="other">Other Inquiry</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                  Description
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Provide any relevant context, repository name, or error messages..."
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/60 px-4 py-2.5 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition resize-y"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 dark:bg-blue-600 hover:bg-slate-800 dark:hover:bg-blue-500 text-white font-medium text-sm px-6 py-2.5 shadow-sm transition-colors duration-200 disabled:opacity-60 cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span>{isSubmitting ? "Submitting..." : "Submit Ticket"}</span>
              </button>
            </form>
          </div>
        </div>

        {/* Frequently Asked Questions */}
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
              Frequently Asked Questions
            </h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Quick answers to common questions about Automate-Testing.io
            </p>
          </div>

          <Accordion
            type="single"
            collapsible
            defaultValue="repo"
            className="w-full space-y-2.5"
          >
            <AccordionItem
              value="repo"
              className="border border-slate-200 dark:border-slate-800 rounded-xl px-5 py-1 bg-white dark:bg-slate-900/60 transition-colors shadow-xs"
            >
              <AccordionTrigger className="text-sm sm:text-base font-semibold text-slate-900 dark:text-slate-100 hover:text-blue-600 dark:hover:text-blue-400 text-left">
                How do I connect my GitHub repository?
              </AccordionTrigger>
              <AccordionContent className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed pt-1 pb-3">
                Navigate to your Workspace dashboard and click "Connect GitHub" or "Setup". Authorize the Automate-Testing GitHub App, grant access to your target repositories, and they will automatically sync to your workspace.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem
              value="ai-tests"
              className="border border-slate-200 dark:border-slate-800 rounded-xl px-5 py-1 bg-white dark:bg-slate-900/60 transition-colors shadow-xs"
            >
              <AccordionTrigger className="text-sm sm:text-base font-semibold text-slate-900 dark:text-slate-100 hover:text-blue-600 dark:hover:text-blue-400 text-left">
                How does AI generate test cases?
              </AccordionTrigger>
              <AccordionContent className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed pt-1 pb-3">
                Our AI inspects your code structure, controllers, endpoints, and frontend components to synthesize comprehensive unit, integration, and E2E test suites with high assertion accuracy.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem
              value="pricing"
              className="border border-slate-200 dark:border-slate-800 rounded-xl px-5 py-1 bg-white dark:bg-slate-900/60 transition-colors shadow-xs"
            >
              <AccordionTrigger className="text-sm sm:text-base font-semibold text-slate-900 dark:text-slate-100 hover:text-blue-600 dark:hover:text-blue-400 text-left">
                Can I upgrade or downgrade my plan later?
              </AccordionTrigger>
              <AccordionContent className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed pt-1 pb-3">
                Yes, you can upgrade your plan or top up test credits at any time directly from the Pricing section. Upgrades take effect immediately.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem
              value="execution"
              className="border border-slate-200 dark:border-slate-800 rounded-xl px-5 py-1 bg-white dark:bg-slate-900/60 transition-colors shadow-xs"
            >
              <AccordionTrigger className="text-sm sm:text-base font-semibold text-slate-900 dark:text-slate-100 hover:text-blue-600 dark:hover:text-blue-400 text-left">
                How long does test generation take?
              </AccordionTrigger>
              <AccordionContent className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed pt-1 pb-3">
                Most repositories are analyzed in 10 to 30 seconds. Larger multi-package monorepos may take slightly longer depending on the number of source files analyzed.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem
              value="support"
              className="border border-slate-200 dark:border-slate-800 rounded-xl px-5 py-1 bg-white dark:bg-slate-900/60 transition-colors shadow-xs"
            >
              <AccordionTrigger className="text-sm sm:text-base font-semibold text-slate-900 dark:text-slate-100 hover:text-blue-600 dark:hover:text-blue-400 text-left">
                How can I contact support directly?
              </AccordionTrigger>
              <AccordionContent className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed pt-1 pb-3">
                You can reach us through email at ppandya573@gmail.com, via the support ticket form above, or through the real-time AI support widget.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </div>
    </section>
  );
}
