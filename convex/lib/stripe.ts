/**
 * Stripe Configuration and Helper Functions
 * 
 * This file contains Stripe API configuration and helper functions
 * used by Convex backend functions.
 */

import Stripe from "stripe";

// Initialize Stripe with API key from environment variable
// This will be set in Convex environment variables
export const getStripeInstance = () => {
  const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
  
  if (!stripeSecretKey) {
    throw new Error("STRIPE_SECRET_KEY is not configured in environment variables");
  }

  return new Stripe(stripeSecretKey, {
    apiVersion: "2023-10-16",
    typescript: true,
  });
};

// Stripe Product and Price Configuration
export const STRIPE_CONFIG = {
  // Subscription Plans
  plans: {
    pro: {
      name: "Pro Plan",
      credits: 1000,
      priceId: process.env.STRIPE_PRO_PRICE_ID || "", // Set in environment
      amount: 2900, // $29.00 in cents
    },
    enterprise: {
      name: "Enterprise Plan",
      credits: 5000,
      priceId: process.env.STRIPE_ENTERPRISE_PRICE_ID || "", // Set in environment
      amount: 9900, // $99.00 in cents
    },
  },
  
  // One-time Credit Packages
  creditPackages: {
    small: {
      credits: 500,
      amount: 1000, // $10.00 in cents
    },
    medium: {
      credits: 1500,
      amount: 2500, // $25.00 in cents
    },
    large: {
      credits: 3500,
      amount: 5000, // $50.00 in cents
    },
  },
};

// Helper function to create or retrieve a Stripe customer
export async function getOrCreateStripeCustomer(
  stripe: Stripe,
  email: string,
  userId: string,
  existingCustomerId?: string
): Promise<string> {
  // If customer already exists, return it
  if (existingCustomerId) {
    try {
      await stripe.customers.retrieve(existingCustomerId);
      return existingCustomerId;
    } catch (error) {
      // Customer doesn't exist, create a new one
      console.error("Customer not found, creating new one:", error);
    }
  }

  // Create new customer
  const customer = await stripe.customers.create({
    email,
    metadata: {
      convexUserId: userId,
    },
  });

  return customer.id;
}

// Helper function to format amount for Stripe (dollars to cents)
export function formatAmountForStripe(amount: number): number {
  return Math.round(amount * 100);
}

// Helper function to format amount for display (cents to dollars)
export function formatAmountFromStripe(amount: number): string {
  return (amount / 100).toFixed(2);
}

