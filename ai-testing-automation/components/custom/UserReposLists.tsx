import React, { Dispatch, SetStateAction } from "react";
import Image from "next/image";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import axios from "axios";

import {
  ListChecks,
  CheckCircle2,
  XCircle,
  TrendingUp,
  Sparkles,
  Loader2,
  Link2Icon,
  Settings2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { UserDetailContext } from "@/context/userDetailContext";
import TestCases from "./TestCases";
import RepoSettings from "./RepoSettings";

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
  userId: number;
  targetDomain?: string;
  globalInstruction?: string;
};

type Props = {
  repoList: UserRepo[];
  setUserRepos: React.Dispatch<React.SetStateAction<UserRepo[]>>;
  setReload: Dispatch<SetStateAction<boolean>>;
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
  status: string;
  
};

type statusType = {
  totalTests: number;
  passedTests: number;
  failedTests: number;
  passRate: number;
};

function UserReposLists({ repoList, setUserRepos, setReload }: Props) {
  const user = React.useContext(UserDetailContext);

  const [loadingRepoId, setLoadingRepoId] = React.useState<number | null>(null);

  const [testCaseLoading, setTestCaseLoading] =
    React.useState<boolean>(false);

  const [repoTestCases, setRepoTestCases] = React.useState<
    Record<number, TestCasetype[]>
  >({});

  const [repoStatus, setRepoStatus] = React.useState<
    Record<number, statusType>
  >({});

  const deleteRepo = async (repoId: number) => {
    try {
      await axios.delete(`/api/user-repo?repoId=${repoId}`);

      setUserRepos((prev) =>
        prev.filter((repo) => repo.repoId !== repoId)
      );
    } catch (error) {
      console.log(error);
    }
  };

  const handleGenerateTestCases = async (repo: UserRepo) => {
    if (user?.credits <= 0) {
      alert("Insufficient credits. Please purchase more credits to generate test cases.");
      return;
    }

    try {
      setLoadingRepoId(repo.repoId);
      setTestCaseLoading(true);

      const result = await axios.post("/api/generate-test-cases", {
        userId: user?.userDetails?.id,
        repoId: repo.repoId,
        owner: repo.owner,
        repo: repo.name,
        branch: repo.defaultBranch,
      });

      if (result.data?.credits !== undefined && user?.setCredits) {
        user.setCredits(result.data.credits);
      }

      await addTestCases(repo.repoId);
    } catch (error) {
      console.log(error);
      setTestCaseLoading(false);
    } finally {
      setLoadingRepoId(null);
    }
  };

  const addTestCases = async (repoId: number) => {
    try {
      setTestCaseLoading(true);

      const result = await axios.get(
        `/api/test-cases?repoId=${repoId}`
      );

      const tests = result.data || [];

      setRepoTestCases((prev) => ({
        ...prev,
        [repoId]: tests,
      }));

      setRepoStatus((prev) => ({
        ...prev,
        [repoId]: {
          totalTests: tests.length,
          passedTests: 0,
          failedTests: 0,
          passRate: 0,
        },
      }));
      const userTestCases = result.data as TestCasetype[];

      const passedTests = userTestCases.filter(
        (test) => test.status === "passed"
      ).length;
      const failedTests = userTestCases.filter(
        (test) => test.status === "failed"
      ).length;
      const passRate = tests.length > 0 ? Number(((passedTests / tests.length) * 100).toFixed(2)) : 0.00;
      console.log("Pass Rate:", passRate);

      setRepoStatus((prev) => ({
        ...prev,
        [repoId]: {
          totalTests: tests.length,
          passedTests,
          failedTests,
          passRate,
        },
      }));
    } catch (error) {
      console.log(error);
    } finally {
      setTestCaseLoading(false);
    }
  };
   
  return (
    <div>
      <h2 className="text-2xl font-medium mb-4">
        Your Repositories
      </h2>

      <Accordion
        type="single"
        collapsible
        onValueChange={(value) => {
          if (value) addTestCases(Number(value));
        }}
      >
        {repoList.map((repo, index) => (
          <AccordionItem
            key={index}
            value={repo.repoId.toString()}
            className="border rounded-md mb-2"
          >
            <AccordionTrigger className="w-full">
              <div className="flex items-center justify-between w-full min-w-0 pr-4">

                <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                  <Image
                    src="/github1.svg"
                    alt="GitHub"
                    width={20}
                    height={20}
                    className="shrink-0"
                  />

                  <div className="flex flex-col items-start min-w-0 text-left">
                    <span className="font-semibold text-gray-800 break-all">{repo.name}</span>

                    <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
                      Branch:{" "}
                      {repo.defaultBranch || "Unknown"}
                    </p>

                    <p className="text-xs sm:text-sm text-gray-500">
                      Updated:
                      {" "}
                      {new Date(
                        repo.updatedAt
                      ).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div
                  className="hover:bg-gray-200 p-1 rounded cursor-pointer shrink-0"
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteRepo(repo.repoId);
                  }}
                >
                  <Image
                    src="/delete.svg"
                    alt="delete"
                    width={25}
                    height={25}
                  />
                </div>
              </div>
            </AccordionTrigger>

            <AccordionContent>
              <div className="pt-4 space-y-5">

                <div className="flex flex-col sm:flex-row gap-4 sm:items-center justify-between w-full">

                  <div className="flex items-center gap-2 max-w-full overflow-hidden">
                    <Link2Icon className="h-5 w-5 text-primary shrink-0" />

                    <div className="bg-gray-100 rounded-md px-2.5 py-1.5 flex items-center gap-2 overflow-hidden max-w-full">
                      <span className="shrink-0 text-xs sm:text-sm text-gray-600">Target Domain:</span>

                      <span className="bg-white border rounded-md px-2 py-1 text-primary font-medium truncate text-xs sm:text-sm">
                        {repo.targetDomain || "None configured"}
                      </span>
                    </div>
                  </div>
                  <div className="self-end sm:self-auto mr-0 sm:mr-5 shrink-0">
                    <RepoSettings repo={repo} setReload={setReload} />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

                  <StatusCard
                    title="Total Tests"
                    value={
                      repoStatus[
                        repo.repoId
                      ]?.totalTests || 0
                    }
                    icon={
                      <ListChecks className="h-5 w-5 text-blue-600" />
                    }
                    bgColor="bg-blue-50"
                  />

                  <StatusCard
                    title="Passed"
                    value={
                      repoStatus[
                        repo.repoId
                      ]?.passedTests || 0
                    }
                    icon={
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                    }
                    bgColor="bg-green-50"
                  />

                  <StatusCard
                    title="Failed"
                    value={
                      repoStatus[
                        repo.repoId
                      ]?.failedTests || 0
                    }
                    icon={
                      <XCircle className="h-5 w-5 text-red-600" />
                    }
                    bgColor="bg-red-50"
                  />

                  <StatusCard
                    title="Pass Rate"
                    value={`${repoStatus[
                      repo.repoId
                    ]?.passRate || 0}%`}
                    icon={
                      <TrendingUp className="h-5 w-5 text-purple-600" />
                    }
                    bgColor="bg-purple-50"
                  />
                </div>

                {!testCaseLoading &&
                  repoTestCases[
                    repo.repoId
                  ]?.length > 0 && (
                    <TestCases
                      testCaseList={
                        repoTestCases[
                          repo.repoId
                        ]
                      }
                      onReload={() =>
                        handleGenerateTestCases(
                          repo
                        )
                      }
                      repository={repo}
                    />
                  )}

                {testCaseLoading ? (
                  <div className="flex justify-center p-4">
                    <Loader2 className="animate-spin h-5 w-5" />
                  </div>
                ) : (
                  (repoTestCases[
                    repo.repoId
                  ]?.length || 0) === 0 && (
                    <div className="flex flex-col sm:flex-row justify-between gap-4 border rounded-xl p-4 bg-gray-50">

                      <div>
                        <h3 className="font-medium">
                          Generate AI Test Cases
                        </h3>

                        <p className="text-sm text-gray-500 mt-1">
                          Analyze repository and
                          generate automated test
                          cases.
                        </p>
                      </div>

                      <Button
                        className="gap-2"
                        disabled={
                          loadingRepoId ===
                          repo.repoId ||
                          user?.credits <= 0
                        }
                        onClick={() =>
                          handleGenerateTestCases(
                            repo
                          )
                        }
                      >
                        {loadingRepoId ===
                        repo.repoId ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Sparkles className="h-4 w-4" />
                        )}

                        Generate Test Cases
                      </Button>
                    </div>
                  )
                )}

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
  bgColor,
}: {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  bgColor: string;
}) {
  return (
    <div className="border rounded-xl p-4 flex items-center justify-between bg-white">

      <div>
        <p className="text-sm text-gray-500">
          {title}
        </p>

        <h3 className="text-2xl font-semibold mt-1">
          {value}
        </h3>
      </div>

      <div
        className={`h-10 w-10 rounded-full flex items-center justify-center ${bgColor}`}
      >
        {icon}
      </div>

    </div>
  );
}