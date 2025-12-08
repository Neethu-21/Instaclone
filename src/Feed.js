import React, { useEffect, useState } from "react";
import { supabase } from "./supabase";

const IMGBB_KEY = "668793f8372c594c8dc0efe3410ededc";

export default function Feed({ user, openProfile }) {
  // ---------------- Hooks (must be first) ----------------
  const [posts, setPosts] = useState([]);
  const [caption, setCaption] = useState("");
  const [file, setFile] = useState(null);
  const [menuPost, setMenuPost] = useState(null);

  // Never fails even if metadata missing
  const myUsername = (user?.user_metadata?.username || user?.email?.split("@")[0] || "user").toString();
  const myAvatar = user?.user_metadata?.avatar || "https://cdn-icons-png.flaticon.com/512/149/149071.png";

  // ---------------- Load posts live ----------------
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

  // ---------------- Upload to imgbb ----------------
  const uploadImage = async () => {
    if (!file) return "";
    const fd = new FormData();
    fd.append("image", file);
    const r = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_KEY}`, {
      method: "POST",
      body: fd,
    });
    const j = await r.json();
    return j.data.url;
  };

  // ---------------- Add Post ----------------
  const addPost = async () => {
    if (!caption.trim() && !file) return alert("Add caption or image");
    const img = file ? await uploadImage() : "";
    await supabase.from("posts").insert({
      username: myUsername,
      avatar: myAvatar,
      caption,
      image: img,
      likes: [],
      comments: [],
      time: Date.now(),
    });
    setCaption("");
    setFile(null);
  };

  // ---------------- Like ----------------
  const likePost = async (post) => {
    if (post.likes.includes(myUsername)) return;
    await supabase
      .from("posts")
      .update({ likes: [...post.likes, myUsername] })
      .eq("id", post.id);
  };

  // ---------------- Comment ----------------
  const addComment = async (post, text) => {
    if (!text.trim()) return;
    const updated = [...post.comments, { user: myUsername, text }];
    await supabase
      .from("posts")
      .update({ comments: updated })
      .eq("id", post.id);
  };

  // ---------------- Edit ----------------
  const editPost = async (post) => {
    const newCap = prompt("New caption:", post.caption);
    if (!newCap) return;
    await supabase.from("posts").update({ caption: newCap }).eq("id", post.id);
    setMenuPost(null);
  };

  // ---------------- Delete ----------------
  const deletePost = async (post) => {
    await supabase.from("posts").delete().eq("id", post.id);
    setMenuPost(null);
  };

  // ---------------- UI (after hooks) ----------------
  return (
    <div className="feed">
      <div className="create-box">
        <textarea
          placeholder="Write a caption..."
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
        />
        <input type="file" onChange={(e) => setFile(e.target.files[0])} />
        <button onClick={addPost}>Share</button>
      </div>

      {posts.map((p) => (
        <div key={p.id} className="post">
          <div className="post-header">
            <div className="post-user" onClick={() => openProfile(p.username)}>
              <img src={p.avatar} alt="" className="avatar-small" />
              <strong>@{p.username}</strong>
            </div>
            <span className="dots" onClick={() => setMenuPost(p)}>⋯</span>
          </div>

          {p.image && <img src={p.image} alt="" className="post-img" />}

          <div className="post-actions">
            <button onClick={() => likePost(p)}>
              {p.likes.includes(myUsername) ? "❤️" : "🤍"}
            </button>
          </div>

          <p className="likes">{p.likes.length} likes</p>

          <p className="caption">
            <strong>@{p.username}</strong> {p.caption}
          </p>

          {p.comments.map((c, i) => (
            <p key={i} className="comment">
              <strong>@{c.user}</strong> {c.text}
            </p>
          ))}

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

      {menuPost && (
        <div className="menu-popup">
          {menuPost.username === myUsername ? (
            <>
              <button onClick={() => editPost(menuPost)}>✏ Edit caption</button>
              <button onClick={() => deletePost(menuPost)}>🗑 Delete post</button>
            </>
          ) : (
            <button onClick={() => alert("Reported")}>🚨 Report post</button>
          )}
          <button onClick={() => setMenuPost(null)}>Close</button>
        </div>
      )}
    </div>
  );
}
