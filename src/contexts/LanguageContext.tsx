"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { getAuthToken } from "@/lib/auth-client";
import type { Language } from "@/lib/translations";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  isLoading: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const token = getAuthToken();
  const userProfile = useQuery(api.users.getUserProfile, token ? { token } : "skip");
  const updateLanguage = useMutation(api.users.updateUserLanguage);
  
  const [language, setLanguageState] = useState<Language>("nl");
  const [isLoading, setIsLoading] = useState(true);

  // Load language from user profile
  useEffect(() => {
    if (userProfile) {
      setLanguageState((userProfile.language as Language) || "nl");
      setIsLoading(false);
    } else if (userProfile === undefined) {
      // Still loading
      return;
    } else {
      // User not logged in or profile not available
      setIsLoading(false);
    }
  }, [userProfile]);

  const setLanguage = async (lang: Language) => {
    setLanguageState(lang);
    
    // Update in database if user is logged in
    if (token && userProfile) {
      try {
        await updateLanguage({ token, language: lang });
      } catch (error) {
        console.error("Failed to update language:", error);
      }
    }
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, isLoading }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}


