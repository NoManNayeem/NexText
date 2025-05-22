"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import api from "@/utils/api";
import { useAuth } from "@/context/AuthContext";
import { FiSend, FiChevronLeft } from "react-icons/fi";
import { motion } from "framer-motion";

export default function ChatPage() {
  const { id } = useParams();
  const router = useRouter();
  const { currentUser, token, logout } = useAuth();

  const [partner, setPartner] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const wsRef = useRef(null);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (!currentUser) router.replace("/login");
  }, [currentUser, router]);

  useEffect(() => {
    if (!currentUser) return;
    (async () => {
      try {
        const { data: userData } = await api.get(`/users?skip=0&limit=1&q=${id}`);
        setPartner(userData[0] || { username: `User ${id}` });

        const { data } = await api.get(`/chat/history/${id}`);
        setMessages(data);
      } catch {
        logout();
      }
    })();
  }, [currentUser, id, logout]);

  useEffect(() => {
    if (!token || !currentUser) return;

    const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "");
    const wsUrl = apiBase.replace(/^http/, "ws");
    const socket = new WebSocket(`${wsUrl}/chat/ws?token=${token}`);
    wsRef.current = socket;

    socket.onmessage = (e) => {
      const msg = JSON.parse(e.data);
      const isToThisUser =
        (msg.sender_id === currentUser.id && msg.recipient_id === +id) ||
        (msg.sender_id === +id && msg.recipient_id === currentUser.id);
      if (isToThisUser) {
        setMessages((prev) => [...prev, msg]);
      }
    };

    return () => socket.close();
  }, [token, currentUser, id]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    const text = newMessage.trim();
    if (!text) return;
    wsRef.current.send(JSON.stringify({ to: +id, content: text }));
    setNewMessage("");
  };

  return (
    <div className="flex flex-col h-screen bg-gray-900">
      {/* Header */}
      <header className="flex items-center px-5 py-4 bg-gray-950 shadow-md sticky top-0 z-20">
        <button
          onClick={() => router.push("/chat")}
          className="p-2 rounded-full hover:bg-gray-800"
        >
          <FiChevronLeft className="text-2xl text-blue-500" />
        </button>
        <div className="ml-4 flex items-center space-x-3">
          <div className="h-9 w-9 bg-blue-600 text-white rounded-full flex items-center justify-center font-semibold uppercase">
            {partner?.username?.charAt(0) || "U"}
          </div>
          <h2 className="text-lg font-semibold text-white">
            {partner?.username || `User ${id}`}
          </h2>
        </div>
      </header>

      {/* Messages */}
      <main className="flex-1 overflow-y-auto px-5 py-6 space-y-4">
        {messages.map((m) => {
          const isMe = m.sender_id === currentUser.id;
          return (
            <motion.div
              key={m.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className={`max-w-[70%] px-4 py-2 rounded-2xl text-sm shadow-md break-words ${
                isMe
                  ? "ml-auto bg-blue-600 text-white rounded-br-none"
                  : "mr-auto bg-gray-800 text-white rounded-bl-none"
              }`}
            >
              <p className="whitespace-pre-wrap">{m.content}</p>
              <span className="block mt-1 text-xs text-right text-gray-300">
                {new Date(m.timestamp).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </motion.div>
          );
        })}
        <div ref={scrollRef} />
      </main>

      {/* Input */}
      <footer className="px-5 py-4 bg-gray-950 border-t border-gray-800 sticky bottom-0 z-30">
        <div className="flex items-center space-x-3">
          <input
            type="text"
            placeholder="Type a message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            className="flex-1 px-4 py-2 rounded-full bg-gray-800 text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handleSend}
            className="p-3 bg-blue-600 rounded-full text-white hover:bg-blue-700 transition"
          >
            <FiSend className="text-xl" />
          </button>
        </div>
      </footer>
    </div>
  );
}
