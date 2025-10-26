import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, CreditCard, Download } from "lucide-react";

const plans = [
  {
    name: "Free",
    price: 0,
    credits: 100,
    features: ["100 credits/month", "Access to all tools", "Basic support"],
  },
  {
    name: "Pro",
    price: 29,
    credits: 1000,
    features: [
      "1,000 credits/month",
      "All tools unlocked",
      "Priority processing",
      "API access",
    ],
    popular: true,
  },
  {
    name: "Enterprise",
    price: 99,
    credits: 5000,
    features: [
      "5,000 credits/month",
      "All Pro features",
      "Custom AI models",
      "Priority support",
    ],
  },
];

const creditPackages = [
  { credits: 500, price: 10, bonus: 0 },
  { credits: 1500, price: 25, bonus: 20 },
  { credits: 3500, price: 50, bonus: 40 },
];

const transactions = [
  {
    date: "2025-10-15",
    description: "Pro Plan Monthly",
    amount: "$29.00",
    status: "Paid",
  },
  {
    date: "2025-10-10",
    description: "500 Credits Purchase",
    amount: "$10.00",
    status: "Paid",
  },
  {
    date: "2025-09-15",
    description: "Pro Plan Monthly",
    amount: "$29.00",
    status: "Paid",
  },
];

export default function BillingPage() {
  return (
    <div className="container mx-auto p-6 max-w-6xl space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-2">
          Billing & Subscription
        </h1>
        <p className="text-muted-foreground">
          Manage your subscription and purchase additional credits
        </p>
      </div>

      {/* Current Plan */}
      <Card>
        <CardHeader>
          <CardTitle>Current Plan</CardTitle>
          <CardDescription>Your active subscription details</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold">Pro Plan</p>
              <p className="text-muted-foreground">
                1,000 credits per month • $29/month
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Next billing date: November 15, 2025
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline">Change Plan</Button>
              <Button variant="outline">Cancel Subscription</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Subscription Plans */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Subscription Plans</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <Card
              key={plan.name}
              className={plan.popular ? "border-primary shadow-lg" : ""}
            >
              {plan.popular && (
                <div className="bg-primary text-primary-foreground text-center py-1 text-sm font-medium rounded-t-lg">
                  Most Popular
                </div>
              )}
              <CardHeader>
                <CardTitle>{plan.name}</CardTitle>
                <div className="mt-4">
                  <span className="text-4xl font-bold">${plan.price}</span>
                  <span className="text-muted-foreground">/month</span>
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  {plan.credits} credits/month
                </p>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center text-sm">
                      <Check className="h-4 w-4 text-primary mr-2 flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Button className="w-full" variant={plan.popular ? "default" : "outline"}>
                  {plan.price === 29 ? "Current Plan" : "Select Plan"}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Buy Additional Credits */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Buy Additional Credits</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {creditPackages.map((pkg) => (
            <Card key={pkg.credits}>
              <CardHeader>
                <CardTitle>{pkg.credits} Credits</CardTitle>
                <CardDescription>
                  {pkg.bonus > 0 && `${pkg.bonus}% bonus credits included`}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <span className="text-3xl font-bold">${pkg.price}</span>
                  {pkg.bonus > 0 && (
                    <span className="ml-2 text-sm text-primary font-medium">
                      Best value!
                    </span>
                  )}
                </div>
                <Button className="w-full">
                  <CreditCard className="h-4 w-4 mr-2" />
                  Purchase
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Transaction History */}
      <Card>
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
          <CardDescription>Your recent billing transactions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {transactions.map((transaction, index) => (
              <div
                key={index}
                className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0"
              >
                <div>
                  <p className="font-medium">{transaction.description}</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(transaction.date).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <span className="font-medium">{transaction.amount}</span>
                  <span className="text-sm text-green-600 bg-green-50 px-2 py-1 rounded">
                    {transaction.status}
                  </span>
                  <Button variant="ghost" size="icon">
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
