/**
 * Payment Functions
 * 
 * Convex functions for handling Stripe payments, subscriptions, and webhooks
 */

import { v } from "convex/values";
import { mutation, query, action, internalMutation, internalQuery } from "./_generated/server";
import { verifySession } from "./auth";
import { getStripeInstance, getOrCreateStripeCustomer, STRIPE_CONFIG } from "./lib/stripe";
import { internal } from "./_generated/api";

// Create Stripe checkout session for subscription
export const createSubscriptionCheckout = action({
  args: {
    token: v.string(),
    tier: v.string(), // "pro" or "enterprise"
  },
  handler: async (ctx, args): Promise<{ sessionId: string; url: string | null }> => {
    // Verify user session
    const userId: string = await ctx.runQuery(internal.auth.verifySessionInternal, {
      token: args.token,
    }) as string;

    const user: any = await ctx.runQuery(internal.payments.getUserForCheckout, {
      userId: userId as string,
    });

    if (!user) {
      throw new Error("User not found");
    }

    const stripe = getStripeInstance();
    const plan = args.tier === "pro" ? STRIPE_CONFIG.plans.pro : STRIPE_CONFIG.plans.enterprise;

    if (!plan.priceId) {
      throw new Error(`Stripe Price ID not configured for ${args.tier} plan`);
    }

    // Get or create Stripe customer
    const customerId = await getOrCreateStripeCustomer(
      stripe,
      user.email,
      user._id,
      user.stripeCustomerId
    );

    // Update user with Stripe customer ID if it's new
    if (!user.stripeCustomerId) {
      await ctx.runMutation(internal.payments.updateStripeCustomerId, {
        userId: user._id,
        stripeCustomerId: customerId,
      });
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [
        {
          price: plan.priceId,
          quantity: 1,
        },
      ],
      success_url: `${process.env.APP_URL}/billing?success=true`,
      cancel_url: `${process.env.APP_URL}/billing?canceled=true`,
      metadata: {
        userId: user._id,
        tier: args.tier,
        credits: plan.credits.toString(),
      },
    });

    return { sessionId: session.id, url: session.url };
  },
});

// Create Stripe checkout session for one-time credit purchase
export const createCreditPurchaseCheckout = action({
  args: {
    token: v.string(),
    packageSize: v.string(), // "small", "medium", "large"
  },
  handler: async (ctx, args): Promise<{ sessionId: string; url: string | null }> => {
    const userId: string = await ctx.runQuery(internal.auth.verifySessionInternal, {
      token: args.token,
    }) as string;

    const user: any = await ctx.runQuery(internal.payments.getUserForCheckout, {
      userId: userId as string,
    });

    if (!user) {
      throw new Error("User not found");
    }

    const stripe = getStripeInstance();
    const creditPackage = STRIPE_CONFIG.creditPackages[
      args.packageSize as keyof typeof STRIPE_CONFIG.creditPackages
    ];

    if (!creditPackage) {
      throw new Error(`Invalid package size: ${args.packageSize}`);
    }

    // Get or create Stripe customer
    const customerId = await getOrCreateStripeCustomer(
      stripe,
      user.email,
      user._id,
      user.stripeCustomerId
    );

    // Update user with Stripe customer ID if it's new
    if (!user.stripeCustomerId) {
      await ctx.runMutation(internal.payments.updateStripeCustomerId, {
        userId: user._id,
        stripeCustomerId: customerId,
      });
    }

    // Create checkout session
    const session: any = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: `${creditPackage.credits} AI Credits`,
              description: `One-time purchase of ${creditPackage.credits} credits`,
            },
            unit_amount: creditPackage.amount,
          },
          quantity: 1,
        },
      ],
      success_url: `${process.env.APP_URL}/billing?success=true`,
      cancel_url: `${process.env.APP_URL}/billing?canceled=true`,
      metadata: {
        userId: user._id,
        credits: creditPackage.credits.toString(),
        type: "credit_purchase",
      },
    });

    return { sessionId: session.id, url: session.url };
  },
});

