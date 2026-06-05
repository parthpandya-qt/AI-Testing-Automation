import React from 'react'
import WorkespaceHeader from '@/components/custom/WorkspaceHeader';
import SupportChat from '@/components/custom/SupportChat';
import Footer from '@/components/custom/Footer';

function WorkSpacelayout({children}: Readonly<{children: React.ReactNode}>) {
  return (
    <div className = "mx-auto ">
      <WorkespaceHeader />
      {children}
      <SupportChat />
      <Footer />
    </div>
  )
}

export default WorkSpacelayout
