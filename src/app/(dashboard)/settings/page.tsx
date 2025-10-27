"use client";

import { Settings as SettingsIcon, Languages, Globe } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/contexts/LanguageContext";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { getAuthToken } from "@/lib/auth-client";

const LANGUAGES = [
  { code: "nl", name: "Nederlands", native: "Nederlands", flag: "🇳🇱" },
  { code: "en", name: "English", native: "English", flag: "🇬🇧" },
];

export default function SettingsPage() {
  const { language, setLanguage, isLoading } = useLanguage();
  const token = getAuthToken();
  const userProfile = useQuery(api.users.getUserProfile, token ? { token } : "skip");

  const translations = {
    en: {
      title: "Settings",
      description: "Manage your account and preferences",
      language: "Language",
      languageDesc: "Choose your preferred language for the interface",
      profile: "Profile Information",
      email: "Email",
      name: "Name",
      subscription: "Subscription",
      credits: "Credits Balance",
      account: "Account Settings",
      preferences: "Preferences",
    },
    nl: {
      title: "Instellingen",
      description: "Beheer uw account en voorkeuren",
      language: "Taal",
      languageDesc: "Kies uw voorkeurstaal voor de interface",
      profile: "Profielinformatie",
      email: "E-mail",
      name: "Naam",
      subscription: "Abonnement",
      credits: "Creditsaldo",
      account: "Account instellingen",
      preferences: "Voorkeuren",
    },
  };

  const t = translations[language];

  const handleLanguageChange = (lang: string) => {
    setLanguage(lang as "nl" | "en");
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-6">
        <div className="flex items-center space-x-3 mb-2">
          <SettingsIcon className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold tracking-tight">{t.title}</h1>
        </div>
        <p className="text-muted-foreground">
          {t.description}
        </p>
      </div>

      {/* Language Settings */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Languages className="h-5 w-5 text-primary" />
            <CardTitle>{t.language}</CardTitle>
          </div>
          <CardDescription>{t.languageDesc}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {LANGUAGES.map((lang) => (
            <div
              key={lang.code}
              className={`flex items-center justify-between p-4 border rounded-lg cursor-pointer transition-all ${
                language === lang.code
                  ? "border-primary bg-primary/5"
                  : "hover:border-primary/50"
              }`}
              onClick={() => handleLanguageChange(lang.code)}
            >
              <div className="flex items-center space-x-3">
                <span className="text-2xl">{lang.flag}</span>
                <div>
                  <div className="font-medium">{lang.name}</div>
                  <div className="text-sm text-muted-foreground">{lang.native}</div>
                </div>
              </div>
              {language === lang.code && (
                <Badge variant="default">
                  Active
                </Badge>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Profile Information */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Globe className="h-5 w-5 text-primary" />
            <CardTitle>{t.profile}</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {userProfile && (
            <>
              <div className="space-y-2">
                <Label>{t.email}</Label>
                <div className="text-sm p-3 bg-muted rounded-md">
                  {userProfile.email}
                </div>
              </div>
              
              {userProfile.name && (
                <div className="space-y-2">
                  <Label>{t.name}</Label>
                  <div className="text-sm p-3 bg-muted rounded-md">
                    {userProfile.name}
                  </div>
                </div>
              )}
              
              <div className="space-y-2">
                <Label>{t.subscription}</Label>
                <div className="text-sm p-3 bg-muted rounded-md">
                  <Badge variant="secondary" className="capitalize">
                    {userProfile.subscriptionTier}
                  </Badge>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>{t.credits}</Label>
                <div className="text-sm p-3 bg-muted rounded-md font-bold text-lg">
                  {userProfile.creditsBalance.toLocaleString()}
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Account Settings */}
      <Card>
        <CardHeader>
          <CardTitle>{t.account}</CardTitle>
          <CardDescription>{t.preferences}</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            {language === "nl" 
              ? "Meer account-opties komen binnenkort beschikbaar."
              : "More account options will be available soon."}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
