"use client";

import React, { useContext } from "react";
import { UserDetailContext } from "@/context/userDetailContext";
import Image from "next/image";
import { Card } from "@/components/ui/card";

function WorkspaceBody() {
  const userDetails = useContext(UserDetailContext);

  return (
    <div className="p-6 space-y-6">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">
            Workspace
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Manage your repositories and projects
          </p>
        </div>

        <div className="bg-linear-to-r from-blue-500 to-indigo-600 text-white px-4 py-2 rounded-xl shadow-md">
          <p className="text-xs opacity-80">Remaining Credits</p>
          <h2 className="text-lg font-semibold">
            {userDetails?.credits}
          </h2>
        </div>
      </div>

      
      <Card className="p-6 rounded-2xl border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300">
        <div className="flex items-center justify-between">
          
       
          <div className="flex items-center gap-4">
            <div className="bg-gray-100 p-3 rounded-xl">
              <Image
                src="/github1.svg"
                alt="GitHub Logo"
                width={40}
                height={40}
              />
            </div>

            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Connect GitHub
              </h2>
              <p className="text-sm text-gray-500">
                Add your repositories and test your code with AI-powered automation
              </p>
            </div>
          </div>

          
          <button className="bg-black hover:bg-gray-800 text-white px-5 py-2.5 rounded-xl font-medium transition-all duration-200 hover:scale-105 cursor-pointer">
            + Add Repo
          </button>
        </div>
      </Card>

     
    </div>
  );
}

export default WorkspaceBody;
