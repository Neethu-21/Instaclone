// App.js — works with username accounts (no email auth)
import React, { useState } from "react";
import Login from "./Login";
import Feed from "./Feed";
import Profile from "./Profile";
import Stories from "./Stories";
import Messages from "./Messages";
import "./styles.css";

export default function App() {
  const [user, setUser] = useState(null);
  const [page, setPage] = useState("feed");
  const [profileUser, setProfileUser] = useState(null);

  if (!user) return <Login onLogin={(u) => setUser(u)} />;

  const logout = () => {
    setUser(null);
    setPage("feed");
  };

  const openProfile = (username) => {
    setProfileUser(username);
    setPage("profile");
  };

  return (
    <div className="app">

      <div className="navbar">
        <h2 className="logo">Insta Clone</h2>
        <button onClick={logout}>🚪</button>
      </div>

      {page === "feed" && <Feed user={user} openProfile={openProfile} />}
      {page === "profile" && (
        <Profile currentUser={user} username={profileUser || user.username} />
      )}
      {page === "stories" && <Stories user={user} />}
      {page === "messages" && <Messages user={user} />}

      <div className="bottom-nav">
        <button onClick={() => setPage("feed")}>🏠</button>
        <button onClick={() => setPage("stories")}>📸</button>
        <button onClick={() => setPage("messages")}>💬</button>
        <button onClick={() => { setProfileUser(null); setPage("profile"); }}>👤</button>
      </div>
    </div>
  );
}
