// App.js
import React, { useEffect, useState } from "react";
import { supabase } from "./supabase";
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

  // Restore session
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user || null);
    });

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user || null);
      }
    );

    return () => listener.subscription.unsubscribe();
  }, []);

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setPage("feed");
  };

  // 🔥 Show Login page when not logged in
  if (!user) return <Login onLogin={(u) => setUser(u)} />;

  const openProfile = (username) => {
    setProfileUser(username);
    setPage("profile");
  };

  return (
    <div className="app">
      {/* Top bar */}
      <div className="navbar">
        <h2 className="logo">Insta Clone</h2>
        <button className="logout-btn" onClick={logout}>🚪</button>
      </div>

      {/* Navigation pages */}
      {page === "feed" && <Feed user={user} openProfile={openProfile} />}
      {page === "profile" && (
        <Profile
          currentUser={user}
          username={profileUser || user.email.split("@")[0]}
        />
      )}
      {page === "stories" && <Stories user={user} />}
      {page === "messages" && <Messages user={user} />}

      {/* Bottom nav buttons */}
      <div className="bottom-nav">
        <button className={page === "feed" ? "active" : ""} onClick={() => setPage("feed")}>🏠</button>
        <button className={page === "stories" ? "active" : ""} onClick={() => setPage("stories")}>📸</button>
        <button className={page === "messages" ? "active" : ""} onClick={() => setPage("messages")}>💬</button>
        <button
          className={page === "profile" ? "active" : ""}
          onClick={() => {
            setProfileUser(null);
            setPage("profile");
          }}
        >
          👤
        </button>
      </div>
    </div>
  );
}
