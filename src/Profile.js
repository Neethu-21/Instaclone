import React, { useState, useEffect } from "react";
import { supabase } from "./supabase";

export default function Profile({ currentUser, username }) {
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);

  const load = async () => {
    const { data: prof } = await supabase
      .from("profiles")
      .select("*")
      .eq("username", username)
      .single();
    setProfile(prof);

    const { data: userPosts } = await supabase
      .from("posts")
      .select("*")
      .eq("username", username)
      .order("time", { ascending: false });

    setPosts(userPosts || []);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [username]);

  return (
    <div className="profile-page">
      {profile && (
        <div className="profile-header">
          <img src={profile.avatar} alt="" className="avatar" />
          <h2>{profile.username}</h2>
          <p>{profile.bio}</p>
        </div>
      )}

      <div className="posts-grid">
        {posts.map((post) => (
          <img key={post.id} src={post.image} alt="" className="post-img" />
        ))}
      </div>
    </div>
  );
}
