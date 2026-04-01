import { useState, useEffect, useRef } from "react";
import { Card, CardContent } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import { Send, Loader, AlertCircle, MessageCircle, Bot } from "lucide-react";
import { messagesAPI } from "../../services/api";
import { useCitizenRouteGuard } from "../../hooks/useCitizenRouteGuard";

interface Conversation {
  id: number;
  name: string;
  specialization?: string;
  last_message?: string;
  last_message_at?: string;
}

interface DirectMessage {
  id: number;
  sender_id: number;
  receiver_id: number;
  message: string;
  is_read: boolean;
  created_at: string;
}

interface ChatMessage {
  id: number;
  user_id: number;
  message: string;
  response: string;
  created_at: string;
}

export function Messages() {
  // Protect route - only citizens can access
  const isAuthorized = useCitizenRouteGuard();

  // Conversations State
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [conversationsLoading, setConversationsLoading] = useState(true);
  const [conversationsError, setConversationsError] = useState<string | null>(null);

  // Direct Messages State
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [directMessages, setDirectMessages] = useState<DirectMessage[]>([]);
  const [newDirectMessage, setNewDirectMessage] = useState("");
  const [directMessagesLoading, setDirectMessagesLoading] = useState(false);
  const [directMessagesError, setDirectMessagesError] = useState<string | null>(null);

  // AI Chat State
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [newChatMessage, setNewChatMessage] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [chatError, setChatError] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load conversations and chat history on mount
  useEffect(() => {
    loadConversations();
    loadChatHistory();
  }, []);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages, directMessages]);

  const loadConversations = async () => {
    setConversationsLoading(true);
    setConversationsError(null);
    try {
      const data = (await messagesAPI.getConversations()) as Conversation[];
      setConversations(Array.isArray(data) ? data : []);
      // Auto-select first conversation
      if (Array.isArray(data) && data.length > 0) {
        const firstConv = data[0];
        setSelectedUserId(firstConv.id);
        setSelectedConversation(firstConv);
        await loadDirectMessages(firstConv.id);
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Failed to load conversations";
      setConversationsError(errorMsg);
      console.error("Error loading conversations:", err);
    } finally {
      setConversationsLoading(false);
    }
  };

  const loadDirectMessages = async (userId: number) => {
    setDirectMessagesLoading(true);
    setDirectMessagesError(null);
    try {
      const data = (await messagesAPI.getMessages(userId, 0, 50)) as DirectMessage[];
      setDirectMessages(Array.isArray(data) ? data : []);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Failed to load messages";
      setDirectMessagesError(errorMsg);
      console.error("Error loading messages:", err);
    } finally {
      setDirectMessagesLoading(false);
    }
  };

  const handleSelectConversation = async (conversation: Conversation) => {
    setSelectedUserId(conversation.id);
    setSelectedConversation(conversation);
    await loadDirectMessages(conversation.id);
  };

  const sendDirectMessage = async () => {
    if (!newDirectMessage.trim() || !selectedUserId) return;

    try {
      const message = newDirectMessage.trim();
      setNewDirectMessage("");

      // Send message
      await messagesAPI.sendMessage(selectedUserId, message);

      // Reload messages and conversations
      await loadDirectMessages(selectedUserId);
      await loadConversations();
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Failed to send message";
      setDirectMessagesError(errorMsg);
      console.error("Error sending message:", err);
      setNewDirectMessage(newDirectMessage); // Restore text on error
    }
  };

  const loadChatHistory = async () => {
    setChatLoading(true);
    setChatError(null);
    try {
      const data = (await messagesAPI.getChatHistory(0, 50)) as ChatMessage[];
      setChatMessages(Array.isArray(data) ? data : []);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Failed to load chat history";
      setChatError(errorMsg);
      console.error("Error loading chat history:", err);
    } finally {
      setChatLoading(false);
    }
  };

  const sendChatMessage = async () => {
    if (!newChatMessage.trim()) return;

    const userMessage = newChatMessage.trim();
    setNewChatMessage("");

    try {
      setChatLoading(true);
      const response = (await messagesAPI.createChatMessage(userMessage, "en")) as ChatMessage;
      setChatMessages([...chatMessages, response]);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Failed to send message";
      setChatError(errorMsg);
      console.error("Error sending chat message:", err);
      setNewChatMessage(userMessage); // Restore text on error
    } finally {
      setChatLoading(false);
    }
  };

  const getCurrentUserId = () => {
    const token = localStorage.getItem("authToken");
    if (!token) return null;
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      return payload.sub;
    } catch {
      return null;
    }
  };

  const currentUserId = getCurrentUserId();

  // Return null while checking authorization
  if (!isAuthorized) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-semibold text-gray-900">Messages</h2>
        <p className="text-gray-600 mt-1">Communicate with your lawyers</p>
      </div>

      <Tabs defaultValue="direct" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="direct" className="flex items-center gap-2">
            <MessageCircle className="w-4 h-4" />
            Direct Messages
          </TabsTrigger>
          <TabsTrigger value="chat" className="flex items-center gap-2">
            <Bot className="w-4 h-4" />
            AI Chat
          </TabsTrigger>
        </TabsList>

        {/* Direct Messages Tab */}
        <TabsContent value="direct" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 min-h-96">
            {/* Conversation List */}
            <Card className="lg:col-span-1">
              <CardContent className="p-4">
                <h3 className="font-semibold text-gray-900 mb-4">Conversations</h3>

                {conversationsLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader className="w-5 h-5 text-blue-600 animate-spin" />
                  </div>
                ) : conversationsError ? (
                  <div className="text-xs text-red-600 bg-red-50 p-2 rounded">
                    {conversationsError}
                  </div>
                ) : conversations.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-sm text-gray-500">No conversations yet</p>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {conversations.map((conv) => (
                      <button
                        key={conv.id}
                        onClick={() => handleSelectConversation(conv)}
                        className={`w-full p-3 rounded-lg border text-left transition-colors ${
                          selectedUserId === conv.id
                            ? "bg-blue-50 border-blue-200"
                            : "border-gray-200 hover:bg-gray-50"
                        }`}
                      >
                        <p className="text-sm font-medium text-gray-900">{conv.name}</p>
                        {conv.specialization && (
                          <p className="text-xs text-gray-600 mt-1">{conv.specialization}</p>
                        )}
                        {conv.last_message && (
                          <p className="text-xs text-gray-500 mt-2 truncate">{conv.last_message}</p>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Messages Thread */}
            <Card className="lg:col-span-2">
              <CardContent className="p-4 h-96 flex flex-col">
                {selectedUserId ? (
                  <>
                    {selectedConversation && (
                      <div className="mb-4 pb-4 border-b">
                        <p className="font-semibold text-gray-900">{selectedConversation.name}</p>
                        {selectedConversation.specialization && (
                          <p className="text-sm text-gray-600">{selectedConversation.specialization}</p>
                        )}
                      </div>
                    )}

                    {/* Messages Display */}
                    <div className="flex-1 overflow-y-auto mb-4 space-y-3">
                      {directMessagesError && (
                        <div className="bg-red-50 border border-red-200 rounded p-3 text-sm text-red-700">
                          {directMessagesError}
                        </div>
                      )}

                      {directMessagesLoading ? (
                        <div className="flex items-center justify-center h-full">
                          <Loader className="w-6 h-6 text-blue-600 animate-spin" />
                        </div>
                      ) : directMessages.length === 0 ? (
                        <div className="flex items-center justify-center h-full text-gray-500">
                          <p>No messages yet. Start a conversation!</p>
                        </div>
                      ) : (
                        directMessages.map((msg) => (
                          <div
                            key={msg.id}
                            className={`flex ${
                              msg.sender_id === currentUserId ? "justify-end" : "justify-start"
                            }`}
                          >
                            <div
                              className={`max-w-xs px-4 py-2 rounded-lg ${
                                msg.sender_id === currentUserId
                                  ? "bg-blue-600 text-white"
                                  : "bg-gray-100 text-gray-900"
                              }`}
                            >
                              <p className="text-sm">{msg.message}</p>
                              <p
                                className={`text-xs mt-1 ${
                                  msg.sender_id === currentUserId
                                    ? "text-blue-100"
                                    : "text-gray-500"
                                }`}
                              >
                                {new Date(msg.created_at).toLocaleTimeString("en-IN")}
                              </p>
                            </div>
                          </div>
                        ))
                      )}
                      <div ref={messagesEndRef} />
                    </div>

                    {/* Message Input */}
                    <div className="flex gap-2">
                      <Input
                        placeholder="Type a message..."
                        value={newDirectMessage}
                        onChange={(e) => setNewDirectMessage(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault();
                            sendDirectMessage();
                          }
                        }}
                        className="flex-1"
                      />
                      <Button
                        onClick={sendDirectMessage}
                        disabled={!newDirectMessage.trim() || directMessagesLoading}
                        size="sm"
                      >
                        <Send className="w-4 h-4" />
                      </Button>
                    </div>
                  </>
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-500">
                    <p>Select a conversation to start messaging</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* AI Chat Tab */}
        <TabsContent value="chat" className="space-y-4">
          <Card className="min-h-96">
            <CardContent className="p-4 h-96 flex flex-col">
              {chatError && (
                <div className="bg-red-50 border border-red-200 rounded p-3 text-sm text-red-700 mb-4 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  {chatError}
                </div>
              )}

              {/* Chat Messages */}
              <div className="flex-1 overflow-y-auto mb-4 space-y-4">
                {chatLoading && chatMessages.length === 0 ? (
                  <div className="flex items-center justify-center h-full">
                    <Loader className="w-6 h-6 text-blue-600 animate-spin" />
                  </div>
                ) : chatMessages.length === 0 ? (
                  <div className="flex items-center justify-center h-full text-gray-500 text-center">
                    <div>
                      <Bot className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                      <p>Start a conversation with our AI legal assistant</p>
                    </div>
                  </div>
                ) : (
                  chatMessages.map((msg) => (
                    <div key={msg.id} className="space-y-2">
                      {/* User Message */}
                      <div className="flex justify-end">
                        <div className="max-w-xs bg-blue-600 text-white px-4 py-2 rounded-lg">
                          <p className="text-sm">{msg.message}</p>
                        </div>
                      </div>

                      {/* AI Response */}
                      <div className="flex justify-start">
                        <div className="max-w-xs bg-gray-100 text-gray-900 px-4 py-2 rounded-lg">
                          <p className="text-sm">{msg.response}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            {new Date(msg.created_at).toLocaleTimeString("en-IN")}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Chat Input */}
              <div className="flex gap-2">
                <Input
                  placeholder="Ask a legal question..."
                  value={newChatMessage}
                  onChange={(e) => setNewChatMessage(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      sendChatMessage();
                    }
                  }}
                  disabled={chatLoading}
                  className="flex-1"
                />
                <Button
                  onClick={sendChatMessage}
                  disabled={!newChatMessage.trim() || chatLoading}
                  size="sm"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
