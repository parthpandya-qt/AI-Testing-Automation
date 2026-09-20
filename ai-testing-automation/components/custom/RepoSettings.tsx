import React, { Dispatch, SetStateAction } from 'react'
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
import toast from 'react-hot-toast'


import { UserRepo } from './WorkspaceBody';

type props ={
    repo: UserRepo;
    setReload: Dispatch<SetStateAction<boolean>>;
}


function RepoSettings({ repo, setReload }:props) {


    const [isOpen, setIsOpen] = React.useState(false);
    const [reposettings, setRepoSettings] = React.useState({
        targetDomain: repo.targetDomain || "",
        globalInstruction: repo.globalInstruction || "",
        techStack: repo.techStack || "nextjs"
    });

    React.useEffect(() => {
        setRepoSettings({
            targetDomain: repo.targetDomain || "",
            globalInstruction: repo.globalInstruction || "",
            techStack: repo.techStack || "nextjs"
        });
    }, [repo]);

    const handleSaveSettings = async () => {
      try {
        const result = await fetch("/api/user-repo/settings", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                repoId: repo.repoId,
                targetDomain: reposettings.targetDomain,
                globalInstruction: reposettings.globalInstruction,
                techStack: reposettings.techStack
            })
        });
        if (!result.ok) throw new Error("Failed to save project settings");
        toast.success("Project settings saved successfully!");
        setIsOpen(false);
        setReload(prev => !prev);
      } catch (err: any) {
        toast.error(err?.message || "Failed to save project settings");
      }
    }
  return (
    <div>
<Dialog open={isOpen} onOpenChange={setIsOpen}>
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
    <div className="space-y-4">
        <div>
            <label className="block text-sm font-medium mb-1">Application Tech Stack</label>
            <select
                className="w-full border rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-grey-200 text-sm bg-white"
                value={reposettings?.techStack}
                onChange={(e) => setRepoSettings({...reposettings, techStack: e.target.value})}
            >
                <option value="nextjs">⚡ Next.js / React</option>
                <option value="mern">🟢 MERN Stack (Mongo/Express/React)</option>
                <option value="java">☕ Java / Spring Boot</option>
                <option value="python">🐍 Python (Flask/Django)</option>
                <option value="go">🐹 Go (Golang)</option>
                <option value="csharp">🔷 C# / .NET</option>
                <option value="php">🐘 PHP / Laravel</option>
                <option value="other">🌐 Other Web App</option>
            </select>
            <p className="text-xs text-gray-500 mt-1">
              Select the tech stack used by your application for tailored AI test case generation and execution.
            </p>
        </div>
        <div>
            <label className="block text-sm font-medium mb-1">App URL/Default Website</label>
            <input 
                type="text"
                placeholder="App URL/Domain for testing"
                className="w-full border rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-grey-200"
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
                className="w-full border rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-grey-200"
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
