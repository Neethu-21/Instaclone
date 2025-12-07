// App.js — FINAL (username login, no email)
import React, { useState } from "react";
import Login from "./Login";
import Feed from "./Feed";
import Profile from "./Profile";
import Stories from "./Stories";
import Messages from "./Messages";
import "./styles.css";

export default function App() {
  const [user, setUser] = useState(null);       // current username
  const [page, setPage] = useState("feed");     // page handling
  const [selectedProfile, setSelectedProfile] = useState(null);

  if (!user) return <Login onLogin={(u) => setUser(u)} />;

  const openProfile = (username) => {
    setSelectedProfile(username);
    setPage("profile");
  };

  const logout = () => {
    setUser(null);
    setPage("feed");
  };

  return (
    <div className="app">
      {/* top bar */}
      <div className="navbar">
        <h2 className="logo">Insta Clone</h2>
        <button className="logout-btn" onClick={logout}>🚪</button>
      </div>

      {/* pages */}
      {page === "feed" && <Feed user={user} openProfile={openProfile} />}
      {page === "profile" && (
        <Profile
          currentUser={user}
          viewingUser={selectedProfile || user}
          logout={logout}
          openProfile={openProfile}
        />
      )}
      {page === "messages" && <Messages user={user} />}
      {page === "stories" && <Stories user={user} />}

      {/* bottom nav */}
      <div className="bottom-nav">
        <button className={page === "feed" ? "active" : ""} onClick={() => setPage("feed")}>🏠</button>
        <button className={page === "stories" ? "active" : ""} onClick={() => setPage("stories")}>📸</button>
        <button className={page === "messages" ? "active" : ""} onClick={() => setPage("messages")}>💬</button>
        <button className={page === "profile" ? "active" : ""} onClick={() => { setSelectedProfile(null); setPage("profile"); }}>👤</button>
      </div>
    </div>
  );
}
