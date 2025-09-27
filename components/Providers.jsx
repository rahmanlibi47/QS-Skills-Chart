"use client";

import React, { createContext, useContext, useState } from "react";
import { SessionProvider } from "next-auth/react";

const EmailContext = createContext();

export function EmailProvider({ children }) {
  const [email, setEmail] = useState("");
  return (
    <EmailContext.Provider value={{ email, setEmail }}>
      {children}
    </EmailContext.Provider>
  );
}

export function useEmail() {
  return useContext(EmailContext);
}

export default function Providers({ children }) {
  return (
    <SessionProvider>
      <EmailProvider>{children}</EmailProvider>
    </SessionProvider>
  );
}
