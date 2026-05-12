"use client";

import { useAuth } from "@clerk/nextjs";
import { useEffect } from "react";
import { setAuthToken } from "@/services/authTokenManager";

export function AuthTokenBridge() {
  const { isSignedIn, getToken } = useAuth();

  useEffect(() => {
    if (!isSignedIn) return;

    getToken({ template: "backend" }).then(token => {
      if (token) {
        setAuthToken(token);
      }
    });
  }, [isSignedIn, getToken]);

  return null;
}
