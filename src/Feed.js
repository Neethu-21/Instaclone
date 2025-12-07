// Feed.js — FINAL STABLE VERSION
import React, { useEffect, useState } from "react";
import { supabase } from "./supabase";

const IMGBB_KEY = process.env.REACT_APP_IMGBB_KEY;


export default function Feed({ user, openProfile }) {
  if (!user) return null;

  // safe username + avatar
  const myUsername =
    user?.user_metadata?.username ||
    user?.email?.split("@")[0] ||
    "user";

  const myAvatar =
    user?.user_metadata?.avatar ||
    "https://cdn-icons-png.flaticon.com/512/149/149071.png";

  const [posts, setPosts] = useState([]);
  const [caption, setCaption] = useState("");
  const [file, setFile] = useState(null);
  const [menuPost, setMenuPost] = useState(null);

  // fetch posts live
  const loadPosts = async () => {
    const { data } = await supabase.from("posts").select("*");
    const sorted = (data || []).sort((a, b) => b.time - a.time);
    setPosts(sorted);
  };

  useEffect(() => {
    loadPosts();
    const channel = supabase
      .channel("posts")
      .on("postgres_changes", { event: "*", schema: "public", table: "posts" }, loadPosts)
      .subscribe();
    return () => supabase.removeChannel(channel);
  }, []);

  // upload image to imgbb
  const uploadImage = async () => {
    if (!file) return "";
    let form = new FormData();
    form.append("image", file);
    const r = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_KEY}`, {
      method: "POST",
      body: form,
    });
    const j = await r.json();
    return j.data.url;
  };

  // create new post
  const addPost = async () => {
    if (!caption.trim() && !file) return alert("Enter caption or image");

    const imageUrl = file ? await uploadImage() : "";

    await supabase.from("posts").insert({
      username: myUsername,
      avatar: myAvatar,
      caption,
      image: imageUrl,
      likes: [],
      comments: [],
      time: Date.now(),
    });

    setCaption("");
    setFile(null);
  };

  // like only once
  const likePost = async (post) => {
    if (post.likes.includes(myUsername)) return;
    await supabase
      .from("posts")
      .update({ likes: [...post.likes, myUsername] })
      .eq("id", post.id);
  };

  // add comment
  const addComment = async (post, text) => {
    if (!text.trim()) return;
    const updated = [...post.comments, { user: myUsername, text }];
    await supabase.from("posts").update({ comments: updated }).eq("id", post.id);
  };

  // delete post
  const deletePost = async (post) => {
    await supabase.from("posts").delete().eq("id", post.id);
    setMenuPost(null);
  };

  // edit caption
  const editPost = async (post) => {
    const newCap = prompt("New caption:", post.caption);
    if (newCap === null) return;
    await supabase.from("posts").update({ caption: newCap }).eq("id", post.id);
    setMenuPost(null);
  };

  return (
    <div className="feed">

      {/* Create post box */}
      <div className="create-box">
        <textarea
          placeholder="Write a caption..."
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
        />
        <input type="file" onChange={(e) => setFile(e.target.files[0])} />
        <button onClick={addPost}>Share</button>
      </div>

      {/* Posts */}
      {posts.map((p) => (
        <div key={p.id} className="post">

          {/* Post header */}
          <div className="post-header">
            <div className="post-user" onClick={() => openProfile(p.username)}>
              <img src={p.avatar} className="avatar-small" alt="" />
              <strong>@{p.username}</strong>
            </div>
            <span className="dots" onClick={() => setMenuPost(p)}>⋯</span>
          </div>

          {/* Image */}
          {p.image && <img src={p.image} alt="" className="post-img" />}

          {/* Like */}
          <div className="post-actions">
            <button onClick={() => likePost(p)}>
              {p.likes.includes(myUsername) ? "❤️" : "🤍"}
            </button>
          </div>

          {/* Likes count */}
          <p className="likes">{p.likes.length} likes</p>

          {/* Caption */}
          <p className="caption">
            <strong>@{p.username}</strong> {p.caption}
          </p>

          {/* Comments */}
          {p.comments.map((c, i) => (
            <p key={i} className="comment">
              <strong>@{c.user}</strong> {c.text}
            </p>
          ))}

          {/* Add comment */}
          <input
            className="comment-input"
            placeholder="Add a comment…"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                addComment(p, e.target.value);
                e.target.value = "";
              }
            }}
          />
        </div>
      ))}

      {/* 3 dots menu popup */}
      {menuPost && (
        <div className="menu-popup">
          {menuPost.username === myUsername ? (
            <>
              <button onClick={() => editPost(menuPost)}>✏ Edit caption</button>
              <button onClick={() => deletePost(menuPost)}>🗑 Delete post</button>
            </>
          ) : (
            <button onClick={() => alert("Reported successfully")}>
              🚨 Report post
            </button>
          )}
          <button onClick={() => setMenuPost(null)}>Close</button>
        </div>
      )}
    </div>
  );
}
