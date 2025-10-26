import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Languages,
  FileText,
  Image,
  Camera,
  Linkedin,
  TrendingUp,
  Clock,
  Zap,
} from "lucide-react";

const quickAccessTools = [
  {
    name: "Translation",
    href: "/tools/translation",
    icon: Languages,
    description: "Translate text instantly",
    color: "text-blue-500",
  },
  {
    name: "OCR",
    href: "/tools/ocr",
    icon: FileText,
    description: "Extract text from images",
    color: "text-green-500",
  },
  {
    name: "Image Gen",
    href: "/tools/image-generation",
    icon: Image,
    description: "Create AI images",
    color: "text-purple-500",
  },
  {
    name: "Headshot",
    href: "/tools/headshot",
    icon: Camera,
    description: "Professional photos",
    color: "text-pink-500",
  },
  {
    name: "LinkedIn",
    href: "/tools/linkedin",
    icon: Linkedin,
    description: "Generate content",
    color: "text-blue-600",
  },
];

const recentActivity = [
  {
    tool: "Image Generation",
    time: "2 minutes ago",
    credits: 10,
  },
  {
    tool: "Translation",
    time: "1 hour ago",
    credits: 1,
  },
  {
    tool: "OCR Scan",
    time: "3 hours ago",
    credits: 2,
  },
];

export default function DashboardPage() {
  return (
    <div className="container mx-auto p-6 space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back! Here's an overview of your AI Toolbox.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Credits Remaining
            </CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">450</div>
            <p className="text-xs text-muted-foreground">
              Pro Plan • Renews in 15 days
            </p>
            <Link href="/billing">
              <Button variant="link" className="px-0 mt-2" size="sm">
                Buy more credits
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">120</div>
            <p className="text-xs text-muted-foreground">
              Credits used • 88% remaining
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Jobs</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,234</div>
            <p className="text-xs text-muted-foreground">
              All-time completed tasks
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Access Tools */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Quick Access</h2>
        <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-5">
          {quickAccessTools.map((tool) => {
            const Icon = tool.icon;
            return (
              <Link key={tool.name} href={tool.href}>
                <Card className="hover:bg-muted/50 transition-colors cursor-pointer h-full">
                  <CardHeader className="text-center space-y-2">
                    <div className="mx-auto">
                      <Icon className={`h-10 w-10 ${tool.color}`} />
                    </div>
                    <CardTitle className="text-base">{tool.name}</CardTitle>
                    <CardDescription className="text-xs">
                      {tool.description}
                    </CardDescription>
                  </CardHeader>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Your latest AI tool usage</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between border-b pb-3 last:border-0 last:pb-0"
                >
                  <div>
                    <p className="font-medium text-sm">{activity.tool}</p>
                    <p className="text-xs text-muted-foreground">
                      {activity.time}
                    </p>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    -{activity.credits} credits
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Getting Started</CardTitle>
            <CardDescription>Tips to maximize your experience</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold flex-shrink-0">
                  1
                </div>
                <div>
                  <p className="text-sm font-medium">Try different AI tools</p>
                  <p className="text-xs text-muted-foreground">
                    Explore all available tools to see what fits your needs
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold flex-shrink-0">
                  2
                </div>
                <div>
                  <p className="text-sm font-medium">Monitor your usage</p>
                  <p className="text-xs text-muted-foreground">
                    Check the Usage Stats page to track your credit consumption
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold flex-shrink-0">
                  3
                </div>
                <div>
                  <p className="text-sm font-medium">Upgrade when needed</p>
                  <p className="text-xs text-muted-foreground">
                    Consider upgrading your plan for more credits and features
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
