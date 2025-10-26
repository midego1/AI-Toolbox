import { BarChart3 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function UsagePage() {
  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-6">
        <div className="flex items-center space-x-3 mb-2">
          <BarChart3 className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold tracking-tight">Usage Statistics</h1>
        </div>
        <p className="text-muted-foreground">
          Track your AI tool usage and credit consumption
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Coming Soon</CardTitle>
          <CardDescription>
            Detailed analytics and usage reports will be available here
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            View charts, graphs, and detailed breakdowns of your credit usage across
            all AI tools.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
