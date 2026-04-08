import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Bot, Maximize2, Minimize2, Send, X } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { messagesAPI } from "../services/api";

type ChatMessage = {
  id: number;
  message: string;
  response: string;
  created_at: string;
};

type QuickQuestionCategory = {
  key: string;
  title: string;
  subtitle: string;
};

type QuickQuestionsResponse = {
  title?: string;
  categories?: QuickQuestionCategory[];
  suggestions?: string[];
  welcome?: string;
  disclaimer?: string;
};

export function CitizenAIAssistant() {
  const [widgetState, setWidgetState] = useState<"expanded" | "minimized" | "hidden">(
    "minimized"
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [typingMessageId, setTypingMessageId] = useState<number | null>(null);
  const [typedResponse, setTypedResponse] = useState("");

  const [quickQuestionsTitle, setQuickQuestionsTitle] = useState("Quick Questions");
  const [quickQuestionCards, setQuickQuestionCards] = useState<QuickQuestionCategory[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [welcome, setWelcome] = useState(
    "Hello! I'm LexConnect AI, your legal assistant. I can help you with basic legal information and guide you through common legal questions. How can I assist you today?"
  );
  const [disclaimer, setDisclaimer] = useState(
    "This is general information only. For specific legal advice, consult a qualified lawyer."
  );

  const threadRef = useRef<HTMLDivElement>(null);

  const hasMessages = useMemo(() => chatMessages.length > 0, [chatMessages]);
  const isOpen = widgetState === "expanded";

  const formatTime = (value?: string) => {
    const source = value ? new Date(value) : new Date();
    if (Number.isNaN(source.getTime())) return "";
    return source.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
  };

  const renderInlineBold = (text: string): ReactNode[] => {
    return text.split(/(\*\*[^*]+\*\*)/g).map((part, index) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return <strong key={`${part}-${index}`}>{part.slice(2, -2)}</strong>;
      }
      return <span key={`${part}-${index}`}>{part}</span>;
    });
  };

  const renderAssistantMessage = (text: string) => {
    const lines = text.split("\n").filter((line) => line.trim().length > 0);

    return (
      <div className="space-y-1.5">
        {lines.map((line, index) => {
          const trimmed = line.trim();
          const isBullet = trimmed.startsWith("• ");
          const isNumber = /^\d+\.\s/.test(trimmed);

          if (isBullet) {
            return (
              <p key={`${trimmed}-${index}`} className="text-sm text-gray-800 pl-2">
                {renderInlineBold(trimmed)}
              </p>
            );
          }

          if (isNumber) {
            return (
              <p key={`${trimmed}-${index}`} className="text-sm text-gray-800">
                {renderInlineBold(trimmed)}
              </p>
            );
          }

          return (
            <p key={`${trimmed}-${index}`} className="text-sm text-gray-900">
              {renderInlineBold(trimmed)}
            </p>
          );
        })}
      </div>
    );
  };

  useEffect(() => {
    if (!isOpen) return;

    void loadQuickQuestions();
    void loadChatHistory();
  }, [isOpen]);

  useEffect(() => {
    if (!threadRef.current) return;
    threadRef.current.scrollTop = threadRef.current.scrollHeight;
  }, [chatMessages, isOpen, typedResponse, isLoading]);

  useEffect(() => {
    if (typingMessageId === null) return;

    const targetMessage = chatMessages.find((msg) => msg.id === typingMessageId);
    if (!targetMessage) {
      setTypingMessageId(null);
      setTypedResponse("");
      return;
    }

    const fullText = targetMessage.response || "";
    let cursor = 0;
    const chunkSize = Math.max(1, Math.ceil(fullText.length / 110));
    setTypedResponse("");

    let timer: ReturnType<typeof setTimeout>;

    const tick = () => {
      cursor = Math.min(fullText.length, cursor + chunkSize);
      setTypedResponse(fullText.slice(0, cursor));

      if (cursor < fullText.length) {
        timer = setTimeout(tick, 22);
      } else {
        setTypingMessageId(null);
      }
    };

    timer = setTimeout(tick, 40);

    return () => {
      clearTimeout(timer);
    };
  }, [typingMessageId, chatMessages]);

  const loadQuickQuestions = async () => {
    try {
      const data = (await messagesAPI.getQuickQuestions()) as QuickQuestionsResponse;
      setQuickQuestionsTitle(data.title || "Quick Questions");
      setQuickQuestionCards(Array.isArray(data.categories) ? data.categories : []);
      setSuggestions(Array.isArray(data.suggestions) ? data.suggestions : []);
      if (data.welcome) setWelcome(data.welcome);
      if (data.disclaimer) setDisclaimer(data.disclaimer);
    } catch {
      // Keep defaults if quick-question API is unavailable.
    }
  };

  const loadChatHistory = async () => {
    setError(null);
    setIsLoading(true);
    try {
      const data = (await messagesAPI.getChatHistory(0, 20)) as ChatMessage[];
      setChatMessages(Array.isArray(data) ? data : []);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Failed to load AI chat";
      setError(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const loadSuggestions = async (context: string) => {
    try {
      const data = (await messagesAPI.getChatSuggestions(context)) as { suggestions?: string[] };
      if (Array.isArray(data.suggestions)) {
        setSuggestions(data.suggestions);
      }
    } catch {
      // Suggestions are optional.
    }
  };

  const sendMessage = async () => {
    const message = newMessage.trim();
    if (!message || isLoading) return;

    setNewMessage("");
    setError(null);
    setIsLoading(true);

    try {
      const response = (await messagesAPI.createChatMessage(message, "en")) as ChatMessage;
      setChatMessages((prev) => [...prev, response]);
      setTypingMessageId(response.id);
      const context = message.split(" ").slice(0, 3).join(" ") || "general";
      await loadSuggestions(context);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Failed to send message";
      setError(errorMsg);
      setNewMessage(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-0 right-6 z-[70]">
      {widgetState === "hidden" && (
        <button
          type="button"
          onClick={() => setWidgetState("expanded")}
          className="h-14 w-14 rounded-full bg-blue-600 text-white shadow-xl hover:bg-blue-700 transition-colors flex items-center justify-center"
          aria-label="Open LexConnect AI"
          title="LexConnect AI"
        >
          <Bot className="h-6 w-6" />
        </button>
      )}

      {widgetState === "minimized" && (
        <div className="w-[320px] sm:w-[380px] rounded-t-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-2xl border border-blue-500/40 border-b-0 px-4 py-3 flex items-center justify-between">
          <button
            type="button"
            onClick={() => setWidgetState("expanded")}
            className="flex items-center gap-2 text-left"
            aria-label="Open LexConnect AI"
          >
            <div className="h-8 w-8 rounded-full bg-white/20 flex items-center justify-center">
              <Bot className="h-4 w-4" />
            </div>
            <div>
              <p className="font-semibold leading-none">LexConnect AI</p>
              <p className="text-xs text-blue-100 mt-1">Legal Assistant</p>
            </div>
          </button>

          <div className="flex items-center gap-1">
            <Button
              type="button"
              size="icon"
              variant="ghost"
              className="h-7 w-7 text-white hover:bg-white/15"
              onClick={() => setWidgetState("expanded")}
              title="Expand"
            >
              <Maximize2 className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              size="icon"
              variant="ghost"
              className="h-7 w-7 text-white hover:bg-white/15"
              onClick={() => setWidgetState("hidden")}
              title="Close"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {isOpen && (
        <div className="w-[340px] sm:w-[380px] h-[560px] bg-white border border-gray-200 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-white/20 flex items-center justify-center">
                <Bot className="h-4 w-4" />
              </div>
              <div>
                <p className="font-semibold leading-none">LexConnect AI</p>
                <p className="text-xs text-blue-100 mt-1">Legal Assistant</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Button
                type="button"
                size="icon"
                variant="ghost"
                className="h-7 w-7 text-white hover:bg-white/15"
                onClick={() => setWidgetState("minimized")}
                title="Minimize"
              >
                <Minimize2 className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                size="icon"
                variant="ghost"
                className="h-7 w-7 text-white hover:bg-white/15"
                onClick={() => setWidgetState("hidden")}
                title="Close"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div ref={threadRef} className="flex-1 overflow-y-auto p-3 space-y-3 bg-gray-50">
            {error && <p className="text-xs text-red-600">{error}</p>}

            {!hasMessages && !isLoading && (
              <>
                <div className="rounded-xl border border-gray-200 bg-white p-3">
                  <p className="text-xs font-semibold text-blue-700">LexConnect AI</p>
                  <p className="text-sm text-gray-800 mt-1">{welcome}</p>
                  <p className="text-[11px] text-gray-500 mt-2">{formatTime()}</p>
                </div>

                {suggestions.length > 0 && (
                  <div className="rounded-xl border border-gray-200 bg-white p-3">
                    <p className="text-xs text-gray-500">You might also ask:</p>
                    <div className="mt-2 space-y-1.5">
                      {suggestions.map((item) => (
                        <button
                          key={item}
                          type="button"
                          className="block w-full text-left text-sm text-gray-800 hover:text-blue-700"
                          onClick={() => setNewMessage(item)}
                        >
                          {item}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}

            {chatMessages.map((msg) => (
              <div key={msg.id} className="space-y-2">
                <div className="flex justify-end">
                  <div className="max-w-[90%] rounded-xl bg-blue-600 text-white px-3 py-2.5 text-sm">
                    {msg.message}
                    <p className="text-[11px] text-blue-100 mt-1">{formatTime(msg.created_at)}</p>
                  </div>
                </div>

                <div className="flex justify-start">
                  <div className="max-w-[92%] rounded-xl bg-white border border-gray-200 px-3 py-2.5">
                    <p className="text-xs font-semibold text-blue-700">LexConnect AI</p>
                    <div className="mt-1">
                      {renderAssistantMessage(typingMessageId === msg.id ? typedResponse : msg.response)}
                    </div>
                    {typingMessageId === msg.id && (
                      <span className="inline-block w-1.5 h-4 bg-blue-500/70 rounded-sm animate-pulse mt-1" />
                    )}
                    <p className="text-[11px] text-gray-500 mt-2">{formatTime(msg.created_at)}</p>
                  </div>
                </div>
              </div>
            ))}

            {isLoading && newMessage.length === 0 && (
              <div className="flex justify-start">
                <div className="max-w-[92%] rounded-xl bg-white border border-gray-200 px-3 py-2.5">
                  <p className="text-xs font-semibold text-blue-700">LexConnect AI</p>
                  <div className="mt-2 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce" />
                    <span className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce [animation-delay:120ms]" />
                    <span className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce [animation-delay:240ms]" />
                  </div>
                </div>
              </div>
            )}

            {hasMessages && suggestions.length > 0 && (
              <div className="rounded-xl border border-gray-200 bg-white p-3">
                <p className="text-xs text-gray-500">You might also ask:</p>
                <div className="mt-2 space-y-1.5">
                  {suggestions.map((item) => (
                    <button
                      key={item}
                      type="button"
                      className="block w-full text-left text-sm text-gray-800 hover:text-blue-700"
                      onClick={() => setNewMessage(item)}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {quickQuestionCards.length > 0 && !hasMessages && (
              <div className="rounded-xl border border-gray-200 bg-white p-3">
                <p className="text-xs text-gray-500 mb-2">{quickQuestionsTitle}</p>
                <div className="space-y-1.5">
                  {quickQuestionCards.map((item) => (
                    <button
                      key={item.key}
                      type="button"
                      className="block w-full text-left text-sm text-gray-800 hover:text-blue-700"
                      onClick={() => {
                        setNewMessage(item.title);
                        void loadSuggestions(item.key);
                      }}
                    >
                      {item.title}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="border-t border-gray-200 bg-white p-3">
            <div className="flex gap-2">
              <Input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Ask a legal question..."
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    void sendMessage();
                  }
                }}
                disabled={isLoading}
              />
              <Button
                type="button"
                onClick={() => void sendMessage()}
                disabled={!newMessage.trim() || isLoading}
                className="h-10 w-10 p-0"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
            <p className="mt-2 text-[11px] text-amber-700 bg-amber-50 border border-amber-200 rounded-md px-2 py-1.5">
              {disclaimer}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
