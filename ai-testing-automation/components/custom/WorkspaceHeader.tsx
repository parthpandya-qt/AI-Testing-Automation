import React from 'react'
import Image from 'next/image'
import { UserButton } from '@clerk/nextjs';

function WorkspaceHeader() {
  return (
    <header className="w-full border-b bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-50">
      
      <div className="flex items-center justify-between px-8 py-4 w-full">
        
        
        <div className="flex items-center gap-3 cursor-pointer">
          <Image
            src="/logo.svg"
            alt="workspace"
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
        </div>

        {/* Navigation */}
        <ul className="flex items-center gap-8 text-sm font-medium text-gray-600">
          <li className="cursor-pointer transition-all duration-200 hover:text-blue-600 hover:scale-105">
            Workspace
          </li>

          <li className="cursor-pointer transition-all duration-200 hover:text-blue-600 hover:scale-105">
            Pricing
          </li>

          <li className="cursor-pointer transition-all duration-200 hover:text-blue-600 hover:scale-105">
            Support
          </li>
        </ul>

        {/* User */}
        <UserButton />
      </div>
    </header>
  )
}

export default WorkspaceHeader
