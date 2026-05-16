"use client";

import { useContext } from "react";
import { UserDetailContext } from "@/context/userDetailContext";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import EmptyWorkspace from "./EmptyWorkspace";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import RepoDialog from "./RepoDialog";


function WorkspaceBody() {
  
  const [token, setToken] = useState<string | null>(null);
  const [refreshPage, setRefreshPage] = useState(false);
  const context = useContext(UserDetailContext);
  const userDetails = context?.userDetails;
  
  const router = useRouter();

  useEffect(() => {
    getGithubUserToken();
  }, []);


  const getGithubUserToken = async () => {
  try {
    const res = await fetch("/api/github/token");

    if (!res.ok) {
      throw new Error("Failed to fetch token");
    }

    const data = await res.json();
    setToken(data.token);

  } catch (err) {
    console.log(err);
    return null;
  }
};


  const onAddRepo = () => {
    router.push("/api/github");
  };

  

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      
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

        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-4 py-2 rounded-xl shadow-md">
            <p className="text-xs opacity-80">Remaining Credits</p>

            <h2 className="text-lg font-semibold">
                {userDetails?.credits}
            </h2>
        </div>
        </div>

      {/* GitHub Connect Card */}
      <Card className="p-6 rounded-2xl border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300">
        <div className="flex items-center justify-between">
          
          {/* Left Section */}
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

          {/* Button */}
<div className="flex items-center gap-4">
  {!token ? (
    <button
      onClick={onAddRepo}
      className="
        bg-black
        text-white
        px-5
        py-2.5
        rounded-xl
        font-medium
        transition-all
        duration-200
        hover:scale-105
        active:scale-95
        cursor-pointer
      "
    >
      Setup
    </button>
  ) : (
    <div
      className="
        transition-all
        duration-200
        hover:scale-105
        active:scale-95
        cursor-pointer
      "
    >
      <RepoDialog setRefreshPage={setRefreshPage} />
    </div>
  )}
</div>
          
        </div>
      </Card>
      <Card>
        <CardContent>
            <EmptyWorkspace />
        </CardContent>
        
      </Card>

     
    </div>
  );
}

export default WorkspaceBody;
