"use client";

import Image from "next/image";
import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import { usePathname } from "next/navigation";

function WorkspaceHeader() {
  const pathname = usePathname();

  const navLinks = [
    { name: "Workspace", href: "/workspace" },
    { name: "Pricing", href: "/pricing" },
    { name: "Support", href: "/support" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-md shadow-sm">
      <div className="flex items-center justify-between px-8 py-4">
        {/* Logo */}
        <Link href="/workspace" className="flex items-center gap-3">
          <Image
            src="/logo.svg"
            alt="Workspace"
            width={45}
            height={45}
            className="rounded-xl"
          />

          <div>
            <h1 className="text-xl font-bold text-gray-800">
              Workspace
            </h1>
            <p className="text-xs text-gray-500">
              Smart collaboration
            </p>
          </div>
        </Link>

        {/* Navigation */}
        <nav>
          <ul className="flex items-center gap-8 text-sm font-medium">
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
        </nav>

        {/* User */}
        <div className="flex items-center">
          <UserButton />
        </div>
      </div>
    </header>
  );
}

export default WorkspaceHeader;