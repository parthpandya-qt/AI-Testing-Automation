"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";

import { DialogClose } from "@radix-ui/react-dialog";
import { Button } from "@/components/ui/button";

import axios from "axios";
import { useEffect, useState } from "react";

type Repo ={
    id:number,
    name:string,
    full_name:string,
    description:string | null,
    html_url:string,
    updated_at:string,
    language:string | null,
    default_branch:string,
    owner:string

}


function RepoDialog() {
    
  const [repoList, setrepoList] = useState<Repo[]>([]);

  useEffect(() => {
    getRepoList();
  }, []);

  


  const getRepoList = async () => {
    try {
      const result = await axios.get("/api/github/repos");

      console.log(result.data);
        setrepoList(result.data.repos);

    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div>
      <Dialog>
        <DialogTrigger>Open</DialogTrigger>

        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Add Repository
            </DialogTitle>

            <DialogDescription>
              Search and connect one of your Github repositories
              to start generating AI-powered tests for your code.
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-[400px] overflow-y-auto mt-4">
            {
                repoList.map((repo)=>(
                    <div key={repo.id} className="border p-4 rounded-lg mb-4">
                        <h3 className="font-bold text-lg">{repo.name}</h3>
                        <p className="text-sm text-gray-500">{repo.description}</p>
                        <a href={repo.html_url} target="_blank" className="text-blue-500 hover:underline">
                            View on GitHub
                        </a>
                        <p className="text-xs text-gray-400 mt-2">
                            Language:{repo.language} | Updated at: {new Date(repo.updated_at).toLocaleDateString()}
                        </p>
                    </div>
                ))
            }
          </div>

          <div>
            <DialogFooter className="flex flex-col gap-4">

              <DialogClose asChild>
                <Button variant="outline">
                  Cancel
                </Button>
              </DialogClose>

              <Button>
                + Add
              </Button>

            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default RepoDialog;