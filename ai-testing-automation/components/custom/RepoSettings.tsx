import React from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from '../ui/button'
import { Settings2 } from 'lucide-react'
import { Textarea } from '../ui/textarea'
import { DialogClose } from '@radix-ui/react-dialog'


import { UserRepo } from './WorkspaceBody';

type props ={
    repo: UserRepo;
}


function RepoSettings({ repo }:props) {



    const [reposettings, setRepoSettings] = React.useState({
        targetDomain: repo.targetDomain || "",
        globalInstruction: repo.globalInstruction || ""
    });


    const handleSaveSettings = async () => {
        const result = await fetch("/api/user-repo/settings", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                userId: repo.userId,
                repoId: repo.repoId,
                targetDomain: reposettings.targetDomain,
                globalInstruction: reposettings.globalInstruction
            })
        });
        
    }
  return (
    <div>
<Dialog>
  <DialogTrigger asChild>
    <Button>
        <Settings2 className="h-4 w-4 mr-1" />
            Project Config
    </Button>
  </DialogTrigger>
    
  <DialogContent>
    <DialogHeader>
      <DialogTitle className="flex items-center gap-2">
        <Settings2 className="h-4 w-4" />
        Project/Repo Settings
      </DialogTitle>
      <DialogDescription>
        Configure your project or repository settings here.
      </DialogDescription>
    </DialogHeader>
    <div>
        <div>
            <label className="block text-sm font-medium mb-1">App URL/Default Website</label>
            <input 
                type="text"
                placeholder="App URL/Domain for testing"
                className="border rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-grey-200"
                value={reposettings?.targetDomain}
                onChange={(e) => setRepoSettings({...reposettings, targetDomain: e.target.value})}
            />
            <p className="text-sm text-gray-500 mt-1">
              The default website or app URL for testing purposes.
            </p>
        </div>
        <div className="mt-4">
            <label className="block text-sm font-medium mb-1">Global Test Instruction</label>
            <Textarea 
                placeholder="Instructions"
                className="border rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-grey-200"
                value={reposettings?.globalInstruction}
                onChange={(e) => setRepoSettings({...reposettings, globalInstruction: e.target.value})}
            />
            <p className="text-sm text-gray-500 mt-1">
              Any specific instruction you want to provide for test case generation or execution?
            </p>
        </div>
    </div>
    <DialogFooter>
        <DialogClose asChild>
            <Button variant="outline">
                Cancel
            </Button>
        </DialogClose>
        <Button onClick={handleSaveSettings}>
            Save Config
        </Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
    </div>
  )
}

export default RepoSettings
