import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { api, internal } from "./_generated/api";
import { callOpenRouterStreaming } from "./lib/openrouter";

const http = httpRouter();

/**
 * CORS headers for cross-origin requests
 */
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

/**
 * Handle CORS preflight OPTIONS request
 */
http.route({
  path: "/chat/stream",
  method: "OPTIONS",
  handler: httpAction(async () => {
    return new Response(null, {
      status: 204,
      headers: corsHeaders,
    });
  }),
});

/**
 * HTTP endpoint for streaming chat responses
 * This allows us to stream AI responses token-by-token to the frontend
 */
http.route({
  path: "/chat/stream",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    try {
      const body = await request.json();
      const { 
        token, 
        sessionId, 
        message, 
        includeThinking,
        systemPrompt,
        temperature = 0.7,
        maxTokens = 1000,
        fileIds
      } = body;

      // Verify the user's session
      const userId = await ctx.runMutation(api.auth.getUserIdFromToken, {
        token,
      });

      // Get user and check credits
      const user = await ctx.runQuery(api.users.getUserProfile, { token });
      const creditsNeeded = includeThinking ? 3 : 2;

      if (user.creditsBalance < creditsNeeded) {
        return new Response(
          JSON.stringify({ error: "Insufficient credits" }),
          {
            status: 402,
            headers: { 
              "Content-Type": "application/json",
              ...corsHeaders,
            },
          }
        );
      }

      // Get conversation history
      const history = await ctx.runQuery(
        internal.tools.chat.getSessionMessagesInternal,
        {
          token,
          sessionId,
          limit: 10,
        }
      );

      // Build system message
      const defaultSystemMessage = `You are an advanced AI assistant providing thoughtful advice and insights. When thinking mode is enabled, you should:
1. Show your reasoning process step-by-step
2. Consider multiple perspectives
3. Cite relevant factors in your decision-making
4. Be honest about limitations and uncertainties

Be helpful, accurate, and insightful. Break down complex topics clearly.`;

      const finalSystemMessage = systemPrompt 
        ? `${defaultSystemMessage}\n\nAdditional Instructions: ${systemPrompt}`
        : defaultSystemMessage;

      // Build messages array
      const messages = [
        { role: "system" as const, content: finalSystemMessage },
        ...history.messages.map((m: any) => ({
          role: m.role as "user" | "assistant",
          content: m.content,
        })),
      ];
      
      // Build user message content with files if any
      let userContent: any = message;
      
      if (fileIds && fileIds.length > 0) {
        // Get file URLs from storage
        const fileUrls = await Promise.all(
          fileIds.map(async (fileId: string) => {
            const url = await ctx.storage.getUrl(fileId as any);
            return url;
          })
        );
        
        // For Gemini vision-capable models, format as multi-modal content
        userContent = [
          { type: "text", text: message },
          ...fileUrls.map((url) => ({
            type: "image_url",
            image_url: { url },
          })),
        ];
      }
      
      messages.push({ role: "user" as const, content: userContent });

      // Save user message first (with file IDs if any)
      console.log("Saving user message with fileIds:", fileIds);
      const userMessageData: any = {
        token,
        sessionId,
        role: "user",
        content: message,
        creditsUsed: 0,
      };
      if (fileIds && fileIds.length > 0) {
        userMessageData.fileIds = fileIds;
      }
      console.log("userMessageData being saved:", userMessageData);
      await ctx.runMutation(internal.tools.chat.addMessage, userMessageData);

      // Create readable stream for SSE
      const stream = new ReadableStream({
        async start(controller) {
          const encoder = new TextEncoder();

          try {
            let thinking = "";
            let assistantResponse = "";
            const startTime = Date.now();

            // If thinking mode, generate thinking first
            if (includeThinking) {
              const thinkingMessages = [
                ...messages,
                {
                  role: "user" as const,
                  content:
                    "Before answering, explain your thinking process and reasoning. What factors are you considering?",
                },
              ];

              // Stream thinking process
              controller.enqueue(
                encoder.encode(
                  `data: ${JSON.stringify({ type: "thinking_start" })}\n\n`
                )
              );

              await callOpenRouterStreaming(
                thinkingMessages,
                {
                  temperature,
                  maxTokens: Math.min(500, maxTokens),
                },
                (chunk) => {
                  thinking += chunk;
                  controller.enqueue(
                    encoder.encode(
                      `data: ${JSON.stringify({ type: "thinking", content: chunk })}\n\n`
                    )
                  );
                }
              );

              controller.enqueue(
                encoder.encode(
                  `data: ${JSON.stringify({ type: "thinking_end" })}\n\n`
                )
              );
            }

            // Stream the actual response
            controller.enqueue(
              encoder.encode(
                `data: ${JSON.stringify({ type: "response_start" })}\n\n`
              )
            );

            await callOpenRouterStreaming(
              messages,
              {
                temperature,
                maxTokens,
              },
              (chunk) => {
                assistantResponse += chunk;
                controller.enqueue(
                  encoder.encode(
                    `data: ${JSON.stringify({ type: "response", content: chunk })}\n\n`
                  )
                );
              }
            );

            const responseTime = Date.now() - startTime;

            // Create job for tracking
            const jobId = await ctx.runMutation(api.aiJobs.createJob, {
              token,
              toolType: "ai_chat",
              inputData: { message, includeThinking },
            });

            // Update job
            await ctx.runMutation(api.aiJobs.updateJobStatus, {
              token,
              jobId,
              status: "completed",
              outputData: { response: assistantResponse, thinking },
              creditsUsed: creditsNeeded,
            });

            // Deduct credits
            await ctx.runMutation(api.users.deductCredits, {
              token,
              amount: creditsNeeded,
              jobId,
              description: `AI Chat - ${includeThinking ? "with thinking" : "standard"}`,
            });

            // Save assistant message
            const messageId = await ctx.runMutation(
              internal.tools.chat.addMessage,
              {
                token,
                sessionId,
                role: "assistant",
                content: assistantResponse,
                thinking: thinking || undefined,
                creditsUsed: creditsNeeded,
                modelUsed: "google/gemini-2.5-flash",
                responseTime,
              }
            );

            // Update session metadata
            await ctx.runMutation(internal.tools.chat.updateSessionMetadata, {
              token,
              sessionId,
              messageCount: history.messages.length + 2,
              creditsUsed: creditsNeeded,
            });

            // Auto-generate title if first message
            if (history.messages.length === 0) {
              await ctx.scheduler.runAfter(
                0,
                api.tools.chat.generateSessionTitle,
                {
                  token,
                  sessionId,
                  firstMessage: message,
                }
              );
            }

            // Send completion event
            controller.enqueue(
              encoder.encode(
                `data: ${JSON.stringify({
                  type: "complete",
                  messageId,
                  creditsUsed: creditsNeeded,
                  responseTime,
                })}\n\n`
              )
            );

            controller.close();
          } catch (error: any) {
            console.error("Streaming error:", error);
            controller.enqueue(
              encoder.encode(
                `data: ${JSON.stringify({
                  type: "error",
                  error: error.message,
                })}\n\n`
              )
            );
            controller.close();
          }
        },
      });

      return new Response(stream, {
        headers: {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          Connection: "keep-alive",
          ...corsHeaders,
        },
      });
    } catch (error: any) {
      console.error("HTTP action error:", error);
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { 
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      });
    }
  }),
});

/**
 * Clerk Webhook endpoint
 * Receives webhooks from Clerk when users sign up or are updated
 */
http.route({
  path: "/api/clerk-webhook",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    try {
      const payload = await request.json();
      const eventType = payload.type;
      
      // Handle user creation and updates
      if (eventType === "user.created" || eventType === "user.updated") {
        const userId = payload.data.id;
        const emailAddresses = payload.data.email_addresses || [];
        const primaryEmail = emailAddresses.find((e: any) => e.id === payload.data.primary_email_address_id) 
          || emailAddresses[0];
        const email = primaryEmail?.email_address || "";
        
        const firstName = payload.data.first_name;
        const lastName = payload.data.last_name;
        const fullName = firstName && lastName ? `${firstName} ${lastName}` : firstName || lastName || "";
        const avatar = payload.data.image_url;
        
        // Sync user to Convex (internal version for webhook)
        await ctx.runMutation(internal.clerk.syncClerkUserInternal, {
          clerkUserId: userId,
          email,
          name: fullName,
          avatarUrl: avatar,
        });
      }
      
      return new Response("OK", { status: 200 });
    } catch (error: any) {
      console.error("Clerk webhook error:", error);
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }
  }),
});

export default http;

