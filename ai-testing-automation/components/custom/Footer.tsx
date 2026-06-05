'use client';

import { Github, Twitter, Linkedin, Mail, Heart, ExternalLink } from 'lucide-react';
import { UserDetailContext } from "@/context/userDetailContext";
import { useContext, useState } from 'react';

import Image from 'next/image';

function Footer() {
  const { userDetails } = useContext(UserDetailContext);
  const userId = userDetails?.id;
  const currentYear = new Date().getFullYear();
  
  const [sentEmail, setSentEmail] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!userId || !sentEmail) return;

    setLoading(true);
    try {
      await fetch(`/api/users/subscription?id=${userId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          userId: userId,
          email: sentEmail
        })
      });
      setSentEmail("");
    } catch (error) {
      console.error("Subscription Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSentEmail(e.target.value);
  };

  return (
    <footer className="border-t border-slate-200 bg-white text-slate-600 antialiased selection:bg-blue-500/10">
      {/* Reduced vertical padding from py-12 to py-6 for a slimmer height profile */}
      <div className="mx-auto max-w-7xl px-6 py-6 lg:px-8">
        
        {/* Main Content Grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-4 lg:gap-8 pb-6">
          
          {/* Brand Column */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Image src="/logo.svg" alt="Automate-Testing.io Logo" width={20} height={20} />
              <span className="text-base font-black tracking-tight text-slate-900">Automate-Testing.io</span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed max-w-xs">
              Automate your dynamic execution matrices and orchestrate system-wide analytical tracking pipelines flawlessly.
            </p>
          </div>

          {/* Column 2: Product */}
          <div>
            <h3 className="text-xs font-bold tracking-wider text-slate-400 uppercase">Product</h3>
            <ul className="mt-2.5 space-y-1.5 text-xs">
              <li><a href="#" className="hover:text-blue-600 transition-colors">Analytics Framework</a></li>
              <li><a href="#" className="hover:text-blue-600 transition-colors">Automations</a></li>
              <li><a href="#" className="hover:text-blue-600 transition-colors">Enterprise Pricing</a></li>
            </ul>
          </div>

          {/* Column 3: Resources */}
          <div>
            <h3 className="text-xs font-bold tracking-wider text-slate-400 uppercase">Resources</h3>
            <ul className="mt-2.5 space-y-1.5 text-xs">
              <li><a href="#" className="hover:text-blue-600 transition-colors">Documentation</a></li>
              <li><a href="#" className="hover:text-blue-600 transition-colors">System Status</a></li>
              <li><a href="#" className="hover:text-blue-600 transition-colors">API References</a></li>
            </ul>
          </div>

          {/* Column 4: Newsletter */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold tracking-wider text-slate-400 uppercase">Stay Updated</h3>
            <p className="text-[11px] text-slate-500">Subscribe to our technical changelog updates.</p>
            
            <form className="flex max-w-md gap-x-2" onSubmit={submit}>
              <input
                onChange={handleEmailChange}
                value={sentEmail} 
                type="email"
                required
                placeholder="you@domain.com"
                className="w-full min-w-0 rounded-lg border border-slate-200 bg-slate-50/50 px-2.5 py-1 text-xs text-slate-900 shadow-sm transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <button
                type="submit"
                disabled={loading}
                className="flex items-center justify-center rounded-lg bg-slate-950 px-3 py-1 text-xs font-semibold text-white shadow-sm hover:bg-slate-800 transition disabled:opacity-50"
              >
                {loading ? "..." : "Join"}
              </button>
            </form>
          </div>

        </div>

        {/* Bottom Metadata & Legal Bar */}
        <div className="flex flex-col gap-4 border-t border-slate-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
          
          {/* Copyright Section with Clean Portfolio integration */}
          <div className="text-[11px] text-slate-400 space-y-0.5">
            <p>&copy; {currentYear} Workspace.io, Inc. All rights reserved.</p>
            <div className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5">
              <span className="inline-flex items-center gap-1">
                Engineered with <Heart className="h-3 w-3 text-rose-500 fill-rose-500" /> for developers.
              </span>
              <span className="text-slate-300 hidden sm:inline">•</span>
              <a 
                href="https://parthpandya-qt.github.io/portfoliowebsite/" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="inline-flex items-center gap-0.5 font-medium text-slate-500 hover:text-blue-600 transition-colors"
              >
                About Developer
                <ExternalLink className="h-2.5 w-2.5" />
              </a>
            </div>
          </div>

          {/* Social Icons Strip */}
          <div className="flex items-center gap-4 text-slate-400">
            <a href="https://github.com/parthpandya-qt" target="_blank" rel="noopener noreferrer" className="hover:text-slate-600 transition-colors" aria-label="GitHub">
              <Github className="h-4 w-4" />
            </a>
            <a href="https://x.com/_Parth_Pandya" target="_blank" rel="noopener noreferrer" className="hover:text-blue-400 transition-colors" aria-label="Twitter">
              <Twitter className="h-4 w-4" />
            </a>
            <a href="https://linkedin.com/in/parth1307" target="_blank" rel="noopener noreferrer" className="hover:text-blue-700 transition-colors" aria-label="LinkedIn">
              <Linkedin className="h-4 w-4" />
            </a>
            <a href="mailto:ppandya573@gmail.com" className="hover:text-slate-600 transition-colors" aria-label="Email support">
              <Mail className="h-4 w-4" />
            </a>
          </div>

        </div>

      </div>
    </footer>
  );
}

export default Footer;