// Handle Stripe webhook events
export const handleStripeWebhook = action({
  args: {
    event: v.any(),
  },
  handler: async (ctx, args) => {
    const event = args.event;

    switch (event.type) {
      case "checkout.session.completed":
        await handleCheckoutCompleted(ctx, event.data.object);
        break;

      case "customer.subscription.created":
      case "customer.subscription.updated":
        await handleSubscriptionUpdated(ctx, event.data.object);
        break;

      case "customer.subscription.deleted":
        await handleSubscriptionDeleted(ctx, event.data.object);
        break;

      case "invoice.payment_succeeded":
        await handleInvoicePaymentSucceeded(ctx, event.data.object);
        break;

      case "invoice.payment_failed":
        await handleInvoicePaymentFailed(ctx, event.data.object);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return { received: true };
  },
});

// Helper function to handle checkout completion
async function handleCheckoutCompleted(ctx: any, session: any) {
  const userId = session.metadata.userId;
  const type = session.metadata.type;

  if (session.mode === "subscription") {
    // Handle subscription checkout
    const tier = session.metadata.tier;
    const credits = parseInt(session.metadata.credits);

    // Update user subscription tier
    await ctx.runMutation(internal.payments.updateUserSubscription, {
      userId,
      tier,
      stripeSubscriptionId: session.subscription,
    });

    // Add monthly credits
    await ctx.runMutation(internal.payments.addCreditsInternal, {
      userId,
      amount: credits,
      type: "subscription",
      description: `Monthly credits from ${tier} plan`,
    });
  } else if (type === "credit_purchase") {
    // Handle one-time credit purchase
    const credits = parseInt(session.metadata.credits);

    await ctx.runMutation(internal.payments.addCreditsInternal, {
      userId,
      amount: credits,
      type: "purchase",
      description: `Purchased ${credits} credits`,
      stripePaymentIntentId: session.payment_intent,
    });
  }
}

// Helper function to handle subscription updates
async function handleSubscriptionUpdated(ctx: any, subscription: any) {
  const customerId = subscription.customer;

  // Find user by Stripe customer ID
  const user = await ctx.runQuery(internal.payments.getUserByStripeCustomerId, {
    stripeCustomerId: customerId,
  });

  if (!user) {
    console.error(`User not found for Stripe customer: ${customerId}`);
    return;
  }

  // Update or create subscription record
  await ctx.runMutation(internal.payments.upsertSubscription, {
    userId: user._id,
    stripeSubscriptionId: subscription.id,
    stripePriceId: subscription.items.data[0].price.id,
    status: subscription.status,
    currentPeriodStart: subscription.current_period_start * 1000,
    currentPeriodEnd: subscription.current_period_end * 1000,
    cancelAtPeriodEnd: subscription.cancel_at_period_end,
  });
}

// Helper function to handle subscription deletion
async function handleSubscriptionDeleted(ctx: any, subscription: any) {
  const customerId = subscription.customer;

  const user = await ctx.runQuery(internal.payments.getUserByStripeCustomerId, {
    stripeCustomerId: customerId,
  });

  if (!user) {
    console.error(`User not found for Stripe customer: ${customerId}`);
    return;
  }

  // Update user subscription tier to free
  await ctx.runMutation(internal.payments.updateUserSubscription, {
    userId: user._id,
    tier: "free",
    stripeSubscriptionId: subscription.id,
  });

  // Mark subscription as canceled
  await ctx.runMutation(internal.payments.cancelSubscriptionInternal, {
    stripeSubscriptionId: subscription.id,
  });
}

// Helper function to handle successful invoice payment
async function handleInvoicePaymentSucceeded(ctx: any, invoice: any) {
  const customerId = invoice.customer;
  const subscriptionId = invoice.subscription;

  if (!subscriptionId) return;

  const user = await ctx.runQuery(internal.payments.getUserByStripeCustomerId, {
    stripeCustomerId: customerId,
  });

  if (!user) {
    console.error(`User not found for Stripe customer: ${customerId}`);
    return;
  }

  // Get subscription details to determine credits to add
  const stripe = getStripeInstance();
  const subscription = await stripe.subscriptions.retrieve(subscriptionId);
  const priceId = subscription.items.data[0].price.id;

  // Determine tier and credits based on price ID
  let tier = "pro";
  let credits = STRIPE_CONFIG.plans.pro.credits;

  if (priceId === STRIPE_CONFIG.plans.enterprise.priceId) {
    tier = "enterprise";
    credits = STRIPE_CONFIG.plans.enterprise.credits;
  }

  // Add monthly credits on successful payment
  await ctx.runMutation(internal.payments.addCreditsInternal, {
    userId: user._id,
    amount: credits,
    type: "subscription",
    description: `Monthly credits renewal - ${tier} plan`,
    stripePaymentIntentId: invoice.payment_intent,
  });
}

// Helper function to handle failed invoice payment
async function handleInvoicePaymentFailed(ctx: any, invoice: any) {
  const customerId = invoice.customer;

  const user = await ctx.runQuery(internal.payments.getUserByStripeCustomerId, {
    stripeCustomerId: customerId,
  });

  if (!user) {
    console.error(`User not found for Stripe customer: ${customerId}`);
    return;
  }

  // Update subscription status to past_due
  await ctx.runMutation(internal.payments.updateSubscriptionStatus, {
    userId: user._id,
    status: "past_due",
  });
}

// Cancel subscription
export const cancelSubscription = action({
  args: {
    token: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await ctx.runQuery(internal.auth.verifySessionInternal, {
      token: args.token,
    });

    const user = await ctx.runQuery(internal.payments.getUserForCheckout, {
      userId: userId as string,
    });

    if (!user) {
      throw new Error("User not found");
    }

    const subscription = await ctx.runQuery(internal.payments.getActiveSubscription, {
      userId: user._id,
    });

    if (!subscription) {
      throw new Error("No active subscription found");
    }

    const stripe = getStripeInstance();

    // Cancel subscription at period end
    await stripe.subscriptions.update(subscription.stripeSubscriptionId, {
      cancel_at_period_end: true,
    });

    // Update subscription in database
    await ctx.runMutation(internal.payments.markSubscriptionForCancellation, {
      subscriptionId: subscription._id,
    });

    return { success: true };
  },
});

// Get current subscription details
export const getCurrentSubscription = query({
  args: {
    token: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await verifySession(ctx, args.token);

    const subscription = await ctx.db
      .query("subscriptions")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .filter((q) => q.neq(q.field("status"), "canceled"))
      .first();

    return subscription;
  },
});

// Internal query to get user for checkout
export const getUserForCheckout = internalQuery({
  args: {
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId as any);
    return user;
  },
});

