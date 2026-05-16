"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { DialogClose } from "@radix-ui/react-dialog";
import { Button } from "@/components/ui/button";

import axios from "axios";
import {
  useEffect,
  useState,
  useMemo,
  useContext,
} from "react";

import { UserDetailContext } from "@/context/userDetailContext";

type Repo = {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  html_url: string;
  updated_at: string;
  language: string | null;
  default_branch: string;
  owner: string;
  private_: boolean;
};

function RepoDialog({setRefreshPage}: {setRefreshPage: (refresh: boolean) => void}) {
  const [repoList, setRepoList] = useState<Repo[]>([]);
  const [repoSearch, setRepoSearch] = useState<string>("");
  const [selectedRepo, setSelectedRepo] = useState<Repo | null>(null);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  

  const context = useContext(UserDetailContext);
  const userDetails = context?.userDetails;

  useEffect(() => {
    getRepoList();
  }, []);

  const getRepoList = async () => {
    try {
      const result = await axios.get("/api/github/repos");

      console.log(result.data);

      setRepoList(result.data.repos);
    } catch (error) {
      console.log(error);
    }
  };

  const filteredRepoList = useMemo(() => {
    const q = repoSearch.toLowerCase().trim();

    if (!q) return repoList;

    return repoList.filter((repo) =>
      repo.name.toLowerCase().includes(q)
    );
  }, [repoSearch, repoList]);

  const saveDatabase = async (repo: Repo) => {
    try {
      const result = await axios.post("/api/user-repo", {
        repoId: repo.id,
        userId: userDetails?.id,
        name: repo.name,
        full_name: repo.full_name,
        description: repo.description,
        html_url: repo.html_url,
        updated_at: repo.updated_at,
        language: repo.language,
        default_branch: repo.default_branch,
        owner: repo.owner,
        private_: repo.private_,
      });

      console.log(result.data);
      setIsOpen(false);
      setRefreshPage(true);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div>
      <Dialog open={isOpen} onOpenChange={(open)=>{setIsOpen(open)}}>
        <DialogTrigger asChild>
          <Button>
            Open
          </Button>
        </DialogTrigger>

        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Add Repository
            </DialogTitle>

            <DialogDescription>
              Search and connect one of your GitHub repositories
              to start generating AI-powered tests for your code.
            </DialogDescription>
          </DialogHeader>

          <input
            type="text"
            placeholder="Search by Repo Name"
            onChange={(e) => setRepoSearch(e.target.value)}
            className="mt-5 w-full border rounded-lg p-2 outline-none"
          />

          <div className="max-h-[400px] overflow-y-auto mt-7 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
            {filteredRepoList.map((repo) => (
              <div
                key={repo.id}
                onClick={() => setSelectedRepo(repo)}
                className={`border p-4 rounded-lg mb-4 cursor-pointer transition-all ${
                  selectedRepo?.id === repo.id
                    ? "bg-gray-200"
                    : "hover:bg-gray-100"
                }`}
              >
                <h3 className="font-bold text-lg">
                  {repo.name}
                </h3>

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
                  Language: {repo.language || "Unknown"} |
                  Updated at:{" "}
                  {new Date(
                    repo.updated_at
                  ).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>

          <DialogFooter className="flex flex-col gap-4">
            <DialogClose asChild>
              <Button variant="outline">
                Cancel
              </Button>
            </DialogClose>

            <Button
              onClick={(e) => {
                const button = e.currentTarget;

                button.classList.add("scale-95", "bg-gray-800");

                setTimeout(() => {
                  button.classList.remove("scale-95", "bg-gray-800");
                }, 150);

                if (selectedRepo) {
                  saveDatabase(selectedRepo);
                }
              }}
              className="
                bg-black
                text-white
                px-5
                py-2.5
                rounded-xl
                font-medium
                transition-all
                duration-150
                hover:scale-105
                active:scale-95
              "
                >
              + Add
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default RepoDialog;