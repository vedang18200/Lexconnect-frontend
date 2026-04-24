import { useState } from "react";

export function LawyerMessages() {

  // Static conversations data
  const conversations = [
    {
      id: 1,
      client: "Rahul Sharma",
      messages: [
        { sender: "client", text: "Hello sir, any update on my case?", time: "10:00 AM" },
        { sender: "lawyer", text: "Hearing is scheduled next week.", time: "10:05 AM" },
      ],
    },
    {
      id: 2,
      client: "Priya Mehta",
      messages: [
        { sender: "client", text: "Can we reschedule the meeting?", time: "09:30 AM" },
        { sender: "lawyer", text: "Yes, tomorrow works.", time: "09:45 AM" },
      ],
    },
  ];

  const [activeChat, setActiveChat] = useState(conversations[0]);

  return (
    <div className="grid grid-cols-3 gap-6 h-[500px]">

      {/* Sidebar */}
      <div className="col-span-1 border rounded-xl bg-white p-4 overflow-y-auto">
        <h2 className="text-xl font-semibold mb-4">Clients</h2>

        {conversations.map((conv) => (
          <div
            key={conv.id}
            onClick={() => setActiveChat(conv)}
            className={`p-3 rounded-lg cursor-pointer mb-2 ${
              activeChat.id === conv.id
                ? "bg-gray-200"
                : "hover:bg-gray-100"
            }`}
          >
            {conv.client}
          </div>
        ))}
      </div>

      {/* Chat Window */}
      <div className="col-span-2 border rounded-xl bg-white flex flex-col">

        {/* Header */}
        <div className="p-4 border-b font-semibold">
          {activeChat.client}
        </div>

        {/* Messages */}
        <div className="flex-1 p-4 space-y-3 overflow-y-auto">
          {activeChat.messages.map((msg, index) => (
            <div
              key={index}
              className={`flex ${
                msg.sender === "lawyer"
                  ? "justify-end"
                  : "justify-start"
              }`}
            >
              <div
                className={`px-4 py-2 rounded-lg max-w-xs ${
                  msg.sender === "lawyer"
                    ? "bg-black text-white"
                    : "bg-gray-200 text-gray-900"
                }`}
              >
                <p>{msg.text}</p>
                <span className="text-xs opacity-70">{msg.time}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Input Box (UI only for now) */}
        <div className="p-4 border-t flex gap-2">
          <input
            type="text"
            placeholder="Type a message..."
            className="flex-1 border rounded-lg px-3 py-2 outline-none"
          />
          <button className="px-4 py-2 bg-black text-white rounded-lg">
            Send
          </button>
        </div>

      </div>
    </div>
  );
}
