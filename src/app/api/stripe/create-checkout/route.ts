/**
 * API Route: Create Stripe Checkout Session
 * 
 * This route creates a Stripe checkout session for either:
 * - Subscription purchases (pro/enterprise plans)
 * - One-time credit purchases
 */

import { NextRequest, NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../convex/_generated/api";

// Initialize Convex client
const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token, type, tier, packageSize } = body;

    if (!token) {
      return NextResponse.json(
        { error: "Authentication token required" },
        { status: 401 }
      );
    }

    let result;

    if (type === "subscription") {
      // Create subscription checkout session
      if (!tier) {
        return NextResponse.json(
          { error: "Tier is required for subscription" },
          { status: 400 }
        );
      }

      result = await convex.action(api.payments.createSubscriptionCheckout, {
        token,
        tier,
      });
    } else if (type === "credits") {
      // Create one-time credit purchase checkout session
      if (!packageSize) {
        return NextResponse.json(
          { error: "Package size is required for credit purchase" },
          { status: 400 }
        );
      }

      result = await convex.action(api.payments.createCreditPurchaseCheckout, {
        token,
        packageSize,
      });
    } else {
      return NextResponse.json(
        { error: "Invalid checkout type" },
        { status: 400 }
      );
    }

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Checkout session creation error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create checkout session" },
      { status: 500 }
    );
  }
}