// Internal query to get user by Stripe customer ID
export const getUserByStripeCustomerId = internalQuery({
  args: {
    stripeCustomerId: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("stripeCustomerId"), args.stripeCustomerId))
      .first();

    return user;
  },
});

// Internal query to get active subscription
export const getActiveSubscription = internalQuery({
  args: {
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const subscription = await ctx.db
      .query("subscriptions")
      .withIndex("by_user", (q) => q.eq("userId", args.userId as any))
      .filter((q) => q.eq(q.field("status"), "active"))
      .first();

    return subscription;
  },
});

// Internal mutation to update Stripe customer ID
export const updateStripeCustomerId = internalMutation({
  args: {
    userId: v.string(),
    stripeCustomerId: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.userId as any, {
      stripeCustomerId: args.stripeCustomerId,
      updatedAt: Date.now(),
    });
  },
});

// Internal mutation to update user subscription
export const updateUserSubscription = internalMutation({
  args: {
    userId: v.string(),
    tier: v.string(),
    stripeSubscriptionId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.userId as any, {
      subscriptionTier: args.tier,
      updatedAt: Date.now(),
    });
  },
});

// Internal mutation to add credits
export const addCreditsInternal = internalMutation({
  args: {
    userId: v.string(),
    amount: v.number(),
    type: v.string(),
    description: v.string(),
    stripePaymentIntentId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user: any = await ctx.db.get(args.userId as any);

    if (!user) {
      throw new Error("User not found");
    }

    const newBalance = (user.creditsBalance as number) + args.amount;
    await ctx.db.patch(args.userId as any, {
      creditsBalance: newBalance,
      updatedAt: Date.now(),
    });

    await ctx.db.insert("creditTransactions", {
      userId: args.userId as any,
      amount: args.amount,
      type: args.type,
      description: args.description,
      stripePaymentIntentId: args.stripePaymentIntentId,
      createdAt: Date.now(),
    });
  },
});

