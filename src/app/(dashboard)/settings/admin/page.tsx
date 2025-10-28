"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { useAuthToken } from "@/hooks/useAuthToken";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { 
  Shield, Users, Activity, CreditCard, Database, 
  Settings, TrendingUp, AlertTriangle, RefreshCw,
  Search, Plus, Check, X, BarChart3,
  Zap, DollarSign, ToggleLeft, ToggleRight, Edit,
  ChevronRight, ChevronDown
} from "lucide-react";
import { Id } from "../../../../../convex/_generated/dataModel";

export default function AdminPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUserId, setSelectedUserId] = useState<Id<"users"> | null>(null);
  const [activeTab, setActiveTab] = useState("overview");
  
  const token = useAuthToken();
  
  // Handle tab persistence via URL hash
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash.slice(1);
      if (hash) {
        setActiveTab(hash);
      }
    }
  }, []);
  
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    if (typeof window !== 'undefined') {
      window.location.hash = value;
    }
  };
  
  // Load data
  const systemStats = useQuery(api.adminTools.getSystemStats, token ? { token } : "skip");
  const recentActivity = useQuery(api.adminTools.getRecentActivity, token ? { token, limit: 20 } : "skip");
  const systemHealth = useQuery(api.adminTools.getSystemHealth, token ? { token } : "skip");
  const allUsers = useQuery(api.adminTools.getAllUsers, token ? { token, limit: 100 } : "skip");
  
  // Debug logging
  useEffect(() => {
    console.log("AdminPage - token:", token ? "available" : "not available");
    console.log("AdminPage - systemStats:", systemStats);
    console.log("AdminPage - allUsers:", allUsers);
    console.log("AdminPage - systemHealth:", systemHealth);
  }, [token, systemStats, allUsers, systemHealth]);
  
  const searchResults = useQuery(
    api.adminTools.searchUsers, 
    token && searchTerm.length > 2 ? { token, searchTerm } : "skip"
  );
  const userDetails = useQuery(
    api.adminTools.getUserDetails,
    token && selectedUserId ? { token, userId: selectedUserId } : "skip"
  );
  const toolConfigs = useQuery(api.adminTools.getAllToolConfigs, token ? { token } : "skip");
  
  // Mutations
  const addCredits = useMutation(api.adminTools.addCreditsToUser);
  const setCredits = useMutation(api.adminTools.setUserCredits);
  const updateAdminStatus = useMutation(api.adminTools.updateUserAdminStatus);
  const updateTier = useMutation(api.adminTools.updateUserTier);
  const cleanupSessions = useMutation(api.adminTools.cleanupExpiredSessions);
  const resetStuckJobs = useMutation(api.adminTools.resetStuckJobs);
  const toggleToolStatus = useMutation(api.adminTools.toggleToolStatus);
  
  if (!token) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle>Authentication Required</CardTitle>
            <CardDescription>Please log in to access admin settings</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto p-6 max-w-7xl">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-3">
            <Shield className="h-6 w-6 text-red-500" />
            <h1 className="text-2xl font-bold tracking-tight">Admin Settings</h1>
          </div>
          {systemHealth?.overallHealth && (
            <Badge variant={systemHealth.overallHealth === "healthy" ? "default" : "destructive"}>
              {systemHealth.overallHealth === "healthy" ? "System Healthy" : "Needs Attention"}
            </Badge>
          )}
        </div>
        <p className="text-muted-foreground">
          Comprehensive system administration and management
        </p>
      </div>
      
      {/* Tabs - Using consistent component */}
      <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
        <TabsList className="w-full justify-start overflow-x-auto">
          <TabsTrigger value="overview" className="flex items-center space-x-2">
            <BarChart3 className="h-4 w-4" />
            <span>Overview</span>
          </TabsTrigger>
          <TabsTrigger value="users" className="flex items-center space-x-2">
            <Users className="h-4 w-4" />
            <span>Users</span>
          </TabsTrigger>
          <TabsTrigger value="jobs" className="flex items-center space-x-2">
            <Activity className="h-4 w-4" />
            <span>Jobs</span>
          </TabsTrigger>
          <TabsTrigger value="credits" className="flex items-center space-x-2">
            <CreditCard className="h-4 w-4" />
            <span>Credits</span>
          </TabsTrigger>
          <TabsTrigger value="subscriptions" className="flex items-center space-x-2">
            <DollarSign className="h-4 w-4" />
            <span>Subscriptions</span>
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center space-x-2">
            <TrendingUp className="h-4 w-4" />
            <span>Analytics</span>
          </TabsTrigger>
          <TabsTrigger value="health" className="flex items-center space-x-2">
            <AlertTriangle className="h-4 w-4" />
            <span>Health</span>
          </TabsTrigger>
          <TabsTrigger value="ai-tools" className="flex items-center space-x-2">
            <Zap className="h-4 w-4" />
            <span>AI Tools</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <OverviewTab 
            systemStats={systemStats} 
            recentActivity={recentActivity}
            systemHealth={systemHealth}
          />
        </TabsContent>
        
        <TabsContent value="users" className="space-y-6">
          <UsersTab
            users={allUsers}
            searchResults={searchResults}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            selectedUserId={selectedUserId}
            setSelectedUserId={setSelectedUserId}
            userDetails={userDetails}
            addCredits={addCredits}
            setCredits={setCredits}
            updateAdminStatus={updateAdminStatus}
            updateTier={updateTier}
            token={token}
          />
        </TabsContent>
        
        <TabsContent value="jobs" className="space-y-6">
          <JobsTab token={token} />
        </TabsContent>
        
        <TabsContent value="credits" className="space-y-6">
          <CreditsTab token={token} />
        </TabsContent>
        
        <TabsContent value="subscriptions" className="space-y-6">
          <SubscriptionsTab token={token} />
        </TabsContent>
        
        <TabsContent value="analytics" className="space-y-6">
          <AnalyticsTab token={token} />
        </TabsContent>
        
        <TabsContent value="health" className="space-y-6">
          <HealthTab
            systemHealth={systemHealth}
            cleanupSessions={cleanupSessions}
            resetStuckJobs={resetStuckJobs}
            token={token}
          />
        </TabsContent>
        
        <TabsContent value="ai-tools" className="space-y-6">
          <AIToolsTab
            toolConfigs={toolConfigs}
            toggleToolStatus={toggleToolStatus}
            token={token}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// ============================================================================
