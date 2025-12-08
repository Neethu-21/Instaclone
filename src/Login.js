// Login.js
import React, { useState } from "react";
import { supabase } from "./supabase";

export default function Login({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) return alert("Enter email & password");
    setLoading(true);

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (error) {
      alert("Incorrect email or password");
      return;
    }

    onLogin(data.user);  // <-- IMPORTANT
  };

  const handleSignup = async () => {
    if (!email || !password) return alert("Enter email & password");
    setLoading(true);

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    setLoading(false);

    if (error) {
      alert(error.message);
      return;
    }

    alert("Signup successful — now login");
  };

  return (
    <div className="login-container">
      <h2 className="app-title">📸 Insta Clone</h2>

      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <button onClick={handleLogin} disabled={loading}>
        {loading ? "Logging in..." : "Login"}
      </button>

      <button onClick={handleSignup} disabled={loading}>
        {loading ? "Creating..." : "Create Account"}
      </button>
    </div>
  );
}
