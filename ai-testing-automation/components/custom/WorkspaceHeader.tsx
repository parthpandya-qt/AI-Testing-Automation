"use client";

import Image from "next/image";
import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, X } from "lucide-react";

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
    <header className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-md shadow-sm">
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
            <h1 className="text-xl font-bold text-gray-800">
              Automate-Testing.io
            </h1>
            <p className="text-xs text-gray-500">
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
                    className={`transition-all duration-200 hover:text-blue-600 hover:scale-105 ${
                      pathname === link.href
                        ? "text-blue-600 font-semibold"
                        : "text-gray-600"
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
          <UserButton />
          
          {/* Mobile menu toggle */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 text-gray-600 hover:text-blue-600 focus:outline-none transition-colors cursor-pointer"
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
        <nav className="md:hidden border-t bg-white px-6 py-4 shadow-inner animate-in slide-in-from-top-4 duration-200">
          <ul className="flex flex-col gap-4 text-sm font-medium">
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`block py-2 transition-all duration-200 hover:text-blue-600 ${
                    pathname === link.href
                      ? "text-blue-600 font-semibold"
                      : "text-gray-600"
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