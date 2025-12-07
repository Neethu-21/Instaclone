// Messages.js — Instagram-style DMs using Supabase realtime
import React, { useEffect, useState } from "react";
import { supabase } from "./supabase";

export default function Messages({ user }) {
  const username = user; // logged-in user (string)

  const [users, setUsers] = useState([]);     // all users except me
  const [chatId, setChatId] = useState(null); // selected chat
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");

  // Load user list
  const loadUsers = async () => {
    const { data } = await supabase.from("profiles").select("*");
    const filtered = (data || []).filter((u) => u.username !== username);
    setUsers(filtered);
  };

  // Find or create chat
  const openChat = async (otherUser) => {
    let { data } = await supabase
      .from("chats")
      .select("*")
      .or(`user1.eq.${username},user2.eq.${username}`);

    let chat = data?.find(
      (c) =>
        (c.user1 === username && c.user2 === otherUser) ||
        (c.user1 === otherUser && c.user2 === username)
    );

    if (!chat) {
      const { data: created } = await supabase
        .from("chats")
        .insert({ user1: username, user2: otherUser })
        .select();

      chat = created[0];
    }

    setChatId(chat.id);
  };

  // Load chat messages
  const loadMessages = async () => {
    if (!chatId) return;
    const { data } = await supabase
      .from("messages")
      .select("*")
      .eq("chat_id", chatId);

    const sorted = (data || []).sort((a, b) => a.time - b.time);
    setMessages(sorted);
  };

  // On mount load users
  useEffect(() => {
    loadUsers();
  }, []);

  // Realtime messaging
  useEffect(() => {
    if (!chatId) return;

    loadMessages();

    const ch = supabase
      .channel("messages")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "messages" },
        loadMessages
      )
      .subscribe();

    return () => supabase.removeChannel(ch);
  }, [chatId]);

  // Send DM
  const sendMessage = async () => {
    if (!text.trim()) return;
    await supabase.from("messages").insert({
      chat_id: chatId,
      sender: username,
      text,
      time: Date.now(),
    });
    setText("");
  };

  return (
    <div className="messages-page">
      {/* If chat is not opened — show user list */}
      {!chatId ? (
        <div className="chat-list">
          <h3>Messages</h3>
          {users.map((u) => (
            <div
              key={u.username}
              className="chat-user"
              onClick={() => openChat(u.username)}
            >
              <img
                src={u.avatar || "https://cdn-icons-png.flaticon.com/512/149/149071.png"}
                alt=""
              />
              <span>@{u.username}</span>
            </div>
          ))}
        </div>
      ) : (
        // Chat opened — show chat UI
        <div className="chat-box">
          <button className="back-btn" onClick={() => setChatId(null)}>
            ◀ Back
          </button>

          <div className="chat-messages">
            {messages.map((m) => (
              <p
                key={m.id}
                className={m.sender === username ? "msg me" : "msg other"}
              >
                {m.text}
              </p>
            ))}
          </div>

          <div className="chat-input-row">
            <input
              placeholder="Message..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            />
            <button onClick={sendMessage}>Send</button>
          </div>
        </div>
      )}
    </div>
  );
}
