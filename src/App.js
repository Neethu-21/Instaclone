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
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const theme = localStorage.getItem("theme") === "true";
    setDark(theme);
    document.body.classList.toggle("dark", theme);

    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user || null);
    });

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user || null);
      }
    );

    return () => authListener.subscription.unsubscribe();
  }, []);

  const toggleTheme = () => {
    const newTheme = !dark;
    setDark(newTheme);
    localStorage.setItem("theme", newTheme);
    document.body.classList.toggle("dark", newTheme);
  };

  const logout = async () => {
    await supabase.auth.signOut();
  };

  if (!user) {
    return (
      <div className={dark ? "dark" : ""}>
        <button onClick={toggleTheme} style={{ position: "absolute", top: 15, right: 15 }}>
          {dark ? "🌞" : "🌙"}
        </button>
        <Login />
      </div>
    );
  }

  return (
    <div className={dark ? "dark" : ""}>
      {/* Navbar */}
      <div className="navbar">
        <h3>Insta</h3>
        <div>
          <button onClick={toggleTheme}>{dark ? "🌞" : "🌙"}</button>
          <button onClick={logout}>🚪</button>
        </div>
      </div>

      {/* Pages */}
      {page === "feed" && <Feed user={user} openProfile={setProfileUser} />}
      {page === "profile" && (
        <Profile currentUser={user} username={profileUser || user.email.split("@")[0]} />
      )}
      {page === "messages" && <Messages user={user} />}
      {page === "stories" && <Stories user={user} />}

      {/* Bottom Navigation */}
      <div className="bottom-nav">
        <button className={page === "feed" ? "active" : ""} onClick={() => setPage("feed")}>🏠</button>
        <button className={page === "stories" ? "active" : ""} onClick={() => setPage("stories")}>📸</button>
        <button className={page === "messages" ? "active" : ""} onClick={() => setPage("messages")}>💬</button>
        <button className={page === "profile" ? "active" : ""} onClick={() => setPage("profile")}>👤</button>
      </div>
    </div>
  );
}
