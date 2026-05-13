import React from 'react'
import WorkespaceHeader from '@/components/custom/WorkspaceHeader';

function WorkSpacelayout({children}: Readonly<{children: React.ReactNode}>) {
  return (
    <div className = "mx-auto max-w-4xl">
      <WorkespaceHeader />
      {children}
    </div>
  )
}

export default WorkSpacelayout
