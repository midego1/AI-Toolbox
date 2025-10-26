import { Camera } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function HeadshotPage() {
  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-6">
        <div className="flex items-center space-x-3 mb-2">
          <Camera className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold tracking-tight">Professional Headshot</h1>
        </div>
        <p className="text-muted-foreground">
          Transform your photos into professional headshots
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Coming Soon</CardTitle>
          <CardDescription>
            This feature is under development and will be available soon
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Upload your photo and our AI will create professional headshots perfect for
            LinkedIn, resumes, and business profiles.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
