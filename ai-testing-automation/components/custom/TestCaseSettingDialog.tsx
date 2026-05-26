import React from 'react'
import {
  Dialog,
  DialogClose,
  
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

import { SettingsIcon } from 'lucide-react'
import { Button} from '../ui/button'
import { Input } from '../ui/input'
import { Textarea } from "@/components/ui/textarea"
import { TestCasetype } from './UserReposLists'



type props = {
  testCase: TestCasetype;
  setReload: any;
}

function TestCaseSettingDialog({testCase, setReload}: props) {
    const [formData, setFormData] = React.useState({
      title: testCase.title,
      description: testCase.description,
      targetRoute: testCase.targetRoute,
      expectedResult: testCase.expectedResult
    }); 



    const handleInputChange = (field: string, value: string) => {
      setFormData((prev) => ({
        ...prev,
        [field]: value,
      }));
    }

    const updateCase = async ()=>{
      const response = await fetch("/api/test-cases/settings",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            ...formData,
            repoId: testCase.repoId,
            testCaseId: testCase.id
          })  
        });
        setReload();
    }
  
    return (
    <div>

      <Dialog>

        <DialogTrigger asChild>
          <Button
            variant="secondary"
            size="icon"
            className="transition duration-200 hover:bg-gray-200 cursor-pointer rounded "
          >
            <SettingsIcon className="h-4 w-4" />
          </Button>
        </DialogTrigger>

        <DialogContent>

          <DialogHeader>

            <DialogTitle>
              Edit Testing Requirements
            </DialogTitle>

            <DialogDescription>
              Modifying these test parameters automatically clears pre-generated test cases.
            </DialogDescription>

          </DialogHeader>

          <div className = "mt-2">

            <label className="text-sm font-medium">
              Test Title
            </label>

            <Input
              value={formData.title}
              placeholder="Test case name"
              className="mt-1"
              onChange={(e)=>{handleInputChange("title", e.target.value)}}
            />

          </div>
          <div className = "mt-2">

            <label className="text-sm font-medium">
              Description
            </label>

            <Textarea 
              value={formData.description}
              placeholder='description' 
              className="mt-1"
              onChange={(e)=>{handleInputChange("description", e.target.value)}}
            />

          </div>
          <div className = "mt-2">

            <label className="text-sm font-medium">
              Target Route
            </label>

            <Input
              value={formData.targetRoute}
              placeholder="Target Route"
              className="mt-1"
              onChange={(e)=>{handleInputChange("targetRoute", e.target.value)}}    
            />

          </div>
          <div className = "mt-2">

            <label className="text-sm font-medium">
              Expected Result
            </label>

            <Textarea 
              value={formData.expectedResult}
              placeholder='Expected result' 
              className="mt-1"
              onChange={(e)=>{handleInputChange("expectedResult", e.target.value)}}
            />

          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button>
                Cancel
              </Button>
            </DialogClose>

            <Button onClick={updateCase}>
              Save
            </Button>
          </DialogFooter>

        </DialogContent>
        

      </Dialog>

    </div>
  )
}

export default TestCaseSettingDialog