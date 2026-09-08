# ⚡ TestAI — AI-Powered Testing Automation

> Generate, run, and manage intelligent test suites in seconds. Let AI handle the testing so your team can focus on building what matters.

TestAI connects directly to your GitHub repositories, automatically analyzes your codebase layout, generates high-fidelity Playwright test cases using generative AI models, and runs those tests on Browserbase cloud headless browser infrastructure.

---

## 🚀 Key Features

*   **One-Click GitHub Integration:** Connect repositories securely to automatically fetch branch details and detect application setups.
*   **AI-Driven Test Generation:** Automatically inspects target application routes, form inputs, and expected outcomes to write full Playwright scripts.
*   **Browserbase Cloud Runner:** Run end-to-end tests instantly inside isolated cloud browser containers. View live terminal execution logs and stream recording playbacks.
*   **Advanced Project Config:** Customize target domain routing, set global test rules, and override prompt instructions dynamically per execution run.
*   **Visual Analytics Dashboard:** Track active repository counts, test coverage volumes, available developer credits, and usage stats in a clean grid.
*   **Pro Subscriptions:** Integrated billing workflows (utilizing Clerk authentication and Razorpay payment gateways) to upgrade limits seamlessly.
*   **Fully Mobile Responsive:** Tailored layouts and touch-friendly controls across all pages, support drawers, and floating panels.

---

## 🛠️ Technology Stack

*   **Framework:** Next.js (App Router, Turbopack)
*   **Language:** TypeScript, React 19
*   **Styles:** Tailwind CSS v4
*   **Database & ORM:** Drizzle ORM, Neon PostgreSQL serverless client
*   **Auth:** Clerk Next.js SDK
*   **Testing Infrastructure:** Browserbase SDK, Playwright E2E Runner
*   **Charts:** Recharts
*   **Payments:** Razorpay Node API / Stripe JS

---

## ⚙️ Project Setup

### Prerequisites
*   Node.js (v18.x or later)
*   NPM (v10.x or later)
*   PostgreSQL Database instance (e.g., Neon DB)
*   Clerk and Browserbase account API keys

### Installation

1.  **Clone the Repository:**
    ```bash
    git clone https://github.com/parthpandya-qt/AI-Testing-Automation.git
    cd AI-Testing-Automation/ai-testing-automation
    ```

2.  **Install Dependencies:**
    ```bash
    npm install
    ```

3.  **Environment Variables:**
    Create a `.env` file in the root of the `ai-testing-automation` folder based on `.env.example`:
    ```env
    # Clerk Auth
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_pub_key
    CLERK_SECRET_KEY=your_clerk_secret_key

    # Database
    DATABASE_URL=your_neon_postgres_connection_string

    # GitHub App Integration
    GITHUB_CLIENT_ID=your_github_app_client_id
    GITHUB_CLIENT_SECRET=your_github_app_secret

    # Browserbase HQ
    BROWSERBASE_API_KEY=your_browserbase_api_key
    BROWSERBASE_PROJECT_ID=your_browserbase_project_id

    # Gemini AI
    GEMINI_API_KEY=your_gemini_api_key

    # Payments
    NEXT_PUBLIC_RAZORPAY_KEY_ID=your_razorpay_key
    RAZORPAY_KEY_SECRET=your_razorpay_secret
    ```

4.  **Database Migration:**
    Push your schema definition to your database:
    ```bash
    npm run db:push
    ```

5.  **Run Development Server:**
    ```bash
    npm run dev
    ```
    Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📂 Codebase Overview

```
ai-testing-automation/
├── app/                  # Next.js App Router routes & API gateways
│   ├── api/              # Core endpoints (runs, generation, user reports)
│   ├── workspace/        # Connected repositories and workspace dashboards
│   ├── pricing/          # Pro/Enterprise plans listing page
│   ├── support/          # FAQ section & support ticket submission
│   ├── layout.tsx        # Main application outer shell
│   └── page.tsx          # Marketing home landing page
├── components/           # Modular UI files
│   ├── custom/           # Custom dashboard modules (Test runner, chat bubble, footer)
│   └── ui/               # Core Shadcn/Radix components (Dialogs, Accoridons, Checkbox)
├── db/                   # Drizzle ORM configuration and database schema definitions
├── context/              # Context Providers (user details & credits)
├── lib/                  # Helper utilities (Tailwind merges, axios configurations)
└── public/               # Static icons, vector graphics, and logo assets
```

---

## 📄 License

This project is licensed under the **ISC License**. See the `package.json` file for details.
