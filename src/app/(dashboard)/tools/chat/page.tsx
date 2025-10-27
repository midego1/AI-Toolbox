"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useAction, useQuery, useMutation } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { useAuthToken } from "@/hooks/useAuthToken";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  MessageSquare, Send, Brain, Star, Trash2, ThumbsUp, ThumbsDown, 
  Sparkles, Clock, BarChart3, Copy, RotateCcw, Edit2, Download,
  ChevronLeft, ChevronRight, Plus, Settings, Maximize2, RefreshCw, Paperclip, X, Search, Minus, Type
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { CodeHighlight } from "@/components/ui/code-highlight";

export default function AdvancedChatPage() {
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [thinkingMode, setThinkingMode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isCreatingSession, setIsCreatingSession] = useState(false);
  const [attachments, setAttachments] = useState<File[]>([]);
  const [uploadedFileIds, setUploadedFileIds] = useState<string[]>([]);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  
  // Use the proper auth hook to get the token
  const token = useAuthToken();

  // Debug: Log token state
  useEffect(() => {
    console.log("Chat page - Token:", token ? "Available" : "Not available");
    console.log("Chat page - Current session ID:", currentSessionId);
    console.log("Chat page - Token value:", token);
  }, [token, currentSessionId]);

  // Debug: Log when component renders
  useEffect(() => {
    console.log("Chat page component rendered");
  }, []);

  // Prevent main content scroll and ensure proper positioning for chat
  useEffect(() => {
    const mainContent = document.querySelector('main');
    if (mainContent) {
      const originalOverflow = mainContent.style.overflow;
      const originalPosition = mainContent.style.position;
      
      mainContent.style.overflow = 'hidden';
      mainContent.style.position = 'relative';
      
      return () => {
        mainContent.style.overflow = originalOverflow;
        mainContent.style.position = originalPosition;
      };
    }
  }, []);
  const [streamingMessage, setStreamingMessage] = useState<{
    content: string;
    thinking: string;
    isThinking: boolean;
  } | null>(null);
  const [leftSidebarCollapsed, setLeftSidebarCollapsed] = useState(false);
  const [rightSidebarCollapsed, setRightSidebarCollapsed] = useState(false);
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  const [systemPrompt, setSystemPrompt] = useState("");
  const [temperature, setTemperature] = useState(0.7);
  const [maxTokens, setMaxTokens] = useState(1000);
  const [fontSize, setFontSize] = useState(0); // -2 to 2 (5 sizes)
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const hasAttemptedAutoCreate = useRef(false);
  const previousSessionId = useRef<string | null>(null);

  // Show loading state while auth is initializing
  useEffect(() => {
    console.log("RENDER CHECK - token:", token, "typeof token:", typeof token);
  }, [token]);

  // Queries - ALL HOOKS MUST BE CALLED BEFORE ANY EARLY RETURNS
  const chatSessions = useQuery(
    api.tools.chat.getChatSessions,
    token ? { token } : "skip"
  );

  const currentChat = useQuery(
    api.tools.chat.getSessionMessages,
    currentSessionId && token
      ? { token, sessionId: currentSessionId as any }
      : "skip"
  );

  // Actions & Mutations
  const createSession = useMutation(api.tools.chat.createChatSession);
  const rateMessageMutation = useMutation(api.tools.chat.rateMessage);
  const toggleFavorite = useMutation(api.tools.chat.toggleFavoriteSession);
  const updateTags = useMutation(api.tools.chat.updateSessionTags);
  const deleteSessionMutation = useMutation(api.tools.chat.deleteSession);
  const generateUploadUrl = useMutation(api.files.generateUploadUrl);

  const handleNewChat = useCallback(async () => {
    console.log("handleNewChat called - token:", token, "isCreatingSession:", isCreatingSession);
    
    if (!token) {
      console.error("Cannot create chat: No token available");
      alert("Please wait for authentication to complete.");
      return;
    }
    
    if (isCreatingSession) {
      console.log("Already creating session, skipping...");
      return;
    }
    
    console.log("Creating new chat session...");
    setIsCreatingSession(true);
    hasAttemptedAutoCreate.current = false; // Reset flag before creating
    try {
      console.log("Calling createSession mutation with token:", token);
      const sessionId = await createSession({ token });
      console.log("Chat session created successfully:", sessionId);
      setCurrentSessionId(sessionId);
      setTimeout(() => {
        inputRef.current?.focus();
        // Scroll to bottom after creating new chat
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    } catch (error: any) {
      console.error("Failed to create chat:", error);
      alert(`Error: ${error.message}`);
      hasAttemptedAutoCreate.current = false; // Reset on error so user can retry
    } finally {
      console.log("Finishing handleNewChat, setting isCreatingSession to false");
      setIsCreatingSession(false);
    }
  }, [token, createSession, isCreatingSession]);

  // ALL REMAINING HOOKS - Must be called before any returns
  useEffect(() => {
    console.log("useEffect triggered - chatSessions:", chatSessions, "currentSessionId:", currentSessionId, "token:", token);
    
    if (chatSessions !== undefined && !isCreatingSession && token) {
      if (chatSessions.length > 0) {
        // Always select the first session if we don't have one
        if (!currentSessionId) {
          console.log("Selecting first session:", chatSessions[0]._id);
          setCurrentSessionId(chatSessions[0]._id);
        }
        // If current session was deleted, select the first available
        else if (!chatSessions.find(s => s._id === currentSessionId)) {
          console.log("Session deleted, selecting first available:", chatSessions[0]._id);
          setCurrentSessionId(chatSessions[0]._id);
        }
      } else if (chatSessions.length === 0 && !currentSessionId && !hasAttemptedAutoCreate.current) {
        // No sessions exist - create a new one
        console.log("No sessions found, creating new chat...");
        hasAttemptedAutoCreate.current = true;
        handleNewChat();
      } else if (chatSessions.length === 0 && !currentSessionId && hasAttemptedAutoCreate.current) {
        // Allow manual retry by resetting the flag
        console.log("Auto-creation attempted but no session yet. User can click button to create.");
      }
    } else if (chatSessions === undefined && token) {
      console.log("Waiting for chatSessions to load...");
    }
  }, [chatSessions, currentSessionId, token, handleNewChat, isCreatingSession]);

  // Auto-scroll when sending/receiving messages OR when switching to a different chat
  useEffect(() => {
    // Scroll if actively loading/streaming
    if (isLoading || streamingMessage) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [isLoading, streamingMessage]);

  // Scroll to bottom when user clicks on a different chat
  useEffect(() => {
    if (currentSessionId && currentSessionId !== previousSessionId.current && previousSessionId.current !== null) {
      // User clicked on a different chat, scroll to bottom
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    }
    previousSessionId.current = currentSessionId;
  }, [currentSessionId]);

  // Scroll to bottom when chat messages are loaded
  useEffect(() => {
    if (currentChat?.messages && currentChat.messages.length > 0) {
      // Small delay to ensure DOM is ready
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    }
  }, [currentChat?.messages]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const cmdOrCtrl = isMac ? e.metaKey : e.ctrlKey;
      
      // Cmd/Ctrl + K: Open command palette
      if (cmdOrCtrl && e.key === 'k') {
        e.preventDefault();
        setCommandPaletteOpen(true);
      }
      
      // Cmd/Ctrl + N: New chat
      if (cmdOrCtrl && e.key === 'n') {
        e.preventDefault();
        if (!isCreatingSession && token) {
          handleNewChat();
        }
      }
      
      // Cmd/Ctrl + E: Export chat
      if (cmdOrCtrl && e.key === 'e') {
        e.preventDefault();
        if (currentChat?.messages.length) {
          exportChat();
        }
      }
      
      // Escape: Clear input (only when input is focused)
      if (e.key === 'Escape' && document.activeElement === inputRef.current) {
        setMessage("");
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isCreatingSession, token, currentChat]);

  // Early return for loading state - MUST BE AFTER ALL HOOKS
  if (!token) {
    console.log("Rendering loading screen - token is null/undefined");
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Initializing chat...</p>
          <p className="text-sm text-muted-foreground mt-2">Waiting for authentication...</p>
        </div>
      </div>
    );
  }

  console.log("Rendering full chat interface - token is available:", token);

  const handleSend = async () => {
    if ((!message.trim() && attachments.length === 0) || !token) return;
    
    // If no session exists, create one first
    if (!currentSessionId) {
      if (!isCreatingSession) {
        const userMessage = message; // Save the message before creating session
        await handleNewChat();
        // The session creation will trigger a re-render with currentSessionId set
        // Wait for state to update, then retry this function
        setTimeout(() => {
          if (message || attachments.length > 0) {
            handleSend();
          }
        }, 500);
        return;
      }
      return;
    }

    setIsLoading(true);
    const userMessage = message;
    setMessage("");
    setStreamingMessage({ content: "", thinking: "", isThinking: false });

    // Upload files first
    let uploadedFileIds: string[] = [];
    console.log("Starting file upload with attachments:", attachments.length);
    if (attachments.length > 0 && token) {
      try {
        for (const file of attachments) {
          const uploadUrl = await generateUploadUrl({ token });
          console.log("Got upload URL:", uploadUrl);
          
          const uploadResponse = await fetch(uploadUrl, {
            method: "POST",
            headers: { "Content-Type": file.type },
            body: file,
          });
          
          if (uploadResponse.ok) {
            const { storageId } = await uploadResponse.json();
            console.log("Raw storageId from upload:", storageId);
            // Remove any suffixes like :1, :2 etc that Convex adds
            const cleanStorageId = storageId.split(':')[0];
            console.log("Cleaned storageId:", cleanStorageId);
            uploadedFileIds.push(cleanStorageId);
          } else {
            console.error("Upload failed with status:", uploadResponse.status);
          }
        }
        console.log("All files uploaded. Total fileIds:", uploadedFileIds.length);
      } catch (uploadError) {
        console.error("Failed to upload files:", uploadError);
        alert("Failed to upload files. Please try again.");
        setIsLoading(false);
        return;
      }
    }

    // Clear attachments after uploading
    setAttachments([]);
    setUploadedFileIds(uploadedFileIds);

    try {
      const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL || "";
      const baseUrl = convexUrl.replace("https://", "https://").replace(".convex.cloud", ".convex.site");
      const streamUrl = `${baseUrl}/chat/stream`;
      
      console.log("Streaming to:", streamUrl);
      console.log("Request payload:", {
        sessionId: currentSessionId,
        message: userMessage,
        includeThinking: thinkingMode,
        temperature,
        maxTokens,
      });

      const requestBody = {
        token,
        sessionId: currentSessionId,
        message: userMessage,
        includeThinking: thinkingMode,
        systemPrompt: systemPrompt || undefined,
        temperature,
        maxTokens,
        fileIds: uploadedFileIds.length > 0 ? uploadedFileIds : undefined,
      };
      console.log("Sending request with fileIds:", requestBody.fileIds);
      
      const response = await fetch(streamUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

      const reader = response.body?.getReader();
      if (!reader) throw new Error("No response body");

      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed || !trimmed.startsWith("data: ")) continue;

          try {
            const data = JSON.parse(trimmed.slice(6));

            switch (data.type) {
              case "thinking_start":
                setStreamingMessage(prev => prev ? { ...prev, isThinking: true } : null);
                break;
              case "thinking":
                setStreamingMessage(prev => prev ? { ...prev, thinking: prev.thinking + data.content } : null);
                break;
              case "thinking_end":
                setStreamingMessage(prev => prev ? { ...prev, isThinking: false } : null);
                break;
              case "response":
                setStreamingMessage(prev => prev ? { ...prev, content: prev.content + data.content } : null);
                break;
              case "complete":
                setStreamingMessage(null);
                break;
              case "error":
                throw new Error(data.error);
            }
          } catch (e) {
            console.error("Failed to parse SSE data:", e);
          }
        }
      }
    } catch (error: any) {
      console.error("Streaming error:", error);
      console.error("Error details:", {
        message: error.message,
        name: error.name,
        stack: error.stack,
      });
      alert(`Error sending message: ${error.message}\n\nCheck the console for more details.`);
      setMessage(userMessage);
      setStreamingMessage(null);
    } finally {
      setIsLoading(false);
    }
  };

  const copyMessage = (content: string, id: string) => {
    navigator.clipboard.writeText(content);
    setCopiedMessageId(id);
    setTimeout(() => setCopiedMessageId(null), 2000);
  };

  const handleRegenerate = (messageId: string) => {
    if (!currentChat?.messages || !currentSessionId || !token) return;
    
    // Find the message index
    const messageIndex = currentChat.messages.findIndex((m: any) => m._id === messageId);
    if (messageIndex === -1) return;
    
    // Find the last user message before this assistant message
    let lastUserMessage = null;
    for (let i = messageIndex - 1; i >= 0; i--) {
      if (currentChat.messages[i].role === 'user') {
        lastUserMessage = currentChat.messages[i];
        break;
      }
    }
    
    if (!lastUserMessage) {
      alert("Could not find the original user message to regenerate");
      return;
    }
    
    // Set the message and send
    setMessage(lastUserMessage.content);
    setTimeout(() => {
      handleSend();
    }, 100);
  };

  const exportChat = () => {
    if (!currentChat) return;
    const text = currentChat.messages.map((m: any) =>
      `${m.role === 'user' ? 'You' : 'AI'}: ${m.content}`
    ).join('\n\n');
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `chat-${currentChat.session.title}.txt`;
    a.click();
  };

  return (
    <div className="absolute inset-0 flex overflow-hidden bg-background">
      {/* Main Content Area - Full Height */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - Chat Sessions */}
        <div className={`flex-none border-r bg-card transition-all duration-300 ${
          leftSidebarCollapsed ? 'w-0 lg:w-12' : 'w-72 lg:w-80'
        } overflow-hidden`}>
          <div className="h-full flex flex-col">
            {!leftSidebarCollapsed && (
              <>
                <div className="flex-none p-4 border-b flex items-center justify-between">
                  <h2 className="font-semibold text-sm text-muted-foreground">YOUR CHATS</h2>
                  <Button 
                    size="sm" 
                    onClick={() => {
                      console.log("New chat button clicked!");
                      handleNewChat();
                    }}
                    disabled={isCreatingSession || !token}
                    title={!token ? "Please wait for authentication..." : ""}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex-1 overflow-y-auto">
                  {isCreatingSession && (
                    <div className="p-4 text-center text-sm text-muted-foreground">
                      Creating chat...
                    </div>
                  )}
                  {chatSessions === undefined ? (
                    <div className="p-4 text-center text-sm text-muted-foreground">
                      Loading chats...
                    </div>
                  ) : chatSessions && chatSessions.length > 0 ? (
                    chatSessions.map((session) => (
                      <button
                        key={session._id}
                        onClick={() => setCurrentSessionId(session._id)}
                        className={`w-full text-left px-4 py-3 hover:bg-muted border-b transition-colors ${
                          currentSessionId === session._id ? "bg-muted" : ""
                        }`}
                      >
                        <div className="flex items-start justify-between mb-1">
                          <span className="font-medium text-sm truncate flex-1">{session.title}</span>
                          {session.isFavorite && (
                            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400 flex-none ml-2" />
                          )}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {session.messageCount} msgs • {session.totalCreditsUsed} credits
                        </div>
                      </button>
                    ))
                  ) : (
                    !isCreatingSession && (
                      <div className="p-4 text-center text-sm text-muted-foreground">
                        No chats yet
                      </div>
                    )
                  )}
                </div>
              </>
            )}
            
            {/* Collapse Toggle */}
            <div className="flex-none border-t p-2">
              <Button
                variant="ghost"
                size="sm"
                className="w-full"
                onClick={() => setLeftSidebarCollapsed(!leftSidebarCollapsed)}
              >
                {leftSidebarCollapsed ? (
                  <ChevronRight className="h-4 w-4" />
                ) : (
                  <ChevronLeft className="h-4 w-4 mr-2" />
                )}
                {!leftSidebarCollapsed && <span className="text-xs">Collapse</span>}
              </Button>
            </div>
          </div>
        </div>

        {/* Center - Chat Area */}
        <div className="flex-1 flex flex-col overflow-hidden min-w-0">
          {/* Chat Title Header */}
          <div className="flex-none px-6 py-4 border-b bg-card/50 backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3 min-w-0">
                <MessageSquare className="h-5 w-5 text-primary flex-none" />
                <div className="min-w-0">
                  <h1 className="text-lg font-semibold truncate">
                    {currentChat?.session?.title || "AI Chat Assistant"}
                  </h1>
                  <p className="text-xs text-muted-foreground">
                    {currentChat?.session?.messageCount || 0} messages • {currentChat?.session?.totalCreditsUsed || 0} credits used
                  </p>
                </div>
              </div>
              
              {/* Font Size Controls */}
              <div className="flex items-center gap-1 bg-muted/50 px-2 py-1 rounded-lg">
                <Type className="h-4 w-4 text-muted-foreground" />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setFontSize(Math.max(-2, fontSize - 1))}
                  title="Decrease text size"
                  className="h-8 w-8 p-0"
                  disabled={fontSize === -2}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="text-xs font-mono text-muted-foreground min-w-[2rem] text-center">
                  {fontSize === -2 ? 'A₁' : fontSize === -1 ? 'A₂' : fontSize === 0 ? 'A₃' : fontSize === 1 ? 'A₄' : 'A₅'}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setFontSize(Math.min(2, fontSize + 1))}
                  title="Increase text size"
                  className="h-8 w-8 p-0"
                  disabled={fontSize === 2}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setRightSidebarCollapsed(!rightSidebarCollapsed)}
              >
                {rightSidebarCollapsed ? (
                  <ChevronLeft className="h-5 w-5" />
                ) : (
                  <ChevronRight className="h-5 w-5" />
                )}
              </Button>
            </div>
          </div>

          {/* Messages - Scrollable */}
          <div className="flex-1 overflow-y-auto px-4 py-6">
            <div className="max-w-4xl mx-auto space-y-6">
              {(() => {
                console.log("Rendering messages area - currentChat:", currentChat, "messages:", currentChat?.messages, "hasMessages:", currentChat?.messages && currentChat.messages.length > 0);
                return null;
              })()}
              {currentChat?.messages && currentChat.messages.length > 0 ? (
                currentChat.messages.map((msg: any, idx: number) => (
                  <MessageBubble
                    key={idx}
                    message={msg}
                    token={token}
                    onCopy={copyMessage}
                    onRate={(helpful) => rateMessageMutation({ token: token!, messageId: msg._id, helpful })}
                    copied={copiedMessageId === msg._id}
                    onRegenerate={msg.role === 'assistant' ? () => handleRegenerate(msg._id) : undefined}
                    fontSize={fontSize}
                  />
                ))
              ) : (
                <EmptyState 
                  onPromptSelect={(prompt) => {
                    setMessage(prompt);
                    setTimeout(() => inputRef.current?.focus(), 0);
                  }}
                  onCreateChat={handleNewChat}
                  isCreatingChat={isCreatingSession}
                />
              )}

              {/* Streaming Message */}
              {streamingMessage && (
                <StreamingMessageBubble message={streamingMessage} fontSize={fontSize} />
              )}

              {isLoading && !streamingMessage && (
                <div className="flex justify-start">
                  <div className="bg-muted rounded-2xl px-6 py-4">
                    <div className="flex space-x-2">
                      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" />
                      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "0.1s" }} />
                      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "0.2s" }} />
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Input Area - Fixed at Bottom */}
          <div className="flex-none border-t bg-card">
            <div className="max-w-4xl mx-auto px-4 py-4 space-y-2">
              {/* File Attachments Preview */}
              {attachments.length > 0 && (
                <div className="flex flex-wrap gap-2 px-2">
                  {attachments.map((file, idx) => (
                    <div key={idx} className="relative flex items-center gap-2 bg-muted px-3 py-2 rounded-lg text-sm">
                      {file.type.startsWith('image/') ? (
                        <div className="flex items-center gap-2">
                          <img src={URL.createObjectURL(file)} alt="Preview" className="w-8 h-8 object-cover rounded" />
                          <span className="max-w-xs truncate">{file.name}</span>
                        </div>
                      ) : (
                        <span className="max-w-xs truncate">{file.name}</span>
                      )}
                      <button
                        onClick={() => setAttachments(attachments.filter((_, i) => i !== idx))}
                        className="ml-2 hover:text-red-600"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              
              <div className="flex items-end space-x-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => document.getElementById('file-input')?.click()}
                  disabled={isLoading}
                  title="Attach files"
                >
                  <Paperclip className="h-5 w-5" />
                </Button>
                <input
                  id="file-input"
                  type="file"
                  multiple
                  className="hidden"
                  accept="image/*,.pdf,.doc,.docx,.txt"
                  onChange={(e) => {
                    const files = Array.from(e.target.files || []);
                    setAttachments([...attachments, ...files]);
                  }}
                />
                <div className="flex-1">
                  <Input
                    ref={inputRef}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSend();
                      }
                    }}
                    placeholder="Type your message... (Press Enter to send, Shift+Enter for new line)"
                    disabled={isLoading}
                    className={`${fontSize === -2 ? 'text-[11px]' : fontSize === -1 ? 'text-xs' : fontSize === 0 ? 'text-sm' : fontSize === 1 ? 'text-base' : 'text-lg'} py-6`}
                  />
                </div>
                <Button
                  onClick={handleSend}
                  disabled={isLoading || (!message.trim() && attachments.length === 0) || isCreatingSession}
                  size="lg"
                  className="px-8"
                >
                  <Send className="h-5 w-5" />
                </Button>
              </div>
              <div className="flex items-center justify-between mt-2 px-1">
                <p className="text-xs text-muted-foreground">
                  {thinkingMode ? "3 credits" : "2 credits"} per message {attachments.length > 0 && `(+${attachments.length} attachment${attachments.length > 1 ? 's' : ''})`}
                </p>
                <p className="text-xs text-muted-foreground">
                  Press <kbd className="px-1 py-0.5 text-xs border rounded">⌘</kbd> + <kbd className="px-1 py-0.5 text-xs border rounded">K</kbd> for shortcuts
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Sidebar - Settings & Advanced Options */}
        <div className={`flex-none border-l bg-card transition-all duration-300 ${
          rightSidebarCollapsed ? 'w-0 lg:w-0' : 'w-80 lg:w-96'
        } overflow-hidden`}>
          {!rightSidebarCollapsed && (
            <div className="h-full flex flex-col overflow-y-auto">
              {/* Settings Header */}
              <div className="flex-none p-4 border-b">
                <div className="flex items-center justify-between mb-1">
                  <h2 className="font-semibold text-sm text-muted-foreground flex items-center space-x-2">
                    <Settings className="h-4 w-4" />
                    <span>SETTINGS</span>
                  </h2>
                </div>
              </div>

              {/* Settings Content */}
              <div className="flex-1 p-4 space-y-6 overflow-y-auto">
                {/* AI Model Settings */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-sm">AI Behavior</h3>
                  
                  {/* Thinking Mode */}
                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Brain className={`h-5 w-5 ${thinkingMode ? "text-purple-500" : "text-muted-foreground"}`} />
                      <div>
                        <Label htmlFor="thinking-mode" className="font-medium cursor-pointer">
                          Thinking Mode
                        </Label>
                        <p className="text-xs text-muted-foreground">
                          Show AI reasoning process (3 credits)
                        </p>
                      </div>
                    </div>
                    <Switch
                      id="thinking-mode"
                      checked={thinkingMode}
                      onCheckedChange={setThinkingMode}
                    />
                  </div>

                  {/* Temperature Slider */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm">Temperature</Label>
                      <span className="text-xs text-muted-foreground">{temperature}</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={temperature}
                      onChange={(e) => setTemperature(parseFloat(e.target.value))}
                      className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer"
                    />
                    <p className="text-xs text-muted-foreground">
                      Higher = more creative, Lower = more focused
                    </p>
                  </div>

                  {/* Max Tokens */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm">Max Response Length</Label>
                      <span className="text-xs text-muted-foreground">{maxTokens}</span>
                    </div>
                    <input
                      type="range"
                      min="100"
                      max="2000"
                      step="100"
                      value={maxTokens}
                      onChange={(e) => setMaxTokens(parseInt(e.target.value))}
                      className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer"
                    />
                    <p className="text-xs text-muted-foreground">
                      Maximum tokens in AI response
                    </p>
                  </div>
                </div>

                {/* System Prompt */}
                <div className="space-y-2">
                  <Label className="text-sm font-semibold">Custom Instructions</Label>
                  <textarea
                    value={systemPrompt}
                    onChange={(e) => setSystemPrompt(e.target.value)}
                    placeholder="Optional: Add custom instructions for the AI (e.g., 'Always respond in Spanish', 'Use simple language', etc.)"
                    className="w-full h-24 p-3 text-sm border rounded-lg bg-background resize-none"
                  />
                  <p className="text-xs text-muted-foreground">
                    These instructions apply to all messages in this chat
                  </p>
                </div>

                {/* Actions */}
                <div className="space-y-2">
                  <h3 className="font-semibold text-sm">Actions</h3>
                  
                  <Button 
                    variant="outline" 
                    className="w-full justify-start" 
                    size="sm"
                    onClick={exportChat}
                    disabled={!currentChat?.messages.length}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Export Chat
                  </Button>

                  <Link href="/tools/chat/analytics" className="block">
                    <Button variant="outline" className="w-full justify-start" size="sm">
                      <BarChart3 className="h-4 w-4 mr-2" />
                      View Analytics
                    </Button>
                  </Link>

                  <Button
                    variant="outline"
                    className="w-full justify-start text-yellow-600 hover:text-yellow-700"
                    size="sm"
                    onClick={() => {
                      if (currentSessionId && token) {
                        toggleFavorite({
                          token,
                          sessionId: currentSessionId as any,
                          favorite: !currentChat?.session?.isFavorite,
                        });
                      }
                    }}
                  >
                    <Star className={`h-4 w-4 mr-2 ${currentChat?.session?.isFavorite ? "fill-yellow-400" : ""}`} />
                    {currentChat?.session?.isFavorite ? "Unfavorite" : "Favorite"} Chat
                  </Button>

                  <Button
                    variant="outline"
                    className="w-full justify-start text-red-600 hover:text-red-700"
                    size="sm"
                    onClick={async () => {
                      if (currentSessionId && token && confirm("Delete this chat?")) {
                        const deletedSessionId = currentSessionId;
                        await deleteSessionMutation({ token, sessionId: currentSessionId as any });
                        
                        // Reset the auto-create flag if this was the last session
                        const otherSessions = chatSessions?.filter(s => s._id !== deletedSessionId);
                        if (!otherSessions || otherSessions.length === 0) {
                          hasAttemptedAutoCreate.current = false;
                        }
                        
                        // Set to null - the useEffect will handle selecting another session or creating a new one
                        setCurrentSessionId(null);
                      }
                    }}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Chat
                  </Button>
                </div>

                {/* Session Info */}
                {currentChat?.session && (
                  <div className="space-y-2 p-3 bg-muted/30 rounded-lg">
                    <h3 className="font-semibold text-sm">Session Info</h3>
                    <div className="space-y-1 text-xs text-muted-foreground">
                      <div className="flex justify-between">
                        <span>Messages:</span>
                        <span className="font-medium">{currentChat.session.messageCount}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Credits Used:</span>
                        <span className="font-medium">{currentChat.session.totalCreditsUsed}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Created:</span>
                        <span className="font-medium">
                          {new Date(currentChat.session.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Last Updated:</span>
                        <span className="font-medium">
                          {new Date(currentChat.session.updatedAt).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Model Info */}
                <div className="space-y-2 p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
                  <h3 className="font-semibold text-sm text-blue-900 dark:text-blue-100">Model Info</h3>
                  <div className="space-y-1 text-xs text-blue-700 dark:text-blue-300">
                    <div className="flex justify-between">
                      <span>Model:</span>
                      <span className="font-medium">Gemini 2.5 Flash</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Cost:</span>
                      <span className="font-medium">{thinkingMode ? "3" : "2"} credits/msg</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Streaming:</span>
                      <span className="font-medium text-green-600">Enabled ✓</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Command Palette */}
      {commandPaletteOpen && (
        <CommandPalette
          onClose={() => setCommandPaletteOpen(false)}
          onNewChat={handleNewChat}
          onExport={exportChat}
          onFocusInput={() => {
            inputRef.current?.focus();
            setCommandPaletteOpen(false);
          }}
          token={token}
        />
      )}
    </div>
  );
}

// Command Palette Component
function CommandPalette({ onClose, onNewChat, onExport, onFocusInput, token }: {
  onClose: () => void;
  onNewChat: () => void;
  onExport: () => void;
  onFocusInput: () => void;
  token: string | null;
}) {
  const [search, setSearch] = useState("");

  const commands = [
    { id: 'new-chat', label: 'New Chat', shortcut: 'N', action: onNewChat, icon: Plus },
    { id: 'export', label: 'Export Chat', shortcut: 'E', action: onExport, icon: Download },
    { id: 'focus', label: 'Focus Input', shortcut: 'I', action: onFocusInput, icon: MessageSquare },
  ];

  const filteredCommands = commands.filter(cmd =>
    cmd.label.toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
      // Execute selected command with Enter
      if (e.key === 'Enter' && filteredCommands.length > 0) {
        filteredCommands[0].action();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, filteredCommands]);

  const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
  const metaKey = isMac ? '⌘' : 'Ctrl';

  return (
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-start justify-center pt-[20vh]"
      onClick={onClose}
    >
      <div 
        className="bg-card border rounded-lg shadow-xl w-full max-w-2xl max-h-[70vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center px-4 py-3 border-b">
          <Search className="h-5 w-5 text-muted-foreground mr-2" /> 
          <input
            autoFocus
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search commands or type to filter..."
            className="flex-1 outline-none bg-transparent text-lg"
          />
        </div>

        {/* Commands List */}
        <div className="flex-1 overflow-y-auto p-2">
          {filteredCommands.length > 0 ? (
            filteredCommands.map((cmd) => {
              const Icon = cmd.icon;
              return (
                <button
                  key={cmd.id}
                  onClick={() => {
                    cmd.action();
                    onClose();
                  }}
                  className="w-full flex items-center justify-between px-4 py-3 rounded-lg hover:bg-muted transition-colors text-left group"
                >
                  <div className="flex items-center space-x-3">
                    <Icon className="h-5 w-5 text-muted-foreground" />
                    <span>{cmd.label}</span>
                  </div>
                  <kbd className="hidden group-hover:inline-flex items-center space-x-1 bg-muted px-2 py-1 rounded text-xs">
                    <span>{metaKey}</span>
                    <span>+</span>
                    <span>{cmd.shortcut}</span>
                  </kbd>
                </button>
              );
            })
          ) : (
            <div className="px-4 py-8 text-center text-muted-foreground">
              No commands found
            </div>
          )}
        </div>

        {/* Footer Hint */}
        <div className="px-4 py-2 border-t text-xs text-muted-foreground flex items-center justify-between">
          <span>Press <kbd className="px-1 py-0.5 border rounded">Esc</kbd> to close</span>
          <span>Press <kbd className="px-1 py-0.5 border rounded">Enter</kbd> to execute</span>
        </div>
      </div>
    </div>
  );
}

// Message with Images Component - fetches URLs from Convex
function MessageWithImages({ fileIds, token }: { fileIds: any[]; token: string | null }) {
  const imageUrls = useQuery(
    api.files.getFileUrls,
    token && fileIds && fileIds.length > 0 ? { token, storageIds: fileIds } : "skip"
  );

  if (!imageUrls || imageUrls.length === 0) return null;

  return (
    <div className="mb-3 flex flex-wrap gap-2">
      {imageUrls
        .filter((url): url is string => url !== null)
        .map((imageUrl: string, idx: number) => (
          <img
            key={idx}
            src={imageUrl}
            alt="Attached file"
            className="max-w-xs max-h-64 rounded-lg object-cover border border-border"
            onError={(e) => {
              console.error("Image failed to load:", imageUrl);
              e.currentTarget.style.display = 'none';
            }}
            onLoad={() => {
              console.log("Image loaded successfully:", imageUrl);
            }}
          />
        ))}
    </div>
  );
}

// Message Bubble Component
function MessageBubble({ message, token, onCopy, onRate, copied, onRegenerate, fontSize }: {
  message: any;
  token: string | null;
  onCopy: (content: string, id: string) => void;
  onRate: (helpful: boolean) => void;
  copied: boolean;
  onRegenerate?: () => void;
  fontSize: number;
}) {
  const [showActions, setShowActions] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Debug: Log message data including fileIds
  console.log("MessageBubble render - message:", message, "fileIds:", message.fileIds);

  const copyCode = (code: string, lang: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(lang);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  // Build image URL from Convex storage ID
  // Note: We now fetch URLs server-side, but this fallback is kept for compatibility
  const getImageUrl = (storageId: string) => {
    if (!storageId) return '';
    return storageId; // The storageId will be converted to a proper URL via getFileUrls
  };

  // Get font size classes based on fontSize state (5 sizes)
  const getFontSizeClass = () => {
    switch (fontSize) {
      case -2: return 'prose-[11px]'; // Smallest
      case -1: return 'prose-xs'; // Small
      case 0: return 'prose-sm'; // Normal
      case 1: return 'prose'; // Large
      case 2: return 'prose-lg'; // Largest
      default: return 'prose-sm';
    }
  };

  const getTextSizeClass = () => {
    switch (fontSize) {
      case -2: return 'text-[11px]';
      case -1: return 'text-xs';
      case 0: return 'text-sm';
      case 1: return 'text-base';
      case 2: return 'text-lg';
      default: return 'text-sm';
    }
  };

  const getInputSizeClass = () => {
    switch (fontSize) {
      case -2: return 'text-[11px]';
      case -1: return 'text-xs';
      case 0: return 'text-sm';
      case 1: return 'text-base';
      case 2: return 'text-lg';
      default: return 'text-sm';
    }
  };

  // Get size classes for use in JSX
  const textSizeClass = getTextSizeClass();
  const fontSizeClass = getFontSizeClass();

  return (
    <div
      className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      <div className={`max-w-[85%] group relative`}>
        <div
          className={`rounded-2xl px-6 py-4 ${
            message.role === "user"
              ? "bg-primary text-primary-foreground"
              : "bg-muted"
          }`}
        >
          {/* Display attached images */}
          {message.fileIds && message.fileIds.length > 0 && (
            <MessageWithImages fileIds={message.fileIds} token={token} />
          )}
          
          {message.role === "assistant" ? (
            <div className={'prose dark:prose-invert max-w-none ' + textSizeClass}>
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  code({ node, inline, className, children, ...props }: any) {
                    const match = /language-(\w+)/.exec(className || '');
                    const lang = match ? match[1] : '';
                    const codeString = String(children).replace(/\n$/, '');
                    
                    if (!inline && match) {
                      return (
                        <div className="relative group/code my-4">
                          <div className="flex items-center justify-between bg-gray-800 px-4 py-2 rounded-t-lg">
                            <span className="text-xs font-mono text-gray-300 uppercase">{lang}</span>
                            <button
                              onClick={() => copyCode(codeString, lang)}
                              className="text-xs text-gray-300 hover:text-white flex items-center space-x-1 transition-colors"
                            >
                              {copiedCode === lang ? (
                                <>
                                  <span>✓</span>
                                  <span>Copied!</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="h-3 w-3" />
                                  <span>Copy</span>
                                </>
                              )}
                            </button>
                          </div>
                          <CodeHighlight code={codeString} language={lang || 'text'} />
                        </div>
                      );
                    }
                    
                    return (
                      <code className="bg-gray-100 dark:bg-gray-800 text-pink-600 dark:text-pink-400 px-1.5 py-0.5 rounded text-sm font-mono" {...props}>
                        {children}
                      </code>
                    );
                  },
                  h1: ({ children }) => {
                    const h1Class = 'font-bold mt-6 mb-4 pb-2 border-b ' + textSizeClass;
                    return <h1 className={h1Class}>{children}</h1>;
                  },
                  h2: ({ children }) => {
                    const h2Class = 'font-semibold mt-5 mb-3 ' + textSizeClass;
                    return <h2 className={h2Class}>{children}</h2>;
                  },
                  h3: ({ children }) => {
                    const h3Class = 'font-semibold mt-4 mb-2 ' + textSizeClass;
                    return <h3 className={h3Class}>{children}</h3>;
                  },
                  p: ({ children }) => {
                    const fullClassName = 'mb-4 leading-6 ' + textSizeClass;
                    return <p className={fullClassName}>{children}</p>;
                  },
                  ul: ({ children }) => {
                    const ulClass = 'my-3 ml-6 list-disc space-y-1.5 ' + textSizeClass;
                    return <ul className={ulClass}>{children}</ul>;
                  },
                  ol: ({ children }) => {
                    const olClass = 'my-3 ml-6 list-decimal space-y-1.5 ' + textSizeClass;
                    return <ol className={olClass}>{children}</ol>;
                  },
                  li: ({ children }) => {
                    const liClass = 'leading-7 ' + textSizeClass;
                    return <li className={liClass}>{children}</li>;
                  },
                  blockquote: ({ children }) => {
                    const blockquoteClass = 'border-l-4 border-primary pl-4 py-2 my-4 italic bg-muted/30 rounded-r ' + textSizeClass;
                    return <blockquote className={blockquoteClass}>{children}</blockquote>;
                  },
                  a: ({ href, children }) => {
                    const aClass = 'text-primary hover:underline font-medium ' + textSizeClass;
                    return <a href={href} className={aClass} target="_blank" rel="noopener noreferrer">
                      {children}
                    </a>;
                  },
                  table: ({ children }) => (
                    <div className="my-4 overflow-x-auto">
                      <table className="min-w-full border-collapse border">{children}</table>
                    </div>
                  ),
                }}
              >
                {message.content}
              </ReactMarkdown>
            </div>
          ) : (
            <p className={'whitespace-pre-wrap leading-6 ' + textSizeClass}>{message.content}</p>
          )}

          {message.thinking && (
            <div className="mt-3 pt-3 border-t border-purple-200/40 dark:border-purple-800/40 bg-purple-50/20 dark:bg-purple-950/20 -mx-6 -mb-4 px-6 py-3 rounded-b-2xl">
              <div className="flex items-center space-x-1.5 mb-2">
                <Brain className="h-3 w-3 text-purple-500 dark:text-purple-400 opacity-60" />
                <span className="text-[10px] font-medium text-purple-600/70 dark:text-purple-400/70 uppercase tracking-wider">Reasoning</span>
              </div>
              <div className="text-xs leading-relaxed text-purple-600/80 dark:text-purple-400/80 space-y-1 italic">
                <ReactMarkdown 
                  remarkPlugins={[remarkGfm]}
                  components={{
                    p: ({ children }) => <p className="mb-1">{children}</p>,
                    ul: ({ children }) => <ul className="list-disc ml-4 space-y-0.5">{children}</ul>,
                    ol: ({ children }) => <ol className="list-decimal ml-4 space-y-0.5">{children}</ol>,
                    li: ({ children }) => <li className="text-xs">{children}</li>,
                    strong: ({ children }) => <strong className="font-semibold text-purple-700 dark:text-purple-300">{children}</strong>,
                    code: ({ children }) => <code className="bg-purple-100 dark:bg-purple-900/50 px-1 py-0.5 rounded text-[10px] not-italic">{children}</code>,
                    em: ({ children }) => <em>{children}</em>,
                  }}
                >
                  {message.thinking}
                </ReactMarkdown>
              </div>
            </div>
          )}
        </div>

        {/* Message Actions */}
        {showActions && message.role === "assistant" && (
          <div className="absolute top-2 right-2 flex space-x-1 bg-background/90 backdrop-blur-sm rounded-lg p-1 shadow-lg">
            {onRegenerate && (
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={onRegenerate}
                title="Regenerate response"
              >
                <RefreshCw className="h-3 w-3" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => onCopy(message.content, message._id)}
            >
              {copied ? <span className="text-xs">✓</span> : <Copy className="h-3 w-3" />}
            </Button>
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onRate(true)}>
              <ThumbsUp className={'h-3 w-3' + (message.wasHelpful === true ? ' fill-current text-green-600' : '')} />
            </Button>
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onRate(false)}>
              <ThumbsDown className={'h-3 w-3' + (message.wasHelpful === false ? ' fill-current text-red-600' : '')} />
            </Button>
          </div>
        )}

        {/* Message Metadata */}
        {message.role === "assistant" && message.responseTime && (
          <div className="mt-2 flex items-center space-x-2 text-xs text-muted-foreground">
            <span className="flex items-center space-x-1">
              <Clock className="h-3 w-3" />
              <span>{message.responseTime}ms</span>
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

// Streaming Message Component
function StreamingMessageBubble({ message, fontSize }: { message: any; fontSize: number }) {
  // Get size classes for use in JSX
  const getFontSizeClass = () => {
    switch (fontSize) {
      case -2: return 'prose-[11px]';
      case -1: return 'prose-xs';
      case 0: return 'prose-sm';
      case 1: return 'prose';
      case 2: return 'prose-lg';
      default: return 'prose-sm';
    }
  };

  const getTextSizeClass = () => {
    switch (fontSize) {
      case -2: return 'text-[11px]';
      case -1: return 'text-xs';
      case 0: return 'text-sm';
      case 1: return 'text-base';
      case 2: return 'text-lg';
      default: return 'text-sm';
    }
  };

  const fontSizeClass = getFontSizeClass();
  const textSizeClass = getTextSizeClass();
  return (
    <div className="flex justify-start">
      <div className="max-w-[85%] rounded-2xl px-6 py-4 bg-muted">
        {message.thinking && (
          <div className="mb-3 pb-3 border-b border-purple-200/40 dark:border-purple-800/40 bg-purple-50/20 dark:bg-purple-950/20 -mx-6 -mt-4 px-6 py-3 rounded-t-2xl">
            <div className="flex items-center space-x-1.5 mb-2">
              <Brain className="h-3 w-3 text-purple-500 dark:text-purple-400 opacity-60 animate-pulse" />
              <span className="text-[10px] font-medium text-purple-600/70 dark:text-purple-400/70 uppercase tracking-wider">
                {message.isThinking ? "Reasoning..." : "Reasoning"}
              </span>
            </div>
            <div className="text-xs leading-relaxed text-purple-600/80 dark:text-purple-400/80 space-y-1 italic">
              <ReactMarkdown 
                remarkPlugins={[remarkGfm]}
                components={{
                  p: ({ children }) => <p className="mb-1">{children}</p>,
                  ul: ({ children }) => <ul className="list-disc ml-4 space-y-0.5">{children}</ul>,
                  ol: ({ children }) => <ol className="list-decimal ml-4 space-y-0.5">{children}</ol>,
                  li: ({ children }) => <li className="text-xs">{children}</li>,
                  strong: ({ children }) => <strong className="font-semibold text-purple-700 dark:text-purple-300">{children}</strong>,
                  code: ({ children }) => <code className="bg-purple-100 dark:bg-purple-900/50 px-1 py-0.5 rounded text-[10px] not-italic">{children}</code>,
                  em: ({ children }) => <em>{children}</em>,
                }}
              >
                {message.thinking}
              </ReactMarkdown>
              {message.isThinking && <span className="inline-block w-0.5 h-3 bg-purple-500 dark:bg-purple-400 ml-0.5 animate-pulse" />}
            </div>
          </div>
        )}
        <div className={'prose ' + fontSizeClass + ' dark:prose-invert max-w-none prose-p:leading-7 prose-p:mb-4 prose-headings:font-semibold prose-headings:tracking-tight prose-h1:text-2xl prose-h2:text-xl prose-h3:text-lg prose-strong:font-semibold prose-strong:text-foreground prose-code:text-sm prose-code:bg-gray-100 dark:prose-code:bg-gray-800 prose-code:text-pink-600 dark:prose-code:text-pink-400 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:font-mono prose-pre:bg-gray-900 prose-pre:p-4 prose-pre:rounded-lg prose-pre:my-4 prose-ul:my-3 prose-ul:ml-6 prose-ul:list-disc prose-ul:space-y-1.5 prose-ol:my-3 prose-ol:ml-6 prose-ol:list-decimal prose-ol:space-y-1.5 prose-li:leading-7 prose-blockquote:border-l-4 prose-blockquote:border-primary prose-blockquote:pl-4 prose-blockquote:py-2 prose-blockquote:my-4 prose-blockquote:italic prose-blockquote:bg-muted/30 prose-blockquote:rounded-r prose-a:text-primary prose-a:hover:underline prose-a:font-medium prose-table:my-4 prose-table:border prose-th:border prose-th:bg-muted prose-th:p-2 prose-td:border prose-td:p-2'}>
          <ReactMarkdown 
            remarkPlugins={[remarkGfm]}
            components={{
              code({ node, inline, className, children, ...props }: any) {
                const match = /language-(\w+)/.exec(className || '');
                const codeString = String(children).replace(/\n$/, '');
                
                return !inline && match ? (
                  <pre className="bg-gray-900 p-4 rounded-lg overflow-x-auto my-4">
                    <code className="text-sm text-gray-100 font-mono">
                      {codeString}
                    </code>
                  </pre>
                ) : (
                  <code className="bg-gray-100 dark:bg-gray-800 text-pink-600 dark:text-pink-400 px-1.5 py-0.5 rounded text-sm font-mono">
                    {children}
                  </code>
                );
              },
            }}
          >
            {message.content}
          </ReactMarkdown>
          <span className="inline-block w-0.5 h-5 bg-foreground ml-1 animate-pulse" />
        </div>
      </div>
    </div>
  );
}

// Empty State Component
function EmptyState({ onPromptSelect, onCreateChat, isCreatingChat }: { 
  onPromptSelect: (prompt: string) => void;
  onCreateChat: () => void;
  isCreatingChat: boolean;
}) {
  console.log("EmptyState render - isCreatingChat:", isCreatingChat);
  
  return (
    <div className="flex items-center justify-center h-full">
      <div className="text-center max-w-md">
        <Sparkles className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
        <h2 className="text-2xl font-bold mb-2">Start a Conversation</h2>
        <p className="text-muted-foreground mb-6">
          Ask me anything! I can help with coding, writing, analysis, advice, and more.
        </p>
        
        <Button
          onClick={() => {
            console.log("EmptyState Create New Chat button clicked! isCreatingChat:", isCreatingChat);
            if (!isCreatingChat) {
              onCreateChat();
            } else {
              console.log("Button is disabled, not creating chat");
            }
          }}
          disabled={isCreatingChat}
          className="w-full mb-4"
          size="lg"
        >
          {isCreatingChat ? "Creating chat..." : "Create New Chat"}
        </Button>
        
        <div className="grid grid-cols-2 gap-2 mt-4">
          {[
            "Explain quantum computing",
            "Write a Python function",
            "Plan a marketing strategy",
            "Debug my code",
          ].map((prompt, i) => (
            <Button
              key={i}
              variant="outline"
              size="sm"
              className="text-xs"
              onClick={() => onPromptSelect(prompt)}
            >
              {prompt}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}