// OVERVIEW TAB
// ============================================================================

function OverviewTab({ systemStats, recentActivity, systemHealth }: any) {
  if (!systemStats) {
    return <div>Loading statistics...</div>;
  }
  
  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Users"
          value={systemStats.users.total}
          subtitle={`+${systemStats.users.newLast7Days} this week`}
          icon={Users}
          color="blue"
        />
        <StatCard
          title="Total Jobs"
          value={systemStats.jobs.total}
          subtitle={`${systemStats.jobs.completed} completed`}
          icon={Activity}
          color="green"
        />
        <StatCard
          title="Credits Used"
          value={systemStats.credits.totalUsed.toLocaleString()}
          subtitle={`${systemStats.credits.currentBalance.toLocaleString()} remaining`}
          icon={CreditCard}
          color="purple"
        />
        <StatCard
          title="Active Subs"
          value={systemStats.subscriptions.active}
          subtitle={`of ${systemStats.subscriptions.total} total`}
          icon={DollarSign}
          color="orange"
        />
      </div>
      
      {/* User Tier Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>User Distribution</CardTitle>
          <CardDescription>Breakdown by subscription tier</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <TierBar label="Free" count={systemStats.users.free} total={systemStats.users.total} color="gray" />
            <TierBar label="Pro" count={systemStats.users.pro} total={systemStats.users.total} color="blue" />
            <TierBar label="Enterprise" count={systemStats.users.enterprise} total={systemStats.users.total} color="purple" />
            <TierBar label="Admins" count={systemStats.users.admins} total={systemStats.users.total} color="red" />
          </div>
        </CardContent>
      </Card>
      
      {/* Jobs by Type */}
      <Card>
        <CardHeader>
          <CardTitle>Jobs by Tool Type</CardTitle>
          <CardDescription>Distribution of job types</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {Object.entries(systemStats.jobs.byType).map(([type, count]: [string, any]) => (
              <div key={type} className="p-3 border rounded-lg">
                <div className="text-xs font-medium text-muted-foreground mb-1">
                  {type.replace(/_/g, " ").toUpperCase()}
                </div>
                <div className="text-xl font-bold">{count}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      
      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Latest jobs across all users</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {recentActivity?.map((activity: any) => (
              <div key={activity.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <Activity className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <div className="text-sm font-medium">{activity.userEmail}</div>
                    <div className="text-xs text-muted-foreground">
                      {activity.toolType} · {activity.creditsUsed} credits
                    </div>
                  </div>
                </div>
                <Badge variant={
                  activity.status === "completed" ? "default" :
                  activity.status === "failed" ? "destructive" :
                  "secondary"
                }>
                  {activity.status}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ============================================================================
// USERS TAB
// ============================================================================

function UsersTab({ 
  users, searchResults, searchTerm, setSearchTerm, 
  selectedUserId, setSelectedUserId, userDetails,
  addCredits, setCredits, updateAdminStatus, updateTier, token 
}: any) {
  const [creditAmount, setCreditAmount] = useState("");
  const [loading, setLoading] = useState(false);
  
  const displayUsers = searchTerm.length > 2 ? searchResults : users;
  
  const handleAddCredits = async (userId: Id<"users">, amount: number) => {
    if (!token) return;
    setLoading(true);
    try {
      await addCredits({ token, userId, amount, description: `Admin added ${amount} credits` });
      setCreditAmount("");
    } catch (error) {
      console.error("Failed to add credits:", error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleSetCredits = async (userId: Id<"users">, amount: number) => {
    if (!token) return;
    setLoading(true);
    try {
      await setCredits({ token, userId, amount });
      setCreditAmount("");
    } catch (error) {
      console.error("Failed to set credits:", error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleToggleAdmin = async (userId: Id<"users">, currentStatus: boolean) => {
    if (!token) return;
    setLoading(true);
    try {
      await updateAdminStatus({ token, userId, isAdmin: !currentStatus });
    } catch (error) {
      console.error("Failed to update admin status:", error);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* User List */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>User Management</CardTitle>
          <CardDescription>Search and manage all users</CardDescription>
          <div className="relative mt-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by email or name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 max-h-[600px] overflow-y-auto">
            {displayUsers?.map((user: any) => (
              <div
                key={user._id}
                className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                  selectedUserId === user._id ? "border-primary bg-primary/5" : "hover:border-primary/50"
                }`}
                onClick={() => setSelectedUserId(user._id)}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">{user.email}</div>
                    {user.name && (
                      <div className="text-sm text-muted-foreground">{user.name}</div>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    {user.isAdmin && (
                      <Badge variant="destructive">Admin</Badge>
                    )}
                    <Badge variant="outline">{user.subscriptionTier}</Badge>
                  </div>
                </div>
                <div className="mt-2 flex items-center space-x-4 text-sm text-muted-foreground">
                  <span>{user.creditsBalance.toLocaleString()} credits</span>
                  <span>·</span>
                  <span>{new Date(user.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      
      {/* User Details Panel */}
      <Card>
        <CardHeader>
          <CardTitle>User Details</CardTitle>
          <CardDescription>
            {selectedUserId ? "Manage selected user" : "Select a user to view details"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {userDetails ? (
            <div className="space-y-4">
              {/* User Info */}
              <div className="space-y-2">
                <Label>Email</Label>
                <div className="text-sm font-mono p-2 bg-muted rounded">
                  {userDetails.user.email}
                </div>
              </div>
              
              {userDetails.user.name && (
                <div className="space-y-2">
                  <Label>Name</Label>
                  <div className="text-sm p-2 bg-muted rounded">
                    {userDetails.user.name}
                  </div>
                </div>
              )}
              
              {/* Stats */}
              <div className="grid grid-cols-2 gap-2">
                <div className="p-3 border rounded">
                  <div className="text-xs text-muted-foreground">Total Jobs</div>
                  <div className="text-xl font-bold">{userDetails.stats.totalJobs}</div>
                </div>
                <div className="p-3 border rounded">
                  <div className="text-xs text-muted-foreground">Completed</div>
                  <div className="text-xl font-bold">{userDetails.stats.completedJobs}</div>
                </div>
                <div className="p-3 border rounded">
                  <div className="text-xs text-muted-foreground">Failed</div>
                  <div className="text-xl font-bold">{userDetails.stats.failedJobs}</div>
                </div>
                <div className="p-3 border rounded">
                  <div className="text-xs text-muted-foreground">Credits Used</div>
                  <div className="text-xl font-bold">{userDetails.stats.totalCreditsUsed.toLocaleString()}</div>
                </div>
              </div>
              
              {/* Credit Management */}
              <div className="space-y-3 pt-4 border-t">
                <Label>Credit Balance</Label>
                <div className="text-xl font-bold">{userDetails.user.creditsBalance.toLocaleString()}</div>
                
                <div className="space-y-2">
                  <Input
                    type="number"
                    placeholder="Amount"
                    value={creditAmount}
                    onChange={(e) => setCreditAmount(e.target.value)}
                    disabled={loading}
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleAddCredits(selectedUserId!, parseInt(creditAmount) || 0)}
                      disabled={loading || !creditAmount}
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Add
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleSetCredits(selectedUserId!, parseInt(creditAmount) || 0)}
                      disabled={loading || !creditAmount}
                    >
                      <Settings className="h-4 w-4 mr-1" />
                      Set
                    </Button>
                  </div>
                </div>
              </div>
              
              {/* Admin Toggle */}
              <div className="space-y-3 pt-4 border-t">
                <Label>Admin Status</Label>
                <Button
                  variant={userDetails.user.isAdmin ? "destructive" : "default"}
                  className="w-full"
                  onClick={() => handleToggleAdmin(selectedUserId!, userDetails.user.isAdmin)}
                  disabled={loading}
                >
                  {userDetails.user.isAdmin ? (
                    <>
                      <X className="h-4 w-4 mr-2" />
                      Remove Admin
                    </>
                  ) : (
                    <>
                      <Check className="h-4 w-4 mr-2" />
                      Make Admin
                    </>
                  )}
                </Button>
              </div>
              
              {/* Recent Transactions */}
              <div className="space-y-3 pt-4 border-t">
                <Label>Recent Transactions</Label>
                <div className="space-y-1 max-h-48 overflow-y-auto">
                  {userDetails.recentTransactions?.map((tx: any) => (
                    <div key={tx._id} className="text-xs p-2 border rounded">
                      <div className="flex justify-between">
                        <span className={tx.amount > 0 ? "text-green-600" : "text-red-600"}>
                          {tx.amount > 0 ? "+" : ""}{tx.amount}
                        </span>
                        <span className="text-muted-foreground">{tx.type}</span>
                      </div>
                      <div className="text-muted-foreground truncate">{tx.description}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center text-muted-foreground py-8">
              Select a user to view details
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// ============================================================================
// JOBS TAB
// ============================================================================

function JobsTab({ token }: { token: string }) {
  const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined);
  
  const jobs = useQuery(
    api.adminTools.getAllJobs,
    token ? { token, status: statusFilter, limit: 100 } : "skip"
  );
  
  const retryJob = useMutation(api.adminTools.retryJob);
  
  const handleRetry = async (jobId: Id<"aiJobs">) => {
    try {
      await retryJob({ token, jobId });
    } catch (error) {
      console.error("Failed to retry job:", error);
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Job Management</CardTitle>
        <CardDescription>Monitor and manage all AI jobs</CardDescription>
        <div className="flex space-x-2 mt-4">
          <Button
            variant={!statusFilter ? "default" : "outline"}
            size="sm"
            onClick={() => setStatusFilter(undefined)}
          >
            All
          </Button>
          <Button
            variant={statusFilter === "pending" ? "default" : "outline"}
            size="sm"
            onClick={() => setStatusFilter("pending")}
          >
            Pending
          </Button>
          <Button
            variant={statusFilter === "processing" ? "default" : "outline"}
            size="sm"
            onClick={() => setStatusFilter("processing")}
          >
            Processing
          </Button>
          <Button
            variant={statusFilter === "completed" ? "default" : "outline"}
            size="sm"
            onClick={() => setStatusFilter("completed")}
          >
            Completed
          </Button>
          <Button
            variant={statusFilter === "failed" ? "default" : "outline"}
            size="sm"
            onClick={() => setStatusFilter("failed")}
          >
            Failed
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 max-h-[600px] overflow-y-auto">
          {jobs?.map((job: any) => (
            <div key={job._id} className="p-4 border rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-3">
                  <Activity className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <div className="font-medium">{job.toolType}</div>
                    <div className="text-sm text-muted-foreground">{job.userEmail}</div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant={
                    job.status === "completed" ? "default" :
                    job.status === "failed" ? "destructive" :
                    "secondary"
                  }>
                    {job.status}
                  </Badge>
                  {job.status === "failed" && (
                    <Button size="sm" variant="outline" onClick={() => handleRetry(job._id)}>
                      <RefreshCw className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              </div>
              <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                <span>{job.creditsUsed} credits</span>
                <span>·</span>
                <span>{new Date(job.createdAt).toLocaleString()}</span>
              </div>
              {job.errorMessage && (
                <div className="mt-2 text-sm text-red-600 p-2 bg-red-50 rounded">
                  {job.errorMessage}
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// ============================================================================
// CREDITS TAB
// ============================================================================

function CreditsTab({ token }: { token: string }) {
  const [typeFilter, setTypeFilter] = useState<string | undefined>(undefined);
  
  const transactions = useQuery(
    api.adminTools.getAllTransactions,
    token ? { token, limit: 100, type: typeFilter } : "skip"
  );
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Credit Transactions</CardTitle>
        <CardDescription>View all credit transactions across the system</CardDescription>
        <div className="flex space-x-2 mt-4">
          <Button
            variant={!typeFilter ? "default" : "outline"}
            size="sm"
            onClick={() => setTypeFilter(undefined)}
          >
            All
          </Button>
          <Button
            variant={typeFilter === "tool_usage" ? "default" : "outline"}
            size="sm"
            onClick={() => setTypeFilter("tool_usage")}
          >
            Tool Usage
          </Button>
          <Button
            variant={typeFilter === "subscription" ? "default" : "outline"}
            size="sm"
            onClick={() => setTypeFilter("subscription")}
          >
            Subscription
          </Button>
          <Button
            variant={typeFilter === "admin" ? "default" : "outline"}
            size="sm"
            onClick={() => setTypeFilter("admin")}
          >
            Admin
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 max-h-[600px] overflow-y-auto">
          {transactions?.map((tx: any) => (
            <div key={tx._id} className="p-4 border rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">{tx.userEmail}</div>
                  <div className="text-sm text-muted-foreground">{tx.description}</div>
                </div>
                <div className="text-right">
                  <div className={`text-base font-bold ${tx.amount > 0 ? "text-green-600" : "text-red-600"}`}>
                    {tx.amount > 0 ? "+" : ""}{tx.amount.toLocaleString()}
                  </div>
                  <Badge variant="outline">{tx.type}</Badge>
                </div>
              </div>
              <div className="mt-2 text-xs text-muted-foreground">
                {new Date(tx.createdAt).toLocaleString()}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// ============================================================================
// SUBSCRIPTIONS TAB
// ============================================================================

function SubscriptionsTab({ token }: { token: string }) {
  const subscriptions = useQuery(
    api.adminTools.getAllSubscriptions,
    token ? { token } : "skip"
  );
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Subscription Management</CardTitle>
        <CardDescription>View and manage all active subscriptions</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 max-h-[600px] overflow-y-auto">
          {subscriptions?.map((sub: any) => (
            <div key={sub._id} className="p-4 border rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <div className="font-medium">{sub.userEmail}</div>
                  <div className="text-sm text-muted-foreground">
                    Stripe ID: {sub.stripeSubscriptionId}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant={sub.status === "active" ? "default" : "secondary"}>
                    {sub.status}
                  </Badge>
                  <Badge variant="outline">{sub.tier}</Badge>
                </div>
              </div>
              <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                <span>Period: {new Date(sub.currentPeriodStart).toLocaleDateString()}</span>
                <span>→</span>
                <span>{new Date(sub.currentPeriodEnd).toLocaleDateString()}</span>
                {sub.cancelAtPeriodEnd && (
                  <Badge variant="destructive">Canceling</Badge>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// ============================================================================
// ANALYTICS TAB
// ============================================================================

function AnalyticsTab({ token }: { token: string }) {
  const [days, setDays] = useState(30);
  
  const usageAnalytics = useQuery(
    api.adminTools.getUsageAnalytics,
    token ? { token, days } : "skip"
  );
  
  const chatAnalytics = useQuery(
    api.adminTools.getChatAnalytics,
    token ? { token, days } : "skip"
  );
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Usage Analytics</CardTitle>
          <CardDescription>System usage over time</CardDescription>
          <div className="flex space-x-2 mt-4">
            <Button
              variant={days === 7 ? "default" : "outline"}
              size="sm"
              onClick={() => setDays(7)}
            >
              7 Days
            </Button>
            <Button
              variant={days === 30 ? "default" : "outline"}
              size="sm"
              onClick={() => setDays(30)}
            >
              30 Days
            </Button>
            <Button
              variant={days === 90 ? "default" : "outline"}
              size="sm"
              onClick={() => setDays(90)}
            >
              90 Days
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {usageAnalytics?.map((day: any) => (
              <div key={day.date} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div className="font-medium">{day.date}</div>
                  <div className="text-sm text-muted-foreground">
                    {day.totalJobs} jobs · {day.totalCredits.toLocaleString()} credits
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(day.toolCounts).map(([tool, count]: [string, any]) => (
                    <Badge key={tool} variant="outline">
                      {tool}: {count}
                    </Badge>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Chat Analytics</CardTitle>
          <CardDescription>Chat system performance metrics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {chatAnalytics?.map((analytics: any) => (
              <div key={analytics._id} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div className="font-medium">{analytics.date}</div>
                  <div className="text-sm text-muted-foreground">
                    {analytics.totalSessions} sessions · {analytics.totalMessages} messages
                  </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                  <div>
                    <span className="text-muted-foreground">Avg Messages:</span>{" "}
                    <span className="font-medium">{analytics.avgMessagesPerSession.toFixed(1)}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Avg Response:</span>{" "}
                    <span className="font-medium">{analytics.avgResponseTime.toFixed(0)}ms</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Confidence:</span>{" "}
                    <span className="font-medium">{(analytics.avgConfidence * 100).toFixed(1)}%</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Avg Rating:</span>{" "}
                    <span className="font-medium">{analytics.avgRating.toFixed(1)}/5</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ============================================================================
// HEALTH TAB
// ============================================================================

function HealthTab({ systemHealth, cleanupSessions, resetStuckJobs, token }: any) {
  const [loading, setLoading] = useState(false);
  
  const handleCleanupSessions = async () => {
    setLoading(true);
    try {
      const result = await cleanupSessions({ token });
      alert(`Deleted ${result.deleted} expired sessions`);
    } catch (error) {
      console.error("Failed to cleanup sessions:", error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleResetStuckJobs = async () => {
    setLoading(true);
    try {
      const result = await resetStuckJobs({ token });
      alert(`Reset ${result.reset} stuck jobs`);
    } catch (error) {
      console.error("Failed to reset stuck jobs:", error);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>System Health</CardTitle>
          <CardDescription>Monitor and maintain system health</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Overall Health */}
          <div className="p-4 border rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">Overall System Health</div>
                <div className="text-sm text-muted-foreground">Current system status</div>
              </div>
              <Badge variant={systemHealth?.overallHealth === "healthy" ? "default" : "destructive"} className="px-3 py-1">
                {systemHealth?.overallHealth === "healthy" ? "Healthy" : "Needs Attention"}
              </Badge>
            </div>
          </div>
          
          {/* Stuck Jobs */}
          <div className="p-4 border rounded-lg">
            <div className="flex items-center justify-between mb-3">
              <div>
                <div className="font-medium">Stuck Jobs</div>
                <div className="text-sm text-muted-foreground">
                  Jobs processing for over 1 hour
                </div>
              </div>
              <Badge variant={systemHealth?.stuckJobs.count > 0 ? "destructive" : "default"}>
                {systemHealth?.stuckJobs.count || 0}
              </Badge>
            </div>
            {systemHealth?.stuckJobs.count > 0 && (
              <Button onClick={handleResetStuckJobs} disabled={loading} variant="destructive" size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                Reset Stuck Jobs
              </Button>
            )}
          </div>
          
          {/* Recent Failures */}
          <div className="p-4 border rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">Recent Failures (24h)</div>
                <div className="text-sm text-muted-foreground">
                  Failure rate: {systemHealth?.recentFailures.rate}%
                </div>
              </div>
              <Badge variant={systemHealth?.recentFailures.count > 10 ? "destructive" : "default"}>
                {systemHealth?.recentFailures.count || 0}
              </Badge>
            </div>
          </div>
          
          {/* Expired Sessions */}
          <div className="p-4 border rounded-lg">
            <div className="flex items-center justify-between mb-3">
              <div>
                <div className="font-medium">Expired Sessions</div>
                <div className="text-sm text-muted-foreground">
                  Sessions that need cleanup
                </div>
              </div>
              <Badge variant="outline">
                {systemHealth?.expiredSessions.count || 0}
              </Badge>
            </div>
            {systemHealth?.expiredSessions.count > 0 && (
              <Button onClick={handleCleanupSessions} disabled={loading} variant="outline" size="sm">
                <Database className="h-4 w-4 mr-2" />
                Cleanup Sessions
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
      
      {/* Maintenance Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Maintenance Actions</CardTitle>
          <CardDescription>System maintenance and cleanup tools</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button onClick={handleCleanupSessions} disabled={loading} variant="outline" className="w-full">
            <Database className="h-4 w-4 mr-2" />
            Cleanup Expired Sessions
          </Button>
          <Button onClick={handleResetStuckJobs} disabled={loading} variant="outline" className="w-full">
            <RefreshCw className="h-4 w-4 mr-2" />
            Reset Stuck Jobs
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

// ============================================================================
// AI TOOLS TAB
// ============================================================================

function AIToolsTab({ toolConfigs, toggleToolStatus, token }: any) {
  const [loading, setLoading] = useState<string | null>(null);
  const [expandedTool, setExpandedTool] = useState<string | null>(null);
  const updateToolConfig = useMutation(api.adminTools.updateToolConfig);
  const updateToolMetadata = useMutation(api.adminTools.updateToolMetadata);
  const initializeToolsMetadata = useMutation(api.adminTools.initializeToolsMetadata);
  const getToolMetadata = useQuery(api.adminTools.getToolMetadata, 
    expandedTool && token ? { token, toolId: expandedTool } : "skip"
  );
  
  // Initialize voicemail metadata on mount if it doesn't exist
  useEffect(() => {
    const initVoicemail = async () => {
      if (!token) return;
      
      try {
        const voicemailData = {
          toolId: "sinterklaas_voicemail",
          name: "Sinterklaas Voicemail",
          description: "Generate personalized voice messages from Sinterklaas to children",
          category: "🎅 Sinterklaas",
          credits: "25",
          defaultPrompt: "Generate a personalized Sinterklaas voicemail for {child_name}, age {age}. Tone: {tone}",
          systemPrompt: "Je bent Sinterklaas, en je imiteert PRECIES de stijl van Bram van der Vlught - de legendarische Nederlandse Sinterklaas.\n\nSTORYBOARD:\n{storyboard}\n\nDe voicemail moet:\n- Natuurlijke Nederlandse spraak gebruiken\n- Rustig en kalm zijn\n- Warme, zachte toon hebben\n- 35-50 seconden (90-130 woorden)\n- Klassieke Sinterklaas elementen bevatten\n\nBram van der Vlught's kenmerkende stijl:\n- Rustige, kalme stem\n- Warme en zachte intonatie\n- Traditonele, eerbiedige benadering\n- Geduldig en begripvol\n- Authentieke Sinterklaas uitstraling",
          configOptions: {
            storyboardPrompt: "Je bent Sinterklaas. Maak een schets/storyboard voor een warme, persoonlijke voice boodschap voor {child_name} ({age} jaar oud)."
          }
        };
        
        await initializeToolsMetadata({
          token,
          tools: [voicemailData]
        });
        
        console.log("✅ Initialized voicemail metadata");
      } catch (error) {
        console.error("Failed to initialize metadata:", error);
      }
    };
    
    initVoicemail();
  }, [token]);
  
  // Get the current tool info from the allTools list
  const getCurrentTool = (toolId: string | null) => {
    if (!toolId) return null;
    return allTools.find(t => t.id === toolId);
  };
  
  // Define all available tools
  const allTools = [
    // Sinterklaas Tools
    {
      id: "sinterklaas_gedicht",
      name: "Sinterklaas Gedichten",
      description: "Generate personalized Sinterklaas poems in traditional Dutch style",
      category: "🎅 Sinterklaas",
      credits: "10",
    },
    {
      id: "sinterklaas_brief",
      name: "Brief van Sinterklaas",
      description: "Create personalized letters from Sinterklaas to children",
      category: "🎅 Sinterklaas",
      credits: "15",
    },
    {
      id: "sinterklaas_voicemail",
      name: "Sinterklaas Voicemail",
      description: "Generate personalized voice messages from Sinterklaas",
      category: "🎅 Sinterklaas",
      credits: "20",
    },
    {
      id: "lootjestrekken",
      name: "Lootjestrekken",
      description: "Organize Secret Santa/Sinterklaas gift exchanges",
      category: "🎅 Sinterklaas",
      credits: "8",
    },
    {
      id: "familie_moment",
      name: "Familie Moment",
      description: "Generate family Sinterklaas celebration illustrations",
      category: "🎅 Sinterklaas",
      credits: "20",
    },
    {
      id: "schoentje_tekening",
      name: "Schoentje Tekening",
      description: "Visualize filled Dutch wooden clogs with Sinterklaas treats",
      category: "🎅 Sinterklaas",
      credits: "18",
    },
    {
      id: "sinterklaas_illustratie",
      name: "Sinterklaas Illustratie",
      description: "Create Sinterklaas character illustrations",
      category: "🎅 Sinterklaas",
      credits: "15",
    },
    {
      id: "cadeautips",
      name: "Cadeautips",
      description: "Get personalized Sinterklaas gift recommendations",
      category: "🎅 Sinterklaas",
      credits: "15",
    },
    {
      id: "surprise_ideeen",
      name: "Surprise Ideeën",
      description: "Generate creative packaging ideas for Sinterklaas gifts",
      category: "🎅 Sinterklaas",
      credits: "20",
    },
    {
      id: "bulk_gedichten",
      name: "Bulk Gedichten",
      description: "Generate multiple Sinterklaas poems at once (for families/classes)",
      category: "🎅 Sinterklaas",
      credits: "5/poem",
    },
    {
      id: "sinterklaas_traditie",
      name: "Sinterklaas Traditie",
      description: "Educational content about Sinterklaas traditions",
      category: "🎅 Sinterklaas",
      credits: "5",
    },
    // Regular AI Tools
    {
      id: "copywriting",
      name: "AI Copywriter Studio",
      description: "Generate professional marketing copy with multiple variants and A/B testing",
      category: "Content Creation",
      credits: "5-10",
    },
    {
      id: "summarizer",
      name: "Text Summarizer",
      description: "Advanced text summarization with key points extraction and study questions",
      category: "Text Processing",
      credits: "2-5",
    },
    {
      id: "rewriter",
      name: "Content Rewriter",
      description: "Rewrite and paraphrase content with tone and complexity control",
      category: "Content Creation",
      credits: "3-7",
    },
    {
      id: "seo-optimizer",
      name: "SEO Optimizer",
      description: "Comprehensive SEO content optimization with keyword analysis",
      category: "Marketing",
      credits: "8-12",
    },
    {
      id: "linkedin-content",
      name: "LinkedIn Content Engine",
      description: "Create engaging LinkedIn posts, articles, and profile content",
      category: "Social Media",
      credits: "5-8",
    },
    {
      id: "translation",
      name: "Translation",
      description: "Translate text between 100+ languages with context awareness",
      category: "Language",
      credits: "1-3",
    },
    {
      id: "transcription",
      name: "Transcription Suite",
      description: "Transcribe audio/video with speaker diarization and content enhancement",
      category: "Audio Processing",
      credits: "5/min",
    },
    {
      id: "ocr",
      name: "OCR Text Extraction",
      description: "Extract text from images with high accuracy",
      category: "Document Processing",
      credits: "5",
    },
    {
      id: "image-generation",
      name: "Image Generation",
      description: "Create AI-generated images from text descriptions",
      category: "Creative",
      credits: "10-20",
    },
    {
      id: "background-removal",
      name: "Background Remover",
      description: "Remove backgrounds from images with advanced edge refinement",
      category: "Image Editing",
      credits: "3-5",
    },
    {
      id: "wardrobe",
      name: "Virtual Wardrobe",
      description: "Try on clothes virtually with AI - supports accessories, clothing, and footwear",
      category: "Fashion",
      credits: "15",
    },
  ];
  
  // Create a map of tool configs for quick lookup
  const configMap = new Map();
  toolConfigs?.forEach((config: any) => {
    configMap.set(config.toolId, config);
  });
  
  const handleToggle = async (toolId: string, currentStatus: boolean) => {
    if (!token) return;
    setLoading(toolId);
    try {
      await toggleToolStatus({ token, toolId, enabled: !currentStatus });
    } catch (error) {
      console.error("Failed to toggle tool status:", error);
    } finally {
      setLoading(null);
    }
  };
  
  const handleConfigUpdate = async (toolId: string, field: string, value: boolean) => {
    if (!token) return;
    setLoading(toolId);
    try {
      // Build the update object with the specific field
      const updateParams: any = { token, toolId };
      
      // Set the specific field based on which one is being updated
      if (field === 'anonymous') {
        updateParams.anonymous = Boolean(value);
      } else if (field === 'free') {
        updateParams.free = Boolean(value);
      } else if (field === 'paid') {
        updateParams.paid = Boolean(value);
      } else if (field === 'enabled') {
        updateParams.enabled = Boolean(value);
      } else if (field === 'showInSidebar') {
        updateParams.showInSidebar = Boolean(value);
      }
      
      console.log("Calling updateToolConfig with:", { toolId, field, value, updateParams });
      await updateToolConfig(updateParams);
    } catch (error) {
      console.error("Failed to update tool config:", error);
      alert(`Failed to update ${field} setting. Please check the console for details.`);
    } finally {
      setLoading(null);
    }
  };
  
  const getToolConfig = (toolId: string) => {
    return configMap.get(toolId) || {
      enabled: true,
      anonymous: undefined,
      free: undefined,
      paid: undefined,
      showInSidebar: undefined,
    };
  };
  
  // Group tools by category
  const groupedTools = allTools.reduce((acc, tool) => {
    if (!acc[tool.category]) {
      acc[tool.category] = [];
    }
    acc[tool.category].push(tool);
    return acc;
  }, {} as Record<string, typeof allTools>);
  
  // Sort categories: Sinterklaas first, then others
  const categories = Object.keys(groupedTools).sort((a, b) => {
    if (a.includes("🎅")) return -1;
    if (b.includes("🎅")) return 1;
    return a.localeCompare(b);
  });
  
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">AI Tools Management</CardTitle>
          <CardDescription className="text-sm">
            Enable or disable AI tools system-wide. Disabled tools will not be accessible to users.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {categories.map((category) => {
              const tools = groupedTools[category];
              const isSinterklaas = category.includes("🎅");
              
              return (
                <div key={category} className="space-y-2">
                  <h3 className={`text-sm font-semibold mb-2 flex items-center ${isSinterklaas ? 'text-red-600' : ''}`}>
                    <Zap className={`h-3 w-3 mr-1.5 ${isSinterklaas ? 'text-red-600' : 'text-primary'}`} />
                    {category}
                  </h3>
                  <div className="border rounded-lg overflow-hidden">
                    <div className="grid grid-cols-[2fr_50px_80px_80px_80px_80px_80px_60px] gap-2 p-2 bg-muted/30 border-b text-xs font-semibold items-center">
                      <div>Tool</div>
                      <div className="text-center">ON/OFF</div>
                      <div className="text-center">Sidebar</div>
                      <div className="text-center">Anonymous</div>
                      <div className="text-center">Free</div>
                      <div className="text-center">Premium</div>
                      <div className="text-center">Credits</div>
                      <div className="text-center">Edit</div>
                    </div>
                    <div className="space-y-0">
                      {tools.map((tool, idx) => {
                        const config = getToolConfig(tool.id);
                        const isLoading = loading === tool.id;
                        
                        // Compact Toggle Component
                        const CompactToggle = ({ field, Icon, isActive }: any) => {
                          const getColorClasses = (field: string, isActive: boolean) => {
                            if (!isActive) return 'bg-gray-100 hover:bg-gray-200';
                            
                            if (field === 'showInSidebar') return 'bg-orange-500 text-white';
                            if (field === 'anonymous') return 'bg-blue-500 text-white';
                            if (field === 'free') return 'bg-green-500 text-white';
                            if (field === 'paid') return 'bg-purple-500 text-white';
                            
                            return 'bg-gray-100 hover:bg-gray-200';
                          };
                          
                          return (
                            <button
                              onClick={() => !isLoading && handleConfigUpdate(tool.id, field, !isActive)}
                              disabled={isLoading}
                              className={`w-full h-8 flex items-center justify-center rounded transition-colors ${getColorClasses(field, isActive)} disabled:opacity-50`}
                              title={field}
                            >
                              {isLoading ? (
                                <RefreshCw className="h-3 w-3 animate-spin" />
                              ) : (
                                <Icon className="h-3.5 w-3.5" />
                              )}
                            </button>
                          );
                        };
                        
                        // Render row with expandable content
                        return (
                          <>
                            <div
                              key={tool.id}
                              className={`grid grid-cols-[2fr_50px_80px_80px_80px_80px_80px_60px] gap-2 p-2 items-center border-b last:border-b-0 ${
                                config.enabled ? "bg-green-50/50 hover:bg-green-50" : "bg-red-50/50 opacity-60"
                              }`}
                            >
                              {/* Tool Info */}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center space-x-2">
                                  <h4 className="text-sm font-medium truncate">{tool.name}</h4>
                                  {config.enabled ? (
                                    <Badge variant="default" className="h-4 px-1.5 text-[10px]">ON</Badge>
                                  ) : (
                                    <Badge variant="destructive" className="h-4 px-1.5 text-[10px]">OFF</Badge>
                                  )}
                                </div>
                                <p className="text-xs text-muted-foreground truncate">{tool.description}</p>
                              </div>
                              
                              {/* Enable/Disable Toggle */}
                              <div className="flex items-center justify-center">
                                <button
                                  onClick={() => !isLoading && handleToggle(tool.id, config.enabled)}
                                  disabled={isLoading}
                                  className={`w-10 h-8 flex items-center justify-center rounded transition-colors ${
                                    config.enabled
                                      ? "bg-green-500 hover:bg-green-600 text-white"
                                      : "bg-gray-300 hover:bg-gray-400"
                                  } disabled:opacity-50`}
                                  title={config.enabled ? "Disable" : "Enable"}
                                >
                                  {isLoading ? (
                                    <RefreshCw className="h-3 w-3 animate-spin" />
                                  ) : config.enabled ? (
                                    <Check className="h-4 w-4" />
                                  ) : (
                                    <X className="h-4 w-4" />
                                  )}
                                </button>
                              </div>
                              
                              {/* Sidebar Toggle */}
                              <div className="flex items-center justify-center">
                                <CompactToggle 
                                  field="showInSidebar"
                                  Icon={() => <div className="text-base">📋</div>}
                                  isActive={config.showInSidebar === true}
                                />
                              </div>
                              
                              {/* Anonymous Toggle */}
                              <div className="flex items-center justify-center">
                                <CompactToggle 
                                  field="anonymous"
                                  Icon={() => <div className="text-base">🔓</div>}
                                  isActive={config.anonymous === true}
                                />
                              </div>
                              
                              {/* Free Toggle */}
                              <div className="flex items-center justify-center">
                                <CompactToggle 
                                  field="free"
                                  Icon={() => <div className="text-base">🔑</div>}
                                  isActive={config.free === true}
                                />
                              </div>
                              
                              {/* Paid Toggle */}
                              <div className="flex items-center justify-center">
                                <CompactToggle 
                                  field="paid"
                                  Icon={() => <div className="text-base">💎</div>}
                                  isActive={config.paid === true}
                                />
                              </div>
                              
                              {/* Credits */}
                              <div className="text-xs text-muted-foreground text-center">
                                {tool.credits}
                              </div>
                              
                              {/* Expand/Collapse Button */}
                              <div className="flex items-center justify-center">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 p-0"
                                  onClick={() => setExpandedTool(expandedTool === tool.id ? null : tool.id)}
                                >
                                  {expandedTool === tool.id ? (
                                    <ChevronDown className="h-4 w-4" />
                                  ) : (
                                    <ChevronRight className="h-4 w-4" />
                                  )}
                                </Button>
                              </div>
                            </div>
                            
                            {/* Expanded Content - Inline Editing */}
                            {expandedTool === tool.id && (
                              <div className="border-l-2 border-primary bg-muted/20 p-4 space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <div>
                                    <Label htmlFor={`name-${tool.id}`}>Tool Name</Label>
                                    <Input 
                                      id={`name-${tool.id}`}
                                      defaultValue={getToolMetadata?.name || getCurrentTool(tool.id)?.name || ''} 
                                      placeholder="Enter tool name"
                                    />
                                  </div>
                                  <div>
                                    <Label htmlFor={`credits-${tool.id}`}>Credits</Label>
                                    <Input 
                                      id={`credits-${tool.id}`}
                                      defaultValue={tool.credits} 
                                      placeholder="Enter credit cost"
                                    />
                                  </div>
                                </div>
                                
                                <div>
                                  <Label htmlFor={`description-${tool.id}`}>Description</Label>
                                  <Textarea 
                                    id={`description-${tool.id}`}
                                    defaultValue={getToolMetadata?.description || getCurrentTool(tool.id)?.description || ''} 
                                    rows={3}
                                    placeholder="Enter tool description"
                                  />
                                </div>
                                
                                <div>
                                  <Label htmlFor={`defaultPrompt-${tool.id}`}>Default Prompt</Label>
                                  <Textarea 
                                    id={`defaultPrompt-${tool.id}`}
                                    defaultValue={getToolMetadata?.defaultPrompt || ''} 
                                    rows={5}
                                    className="font-mono text-sm"
                                    placeholder="Enter default prompt shown to users"
                                  />
                                  <p className="text-xs text-muted-foreground mt-1">
                                    This prompt is shown to users as the default input for this tool
                                  </p>
                                </div>
                                
                                <div>
                                  <Label htmlFor={`systemPrompt-${tool.id}`}>System Prompt</Label>
                                  <Textarea 
                                    id={`systemPrompt-${tool.id}`}
                                    defaultValue={getToolMetadata?.systemPrompt || ''} 
                                    rows={8}
                                    className="font-mono text-sm"
                                    placeholder="Enter internal AI instructions"
                                  />
                                  <p className="text-xs text-muted-foreground mt-1">
                                    Internal instructions for the AI when processing requests for this tool
                                  </p>
                                </div>
                                
                                <div>
                                  <Label htmlFor={`configOptions-${tool.id}`}>Configuration Options (JSON)</Label>
                                  <Textarea 
                                    id={`configOptions-${tool.id}`}
                                    defaultValue={JSON.stringify(getToolMetadata?.configOptions || {}, null, 2)} 
                                    rows={6}
                                    className="font-mono text-sm"
                                    placeholder="Enter JSON configuration"
                                  />
                                  <p className="text-xs text-muted-foreground mt-1">
                                    JSON configuration for tool parameters, features, and settings
                                  </p>
                                </div>
                                
                                <div className="flex justify-end space-x-2 pt-2 border-t">
                                  <Button variant="outline" onClick={() => setExpandedTool(null)}>
                                    Collapse
                                  </Button>
                                  <Button onClick={async () => {
                                    if (!token || !expandedTool) return;
                                    
                                    try {
                                      // Get current form values
                                      const nameEl = document.getElementById(`name-${tool.id}`) as HTMLInputElement;
                                      const descriptionEl = document.getElementById(`description-${tool.id}`) as HTMLTextAreaElement;
                                      const defaultPromptEl = document.getElementById(`defaultPrompt-${tool.id}`) as HTMLTextAreaElement;
                                      const systemPromptEl = document.getElementById(`systemPrompt-${tool.id}`) as HTMLTextAreaElement;
                                      const configOptionsEl = document.getElementById(`configOptions-${tool.id}`) as HTMLTextAreaElement;
                                      
                                      let configOptions = {};
                                      try {
                                        configOptions = JSON.parse(configOptionsEl.value);
                                      } catch (e) {
                                        alert("Invalid JSON in configuration options");
                                        return;
                                      }
                                      
                                      await updateToolMetadata({
                                        token,
                                        toolId: expandedTool,
                                        name: nameEl.value,
                                        description: descriptionEl.value,
                                        defaultPrompt: defaultPromptEl.value,
                                        systemPrompt: systemPromptEl.value,
                                        configOptions: configOptions,
                                      });
                                      
                                      alert("Changes saved successfully!");
                                      setExpandedTool(null);
                                    } catch (error) {
                                      console.error("Failed to save metadata:", error);
                                      alert("Failed to save changes. Please check the console.");
                                    }
                                  }}>
                                    Save Changes
                                  </Button>
                                </div>
                              </div>
                            )}
                          </>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Tool Management Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="p-3 border rounded-lg text-center">
              <div className="text-xl font-bold text-primary">{allTools.length}</div>
              <div className="text-xs text-muted-foreground">Total Tools</div>
            </div>
            <div className="p-3 border rounded-lg text-center">
              <div className="text-xl font-bold text-green-600">
                {allTools.filter(t => getToolConfig(t.id).enabled).length}
              </div>
              <div className="text-xs text-muted-foreground">Enabled</div>
            </div>
            <div className="p-3 border rounded-lg text-center">
              <div className="text-xl font-bold text-blue-600">
                {allTools.filter(t => getToolConfig(t.id).anonymous).length}
              </div>
              <div className="text-xs text-muted-foreground">Anonymous</div>
            </div>
            <div className="p-3 border rounded-lg text-center">
              <div className="text-xl font-bold text-green-600">
                {allTools.filter(t => getToolConfig(t.id).free).length}
              </div>
              <div className="text-xs text-muted-foreground">Free</div>
            </div>
            <div className="p-3 border rounded-lg text-center">
              <div className="text-xl font-bold text-purple-600">
                {allTools.filter(t => getToolConfig(t.id).paid).length}
              </div>
              <div className="text-xs text-muted-foreground">Paid</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ============================================================================
// HELPER COMPONENTS
// ============================================================================

function StatCard({ title, value, subtitle, icon: Icon, color }: any) {
  const colorClasses = {
    blue: "text-blue-500 bg-blue-50",
    green: "text-green-500 bg-green-50",
    purple: "text-purple-500 bg-purple-50",
    orange: "text-orange-500 bg-orange-50",
    red: "text-red-500 bg-red-50",
  };
  
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className={`p-3 rounded-lg ${colorClasses[color as keyof typeof colorClasses]}`}>
            <Icon className="h-6 w-6" />
          </div>
        </div>
        <div className="text-xl font-bold mb-1">{value}</div>
        <div className="text-xs text-muted-foreground mb-1">{title}</div>
        <div className="text-xs text-muted-foreground">{subtitle}</div>
      </CardContent>
    </Card>
  );
}

function TierBar({ label, count, total, color }: any) {
  const percentage = (count / total) * 100;
  
  const colorClasses = {
    gray: "bg-gray-500",
    blue: "bg-blue-500",
    purple: "bg-purple-500",
    red: "bg-red-500",
  };
  
  return (
    <div>
      <div className="flex items-center justify-between text-sm mb-1">
        <span className="font-medium">{label}</span>
        <span className="text-muted-foreground">
          {count} ({percentage.toFixed(1)}%)
        </span>
      </div>
      <div className="h-2 bg-muted rounded-full overflow-hidden">
        <div
          className={`h-full ${colorClasses[color as keyof typeof colorClasses]}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

