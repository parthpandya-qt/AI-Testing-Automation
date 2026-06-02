import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge"
import React from "react";
import { TestCasetype } from "./UserReposLists";
import { Button } from "../ui/button";
import { Play, RefreshCw } from "lucide-react";
import TestCaseSettingDialog from "./TestCaseSettingDialog";

type Props = {
   testCaseList: TestCasetype[];
   onReload: () => void;
};

function TestCases({ testCaseList, onReload }: Props) {
  const[selectedTestCases, setSelectedTestCases] = React.useState<number[]>([]);

  const handleSelectedTestCase = (checked: boolean | "indeterminate", id:number) => {
    if(checked){
      setSelectedTestCases((prev) => [...prev, id]);
    }else{
      setSelectedTestCases((prev) => prev.filter((testCaseId) => testCaseId !== id));
    }
  }

return (
    <div>
      
      <div className = "flex items-center justify-between mt-5">
        <h2 className=" text-2xl font-large ml-5">Generated Test Cases</h2>
        <Button variant="outline" size="sm" className="ml-5 mt-3 mr-5 bg-black text-white" onClick={()=>{onReload}}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      <div>
        {testCaseList.map((testCase) => (
          <div
            key={testCase.id}
            className="flex items-center justify-between rounded-xl p-4 mt-4 bg-gray-50 gap-3  border-2-gray-200 "
          >
            

            <div className = "flex gap-3 items-center">
              <Checkbox checked={selectedTestCases.includes(testCase.id)} onCheckedChange={(checked)=>{handleSelectedTestCase(checked, testCase.id)}} />
              <div>
                <h2 className="font-medium text-medium">
                  {testCase.title}
                </h2>

                <p className="text-sm text-gray-500 mt-1">
                  {testCase.description}
                </p>
              </div>
              
            </div>
            <div className = " flex gap-5 items-center">
              <Badge variant="secondary">{testCase.type}</Badge>
              {testCase?.status=='failed' && <Badge variant="destructive" className="font-normal text-red-100">
                {testCase.status}
              </Badge>}
              {testCase?.status=='passed' && <Badge variant="default" className="font-normal text-green-100 bg-green-500">
                {testCase.status}
              </Badge>}
              {testCase?.status=='running' && <Badge variant="destructive" className="font-normal text-yellow-100 bg-yellow-500">
                {testCase.status}
              </Badge>}
              <TestCaseSettingDialog testCase={testCase} setReload={onReload} />
            </div>
          </div>
        ))}
        
      </div>
      <div className="flex items-center justify-between mt-4 bg-gray-50 p-4 rounded-xl">
          <h2 className="font-bold ml-5" >Run Selected Test Case</h2>
          <Button disabled={selectedTestCases.length === 0} className="mr-5">
            <Play className="h-4 w-4" /> Run Selected{selectedTestCases.length > 0 && ` (${selectedTestCases.length})`}
          </Button>
        </div>
    </div>
  );
}

export default TestCases;