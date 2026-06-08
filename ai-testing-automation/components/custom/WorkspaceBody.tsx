"use client";

import { useContext } from "react";
import { UserDetailContext } from "@/context/userDetailContext";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import EmptyWorkspace from "./EmptyWorkspace";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import RepoDialog from "./RepoDialog";
import axios from "axios";
import UserReposLists from "./UserReposLists";




export type UserRepo = {
  id: number;
  name: string;
  fullName: string;
  description: string | null;
  html_url: string;
  updatedAt: string;
  language: string | null;
  defaultBranch: string;
  owner: string;
  private_: boolean;
  repoId: number;
  userId: number;
  targetDomain?: string;
  globalInstruction?: string;
 
};



function WorkspaceBody() {
  
  const [token, setToken] = useState<string | null>(null);
  const [refreshPage, setRefreshPage] = useState(false);
  const [userRepos, setUserRepos] = useState<UserRepo[]>([]);
  
  const { userDetails, credits } = useContext(UserDetailContext);
  
  
  const router = useRouter();

  useEffect(() => {
    getGithubUserToken();
   
  }, []);

  useEffect(() => {
  if (userDetails) {
    getUserRepoList();
    
  }
}, [userDetails, refreshPage]);



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

  const getUserRepoList = async ()=>{
      const result = await axios.get("./api/user-repo?userId=" + userDetails?.id)
      
      
      setUserRepos(result.data);
  }

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">
            Workspace
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Manage your repositories and projects
          </p>
        </div>

        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-4 py-2 rounded-xl shadow-md self-start sm:self-auto min-w-[120px]">
            <p className="text-xs opacity-80">Remaining Credits</p>

            <h2 className="text-lg font-semibold">
                {credits}
            </h2>
        </div>
      </div>

      {/* GitHub Connect Card */}
      <Card className="p-6 rounded-2xl border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300">
        <div className="flex flex-col sm:flex-row gap-4 sm:items-center justify-between">
          
          {/* Left Section */}
          <div className="flex items-start sm:items-center gap-4">
            <div className="bg-gray-100 p-3 rounded-xl shrink-0">
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
          <div className="flex items-center gap-4 w-full sm:w-auto justify-end">
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
                  w-full
                  sm:w-auto
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
                  w-full
                  sm:w-auto
                  flex
                  justify-end
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
            {userRepos.length === 0 ? <EmptyWorkspace /> : <UserReposLists repoList={userRepos} setUserRepos={setUserRepos} setReload={setRefreshPage} />}
        </CardContent>
        
      </Card>

     
    </div>
  );
}

export default WorkspaceBody;