// Internal mutation to upsert subscription
export const upsertSubscription = internalMutation({
  args: {
    userId: v.string(),
    stripeSubscriptionId: v.string(),
    stripePriceId: v.string(),
    status: v.string(),
    currentPeriodStart: v.number(),
    currentPeriodEnd: v.number(),
    cancelAtPeriodEnd: v.boolean(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("subscriptions")
      .withIndex("by_stripe_subscription", (q) =>
        q.eq("stripeSubscriptionId", args.stripeSubscriptionId)
      )
      .first();

    // Determine tier based on price ID
    let tier = "pro";
    if (args.stripePriceId === STRIPE_CONFIG.plans.enterprise.priceId) {
      tier = "enterprise";
    }

    if (existing) {
      await ctx.db.patch(existing._id, {
        status: args.status,
        currentPeriodStart: args.currentPeriodStart,
        currentPeriodEnd: args.currentPeriodEnd,
        cancelAtPeriodEnd: args.cancelAtPeriodEnd,
        tier,
        updatedAt: Date.now(),
      });
    } else {
      await ctx.db.insert("subscriptions", {
        userId: args.userId as any,
        stripeSubscriptionId: args.stripeSubscriptionId,
        stripePriceId: args.stripePriceId,
        tier,
        status: args.status,
        currentPeriodStart: args.currentPeriodStart,
        currentPeriodEnd: args.currentPeriodEnd,
        cancelAtPeriodEnd: args.cancelAtPeriodEnd,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
    }
  },
});

// Internal mutation to cancel subscription
export const cancelSubscriptionInternal = internalMutation({
  args: {
    stripeSubscriptionId: v.string(),
  },
  handler: async (ctx, args) => {
    const subscription = await ctx.db
      .query("subscriptions")
      .withIndex("by_stripe_subscription", (q) =>
        q.eq("stripeSubscriptionId", args.stripeSubscriptionId)
      )
      .first();

    if (subscription) {
      await ctx.db.patch(subscription._id, {
        status: "canceled",
        updatedAt: Date.now(),
      });
    }
  },
});

// Internal mutation to mark subscription for cancellation
export const markSubscriptionForCancellation = internalMutation({
  args: {
    subscriptionId: v.id("subscriptions"),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.subscriptionId, {
      cancelAtPeriodEnd: true,
      updatedAt: Date.now(),
    });
  },
});

// Internal mutation to update subscription status
export const updateSubscriptionStatus = internalMutation({
  args: {
    userId: v.string(),
    status: v.string(),
  },
  handler: async (ctx, args) => {
    const subscription = await ctx.db
      .query("subscriptions")
      .withIndex("by_user", (q) => q.eq("userId", args.userId as any))
      .first();

    if (subscription) {
      await ctx.db.patch(subscription._id, {
        status: args.status,
        updatedAt: Date.now(),
      });
    }
  },
});

