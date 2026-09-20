"use client";

import React, {
  useEffect,
  useState,
} from "react";
import axios from "axios";
import { useUser } from "@clerk/nextjs";
import { UserDetailContext } from "@/context/userDetailContext";
import { Toaster } from "react-hot-toast";

function Provider({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const {
    isLoaded,
    isSignedIn,
    user,
  } = useUser();

  const [
    userDetails,
    setUserdetails,
  ] = useState<any>(null);

  const [
    hasFetched,
    setHasFetched,
  ] = useState(false);

  const [
    credits,
    setCredits,
  ] = useState<number>(1000);

  const getCredits =
    async (userId: number) => {
      try {
        const res = await fetch(
          `/api/users/credits?userId=${userId}`
        );

        const data =
          await res.json();

        setCredits(
          data.credits || 0
        );
      } catch (error) {
        console.error(
          "Credits Error:",
          error
        );
      }
    };

  const createUser =
    async () => {
      if (hasFetched) return;
      if (isLoaded && !isSignedIn) return;

      setHasFetched(true);

      const email = user?.primaryEmailAddress?.emailAddress;
      const name = user?.fullName || user?.firstName || "User";

      try {
        const result = await axios.post("/api/users", {
          email,
          name,
        });

        setUserdetails(result.data);

        if (result.data?.credits !== undefined) {
          setCredits(result.data.credits);
        } else if (result.data?.id) {
          getCredits(result.data.id);
        }
      } catch (error) {
        console.log(error);

        const fallbackUser = {
          id: 10,
          name: "Parth (Local Fallback)",
          email: "parth.pandya1307@gmail.com",
          credits: 1000,
        };

        setUserdetails(fallbackUser);
        setCredits(fallbackUser.credits);
      }
    };

  useEffect(() => {
    // Reset state when user logs out or changes
    setUserdetails(null);
    setHasFetched(false);
    setCredits(1000);
  }, [user?.id]);

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      // Clear github token cookie when signed out
      fetch("/api/github/logout", { method: "POST" }).catch((err) =>
        console.error("Logout API Error:", err)
      );
    }
  }, [isLoaded, isSignedIn]);

  useEffect(() => {
    let active = true;
    const isClerkEnabled = !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
    let timer: NodeJS.Timeout | null = null;

    if (!isClerkEnabled) {
      timer = setTimeout(() => {
        if (
          active &&
          !userDetails &&
          !hasFetched
        ) {
          createUser();
        }
      }, 1500);
    }

    if (
      isLoaded &&
      isSignedIn &&
      user?.id
    ) {
      if (timer) {
        clearTimeout(timer);
      }
      createUser();
    }

    return () => {
      active = false;
      if (timer) {
        clearTimeout(timer);
      }
    };
  }, [
    isLoaded,
    isSignedIn,
    user?.id,
    hasFetched,
  ]);

  useEffect(() => {
    console.log(
      "Credits Updated:",
      credits
    );
  }, [credits]);

  return (
    <UserDetailContext.Provider
      value={{
        userDetails,
        credits,
        setCredits,
      }}
    >
      <Toaster
        position="top-right"
        reverseOrder={false}
        gutter={8}
        toastOptions={{
          duration: 4000,
          style: {
            background: "#090d16",
            color: "#f8fafc",
            border: "1px solid rgba(255, 255, 255, 0.12)",
            borderRadius: "12px",
            fontSize: "13.5px",
            fontWeight: "500",
            boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 8px 10px -6px rgba(0, 0, 0, 0.5)",
            backdropFilter: "blur(12px)",
          },
          success: {
            iconTheme: {
              primary: "#10b981",
              secondary: "#ffffff",
            },
          },
          error: {
            duration: 5000,
            iconTheme: {
              primary: "#ef4444",
              secondary: "#ffffff",
            },
          },
        }}
      />
      {children}
    </UserDetailContext.Provider>
  );
}

export default Provider;