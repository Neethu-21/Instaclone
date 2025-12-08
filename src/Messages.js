import React, { useState, useEffect } from "react";
import { supabase } from "./supabase";

export default function Messages({ user }) {
  const [users, setUsers] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");

  const loadUsers = async () => {
    const { data } = await supabase.from("profiles").select("*");
    setUsers(data || []);
  };

  const loadMessages = async () => {
    if (!selectedChat) return;
    const { data } = await supabase
      .from("messages")
      .select("*")
      .eq("chat_id", selectedChat)
      .order("time", { ascending: true });
    setMessages(data || []);
  };

  useEffect(() => {
    loadUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    loadMessages();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedChat]);

  const sendMessage = async () => {
    if (!text.trim() || !selectedChat) return;
    await supabase.from("messages").insert({
      chat_id: selectedChat,
      sender: user.email,
      text,
      time: Date.now(),
    });
    setText("");
    loadMessages();
  };

  return (
    <div className="messages-page">
      <div className="sidebar">
        {users.map((u) => (
          <div
            key={u.id}
            className="user"
            onClick={() => setSelectedChat(u.id)}
          >
            {u.username}
          </div>
        ))}
      </div>

      <div className="chat">
        <div className="chat-body">
          {messages.map((m) => (
            <div
              key={m.id}
              className={m.sender === user.email ? "my-msg" : "other-msg"}
            >
              {m.text}
            </div>
          ))}
        </div>

        <div className="chat-input">
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type..."
          />
          <button onClick={sendMessage}>Send</button>
        </div>
      </div>
    </div>
  );
}
