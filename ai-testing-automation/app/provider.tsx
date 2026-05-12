'use client'
import React, { useEffect } from 'react';
import axios from 'axios';

function provider({children}:Readonly<{children: React.ReactNode}>) {
    useEffect(()=>{
        createUser();
    },[])
    
    const createUser = async ()=>{
        const result = await axios.post('/api/users',{})
    }
    
    
    return (
    <div>
        {children}
    </div>
    )
}

export default provider









// This is a React component in Next.js that acts as a wrapper component (often called a Provider/Layout wrapper).

// 'use client'
// Marks this file as a Client Component in Next.js App Router.
// Needed when using:
// useState
// useEffect
// event handlers
// browser APIs

// Without this, the component becomes a Server Component by default.