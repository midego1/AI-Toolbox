import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { verifySession } from "./auth";

// Generate upload URL for file
export const generateUploadUrl = mutation({
  args: {
    token: v.string(),
  },
  handler: async (ctx, args) => {
    // Verify user is authenticated
    await verifySession(ctx, args.token);

    // Generate upload URL
    return await ctx.storage.generateUploadUrl();
  },
});

// Get file URL for download/display
export const getFileUrl = query({
  args: {
    token: v.string(),
    storageId: v.id("_storage"),
  },
  handler: async (ctx, args) => {
    // Verify user is authenticated
    await verifySession(ctx, args.token);

    // Get file URL
    return await ctx.storage.getUrl(args.storageId);
  },
});

// Delete a file
export const deleteFile = mutation({
  args: {
    token: v.string(),
    storageId: v.id("_storage"),
  },
  handler: async (ctx, args) => {
    // Verify user is authenticated
    await verifySession(ctx, args.token);

    // Delete file
    await ctx.storage.delete(args.storageId);

    return { success: true };
  },
});
