"use client";

import Image from "next/image";
import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import ThemeToggle from "@/components/custom/ThemeToggle";

function WorkspaceHeader() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navLinks = [
    { name: "Workspace", href: "/workspace" },
    { name: "Pricing", href: "/pricing" },
    { name: "Support", href: "/support" },
    { name: "Report", href: "/report" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200 dark:border-slate-800/80 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md shadow-xs transition-colors duration-300">
      <div className="flex items-center justify-between px-4 sm:px-8 py-4">
        {/* Logo */}
        <Link href="/workspace" className="flex items-center gap-2">
          <Image
            src="/logo.svg"
            alt="Workspace"
            width={45}
            height={45}
            className="rounded-xl"
          />

          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">
              Automate-Testing.io
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Smart collaboration
            </p>
          </div>
        </Link>

        {/* Navigation */}
        <nav>
          <div className="hidden md:block">
            <ul className="flex items-center gap-20 text-sm font-medium">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className={`transition-all duration-200 hover:text-blue-600 dark:hover:text-blue-400 hover:scale-105 ${
                      pathname === link.href
                        ? "text-blue-600 dark:text-blue-400 font-semibold"
                        : "text-slate-600 dark:text-slate-300"
                    }`}
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-4">
          <ThemeToggle />
          <UserButton />
          
          {/* Mobile menu toggle */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 focus:outline-none transition-colors cursor-pointer"
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Dropdown */}
      {isMobileMenuOpen && (
        <nav className="md:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-6 py-4 shadow-inner animate-in slide-in-from-top-4 duration-200">
          <ul className="flex flex-col gap-4 text-sm font-medium">
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`block py-2 transition-all duration-200 hover:text-blue-600 dark:hover:text-blue-400 ${
                    pathname === link.href
                      ? "text-blue-600 dark:text-blue-400 font-semibold"
                      : "text-slate-600 dark:text-slate-300"
                  }`}
                >
                  {link.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </header>
  );
}

export default WorkspaceHeader;