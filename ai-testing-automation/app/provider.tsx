'use client'

import React, { useEffect , useState } from 'react'
import axios from 'axios'
import { useUser } from '@clerk/nextjs'
import { UserDetailContext } from '@/context/userDetailContext'

function Provider({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const { isLoaded, isSignedIn, user } = useUser()
  
  const [userDetails,setUserdetails] = useState<any>(null)
  
  const createUser = async () => {
    try {
      const result = await axios.post('/api/users', {})
      console.log(result.data)
      setUserdetails(result.data?.user);
    } catch (error) {
      console.log(error)
    }
  }
  
  
  useEffect(() => {
    if (!isLoaded || !isSignedIn || !user?.id) return
    createUser()
  }, [isLoaded, isSignedIn, user?.id])


  return (
    <UserDetailContext.Provider value = {userDetails} >
      <div>
        {children}
      </div>
    </UserDetailContext.Provider>
  )
}

export default Provider









// This is a React component in Next.js that acts as a wrapper component (often called a Provider/Layout wrapper).

// 'use client'
// Marks this file as a Client Component in Next.js App Router.
// Needed when using:
// useState
// useEffect
// event handlers
// browser APIs

// Without this, the component becomes a Server Component by default.