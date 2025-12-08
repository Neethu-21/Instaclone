// Login.js — Username + Password only (no email)
import React, { useState } from "react";
import { supabase } from "./supabase";

export default function Login({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const signup = async () => {
    if (!username || !password) return alert("Enter username & password");

    const { data: exists } = await supabase
      .from("accounts")
      .select("username")
      .eq("username", username);

    if (exists.length) return alert("Username already exists");

    await supabase.from("accounts").insert({
      username,
      password,
      avatar: "",
    });

    alert("Signup successful — now login");
  };

  const login = async () => {
    const { data } = await supabase
      .from("accounts")
      .select("*")
      .eq("username", username)
      .eq("password", password);

    if (!data || !data.length) return alert("Incorrect username or password");

    onLogin(data[0]); // logged in user
  };

  return (
    <div className="login-container">
      <h2 className="app-title">📸 Insta Clone</h2>

      <input
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />

      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <button onClick={login}>Login</button>
      <button onClick={signup}>Create Account</button>
    </div>
  );
}
