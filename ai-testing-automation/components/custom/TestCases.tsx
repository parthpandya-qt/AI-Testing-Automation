import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge"
import React, { useContext } from "react";
import { TestCasetype } from "./UserReposLists";
import { Button } from "../ui/button";
import { Play, RefreshCw } from "lucide-react";
import TestCaseSettingDialog from "./TestCaseSettingDialog";
import TestExecutionModal from "./TestExecutionModal";
import { UserDetailContext } from "@/context/userDetailContext";
import Image from "next/image";
import axios from "axios";

type Props = {
   testCaseList: TestCasetype[];
   onReload: () => void;
   repository: any;
};

function TestCases({ testCaseList, onReload, repository }: Props) {
  const user = useContext(UserDetailContext);
  const[selectedTestCases, setSelectedTestCases] = React.useState<number[]>([]);
  const[isModalOpen, setIsModalOpen] = React.useState(false);
  const [testCases, setTestCases] = React.useState(testCaseList);

React.useEffect(() => {
  setTestCases(testCaseList);
}, [testCaseList]);

  const handleSelectedTestCase = (checked: boolean | "indeterminate", id:number) => {
    if(checked){
      setSelectedTestCases((prev) => [...prev, id]);
    }else{
      setSelectedTestCases((prev) => prev.filter((testCaseId) => testCaseId !== id));
    }
  }
  const deleteTestCaseSingle = async (testCaseId: number) => {
  try {
    await axios.delete(
      `/api/user-repo/deleteSingleRepo?repoId=${testCaseId}`
    );

    setTestCases(prev =>
      prev.filter(tc => tc.id !== testCaseId)
    );
  } catch (error) {
    console.log("delete error:", error);
  }
};
 

return (
    <div>
      
      <div className = "flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between mt-5 px-5">
        <h2 className="text-2xl font-semibold">Generated Test Cases</h2>
        <Button 
          variant="outline" 
          size="sm" 
          className="bg-black text-white w-full sm:w-auto mt-2 sm:mt-0" 
          disabled={user?.credits <= 0}
          onClick={onReload}
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      <div>
        {testCases.map((testCase) => (
          <div
            key={testCase.id}
            className="flex flex-col sm:flex-row justify-between rounded-xl p-4 mt-4 bg-gray-50 gap-4 border border-gray-200"
          >
            

            <div className = "flex gap-3 items-start min-w-0">
              <Checkbox 
                checked={selectedTestCases.includes(testCase.id)} 
                onCheckedChange={(checked)=>{handleSelectedTestCase(checked, testCase.id)}} 
                className="mt-1 shrink-0"
              />
              <div className="min-w-0">
                <h2 className="font-medium text-base text-gray-800 break-words">
                  {testCase.title}
                </h2>

                <p className="text-sm text-gray-500 mt-1 break-words">
                  {testCase.description}
                </p>
              </div>
              
            </div>
            <div className="flex items-center flex-wrap gap-2.5 sm:gap-4 self-end sm:self-auto shrink-0">
              <Badge variant="secondary" className="capitalize">{testCase.type}</Badge>
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
              

              <Button
                className="bg-gray-100 border-0 p-0 hover:bg-gray-200 rounded transition duration-200 disabled:hover:bg-transparent disabled:cursor-not-allowed"
                onClick={() => deleteTestCaseSingle(testCase.id)}
              >
              <Image
                src="/delete.svg"
                alt="Delete"
                width={20}
                height={20}
              />
            </Button>
            </div>
          </div>
        ))}
        
      </div>
      <div className="flex flex-col sm:flex-row items-center justify-between mt-4 bg-gray-50 p-4 rounded-xl gap-4">
          <h2 className="font-bold text-gray-800" >Run Selected Test Cases</h2>
          <Button 
            disabled={selectedTestCases.length === 0} 
            className="w-full sm:w-auto cursor-pointer"
            onClick={() => setIsModalOpen(true)}
          >
            <Play className="h-4 w-4 mr-2" /> Run Selected{selectedTestCases.length > 0 && ` (${selectedTestCases.length})`}
          </Button>
        </div>

        <TestExecutionModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            onReload();
          }}
          testCases={testCases.filter((tc) => selectedTestCases.includes(tc.id))}
          repository={repository}
        />
    </div>
  );
}

export default TestCases;