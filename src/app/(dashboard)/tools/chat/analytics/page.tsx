"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, MessageSquare, TrendingUp, Clock, ThumbsUp, Star, Brain, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function ChatAnalyticsPage() {
  const [timeRange, setTimeRange] = useState<"7d" | "30d" | "90d" | "all">("30d");
  const token = typeof window !== "undefined" ? localStorage.getItem("authToken") : null;

  const analytics = useQuery(
    api.tools.chat.getChatAnalytics,
    token ? { token, timeRange } : "skip"
  );

  const timeRangeLabels = {
    "7d": "Last 7 Days",
    "30d": "Last 30 Days",
    "90d": "Last 90 Days",
    "all": "All Time",
  };

  if (!analytics) {
    return (
      <div className="container mx-auto p-6 max-w-6xl">
        <div className="flex items-center justify-center h-64">
          <div className="text-muted-foreground">Loading analytics...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <BarChart3 className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Chat Analytics</h1>
              <p className="text-muted-foreground">
                Insights into your AI conversations
              </p>
            </div>
          </div>
          <Link href="/tools/chat">
            <Button variant="outline">
              <MessageSquare className="h-4 w-4 mr-2" />
              Back to Chat
            </Button>
          </Link>
        </div>

        {/* Time Range Selector */}
        <div className="flex space-x-2">
          {(Object.keys(timeRangeLabels) as Array<keyof typeof timeRangeLabels>).map((range) => (
            <Button
              key={range}
              variant={timeRange === range ? "default" : "outline"}
              size="sm"
              onClick={() => setTimeRange(range)}
            >
              {timeRangeLabels[range]}
            </Button>
          ))}
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Sessions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <MessageSquare className="h-8 w-8 text-blue-500" />
              <span className="text-3xl font-bold">{analytics.totalSessions}</span>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {analytics.favoriteCount} favorited
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Messages
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-8 w-8 text-green-500" />
              <span className="text-3xl font-bold">{analytics.totalMessages}</span>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {analytics.avgMessagesPerSession} avg per session
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Avg Response Time
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <Clock className="h-8 w-8 text-orange-500" />
              <span className="text-3xl font-bold">{analytics.avgResponseTime}</span>
              <span className="text-sm text-muted-foreground">ms</span>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Average AI response time
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Credits Used
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <CreditCard className="h-8 w-8 text-purple-500" />
              <span className="text-3xl font-bold">{analytics.totalCreditsUsed}</span>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Total spent on chat
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quality Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <ThumbsUp className="h-5 w-5 text-green-600" />
              <span>Helpfulness</span>
            </CardTitle>
            <CardDescription>User feedback rating</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-3">
              <div className="text-4xl font-bold">{analytics.helpfulnessRate}%</div>
              <div className="flex-1">
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div 
                    className="bg-green-600 h-2.5 rounded-full" 
                    style={{ width: `${analytics.helpfulnessRate}%` }}
                  />
                </div>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {analytics.helpfulResponses} helpful responses
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Star className="h-5 w-5 text-yellow-500" />
              <span>User Rating</span>
            </CardTitle>
            <CardDescription>Average rating (1-5 stars)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <span className="text-4xl font-bold">{analytics.avgRating}</span>
              <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`h-5 w-5 ${
                      star <= analytics.avgRating
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-gray-300"
                    }`}
                  />
                ))}
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Based on user feedback
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Daily Activity Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Daily Activity</CardTitle>
          <CardDescription>Sessions, messages, and credits per day</CardDescription>
        </CardHeader>
        <CardContent>
          {analytics.dailyStats && analytics.dailyStats.length > 0 ? (
            <div className="space-y-2">
              {analytics.dailyStats.slice(-14).map((day: any) => (
                <div key={day.date} className="flex items-center justify-between border-b pb-2">
                  <span className="text-sm font-medium min-w-[100px]">
                    {new Date(day.date).toLocaleDateString("en-US", { 
                      month: "short", 
                      day: "numeric" 
                    })}
                  </span>
                  <div className="flex space-x-4 text-sm">
                    <span className="flex items-center space-x-1">
                      <MessageSquare className="h-3 w-3 text-blue-500" />
                      <span>{day.sessions} sessions</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <TrendingUp className="h-3 w-3 text-green-500" />
                      <span>{day.messages} msgs</span>
                    </span>
                    <span className="flex items-center space-x-1 text-muted-foreground">
                      <CreditCard className="h-3 w-3" />
                      <span>{day.credits} credits</span>
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-muted-foreground py-8">
              No activity data yet. Start chatting to see your analytics!
            </div>
          )}
        </CardContent>
      </Card>

      {/* Usage Insights */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Usage Insights</CardTitle>
          <CardDescription>Key findings from your chat history</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <h3 className="font-semibold text-blue-900 mb-2">Most Active Period</h3>
              <p className="text-sm text-blue-700">
                {analytics.dailyStats && analytics.dailyStats.length > 0 ? (
                  <>
                    You had the most conversations on{" "}
                    {analytics.dailyStats.reduce((max: any, day: any) => 
                      day.sessions > max.sessions ? day : max
                    ).date}
                  </>
                ) : (
                  "Start chatting to see insights!"
                )}
              </p>
            </div>

            <div className="p-4 bg-green-50 rounded-lg">
              <h3 className="font-semibold text-green-900 mb-2">Efficiency Score</h3>
              <p className="text-sm text-green-700">
                {analytics.avgMessagesPerSession > 0 ? (
                  <>
                    Average of {analytics.avgMessagesPerSession} messages per conversation
                    {analytics.avgMessagesPerSession > 10 && " - You like in-depth discussions!"}
                    {analytics.avgMessagesPerSession <= 10 && analytics.avgMessagesPerSession > 5 && " - Balanced conversations"}
                    {analytics.avgMessagesPerSession <= 5 && " - Quick and concise!"}
                  </>
                ) : (
                  "Start chatting to see your efficiency!"
                )}
              </p>
            </div>

            <div className="p-4 bg-purple-50 rounded-lg">
              <h3 className="font-semibold text-purple-900 mb-2">AI Response Quality</h3>
              <p className="text-sm text-purple-700">
                {analytics.totalMessages > 0 ? (
                  <>
                    Average {analytics.avgResponseTime}ms response time
                    {analytics.avgResponseTime < 1000 && " - Fast responses!"}
                    {analytics.avgResponseTime >= 1000 && " - Good performance"}
                  </>
                ) : (
                  "Start chatting to see metrics"
                )}
              </p>
            </div>

            <div className="p-4 bg-yellow-50 rounded-lg">
              <h3 className="font-semibold text-yellow-900 mb-2">Cost Efficiency</h3>
              <p className="text-sm text-yellow-700">
                {analytics.totalCreditsUsed > 0 ? (
                  <>
                    {(analytics.totalCreditsUsed / Math.max(analytics.totalMessages, 1)).toFixed(1)} credits per message on average
                    {(analytics.totalCreditsUsed / Math.max(analytics.totalMessages, 1)) <= 2.5 && " - Cost effective!"}
                  </>
                ) : (
                  "Start chatting to track costs"
                )}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

