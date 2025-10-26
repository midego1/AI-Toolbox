import { Linkedin } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function LinkedInPage() {
  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-6">
        <div className="flex items-center space-x-3 mb-2">
          <Linkedin className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold tracking-tight">LinkedIn Content Generator</h1>
        </div>
        <p className="text-muted-foreground">
          Generate professional LinkedIn recommendations and content
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
            Create compelling LinkedIn posts, recommendations, and profile summaries
            with AI assistance.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
