import { useState, useEffect, useMemo, useRef } from "react";
import { Card, CardContent } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Tabs, TabsContent } from "../../components/ui/tabs";
import { Badge } from "../../components/ui/badge";
import {
  Send,
  Loader,
  AlertCircle,
  Bot,
  Search,
  Paperclip,
  Phone,
  Video,
  MoreVertical,
  Star,
  Check,
  CheckCheck,
} from "lucide-react";
import { messagesAPI } from "../../services/api";
import { useCitizenRouteGuard } from "../../hooks/useCitizenRouteGuard";

interface Conversation {
  id: number;
  name: string;
  specialization?: string;
  rating?: number;
  location?: string;
  case_id?: number | null;
  case_title?: string | null;
  unread_count?: number;
  avatar_url?: string | null;
  is_online?: boolean;
  last_message?: string;
  last_message_at?: string;
}

interface DirectMessage {
  id: number;
  sender_id: number;
  receiver_id: number;
  message: string;
  sent_at?: string;
  created_at?: string;
  read_at?: string | null;
}

interface ChatMessage {
  id: number;
  user_id: number;
  message: string;
  response: string;
  created_at: string;
}

interface QuickQuestionCategory {
  key: string;
  title: string;
  subtitle: string;
}

interface QuickQuestionsResponse {
  title?: string;
  categories?: QuickQuestionCategory[];
  suggestions?: string[];
  welcome?: string;
  disclaimer?: string;
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
  const [searchQuery, setSearchQuery] = useState("");
  const [composerValue, setComposerValue] = useState("");
  const [sendingMessage, setSendingMessage] = useState(false);
  const [directMessagesLoading, setDirectMessagesLoading] = useState(false);
  const [directMessagesError, setDirectMessagesError] = useState<string | null>(null);

  // AI Chat State
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [newChatMessage, setNewChatMessage] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [chatError, setChatError] = useState<string | null>(null);
  const [quickQuestionsTitle, setQuickQuestionsTitle] = useState("Quick Questions");
  const [quickQuestionCards, setQuickQuestionCards] = useState<QuickQuestionCategory[]>([]);
  const [chatSuggestions, setChatSuggestions] = useState<string[]>([]);
  const [chatWelcome, setChatWelcome] = useState(
    "Hello! I'm LexConnect AI, your legal assistant. How can I assist you today?"
  );
  const [chatDisclaimer, setChatDisclaimer] = useState(
    "This is general information only. For specific legal advice, consult a qualified lawyer."
  );

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const directThreadRef = useRef<HTMLDivElement>(null);
  const aiThreadRef = useRef<HTMLDivElement>(null);

  const thinScrollbar =
    "[scrollbar-width:thin] [scrollbar-color:#9ca3af_transparent] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-gray-400/80";

  const getMessageTimestamp = (msg: DirectMessage) => msg.sent_at ?? msg.created_at ?? "";

  const formatTime = (value?: string) => {
    if (!value) return "";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";
    return date.toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit" });
  };

  const formatConversationTime = (value?: string) => {
    if (!value) return "";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";

    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    if (isToday) {
      return date.toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit" });
    }

    return date.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
  };

  // Load conversations and chat history on mount
  useEffect(() => {
    loadConversations();
    loadChatHistory();
    loadQuickQuestions();
  }, []);

  // Keep direct thread pinned to the latest message without scrolling the entire page.
  useEffect(() => {
    if (!directThreadRef.current) return;
    directThreadRef.current.scrollTop = directThreadRef.current.scrollHeight;
  }, [directMessages]);

  useEffect(() => {
    if (!aiThreadRef.current) return;
    aiThreadRef.current.scrollTop = aiThreadRef.current.scrollHeight;
  }, [chatMessages]);

