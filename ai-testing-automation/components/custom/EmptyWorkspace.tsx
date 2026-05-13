import React from 'react';
import Image from 'next/image';
import {Button} from '@/components/ui/button';
import {Link} from 'lucide-react';

function EmptyWorkspace() {
  return (
    <div className="flex items-center justify-center flex-col className=">
      <Image src="/folder.svg" alt="empty" width={200} height={200} className="mx-auto" />
      <h2 className="text-2xl font-semibold text-gray-900 text-center mt-6">
        No Repositories Connected
      </h2>
      <p className="text-sm text-gray-500 text-center mt-2">
        Connect your GitHub repositories to start testing your code with AI-powered automation.
      </p>
      <Button className = "mt-4 bg-black hover:bg-gray-800 text-white px-5 py-2.5 rounded-xl font-medium transition-all duration-200 hover:scale-105 cursor-pointer">
        <Link className ="h-4 w-4 mr-2"/>Connect Repository
      </Button>
    </div>
  )
}

export default EmptyWorkspace
