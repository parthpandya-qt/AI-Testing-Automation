"use client";

import React, {
  useEffect,
  useState,
} from "react";
import axios from "axios";
import { useUser } from "@clerk/nextjs";
import { UserDetailContext } from "@/context/userDetailContext";

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

      try {
        const result =
          await axios.post(
            "/api/users",
            {}
          );

        setUserdetails(
          result.data
        );

        if (
          result.data?.id
        ) {
          getCredits(
            result.data.id
          );
        }
      } catch (error) {
        console.log(error);

        const fallbackUser = {
          id: 10,
          name: "Parth (Local Fallback)",
          email:
            "parth.pandya1307@gmail.com",
          credits: 1000,
        };

        setUserdetails(
          fallbackUser
        );

        getCredits(
          fallbackUser.id
        );
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

    const timer =
      setTimeout(() => {
        if (
          active &&
          !userDetails &&
          !hasFetched
        ) {
          createUser();
        }
      }, 1500);

    if (
      isLoaded &&
      isSignedIn &&
      user?.id
    ) {
      clearTimeout(
        timer
      );

      createUser();
    }

    return () => {
      active = false;

      clearTimeout(
        timer
      );
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
      {children}
    </UserDetailContext.Provider>
  );
}

export default Provider;