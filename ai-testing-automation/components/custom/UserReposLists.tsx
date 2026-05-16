import React from 'react'
import Image from 'next/image'
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion"

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
};

type Props = {
    repoList: UserRepo[];
};

function UserReposLists({ repoList }: Props) {
    return (
    <div>
        {repoList.map((repo,index) => (
            <Accordion type="single" collapsible defaultValue="item-1" key={index}>
                
                <AccordionItem value="item-1">
                    
                    <AccordionTrigger>
                        <div className="flex flex-row items-center space-x-4">
                            <div className="flex items-center space-x-4 mb-2">
                                <Image src="/github1.svg" alt="GitHub Logo" width={20} height={20} />
                            </div>
                            <div className="flex flex-col items-start space-y-1">
                                {repo.name}
                                <p className="text-sm text-gray-500">
                                    Branch: {repo.defaultBranch || "Unknown Branch"}
                                </p>
                                <p className="text-sm text-gray-500">
                                    Updated at: {new Date(repo.updatedAt).toLocaleDateString() || "Unknown Date"}
                                </p>
                            </div>
                            
                        </div>
                        
                    </AccordionTrigger>
                        <AccordionContent>
                            <div key={repo.id} className={`border p-4 rounded-lg mb-4 cursor-pointer transition-all }`}>
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