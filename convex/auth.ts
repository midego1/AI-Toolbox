import { v } from "convex/values";
import { mutation, query, internalQuery, action } from "./_generated/server";
import { Id } from "./_generated/dataModel";

function generateToken(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

// Secure password hashing using Web Crypto API (works in Convex environment)
async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const salt = crypto.getRandomValues(new Uint8Array(32));
  
  // Import the password as a key
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    encoder.encode(password),
    { name: "PBKDF2" },
    false,
    ["deriveBits"]
  );
  
  // Derive bits directly using PBKDF2 (256 bits = 32 bytes)
  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      salt: salt,
      iterations: 100000,
      hash: "SHA-256",
    },
    keyMaterial,
    256 // 256 bits = 32 bytes
  );
  
  // Convert to hex string
  const keyArray = new Uint8Array(derivedBits);
  const keyHex = Array.from(keyArray).map(b => b.toString(16).padStart(2, '0')).join('');
  
  // Encode salt as hex string
  const saltHex = Array.from(salt).map(b => b.toString(16).padStart(2, '0')).join('');
  
  return `${saltHex}:${keyHex}`;
}

// Verify password against hash
async function verifyPassword(password: string, hash: string): Promise<boolean> {
  // Check if it's the new PBKDF2 format (contains colon separator)
  if (hash.includes(':')) {
    try {
      const [saltHex, keyHex] = hash.split(':');
      
      if (!saltHex || !keyHex) {
        return false;
      }
      
      // Convert hex strings back to Uint8Array
      const salt = new Uint8Array(
        saltHex.match(/.{1,2}/g)!.map(byte => parseInt(byte, 16))
      );
      
      const encoder = new TextEncoder();
      
      // Import password as key material
      const keyMaterial = await crypto.subtle.importKey(
        "raw",
        encoder.encode(password),
        { name: "PBKDF2" },
        false,
        ["deriveBits"]
      );
      
      // Derive bits using same parameters
      const derivedBits = await crypto.subtle.deriveBits(
        {
          name: "PBKDF2",
          salt: salt,
          iterations: 100000,
          hash: "SHA-256",
        },
        keyMaterial,
        256 // 256 bits = 32 bytes
      );
      
      // Convert to hex and compare
      const keyArray = new Uint8Array(derivedBits);
      const computedKeyHex = Array.from(keyArray).map(b => b.toString(16).padStart(2, '0')).join('');
      
      return computedKeyHex === keyHex;
    } catch (error) {
      return false;
    }
  } else {
    // Legacy SHA-256 hash format (no colon)
    try {
      const encoder = new TextEncoder();
      const data = encoder.encode(password + "SALT_HERE");
      const hashBuffer = await crypto.subtle.digest('SHA-256', data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const legacyHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
      
      return legacyHash === hash;
    } catch (error) {
      return false;
    }
  }
}

// Sign up a new user
export const signup = mutation({
  args: {
    email: v.string(),
    password: v.string(),
    name: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Check if user already exists
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();

    if (existingUser) {
      throw new Error("User with this email already exists");
    }

    // Validate password length
    if (args.password.length < 8) {
      throw new Error("Password must be at least 8 characters long");
    }

    // Hash password using secure PBKDF2 (production-ready)
    const passwordHash = await hashPassword(args.password);

    // Create user
    const userId = await ctx.db.insert("users", {
      email: args.email,
      passwordHash,
      name: args.name,
      subscriptionTier: "free",
      creditsBalance: 10000, // Starting credits (effectively unlimited for testing)
      language: "nl", // Default to Dutch
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    // Add initial credit transaction
    await ctx.db.insert("creditTransactions", {
      userId,
      amount: 10000,
      type: "subscription",
      description: "Welcome bonus credits",
      createdAt: Date.now(),
    });

    // Create session
    const token = generateToken();
    const expiresAt = Date.now() + (30 * 24 * 60 * 60 * 1000); // 30 days

    await ctx.db.insert("sessions", {
      userId,
      token,
      expiresAt,
      createdAt: Date.now(),
    });

    return {
      userId,
      token,
      email: args.email,
      name: args.name,
      subscriptionTier: "free",
      creditsBalance: 10000,
    };
  },
});

// Log in an existing user
export const login = mutation({
  args: {
    email: v.string(),
    password: v.string(),
  },
  handler: async (ctx, args) => {
    // Find user
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();

    if (!user) {
      throw new Error("Invalid email or password");
    }

    // Check if user has a password (not OAuth-only user)
    if (!user.passwordHash) {
      throw new Error("Please sign in with your social provider");
    }

    // Verify password
    const isValid = await verifyPassword(args.password, user.passwordHash);
    if (!isValid) {
      throw new Error("Invalid email or password");
    }

    // Migrate password to new format if it's still using legacy SHA-256
    if (!user.passwordHash.includes(':')) {
      const newPasswordHash = await hashPassword(args.password);
      await ctx.db.patch(user._id, {
        passwordHash: newPasswordHash,
        updatedAt: Date.now(),
      });
    }

    // Create session
    const token = generateToken();
    const expiresAt = Date.now() + (30 * 24 * 60 * 60 * 1000); // 30 days

    await ctx.db.insert("sessions", {
      userId: user._id,
      token,
      expiresAt,
      createdAt: Date.now(),
    });

    return {
      userId: user._id,
      token,
      email: user.email,
      name: user.name,
      subscriptionTier: user.subscriptionTier,
      creditsBalance: user.creditsBalance,
    };
  },
});

// Log out (delete session)
export const logout = mutation({
  args: {
    token: v.string(),
  },
  handler: async (ctx, args) => {
    const session = await ctx.db
      .query("sessions")
      .withIndex("by_token", (q) => q.eq("token", args.token))
      .first();

    if (session) {
      await ctx.db.delete(session._id);
    }

    return { success: true };
  },
});

// Get current user from token
export const getCurrentUser = query({
  args: {
    token: v.string(),
  },
  handler: async (ctx, args) => {
    // Find session
    const session = await ctx.db
      .query("sessions")
      .withIndex("by_token", (q) => q.eq("token", args.token))
      .first();

    if (!session) {
      return null;
    }

    // Check if session is expired
    if (session.expiresAt < Date.now()) {
      // Don't delete in query context - just return null
      // Session cleanup can be handled in a separate mutation
      return null;
    }

    // Get user
    const user = await ctx.db.get(session.userId);
    if (!user) {
      return null;
    }

    return {
      _id: user._id,
      email: user.email,
      name: user.name,
      subscriptionTier: user.subscriptionTier,
      creditsBalance: user.creditsBalance,
      stripeCustomerId: user.stripeCustomerId,
      isAdmin: user.isAdmin || false,
    };
  },
});

// Verify session (helper for authenticated mutations)
// Now supports both Convex user IDs (passed as token) and legacy session tokens
export async function verifySession(ctx: any, token: string): Promise<Id<"users">> {
  // Try to use token directly as a Convex user ID (for Clerk)
  // Convex IDs typically start with letters and are alphanumeric
  try {
    // Check if it looks like a Convex ID (starts with letter, alphanumeric)
    if (/^[a-z][a-z0-9]*$/.test(token)) {
      const user = await ctx.db.get(token as Id<"users">);
      if (user) {
        return token as Id<"users">;
      }
    }
  } catch (e) {
    // Not a valid user ID, continue to session check
  }

  // Legacy: Check for session token (optional - if sessions table exists)
  try {
    const session = await ctx.db
      .query("sessions")
      .withIndex("by_token", (q: any) => q.eq("token", token))
      .first();

    if (session) {
      if (session.expiresAt < Date.now()) {
        await ctx.db.delete(session._id);
        throw new Error("Session expired");
      }
      return session.userId;
    }
  } catch (e) {
    // Sessions table might not exist or not used
  }

  // If we get here, it's an invalid token
  throw new Error("Invalid token or user not found");
}

// Internal query for verifying sessions (can be called from actions)
export const verifySessionInternal = internalQuery({
  args: {
    token: v.string(),
  },
  handler: async (ctx, args) => {
    const session = await ctx.db
      .query("sessions")
      .withIndex("by_token", (q) => q.eq("token", args.token))
      .first();

    if (!session) {
      throw new Error("Invalid or expired session");
    }

    if (session.expiresAt < Date.now()) {
      throw new Error("Session expired");
    }

    return session.userId;
  },
});

// Get user ID from token (mutation for use in actions)
export const getUserIdFromToken = mutation({
  args: {
    token: v.string(),
  },
  handler: async (ctx, args) => {
    return await verifySession(ctx, args.token);
  },
});

// OAuth authentication - find or create user
export const oauthLogin = mutation({
  args: {
    provider: v.string(), // "google", "github", "apple"
    providerId: v.string(),
    email: v.string(),
    name: v.optional(v.string()),
    avatarUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Try to find existing user by OAuth provider
    const existingOAuthUser = await ctx.db
      .query("users")
      .filter(q => q.eq(q.field("oauthProvider"), args.provider))
      .filter(q => q.eq(q.field("oauthProviderId"), args.providerId))
      .first();

    if (existingOAuthUser) {
      // Existing OAuth user - create new session
      const token = generateToken();
      const expiresAt = Date.now() + (30 * 24 * 60 * 60 * 1000); // 30 days

      await ctx.db.insert("sessions", {
        userId: existingOAuthUser._id,
        token,
        expiresAt,
        createdAt: Date.now(),
      });

      // Update last login and avatar if changed
      await ctx.db.patch(existingOAuthUser._id, {
        updatedAt: Date.now(),
        ...(args.avatarUrl && { avatarUrl: args.avatarUrl }),
        ...(args.name && { name: args.name }),
      });

      return {
        userId: existingOAuthUser._id,
        token,
        email: existingOAuthUser.email,
        name: existingOAuthUser.name,
        subscriptionTier: existingOAuthUser.subscriptionTier,
        creditsBalance: existingOAuthUser.creditsBalance,
      };
    }

    // Check if user exists with same email (link OAuth to existing account)
    const existingEmailUser = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();

    let userId: Id<"users">;

    if (existingEmailUser) {
      // Link OAuth to existing account
      userId = existingEmailUser._id;
      await ctx.db.patch(userId, {
        oauthProvider: args.provider,
        oauthProviderId: args.providerId,
        ...(args.avatarUrl && { avatarUrl: args.avatarUrl }),
        updatedAt: Date.now(),
      });
    } else {
      // Create new user
      userId = await ctx.db.insert("users", {
        email: args.email,
        name: args.name,
        oauthProvider: args.provider,
        oauthProviderId: args.providerId,
        subscriptionTier: "free",
        creditsBalance: 10000, // Starting credits
        language: "nl", // Default to Dutch
        avatarUrl: args.avatarUrl,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });

      // Add initial credit transaction
      await ctx.db.insert("creditTransactions", {
        userId,
        amount: 10000,
        type: "subscription",
        description: "Welcome bonus credits",
        createdAt: Date.now(),
      });
    }

    // Create session
    const token = generateToken();
    const expiresAt = Date.now() + (30 * 24 * 60 * 60 * 1000); // 30 days

    await ctx.db.insert("sessions", {
      userId,
      token,
      expiresAt,
      createdAt: Date.now(),
    });

    const user = await ctx.db.get(userId);

    return {
      userId,
      token,
      email: user!.email,
      name: user!.name,
      subscriptionTier: user!.subscriptionTier,
      creditsBalance: user!.creditsBalance,
    };
  },
});
