import React from 'react'
import WorkespaceHeader from '@/components/custom/WorkspaceHeader';
import SupportChat from '@/components/custom/SupportChat';

function WorkSpacelayout({children}: Readonly<{children: React.ReactNode}>) {
  return (
    <div className = "mx-auto ">
      <WorkespaceHeader />
      {children}
      <SupportChat />
    </div>
  )
}

export default WorkSpacelayout
