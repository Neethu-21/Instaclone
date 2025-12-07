// Login.js — Username-only Auth (NO EMAIL)
import React, { useState } from "react";
import { supabase } from "./supabase";

export default function Login({ onLogin }) {
  const [isSignup, setIsSignup] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [avatar, setAvatar] = useState(null);

  const IMGBB_KEY = process.env.REACT_APP_IMGBB_KEY;

  // upload avatar
  const uploadAvatar = async () => {
    if (!avatar) return "";
    let fd = new FormData();
    fd.append("image", avatar);
    const res = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_KEY}`, {
      method: "POST",
      body: fd,
    });
    const json = await res.json();
    return json.data.url;
  };

  /* ---------- SIGNUP ---------- */
  const signup = async () => {
    if (!username.trim() || !password.trim())
      return alert("Enter username & password");

    // check if username exists
    const { data: exists } = await supabase
      .from("profiles")
      .select("username")
      .eq("username", username)
      .maybeSingle();

    if (exists) return alert("Username already taken");

    // upload avatar
    const avatarUrl = await uploadAvatar();

    // save profile
    await supabase.from("profiles").insert({
      username,
      avatar: avatarUrl,
      bio: "",
      password,  // we store password, no hashing for now (simple)
    });

    onLogin(username);
  };

  /* ---------- LOGIN ---------- */
  const login = async () => {
    if (!username.trim() || !password.trim())
      return alert("Enter username & password");

    const { data: userRow } = await supabase
      .from("profiles")
      .select("*")
      .eq("username", username)
      .maybeSingle();

    if (!userRow) return alert("User not found");
    if (userRow.password !== password) return alert("Incorrect password");

    onLogin(username);
  };

  return (
    <div className="login-page">
      <h2 className="login-title">Insta Clone</h2>

      <input
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />

      <input
        placeholder="Password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      {isSignup && (
        <label className="avatar-label">
          Upload Avatar (optional)
          <input
            type="file"
            onChange={(e) => setAvatar(e.target.files[0])}
            style={{ display: "none" }}
          />
        </label>
      )}

      <button onClick={isSignup ? signup : login}>
        {isSignup ? "Sign Up" : "Login"}
      </button>

      <p className="switch-link" onClick={() => setIsSignup(!isSignup)}>
        {isSignup ? "Already have an account? Login" : "Create new account"}
      </p>
    </div>
  );
}
