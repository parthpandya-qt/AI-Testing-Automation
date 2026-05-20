import React from "react";
import Image from "next/image";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import axios from "axios";

import { ListChecks, CheckCircle2, XCircle, TrendingUp, Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

import { UserDetailContext } from "@/context/userDetailContext";
import test from "node:test";
import TestCases from "./TestCases";

type UserRepo = {
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
};

type Props = {
  repoList: UserRepo[];
  setUserRepos: React.Dispatch<React.SetStateAction<UserRepo[]>>;
};


export type TestCasetype = {
  id: number;
  title: string;
  description: string;
  type: string;
  priority: string;
  userId: string;
  repoId: string;
  repoName: string;
  repoOwner: string;
  branch: string;
  targetRoute: string;
  expectedResult: string;
}




function UserReposLists({ repoList, setUserRepos }: Props) {
  const totalTests = 0; 
  const passedTests = 0;
  const failedTests = 0;
  const passRate = totalTests > 0 ? ((passedTests / totalTests) * 100) : 0;

  const user  = React.useContext(UserDetailContext);
  

  const[loading, setLoading] = React.useState<boolean>(false);
  const[testCaseLoading, setTestCaseLoading] = React.useState<boolean>(false);
  const[testCases, setTestCases] = React.useState<TestCasetype[]>([]);



  const deleteRepo = async (a: number) => {
    const result = await axios.delete(`/api/user-repo?repoId=${a}`);

    setUserRepos((prevRepos) =>
      prevRepos.filter((repo) => repo.repoId !== a)
    );

    console.log(result.data);
  };

  const handleGenerateTestCases = async (repo: UserRepo) => {
    try {
      setLoading(true);
      console.log({
    userId: user?.userDetails.id,
    repoId: repo.repoId,
    owner: repo.owner,
    repo: repo.name,
    branch: repo.defaultBranch,
});
      const result = await axios.post("/api/generate-test-cases", {
        userId: user?.userDetails.id,
        repoId: repo.repoId,
        owner: repo.owner,
        repo: repo.name,
        branch: repo.defaultBranch,
      });
      console.log(result.data);
      
    } catch (error) {
      console.log(error);
    }finally{
      setLoading(false);
    }
  }

  const addTestCases = async (repoId: number) => {
    setTestCaseLoading(true);
    const result = await axios.get("/api/test-cases?repoId=" + repoId);
    
    if(result.data.length > 0){
      console.log(result.data);
      setTestCases(result.data);
      
    }else{
      console.log("No test cases found for this repository.");
      setTestCases([]);
    }
    setTestCaseLoading(false);
  };

  return (
    <div>
      <h2 className="text-2xl font-medium mb-4">Your Repositories</h2>
      <Accordion
          
          type="single"
          collapsible
          defaultValue="item-1"
          onValueChange={(value)=>{addTestCases(Number(value))}}
        >
      {repoList.map((repo, index) => (
        
          <AccordionItem  key = {index} value={repo.repoId.toString()} className="border rounded-md mb-2">
            <AccordionTrigger className="w-full">
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center space-x-4">
                  <Image
                    src="/github1.svg"
                    alt="GitHub Logo"
                    width={20}
                    height={20}
                  />

                  <div className="flex flex-col items-start">
                    <span>{repo.name}</span>

                    <p className="text-sm text-gray-500">
                      Branch: {repo.defaultBranch || "Unknown Branch"}
                    </p>

                    <p className="text-sm text-gray-500">
                      Updated at:{" "}
                      {new Date(repo.updatedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div
                  className="hover:bg-gray-200 p-1 rounded cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteRepo(repo.repoId);
                  }}
                >
                  <Image
                    src="/delete.svg"
                    alt="Delete Repository"
                    width={25}
                    height={25}
                  />
                </div>
              </div>
            </AccordionTrigger>

            <AccordionContent>
    <div className='pt-4 space-y-5'>

        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4'>

            <StatusCard
                title="Total Tests"
                value={totalTests}
                icon={<ListChecks className='h-5 w-5 text-blue-600' />}
                bgColor="bg-blue-50"
            />

            <StatusCard
                title="Passed"
                value={passedTests}
                icon={<CheckCircle2 className='h-5 w-5 text-green-600' />}
                bgColor="bg-green-50"
            />

            <StatusCard
                title="Failed"
                value={failedTests}
                icon={<XCircle className='h-5 w-5 text-red-600' />}
                bgColor="bg-red-50"
            />

            <StatusCard
                title="Pass Rate"
                value={`${passRate}%`}
                icon={<TrendingUp className='h-5 w-5 text-purple-600' />}
                bgColor="bg-purple-50"
            />

        </div>
        
        {!testCaseLoading && testCases.length > 0 && <TestCases testCaseList={testCases} onReload={() => handleGenerateTestCases(repo)}/>}


        {testCaseLoading ?(
            <div className='flex items-center justify-center p-4'>
                <Loader2 className='h-4 w-4 animate-spin' />
            </div>
        ):

        testCases?.length==0&&<div className='flex flex-col sm:flex-row sm:items-center justify-between gap-4 border rounded-xl p-4 bg-gray-50'>

            <div>
                <h3 className='font-medium'>
                    Generate AI Test Cases
                </h3>

                <p className='text-sm text-gray-500 mt-1'>
                    Analyze this repository and generate automated
                    test cases using AI.
                </p>
            </div>
            
            <Button className='gap-2' disabled={loading} onClick={()=>{handleGenerateTestCases(repo)}}>
                {loading ? (
                    <Loader2 className='h-4 w-4 animate-spin' />
                ) : (
                    <Sparkles className='h-4 w-4' />
                )}
                Generate Test Cases
            </Button>

        </div>
}

    </div>
</AccordionContent>
          </AccordionItem>
       
      ))}
      </Accordion>
    </div>
  );
}

export default UserReposLists;





function StatusCard({
    title,
    value,
    icon,
    bgColor
}: {
    title: string
    value: string | number
    icon: React.ReactNode
    bgColor: string
}) {
    return (
        <div className='border rounded-xl p-4 flex items-center justify-between bg-white'>
            
            <div>
                <p className='text-sm text-gray-500'>{title}</p>
                <h3 className='text-2xl font-semibold mt-1'>{value}</h3>
            </div>

            <div className={`h-10 w-10 rounded-full flex items-center justify-center ${bgColor}`}>
                {icon}
            </div>

        </div>
    )
}