"use client";

import { useEffect, useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Check, 
  CreditCard, 
  Download, 
  Loader2, 
  Sparkles, 
  Zap, 
  Crown, 
  TrendingUp,
  ArrowRight,
  Gift,
  Calendar,
  FileText,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  RefreshCw,
  Receipt
} from "lucide-react";
import { getAuthToken } from "@/lib/auth-client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

const plans = [
  {
    id: "free",
    name: "Free",
    price: 0,
    credits: 100,
    icon: Sparkles,
    gradient: "from-gray-400 to-gray-600",
    features: [
      "100 credits/month",
      "Access to all tools",
      "Basic support",
      "Community access"
    ],
    description: "Perfect for trying out our AI tools",
  },
  {
    id: "pro",
    name: "Pro",
    price: 29,
    credits: 1000,
    icon: Zap,
    gradient: "from-blue-500 to-purple-600",
    features: [
      "1,000 credits/month",
      "All tools unlocked",
      "Priority processing",
      "API access",
      "Email support",
      "Advanced analytics"
    ],
    popular: true,
    description: "Most popular for professionals",
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: 99,
    credits: 5000,
    icon: Crown,
    gradient: "from-amber-500 to-orange-600",
    features: [
      "5,000 credits/month",
      "All Pro features",
      "Custom AI models",
      "Priority support",
      "Dedicated account manager",
      "Custom integrations"
    ],
    description: "For teams and businesses",
  },
];

const creditPackages = [
  { 
    id: "small", 
    credits: 500, 
    price: 10, 
    bonus: 0,
    popular: false,
    gradient: "from-green-400 to-emerald-600"
  },
  { 
    id: "medium", 
    credits: 1500, 
    price: 25, 
    bonus: 20,
    popular: true,
    gradient: "from-blue-400 to-cyan-600"
  },
  { 
    id: "large", 
    credits: 3500, 
    price: 50, 
    bonus: 40,
    popular: false,
    gradient: "from-purple-400 to-pink-600"
  },
];

