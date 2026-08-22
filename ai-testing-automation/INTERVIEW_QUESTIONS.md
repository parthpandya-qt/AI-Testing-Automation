# 🤖 AI Testing Automation — Technical & Behavioral Interview Guide

> **Prepared for Interview Preparation**  
> **Project Name**: AI Testing Automation Platform (`ai-testing-automation`)  
> **Tech Stack**: Next.js 16 (App Router), React 19, TypeScript, Drizzle ORM, Neon PostgreSQL Serverless, Clerk Auth, Google GenAI (`@google/genai` Gemini 2.5 Flash), Browserbase SDK (`@browserbasehq/sdk`), Playwright Core (`playwright-core`), Stripe & Razorpay, Tailwind CSS v4, Recharts.

---

## 📑 Table of Contents
1. [1-Minute Elevator Pitch](#1-1-minute-elevator-pitch)
2. [High-Level Architecture & Tech Stack Q&A](#2-high-level-architecture--tech-stack-qa)
3. [Deep-Dive Business Logic & AI Pipeline](#3-deep-dive-business-logic--ai-pipeline)
4. [Cloud Browser Automation & Playwright Engine Q&A](#4-cloud-browser-automation--playwright-engine-qa)
5. [Database & Schema Architecture Q&A (Drizzle + Neon)](#5-database--schema-architecture-qa-drizzle--neon)
6. [Payment, Subscription & Credit System Q&A](#6-payment-subscription--credit-system-qa)
7. [Security, Authentication & Data Integrity](#7-security-authentication--data-integrity)
8. [System Design & Scalability Interview Scenarios](#8-system-design--scalability-interview-scenarios)
9. [Numerical & Algorithmic Tracing Q&A](#9-numerical--algorithmic-tracing-qa)
10. [Behavioral & Technical HR Q&A](#10-behavioral--technical-hr-qa)

---

## 1. 1-Minute Elevator Pitch

**Q: "Can you tell me about your AI Testing Automation project?"**

> *"AI Testing Automation is an end-to-end, AI-driven QA testing platform that automatically analyzes web codebase repositories, generates structured E2E test cases, and executes headful browser automation tests in the cloud.*
> 
> *I built it using **Next.js 16 (App Router)**, **React 19**, **TypeScript**, **Drizzle ORM**, and **Neon PostgreSQL Serverless**. Key highlights include:*
> 1. *An **AI Repository Analyzer** using **Google Gemini 2.5 Flash** (`@google/genai`) that fetches recursive GitHub tree structures, filters out build artifacts/binaries, extracts key source code files, and generates structured QA test suites via forced JSON Schemas.*
> 2. *A **Cloud Execution Engine** powered by **Browserbase SDK** and **Playwright Core** (`chromium.connectOverCDP`) that dynamically synthesizes TypeScript automation scripts, runs live browser sessions on target domains, captures console logs, and embeds video playback URLs (`sessionUrl`).*
> 3. *A **Dual Payment & Credit Engine** integrated with **Stripe** and **Razorpay** that manages subscription tiers (Free, Starter, Pro) and deducts usage credits per AI scan and test execution.*
> 
> *It solves real-world developer pain points like manual QA writing, flaky test maintainability, and local browser environment setup."*

---

## 2. High-Level Architecture & Tech Stack Q&A

### Q1: Why did you choose Drizzle ORM with Neon Serverless Postgres over Prisma or raw SQL?
**Answer:**
* **Serverless HTTP Driver Compatibility:** Neon PostgreSQL (`@neondatabase/serverless`) operates over HTTP/WebSocket connection pools, perfectly matching Next.js serverless and edge functions.
* **Type-Safety with Zero Overhead:** Drizzle ORM provides 100% TypeScript type safety with zero runtime bundle bloat and SQL-like transparent query generation.
* **Migration & Schema Control:** `drizzle-kit` (`db:generate`, `db:push`) allows fast, declarative schema syncs without heavy ORM migrations.

### Q2: What role does Next.js 16 App Router play in this project?
**Answer:**
* **Full-Stack Synergy:** Hosts admin dashboards (`/workspace`, `/report`, `/support`, `/pricing`) and secure API route handlers (`/api/generate-test-cases`, `/api/test-cases/run`, `/api/github`, `/api/user-repo`).
* **Server Components & Security:** Keeps secret keys (`GEMINI_API_KEY`, `BROWSERBASE_API_KEY`, `DATABASE_URL`, `STRIPE_SECRET_KEY`, `RAZORPAY_KEY_SECRET`) strictly on the server while streaming fast React 19 UI components.

### Q3: How is user authentication handled between Clerk and the database?
**Answer:**
* Authentication is managed by **Clerk** (`@clerk/nextjs`).
* In `lib/auth.ts`, the helper `getAuthUser()` inspects the current Clerk session user, extracts their primary email, and queries the Neon Postgres `users` table.
* If a newly authenticated Clerk user visits for the first time, `getAuthUser()` automatically registers them into the `users` table with default 1000 credits. In local development or automated test scenarios, a dev fallback creates a default test user.

---

## 3. Deep-Dive Business Logic & AI Pipeline

### Q4: How does the AI Repository Analyzer (`/api/generate-test-cases`) process a GitHub codebase?
**Answer:**
1. **Repository Authentication & Permission Check:** Verifies the user's encrypted `github_token` cookie and confirms user ownership in the `repositories` table.
2. **Recursive Tree Filtering (`getRepoTree`):** Fetches the repository directory tree via GitHub REST API (`recursive=1`) and filters paths:
   - Excludes noise: `node_modules`, `.next`, `build`, `dist`, `.git`, binary media (`.png`, `.mp4`).
   - Retains essential source files: `.tsx`, `.ts`, `.js`, `.json`, `package.json`, `app/`, `components/`, `lib/`. Caps at top 25 high-impact files.
3. **Source Code Extraction:** Reads file contents (up to 5,000 characters per file) using Base64 decoding.
4. **Structured Gemini Generation:** Calls `@google/genai` (Gemini 2.5 Flash) with an explicit `responseSchema` enforcing a JSON array format:
   ```json
   {
     "title": "User Authentication Flow Test",
     "description": "Verify user can log in with valid credentials",
     "type": "UI / Auth",
     "priority": "High",
     "targetRoute": "/sign-in",
     "targetFiles": ["app/sign-in/page.tsx", "lib/auth.ts"],
     "expectedResult": "Redirected to /workspace with valid session cookie"
   }
   ```
5. **Batch Database Storage & Credit Deduction:** Inserts generated test cases into `test_cases` table and atomically decrements `users.credits` by 10.

---

## 4. Cloud Browser Automation & Playwright Engine Q&A

### Q5: How does the Cloud Execution Engine (`/api/test-cases/run`) run tests via Browserbase and Playwright?
**Answer:**
1. **Test Case Retrieval:** Fetches target test record from `test_cases` and custom repository instructions from `repositories`.
2. **Playwright Script Synthesis:** Sends the test details and target source files to Gemini to synthesize a runnable Playwright TypeScript script utilizing standard browser selectors (`page.goto()`, `page.click()`, `page.fill()`, `expect()`).
3. **Browserbase Connection Over CDP:**
   ```typescript
   const session = await bb.sessions.create({ projectId: process.env.BROWSERBASE_PROJECT_ID });
   const browser = await chromium.connectOverCDP(session.connectUrl);
   const defaultContext = browser.contexts()[0];
   const page = defaultContext.pages()[0];
   ```
4. **Execution & Log Capture:** Executes navigation steps on the `baseUrl` (resolving IPv6 `localhost` to `127.0.0.1`), intercepts console output into `logs` (`jsonb`), and captures errors.
5. **Session URL Persistence:** Updates `test_cases` status (`passed` / `failed`), stores the Playwright script (`browserbaseScript`), execution logs (`logs`), and saves `sessionId` and live view/video URL `sessionUrl` (`https://www.browserbase.com/sessions/...`).

---

## 5. Database & Schema Architecture Q&A (Drizzle + Neon)

### Q6: Explain the Database Schema design (`db/schema.ts`).
**Answer:**
The schema consists of 4 main tables:
1. **`users`**: Manages user accounts, subscription tier (`plan`), credit balance (`credits`), and subscriber emails array (`subscriberEmails` as `text[].array()`).
2. **`repositories`**: Stores connected GitHub repositories (`repoId` as `bigint`), `fullName`, `defaultBranch`, `targetDomain`, and `globalInstruction` for AI customization.
3. **`test_cases`**: Core entity storing test `title`, `type`, `priority`, `targetRoute`, `targetFiles` (`jsonb`), `browserbaseScript`, execution `status`, `logs` (`jsonb`), `sessionId`, and `sessionUrl`.
4. **`support_tickets`**: Tracks user support requests with `category`, `subject`, and `status`.

---

## 6. Payment, Subscription & Credit System Q&A

### Q7: How does the dual payment model (Stripe & Razorpay) work?
**Answer:**
* **Stripe (`/api/create-order`, `/api/verify-payment`)**: Handles international USD transactions for subscription plans (Starter / Pro) and credit top-ups using Stripe Checkout & Payment Intents.
* **Razorpay (`lib/razorpay.ts`)**: Supports domestic INR transactions with Razorpay Orders API and HMAC-SHA256 signature verification.
* **Credit Consumption**: Users consume credits upon generating test suites (10 credits per scan) and running cloud browser sessions (20 credits per execution). Refills are updated directly in `users.credits`.

---

## 7. Security, Authentication & Data Integrity

### Q8: How do you secure API routes and prevent cross-tenant data access?
**Answer:**
* **Clerk Session Verification:** Every API route verifies `getAuthUser()`. Unauthenticated requests immediately return HTTP `401 Unauthorized`.
* **Repository Ownership Check:** When generating or running test cases, queries check:
  ```typescript
  const repoCheck = await db.select().from(repositories)
    .where(and(eq(repositories.repoId, Number(repoId)), eq(repositories.userId, user.id)));
  if (repoCheck.length === 0) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  ```
* **Cookie Isolation:** GitHub tokens are scoped per user using user-specific cookie keys (`github_token_${user.id}`).

---

## 8. System Design & Scalability Interview Scenarios

### Q9: "How would you scale this system from 100 to 1,000,000 daily automated test runs?"
**Answer:**
1. **Asynchronous Execution Queues (BullMQ + Redis):** Move synchronous HTTP test executions from Next.js route handlers to background worker nodes via Redis queues.
2. **Browserbase Parallel Pool Management:** Utilize Browserbase session pooling to execute hundreds of Playwright tests concurrently across distributed browser instances.
3. **Database Read/Write Splitting & Caching:** Cache GitHub repo directory trees and generated test case scripts in Redis to minimize repetitive AI API calls.
4. **Serverless Neon Autoscaling:** Leverage Neon's serverless auto-suspend and auto-scaling HTTP database architecture to handle spike traffic during continuous integration (CI) builds.

---

## 9. Numerical & Algorithmic Tracing Q&A

### Q10: Trace Credit Deduction: User starting balance = 1,000 Credits.
* **Event 1:** User connects GitHub repo and generates test cases for a 15-file Next.js app (Cost: 10 Credits).
* **Event 2:** User runs 3 automated Playwright test cases in Browserbase (Cost: 20 Credits per run).
* **Event 3:** One test fails due to network timeout, user clicks "Re-run Test" (Cost: 20 Credits).
* **Question:** What is the remaining user credit balance?

**Answer:**
* $\text{Initial Balance} = 1,000$
* $\text{Event 1 (Test Generation)} = 1,000 - 10 = 990$
* $\text{Event 2 (3 Runs)} = 990 - (3 \times 20) = 990 - 60 = 930$
* $\text{Event 3 (1 Re-run)} = 930 - 20 = 910$
* **Final Credit Balance** = **910 Credits**.

---

## 10. Behavioral & Technical HR Q&A

### Q11: "What was the most challenging bug you encountered in this project, and how did you resolve it?"
**Answer:**
> *"The trickiest issue occurred when Browserbase cloud browser instances tried to test local development server URLs (`http://localhost:3000`). Because `localhost` in Node.js 18+ resolves to IPv6 loopback (`::1`), remote WebSocket connections to Chrome DevTools Protocol (CDP) timed out.
> 
> I resolved this in `/api/test-cases/run/route.ts` by creating an explicit hostname resolver that sanitizes `localhost` to `127.0.0.1` before passing target routes to Playwright, ensuring 100% reliable cloud browser connectivity."*

---

### Q12: "If you had 2 more weeks to work on this project, what features would you add?"
**Answer:**
1. **GitHub Actions CI/CD Integration:** Create a native GitHub Action that triggers AI test generation and Browserbase test execution automatically on every Pull Request.
2. **Self-Healing Test Scripts:** Use AI to inspect failed Playwright DOM selectors and automatically update `browserbaseScript` when page elements change.
3. **Slack / Discord Webhook Notifications:** Instant alerts with video recording links whenever an E2E test fails.
