import React from "react";
import Image from "next/image";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import axios from "axios";

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

function UserReposLists({ repoList, setUserRepos }: Props) {
  const deleteRepo = async (a: number) => {
    const result = await axios.delete(`/api/user-repo?repoId=${a}`);

    setUserRepos((prevRepos) =>
      prevRepos.filter((repo) => repo.repoId !== a)
    );

    console.log(result.data);
  };

  return (
    <div>
      {repoList.map((repo, index) => (
        <Accordion
          type="single"
          collapsible
          defaultValue="item-1"
          key={index}
        >
          <AccordionItem value="item-1">
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
              <div className="border p-4 rounded-lg mb-4 cursor-pointer transition-all">
                <h3 className="font-bold text-lg">{repo.name}</h3>

                <p className="text-sm text-gray-500">
                  {repo.description || "No description available"}
                </p>

                <a
                  href={repo.html_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:underline"
                >
                  View on GitHub
                </a>

                <p className="text-xs text-gray-700 mt-2">
                  Language: {repo.language || "Unknown"}
                </p>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      ))}
    </div>
  );
}

export default UserReposLists;