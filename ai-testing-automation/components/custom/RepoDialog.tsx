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
import { useEffect } from "react";

function RepoDialog() {

  useEffect(() => {
    getRepoList();
  }, []);

  const getRepoList = async () => {
    try {
      const result = await axios.get("/api/github/repos");

      console.log(result.data);

      return result.data;

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