  const loadConversations = async () => {
    setConversationsLoading(true);
    setConversationsError(null);
    try {
      const data = (await messagesAPI.getConversations()) as Conversation[];
      const convoList = Array.isArray(data) ? data : [];
      setConversations(convoList);

      if (convoList.length > 0) {
        const currentSelected = convoList.find((item) => item.id === selectedUserId);
        const nextSelected = currentSelected ?? convoList[0];

        setSelectedUserId(nextSelected.id);
        setSelectedConversation(nextSelected);

        if (!currentSelected) {
          await loadDirectMessages(nextSelected.id);
        }
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
      const sortedMessages = (Array.isArray(data) ? data : []).sort((a, b) => {
        const aTime = new Date(getMessageTimestamp(a)).getTime();
        const bTime = new Date(getMessageTimestamp(b)).getTime();

        if (Number.isNaN(aTime) && Number.isNaN(bTime)) return 0;
        if (Number.isNaN(aTime)) return 1;
        if (Number.isNaN(bTime)) return -1;
        return aTime - bTime;
      });

      setDirectMessages(sortedMessages);

      await messagesAPI.markConversationRead(userId);
      setConversations((prev) =>
        prev.map((conversation) =>
          conversation.id === userId
            ? {
                ...conversation,
                unread_count: 0,
              }
            : conversation
        )
      );
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
    if (!composerValue.trim() || !selectedUserId || sendingMessage) return;

    const currentUserId = getCurrentUserId() ?? 0;
    const message = composerValue.trim();
    const optimisticId = -Date.now();

    const optimisticMessage: DirectMessage = {
      id: optimisticId,
      sender_id: currentUserId,
      receiver_id: selectedUserId,
      message,
      sent_at: new Date().toISOString(),
      read_at: null,
    };

    setComposerValue("");
    setSendingMessage(true);
    setDirectMessages((prev) => [...prev, optimisticMessage]);

    try {
      await messagesAPI.sendMessage(selectedUserId, message);
      await loadDirectMessages(selectedUserId);
      await loadConversations();
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Failed to send message";
      setDirectMessagesError(errorMsg);
      console.error("Error sending message:", err);
      setDirectMessages((prev) => prev.filter((item) => item.id !== optimisticId));
      setComposerValue(message);
    } finally {
      setSendingMessage(false);
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

  const loadQuickQuestions = async () => {
    try {
      const data = (await messagesAPI.getQuickQuestions()) as QuickQuestionsResponse;
      setQuickQuestionsTitle(data.title || "Quick Questions");
      setQuickQuestionCards(Array.isArray(data.categories) ? data.categories : []);
      setChatSuggestions(Array.isArray(data.suggestions) ? data.suggestions : []);
      setChatWelcome(data.welcome || chatWelcome);
      setChatDisclaimer(data.disclaimer || chatDisclaimer);
    } catch {
      // Keep graceful defaults if this endpoint is unavailable.
    }
  };

  const loadChatSuggestions = async (context: string) => {
    try {
      const data = (await messagesAPI.getChatSuggestions(context)) as { suggestions?: string[] };
      if (Array.isArray(data.suggestions)) {
        setChatSuggestions(data.suggestions);
      }
    } catch {
      // Suggestions are optional and should not block chat.
    }
  };

  const sendChatMessage = async () => {
    if (!newChatMessage.trim()) return;

    const userMessage = newChatMessage.trim();
    setNewChatMessage("");

    try {
      setChatLoading(true);
      const response = (await messagesAPI.createChatMessage(userMessage, "en")) as ChatMessage;
      setChatMessages((prev) => [...prev, response]);
      const context = userMessage.split(" ").slice(0, 3).join(" ") || "general";
      await loadChatSuggestions(context);
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
    const localUserId = localStorage.getItem("userId");
    if (localUserId && !Number.isNaN(Number(localUserId))) {
      return Number(localUserId);
    }

    const token = localStorage.getItem("authToken");
    if (!token) {
      return null;
    }

    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      const parsedSub = Number(payload.sub);
      return Number.isNaN(parsedSub) ? null : parsedSub;
    } catch {
      return null;
    }
  };

  const currentUserId = getCurrentUserId();

  const filteredConversations = useMemo(() => {
    const search = searchQuery.trim().toLowerCase();
    if (!search) return conversations;

    return conversations.filter((conversation) => {
      const name = conversation.name?.toLowerCase() ?? "";
      const specialization = conversation.specialization?.toLowerCase() ?? "";
      const lastMessage = conversation.last_message?.toLowerCase() ?? "";
      const caseTitle = conversation.case_title?.toLowerCase() ?? "";

      return (
        name.includes(search) ||
        specialization.includes(search) ||
        lastMessage.includes(search) ||
        caseTitle.includes(search)
      );
    });
  }, [conversations, searchQuery]);

  // Return null while checking authorization
  if (!isAuthorized) {
    return null;
  }

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-3xl font-semibold text-gray-900">Messages</h2>
        <p className="text-gray-600 mt-1">Communicate with your lawyers</p>
      </div>

      <Tabs defaultValue="direct" className="w-full">
        {/* Direct Messages Tab */}
        <TabsContent value="direct" className="space-y-4">
          <Card className="overflow-hidden border-gray-200 rounded-2xl">
            <CardContent className="p-0">
              <div className="grid grid-cols-1 lg:grid-cols-[340px_minmax(0,1fr)] min-h-[560px] max-h-[calc(100vh-220px)]">
                {/* Conversation Sidebar */}
                <aside className="border-b lg:border-b-0 lg:border-r border-gray-200 bg-white">
                  <div className="p-4 border-b border-gray-200">
                    <div className="relative">
                      <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <Input
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search conversations..."
                        className="pl-9 h-10"
                      />
                    </div>
                  </div>

                  <div className={`h-[460px] lg:h-[calc(100vh-320px)] overflow-y-auto ${thinScrollbar}`}>
                    {conversationsLoading ? (
                      <div className="flex items-center justify-center py-8">
                        <Loader className="w-5 h-5 text-blue-600 animate-spin" />
                      </div>
                    ) : conversationsError ? (
                      <div className="m-3 text-xs text-red-600 bg-red-50 p-2 rounded">
                        {conversationsError}
                      </div>
                    ) : filteredConversations.length === 0 ? (
                      <div className="text-center py-8 px-6">
                        <p className="text-sm text-gray-500">No conversations found</p>
                      </div>
                    ) : (
                      <ul className="p-2 space-y-1">
                        {filteredConversations.map((conv) => {
                          const initials = conv.name
                            .split(" ")
                            .filter(Boolean)
                            .slice(0, 2)
                            .map((part) => part[0])
                            .join("")
                            .toUpperCase();

                          return (
                            <li key={conv.id}>
                              <button
                                onClick={() => handleSelectConversation(conv)}
                                className={`w-full rounded-xl px-3 py-3 text-left border transition-colors ${
                                  selectedUserId === conv.id
                                    ? "bg-blue-50 border-blue-200"
                                    : "border-transparent hover:bg-gray-50"
                                }`}
                              >
                                <div className="flex items-start gap-3">
                                  <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 text-xs font-semibold flex items-center justify-center shrink-0">
                                    {initials}
                                  </div>
                                  <div className="min-w-0 flex-1">
                                    <div className="flex items-start justify-between gap-2">
                                      <p className="text-sm font-semibold text-gray-900 truncate">
                                        {conv.name}
                                      </p>
                                      <span className="text-xs text-gray-500 shrink-0">
                                        {formatConversationTime(conv.last_message_at)}
                                      </span>
                                    </div>

                                    {conv.specialization && (
                                      <p className="text-xs text-gray-600 mt-0.5 truncate">
                                        {conv.specialization}
                                      </p>
                                    )}

                                    {conv.case_title && (
                                      <Badge
                                        variant="outline"
                                        className="mt-1 text-[10px] bg-white text-gray-700"
                                      >
                                        {conv.case_title}
                                      </Badge>
                                    )}

                                    <div className="mt-2 flex items-center justify-between gap-2">
                                      <p className="text-xs text-gray-500 truncate">
                                        {conv.last_message || "No recent messages"}
                                      </p>

                                      {!!conv.unread_count && conv.unread_count > 0 && (
                                        <span className="min-w-5 h-5 px-1 rounded-full bg-blue-600 text-white text-[10px] font-semibold inline-flex items-center justify-center">
                                          {conv.unread_count}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </button>
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </div>
                </aside>

                {/* Thread Area */}
                <section className="flex flex-col bg-gray-50/60">
                  {selectedUserId ? (
                    <>
                      {selectedConversation && (
                        <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between gap-3">
                          <div className="min-w-0 flex items-start gap-3">
                            <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 text-xs font-semibold flex items-center justify-center shrink-0">
                              {selectedConversation.name
                                .split(" ")
                                .filter(Boolean)
                                .slice(0, 2)
                                .map((part) => part[0])
                                .join("")
                                .toUpperCase()}
                            </div>
                            <div className="min-w-0">
                              <p className="text-xl font-semibold text-gray-900 truncate">
                                {selectedConversation.name}
                              </p>
                              <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-gray-600">
                                {selectedConversation.specialization && (
                                  <span>{selectedConversation.specialization}</span>
                                )}
                                {selectedConversation.rating ? (
                                  <span className="inline-flex items-center gap-1">
                                    <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                                    {selectedConversation.rating.toFixed(1)}
                                  </span>
                                ) : null}
                                <span
                                  className={`inline-flex items-center gap-1 ${
                                    selectedConversation.is_online === true
                                      ? "text-emerald-600"
                                      : "text-gray-500"
                                  }`}
                                >
                                  <span
                                    className={`w-2 h-2 rounded-full ${
                                      selectedConversation.is_online === true
                                        ? "bg-emerald-500"
                                        : "bg-gray-400"
                                    }`}
                                  />
                                  {selectedConversation.is_online === true ? "Online" : "Offline"}
                                </span>
                              </div>

                              {selectedConversation.case_title && (
                                <Badge
                                  variant="outline"
                                  className="mt-2 text-[11px] bg-white text-gray-700"
                                >
                                  Case: {selectedConversation.case_title}
                                </Badge>
                              )}
                            </div>
                          </div>

                          <div className="hidden sm:flex items-center gap-1 text-gray-500">
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <Phone className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <Video className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </div>
                        </header>
                      )}

                      <div
                        ref={directThreadRef}
                        className={`flex-1 overflow-y-auto p-4 md:p-5 space-y-4 ${thinScrollbar}`}
                      >
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
                            <p>No messages yet. Start a conversation.</p>
                          </div>
                        ) : (
                          directMessages.map((msg) => {
                            const isOutgoing = msg.sender_id === currentUserId;
                            const time = formatTime(getMessageTimestamp(msg));

                            return (
                              <div
                                key={msg.id}
                                className={`flex ${isOutgoing ? "justify-end" : "justify-start"}`}
                              >
                                <div className="max-w-[82%] md:max-w-[70%]">
                                  <div
                                    className={`rounded-2xl px-4 py-2.5 text-sm shadow-sm ${
                                      isOutgoing
                                        ? "bg-blue-600 text-white rounded-br-md"
                                        : "bg-white text-gray-900 border border-gray-200 rounded-bl-md"
                                    }`}
                                  >
                                    <p className="whitespace-pre-wrap break-words">{msg.message}</p>
                                  </div>

                                  <div
                                    className={`mt-1 flex items-center gap-1 text-xs ${
                                      isOutgoing
                                        ? "justify-end text-gray-500"
                                        : "justify-start text-gray-500"
                                    }`}
                                  >
                                    {time && <span>{time}</span>}
                                    {isOutgoing &&
                                      (msg.read_at ? (
                                        <CheckCheck className="w-3.5 h-3.5 text-blue-600" />
                                      ) : (
                                        <Check className="w-3.5 h-3.5" />
                                      ))}
                                  </div>
                                </div>
                              </div>
                            );
                          })
                        )}
                        <div ref={messagesEndRef} />
                      </div>

                        <div className="border-t border-gray-200 bg-white px-3 py-2.5">
                        <div className="flex items-end gap-2">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-9 w-9 text-gray-500"
                            title="Attachment support will be enabled when backend upload endpoint is available"
                          >
                            <Paperclip className="w-4 h-4" />
                          </Button>

                          <Input
                            placeholder="Type a message..."
                            value={composerValue}
                            onChange={(e) => setComposerValue(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter" && !e.shiftKey) {
                                e.preventDefault();
                                void sendDirectMessage();
                              }
                            }}
                            className="flex-1 h-10 rounded-xl"
                          />

                          <Button
                            onClick={sendDirectMessage}
                            disabled={!composerValue.trim() || directMessagesLoading || sendingMessage}
                            size="icon"
                            className="h-9 w-9 rounded-xl"
                          >
                            {sendingMessage ? (
                              <Loader className="w-4 h-4 animate-spin" />
                            ) : (
                              <Send className="w-4 h-4" />
                            )}
                          </Button>
                        </div>
                        <p className="text-[11px] text-gray-500 px-1 mt-1.5">
                          Press Enter to send, Shift + Enter for a new line
                        </p>
                      </div>
                    </>
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-500 px-6 text-center">
                      <p>Select a conversation to start messaging.</p>
                    </div>
                  )}
                </section>
              </div>
            </CardContent>
          </Card>
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
              <div ref={aiThreadRef} className="flex-1 overflow-y-auto mb-4 space-y-4">
                {chatLoading && chatMessages.length === 0 ? (
                  <div className="flex items-center justify-center h-full">
                    <Loader className="w-6 h-6 text-blue-600 animate-spin" />
                  </div>
                ) : chatMessages.length === 0 ? (
                  <div className="flex items-center justify-center h-full text-gray-500 text-center">
                    <div>
                      <Bot className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                      <p>{chatWelcome}</p>
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

              <div className="mt-4 space-y-3">
                {quickQuestionCards.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">{quickQuestionsTitle}</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {quickQuestionCards.map((item) => (
                        <button
                          key={item.key}
                          type="button"
                          className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-left hover:bg-gray-50"
                          onClick={() => {
                            setNewChatMessage(item.title);
                            void loadChatSuggestions(item.key);
                          }}
                        >
                          <p className="text-sm font-semibold text-gray-900">{item.title}</p>
                          <p className="text-xs text-gray-600 mt-0.5">{item.subtitle}</p>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {chatSuggestions.length > 0 && (
                  <div>
                    <p className="text-xs text-gray-500">You might also ask:</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {chatSuggestions.map((suggestion) => (
                        <button
                          key={suggestion}
                          type="button"
                          className="rounded-full border border-gray-300 bg-white px-3 py-1.5 text-xs text-gray-700 hover:bg-gray-50"
                          onClick={() => setNewChatMessage(suggestion)}
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
                  {chatDisclaimer}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