export default function BillingPage() {
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState<{ [key: string]: boolean }>({});
  const [cancelLoading, setCancelLoading] = useState(false);
  const [stripeConfigured, setStripeConfigured] = useState(true);

  // Get auth token from localStorage
  useEffect(() => {
    const storedToken = getAuthToken();
    console.log("🔑 Token from localStorage:", storedToken ? `Present (${storedToken.length} chars)` : "Missing");
    setToken(storedToken);
    
    // Check if Stripe is configured by attempting to create a test checkout
    // This will be checked when user tries to purchase
  }, []);

  // Get user data
  const user = useQuery(
    api.users.getUserProfile,
    token ? { token } : "skip"
  );

  // Get current subscription
  const subscription = useQuery(
    api.payments.getCurrentSubscription,
    token ? { token } : "skip"
  );

  // Get credit transactions
  const transactions = useQuery(
    api.users.getCreditTransactions,
    token ? { token, limit: 10 } : "skip"
  );

  // Handle subscription purchase
  const handleSubscriptionPurchase = async (tier: string) => {
    if (!token) {
      alert("Please log in to purchase a subscription");
      return;
    }

    setLoading({ ...loading, [`sub-${tier}`]: true });

    try {
      console.log("Creating checkout session for tier:", tier);
      
      const response = await fetch("/api/stripe/create-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          type: "subscription",
          tier,
        }),
      });

      console.log("Response status:", response.status);
      const data = await response.json();
      console.log("Response data:", data);

      if (data.error) {
        // Check if it's a configuration error
        if (data.error.includes("not configured") || data.error.includes("STRIPE")) {
          setStripeConfigured(false);
          throw new Error(
            "Stripe is not configured yet. Please run ./setup-stripe.sh to configure payment processing."
          );
        }
        throw new Error(data.error);
      }

      if (!data.url) {
        throw new Error("No checkout URL received from server");
      }

      // Redirect to Stripe checkout
      console.log("Redirecting to Stripe checkout:", data.url);
      window.location.href = data.url;
    } catch (error: any) {
      console.error("Subscription purchase error:", error);
      alert(`Failed to create checkout session: ${error.message}\n\nPlease check the console for more details.`);
      setLoading({ ...loading, [`sub-${tier}`]: false });
    }
  };

  // Handle credit package purchase
  const handleCreditPurchase = async (packageSize: string) => {
    if (!token) {
      alert("Please log in to purchase credits");
      return;
    }

    setLoading({ ...loading, [`credit-${packageSize}`]: true });

    try {
      console.log("Creating checkout session for credit package:", packageSize);
      
      const response = await fetch("/api/stripe/create-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          type: "credits",
          packageSize,
        }),
      });

      console.log("Response status:", response.status);
      const data = await response.json();
      console.log("Response data:", data);

      if (data.error) {
        throw new Error(data.error);
      }

      if (!data.url) {
        throw new Error("No checkout URL received from server");
      }

      // Redirect to Stripe checkout
      console.log("Redirecting to Stripe checkout:", data.url);
      window.location.href = data.url;
    } catch (error: any) {
      console.error("Credit purchase error:", error);
      alert(`Failed to create checkout session: ${error.message}\n\nPlease check the console for more details.`);
      setLoading({ ...loading, [`credit-${packageSize}`]: false });
    }
  };

  // Handle subscription cancellation
  const handleCancelSubscription = async () => {
    if (!token || !confirm("Are you sure you want to cancel your subscription? You will continue to have access until the end of your current billing period.")) {
      return;
    }

    setCancelLoading(true);

    try {
      const response = await fetch("/api/stripe/cancel-subscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      alert("Subscription cancelled successfully. You will have access until the end of your current billing period.");
      window.location.reload();
    } catch (error: any) {
      console.error("Subscription cancellation error:", error);
      alert(`Error: ${error.message}`);
    } finally {
      setCancelLoading(false);
    }
  };

  // Format date
  const formatDate = (timestamp: number) => {
    if (!timestamp || isNaN(timestamp)) {
      return "Date unavailable";
    }
    const date = new Date(timestamp);
    if (isNaN(date.getTime())) {
      return "Invalid date";
    }
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  // Format time ago
  const timeAgo = (timestamp: number): string => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    
    if (seconds < 60) return "just now";
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
    return `${Math.floor(seconds / 604800)}w ago`;
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Billing & Subscriptions</h1>
        <p className="text-muted-foreground">
          Manage your subscription and credits
        </p>
      </div>

      {/* Stripe Configuration Warning */}
      {!stripeConfigured && (
        <Card className="border-yellow-500 bg-yellow-50">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <div className="text-yellow-600 mt-0.5">⚠️</div>
              <div>
                <p className="font-semibold text-yellow-900">Stripe Not Configured</p>
                <p className="text-sm text-yellow-800 mt-1">
                  Payment processing is not set up yet. To enable subscriptions and credit purchases,
                  please run <code className="bg-yellow-100 px-2 py-1 rounded">./setup-stripe.sh</code> in your terminal
                  or see <code className="bg-yellow-100 px-2 py-1 rounded">STRIPE_SETUP_GUIDE.md</code> for instructions.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tabs */}
      <Tabs defaultValue="plans" className="space-y-6">
        <TabsList>
          <TabsTrigger value="plans">Plans & Credits</TabsTrigger>
          <TabsTrigger value="history">Transaction History</TabsTrigger>
          <TabsTrigger value="subscription">Subscription History</TabsTrigger>
        </TabsList>

        {/* Plans Tab */}
        <TabsContent value="plans" className="space-y-6">

      {/* Current Plan & Credits */}
      {user && (
        <div className="grid gap-4 md:grid-cols-3">
          {/* Current Plan Card */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Current Plan</CardTitle>
              {user.subscriptionTier === "enterprise" ? <Crown className="h-4 w-4 text-muted-foreground" /> :
               user.subscriptionTier === "pro" ? <Zap className="h-4 w-4 text-muted-foreground" /> :
               <Sparkles className="h-4 w-4 text-muted-foreground" />}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold capitalize">{subscription ? subscription.tier : user.subscriptionTier}</div>
              {subscription && subscription.status === "active" ? (
                <>
                  <p className="text-xs text-muted-foreground">
                    {subscription.tier === "pro" ? "$29" : "$99"}/month • {subscription.tier === "pro" ? "1,000" : "5,000"} credits
                  </p>
                  {subscription.currentPeriodEnd && typeof subscription.currentPeriodEnd === 'number' && !isNaN(subscription.currentPeriodEnd) && (
                    <p className="text-xs text-muted-foreground">
                      Renews {formatDate(subscription.currentPeriodEnd)}
                    </p>
                  )}
                  {subscription.cancelAtPeriodEnd && (
                    <p className="text-xs text-red-600">
                      Cancels at period end
                    </p>
                  )}
                  {!subscription.cancelAtPeriodEnd && (
                    <Button
                      variant="link"
                      className="px-0 mt-2 h-auto text-sm"
                      size="sm"
                      onClick={handleCancelSubscription}
                      disabled={cancelLoading}
                    >
                      {cancelLoading ? "Cancelling..." : "Cancel subscription"}
                    </Button>
                  )}
                </>
              ) : subscription && subscription.status === "incomplete" ? (
                <>
                  <p className="text-xs text-muted-foreground">
                    {subscription.tier === "pro" ? "$29" : "$99"}/month • {subscription.tier === "pro" ? "1,000" : "5,000"} credits
                  </p>
                  <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-xs font-medium text-yellow-900">Setup Incomplete</p>
                    <p className="text-xs text-yellow-700 mt-1">
                      Your subscription payment is being processed. This may take a few minutes.
                    </p>
                  </div>
                </>
              ) : (
                <p className="text-xs text-muted-foreground">
                  {user.subscriptionTier === "free" 
                    ? "Upgrade to unlock more credits"
                    : "Active"}
                </p>
              )}
            </CardContent>
          </Card>

          {/* Credits Balance Card */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Credits Balance</CardTitle>
              <Zap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{user.creditsBalance.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                Available for all AI tools
              </p>
            </CardContent>
          </Card>

          {/* Subscription Status Card */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Status</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold capitalize">
                {subscription?.status || "Active"}
              </div>
              <p className="text-xs text-muted-foreground">
                Account is in good standing
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Subscription Plans */}
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold mb-4">Monthly Subscriptions</h2>
          <p className="text-muted-foreground">Choose the perfect plan for your needs</p>
        </div>
        <div className="grid md:grid-cols-3 gap-4">
          {plans.map((plan) => {
            const isCurrentPlan = user?.subscriptionTier === plan.id;
            const loadingKey = `sub-${plan.id}`;
            const Icon = plan.icon;

            return (
              <Card
                key={plan.name}
                className={`relative overflow-hidden hover:bg-muted/50 transition-colors ${
                  plan.popular ? "border-2 border-primary" : ""
                } ${isCurrentPlan ? "ring-2 ring-green-500" : ""}`}
              >
                {/* Badges */}
                {(plan.popular || isCurrentPlan) && (
                  <div className="absolute top-2 right-2 flex gap-2">
                    {isCurrentPlan && (
                      <div className="bg-green-600 text-white px-2 py-0.5 text-xs font-medium rounded">
                        Current
                      </div>
                    )}
                {plan.popular && (
                      <div className="bg-primary text-white px-2 py-0.5 text-xs font-medium rounded">
                        Popular
                  </div>
                )}
                  </div>
                )}

                <CardHeader>
                  <div className="flex items-center gap-2 mb-2">
                    <Icon className={`h-6 w-6 ${plan.id === "enterprise" ? "text-amber-500" : plan.id === "pro" ? "text-blue-500" : "text-gray-500"}`} />
                    <CardTitle className="text-lg">{plan.name}</CardTitle>
                  </div>
                  <CardDescription className="text-xs">{plan.description}</CardDescription>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Price */}
                  <div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-bold">${plan.price}</span>
                      <span className="text-muted-foreground text-sm">/month</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {plan.credits.toLocaleString()} credits included
                    </p>
                  </div>

                  {/* Features */}
                  <ul className="space-y-2">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-2 text-xs">
                        <Check className="h-3 w-3 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {/* CTA Button */}
                  <Button
                    className="w-full"
                    variant={plan.popular ? "default" : "outline"}
                    onClick={() => handleSubscriptionPurchase(plan.id)}
                    disabled={
                      plan.id === "free" ||
                      isCurrentPlan ||
                      loading[loadingKey] ||
                      !token
                    }
                  >
                    {loading[loadingKey] ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : isCurrentPlan ? (
                      <>
                        <Check className="h-4 w-4 mr-2" />
                        Current Plan
                      </>
                    ) : plan.id === "free" ? (
                      "Free Plan"
                    ) : !token ? (
                      "Login Required"
                    ) : (
                      "Get Started"
                    )}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Buy Additional Credits */}
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold mb-4">One-Time Credit Packages</h2>
          <p className="text-muted-foreground">Top up your credits anytime with no commitment</p>
        </div>
        <div className="grid md:grid-cols-3 gap-4">
          {creditPackages.map((pkg) => {
            const loadingKey = `credit-${pkg.id}`;
            const totalCredits = pkg.credits + (pkg.credits * pkg.bonus / 100);

            return (
              <Card 
                key={pkg.credits}
                className={`relative overflow-hidden hover:bg-muted/50 transition-colors ${
                  pkg.popular ? "border-2 border-primary" : ""
                }`}
              >
                {/* Best Value Badge */}
                {pkg.bonus > 0 && (
                  <div className="absolute top-2 right-2 bg-green-600 text-white px-2 py-0.5 text-xs font-medium rounded">
                    +{pkg.bonus}% Bonus
                  </div>
                )}

                <CardHeader>
                  <div className="flex items-center gap-2 mb-2">
                    <Gift className={`h-6 w-6 ${pkg.id === "large" ? "text-purple-500" : pkg.id === "medium" ? "text-blue-500" : "text-green-500"}`} />
                    <CardTitle className="text-lg">
                    {totalCredits.toLocaleString()} Credits
                  </CardTitle>
                  </div>
                  <CardDescription className="text-xs">
                    {pkg.bonus > 0 ? (
                      <span>
                        {pkg.credits.toLocaleString()} + {(pkg.credits * pkg.bonus / 100).toLocaleString()} bonus
                      </span>
                    ) : (
                      <span>One-time purchase</span>
                    )}
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Price Display */}
                  <div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-bold">${pkg.price}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      ${(pkg.price / totalCredits).toFixed(3)} per credit
                    </p>
                  </div>

                  {/* Purchase Button */}
                  <Button
                    className="w-full"
                    variant={pkg.popular ? "default" : "outline"}
                    onClick={() => handleCreditPurchase(pkg.id)}
                    disabled={loading[loadingKey] || !token}
                  >
                    {loading[loadingKey] ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <CreditCard className="h-4 w-4 mr-2" />
                        Purchase
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
        </TabsContent>

        {/* Transaction History Tab */}
        <TabsContent value="history" className="space-y-6">
          {!transactions || transactions.length === 0 ? (
            <Card>
              <CardContent className="py-12">
                <div className="text-center text-muted-foreground">
                  <CreditCard className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p className="text-sm font-medium">No transactions yet</p>
                  <p className="text-xs mt-1">Your billing transactions will appear here</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Transaction Summary Cards */}
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardDescription className="text-xs">Total Transactions</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-baseline justify-between">
                      <div>
                        <div className="text-2xl font-bold">{transactions.length}</div>
                        <p className="text-xs text-muted-foreground mt-1">transactions</p>
                      </div>
                      <TrendingUp className="h-8 w-8 text-blue-500 opacity-50" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardDescription className="text-xs">Credits Added</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-baseline justify-between">
                      <div>
                        <div className="text-2xl font-bold">
                          {transactions.filter(t => t.amount > 0).reduce((sum, t) => sum + t.amount, 0).toLocaleString()}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">total credits</p>
                      </div>
                      <Sparkles className="h-8 w-8 text-green-500 opacity-50" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardDescription className="text-xs">Credits Used</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-baseline justify-between">
                      <div>
                        <div className="text-2xl font-bold">
                          {Math.abs(transactions.filter(t => t.amount < 0).reduce((sum, t) => sum + t.amount, 0)).toLocaleString()}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">total spent</p>
                      </div>
                      <Zap className="h-8 w-8 text-amber-500 opacity-50" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardDescription className="text-xs">Latest Transaction</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-baseline justify-between">
                      <div>
                        <div className="text-base font-bold truncate">
                          {transactions[0]?.type || "N/A"}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          {transactions[0] ? timeAgo(transactions[0].createdAt) : ""}
                        </p>
                      </div>
                      <CreditCard className="h-8 w-8 text-purple-500 opacity-50" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Transaction List */}
              <Card>
          <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">All Transactions</CardTitle>
                      <CardDescription>Your complete billing history</CardDescription>
            </div>
                    <Badge variant="secondary">{transactions.length} total</Badge>
                  </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {transactions.map((transaction, index) => (
                <div
                  key={index}
                        className="flex items-center justify-between border rounded-lg p-3 hover:bg-muted/30 transition-colors"
                >
                        <div className="flex items-start space-x-3 flex-1 min-w-0">
                          <div className={`p-2 rounded-lg flex-shrink-0 ${
                      transaction.amount > 0 
                              ? 'bg-green-500/10' 
                              : 'bg-red-500/10'
                    }`}>
                      {transaction.amount > 0 ? (
                              <Sparkles className={`h-4 w-4 ${transaction.amount > 0 ? 'text-green-600' : 'text-red-600'}`} />
                      ) : (
                              <Zap className={`h-4 w-4 ${transaction.amount > 0 ? 'text-green-600' : 'text-red-600'}`} />
                      )}
                    </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm">{transaction.description}</p>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              {formatDate(transaction.createdAt)} • {timeAgo(transaction.createdAt)}
                      </p>
                    </div>
                  </div>
                        <div className="text-right flex-shrink-0 ml-3">
                          <div className={`text-sm font-bold ${transaction.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {transaction.amount > 0 ? '+' : ''}{transaction.amount.toLocaleString()} 
                          </div>
                          <p className="text-xs text-muted-foreground">credits</p>
                          <Badge variant="outline" className="text-xs mt-1 capitalize">
                      {transaction.type}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        {/* Subscription History Tab */}
        <TabsContent value="subscription" className="space-y-6">
          {!subscription && user?.subscriptionTier === "free" ? (
            <Card>
              <CardContent className="py-12">
                <div className="text-center text-muted-foreground">
                  <Crown className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p className="text-sm font-medium">No subscription history</p>
                  <p className="text-xs mt-1">Upgrade to a paid plan to see your subscription history</p>
                  <Button variant="outline" size="sm" className="mt-4" onClick={() => {
                    const tabsList = document.querySelector('[role="tablist"]');
                    const plansTab = tabsList?.querySelector('[value="plans"]') as HTMLElement;
                    plansTab?.click();
                  }}>
                    View Plans
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Subscription Summary Cards */}
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardDescription className="text-xs">Current Status</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-baseline justify-between">
                      <div>
                        <div className="text-lg font-bold capitalize">
                          {subscription?.status || "Active"}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          {subscription?.tier || user?.subscriptionTier} plan
                        </p>
                      </div>
                      {subscription?.status === "active" ? (
                        <CheckCircle2 className="h-8 w-8 text-green-500 opacity-50" />
                      ) : subscription?.status === "past_due" ? (
                        <AlertCircle className="h-8 w-8 text-red-500 opacity-50" />
                      ) : (
                        <Clock className="h-8 w-8 text-gray-500 opacity-50" />
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardDescription className="text-xs">Next Billing</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-baseline justify-between">
                      <div>
                        <div className="text-sm font-bold">
                          {subscription?.currentPeriodEnd 
                            ? new Date(subscription.currentPeriodEnd).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                            : "N/A"}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          {subscription?.currentPeriodEnd 
                            ? `${Math.ceil((subscription.currentPeriodEnd - Date.now()) / (1000 * 60 * 60 * 24))} days left`
                            : "No active billing"}
                        </p>
                      </div>
                      <Calendar className="h-8 w-8 text-blue-500 opacity-50" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardDescription className="text-xs">Monthly Cost</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-baseline justify-between">
                      <div>
                        <div className="text-lg font-bold">
                          ${subscription?.tier === "enterprise" ? "99" : subscription?.tier === "pro" ? "29" : "0"}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">per month</p>
                      </div>
                      <CreditCard className="h-8 w-8 text-purple-500 opacity-50" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardDescription className="text-xs">Auto-Renewal</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-baseline justify-between">
                      <div>
                        <div className="text-lg font-bold">
                          {subscription?.cancelAtPeriodEnd ? "Off" : "On"}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          {subscription?.cancelAtPeriodEnd ? "Cancels at period end" : "Active"}
                        </p>
                      </div>
                      <RefreshCw className={`h-8 w-8 opacity-50 ${subscription?.cancelAtPeriodEnd ? 'text-red-500' : 'text-green-500'}`} />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Subscription Timeline */}
              {subscription && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center space-x-2">
                      <Clock className="h-5 w-5" />
                      <span>Subscription Timeline</span>
                    </CardTitle>
                    <CardDescription>Important events and changes</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {/* Current Period */}
                      <div className="flex items-start space-x-3 border-l-2 border-blue-500 pl-4">
                        <div className="flex-shrink-0 w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <p className="font-medium text-sm">Current Billing Period</p>
                            <Badge variant="secondary">Active</Badge>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            {subscription.currentPeriodStart && new Date(subscription.currentPeriodStart).toLocaleDateString('en-US', { 
                              month: 'long', 
                              day: 'numeric',
                              year: 'numeric'
                            })} - {subscription.currentPeriodEnd && new Date(subscription.currentPeriodEnd).toLocaleDateString('en-US', { 
                              month: 'long', 
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </p>
                        </div>
                      </div>

                      {/* Cancellation Notice */}
                      {subscription.cancelAtPeriodEnd && (
                        <div className="flex items-start space-x-3 border-l-2 border-red-500 pl-4">
                          <div className="flex-shrink-0 w-2 h-2 bg-red-500 rounded-full mt-2"></div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <p className="font-medium text-sm">Cancellation Scheduled</p>
                              <Badge variant="destructive">Ending Soon</Badge>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                              Subscription will end on {subscription.currentPeriodEnd && new Date(subscription.currentPeriodEnd).toLocaleDateString('en-US', { 
                                month: 'long', 
                                day: 'numeric',
                                year: 'numeric'
                              })}
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Subscription Started */}
                      {subscription.createdAt && (
                        <div className="flex items-start space-x-3 border-l-2 border-green-500 pl-4">
                          <div className="flex-shrink-0 w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <p className="font-medium text-sm">Subscription Started</p>
                              <Badge variant="outline">
                                <CheckCircle2 className="h-3 w-3 mr-1" />
                                Created
                              </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                              {new Date(subscription.createdAt).toLocaleDateString('en-US', { 
                                month: 'long', 
                                day: 'numeric',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              Plan: <span className="font-medium capitalize">{subscription.tier}</span>
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Invoices Section */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg flex items-center space-x-2">
                        <Receipt className="h-5 w-5" />
                        <span>Invoices & Receipts</span>
                      </CardTitle>
                      <CardDescription>Download your billing documents</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {transactions && transactions.filter(t => t.type === "subscription" || t.type === "purchase").length > 0 ? (
                    <div className="space-y-3">
                      {transactions
                        .filter(t => t.type === "subscription" || t.type === "purchase")
                        .map((transaction, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between border rounded-lg p-4 hover:bg-muted/30 transition-colors"
                          >
                            <div className="flex items-start space-x-3 flex-1 min-w-0">
                              <div className="p-2 rounded-lg bg-blue-500/10 flex-shrink-0">
                                <FileText className="h-5 w-5 text-blue-600" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-sm">{transaction.description}</p>
                                <p className="text-xs text-muted-foreground mt-1">
                                  {formatDate(transaction.createdAt)}
                                </p>
                                <div className="flex items-center space-x-2 mt-2">
                                  <Badge variant="outline" className="text-xs">
                                    {transaction.amount > 0 ? `+${transaction.amount}` : transaction.amount} credits
                                  </Badge>
                                  {transaction.type === "subscription" && (
                                    <Badge variant="secondary" className="text-xs">
                                      Monthly
                                    </Badge>
                                  )}
                                  {transaction.type === "purchase" && (
                                    <Badge variant="secondary" className="text-xs">
                                      One-time
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2 ml-3">
                              <Button variant="outline" size="sm" disabled>
                                <Download className="h-4 w-4 mr-2" />
                                Download
                    </Button>
                  </div>
                </div>
              ))}
                      
                      <div className="bg-muted/50 rounded-lg p-4 mt-4">
                        <p className="text-xs text-muted-foreground">
                          <AlertCircle className="h-4 w-4 inline mr-1" />
                          Invoice downloads will be available once Stripe invoicing is fully configured. 
                          For now, you can view your payment history in the Transaction History tab.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">No invoices yet</p>
                      <p className="text-xs mt-1">Invoices will appear here after your first payment</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Payment Method Info */}
              {subscription && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center space-x-2">
                      <CreditCard className="h-5 w-5" />
                      <span>Payment Information</span>
                    </CardTitle>
                    <CardDescription>Your billing details</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between py-3 border-b">
                        <span className="text-sm text-muted-foreground">Stripe Customer ID</span>
                        <code className="text-xs bg-muted px-2 py-1 rounded">
                          {user?.stripeCustomerId || "Not available"}
                        </code>
                      </div>
                      <div className="flex items-center justify-between py-3 border-b">
                        <span className="text-sm text-muted-foreground">Subscription ID</span>
                        <code className="text-xs bg-muted px-2 py-1 rounded">
                          {subscription.stripeSubscriptionId?.substring(0, 20)}...
                        </code>
                      </div>
                      <div className="flex items-center justify-between py-3">
                        <span className="text-sm text-muted-foreground">Payment Method</span>
                        <Badge variant="outline">
                          <CreditCard className="h-3 w-3 mr-1" />
                          Card on file
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="mt-6 p-4 bg-muted/50 rounded-lg">
                      <p className="text-xs text-muted-foreground">
                        To update your payment method or view detailed billing information, 
                        manage your subscription through the Stripe customer portal.
                      </p>
                      <Button variant="outline" size="sm" className="mt-3" disabled>
                        <ArrowRight className="h-4 w-4 mr-2" />
                        Manage in Stripe
                      </Button>
            </div>
          </CardContent>
        </Card>
      )}
            </>
          )}
        </TabsContent>
      </Tabs>

      {/* Debug Info (only in development) */}
      {process.env.NODE_ENV === 'development' && (
        <Card className="border-dashed border-gray-300">
          <CardHeader>
            <CardTitle className="text-sm">Debug Info</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xs space-y-1 font-mono">
              <p>Token: {token ? '✅ Present' : '❌ Missing'}</p>
              <p>Token Length: {token?.length || 0}</p>
              <p>User Loaded: {user ? '✅ Yes' : '❌ No'}</p>
              {user && (
                <>
                  <p>User Tier: {user.subscriptionTier}</p>
                  <p>Credits: {user.creditsBalance}</p>
                  <p>Subscription: {subscription ? `✅ ${subscription.tier} (${subscription.status})` : '❌ None'}</p>
                  <p>Stripe Customer: {user.stripeCustomerId ? '✅ Created' : '❌ Not yet'}</p>
                  {subscription && (
                    <>
                      <p className="text-yellow-600">--- Subscription Debug ---</p>
                      <p>currentPeriodEnd: {subscription.currentPeriodEnd || 'undefined'}</p>
                      <p>currentPeriodEnd type: {typeof subscription.currentPeriodEnd}</p>
                      <p>isNaN check: {subscription.currentPeriodEnd ? String(isNaN(subscription.currentPeriodEnd)) : 'N/A'}</p>
                      <p>formatDate result: {subscription.currentPeriodEnd ? formatDate(subscription.currentPeriodEnd) : 'N/A'}</p>
                      <p>cancelAtPeriodEnd: {String(subscription.cancelAtPeriodEnd)}</p>
                    </>
                  )}
                </>
              )}
              <p>LocalStorage Token: {typeof window !== 'undefined' ? (getAuthToken() ? '✅ Present' : '❌ Missing') : 'N/A'}</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
