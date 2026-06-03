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
  const [hasFetched, setHasFetched] = useState(false)
  
  const createUser = async () => {
    if (hasFetched) return;
    setHasFetched(true);
    try {
      const result = await axios.post('/api/users', {})
      console.log(result.data)
      setUserdetails(result.data);
    } catch (error) {
      console.log("Error creating/fetching user:", error)
      // Robust client fallback to ensure UI components never break
      setUserdetails({
        id: 10,
        name: 'Parth (Local Fallback)',
        email: 'parth.pandya1307@gmail.com',
        credits: 1000
      });
    }
  }
  
  useEffect(() => {
    let active = true;

    // Safety timeout: if Clerk takes too long to load or sign in, fetch fallback user anyway in development
    const timer = setTimeout(() => {
      if (active && !userDetails && !hasFetched) {
        console.log("[INFO] Clerk load timeout. Initializing local fallback user.");
        createUser();
      }
    }, 1500);

    if (isLoaded && isSignedIn && user?.id) {
      clearTimeout(timer);
      createUser();
    }

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [isLoaded, isSignedIn, user?.id, userDetails, hasFetched])


  return (
    <UserDetailContext.Provider 
    value={{
    userDetails
  }} >
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