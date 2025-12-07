// Profile.js
import React, { useEffect, useState } from "react";
import { supabase } from "./supabase";

export default function Profile({ currentUser, viewingUser, logout, openProfile }) {
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [bio, setBio] = useState("");
  const [avatar, setAvatar] = useState("");
  const [file, setFile] = useState(null);
  const [editing, setEditing] = useState(false);
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);

  const IMGBB_KEY = "668793f8372c594c8dc0efe3410ededc";

  const uploadAvatar = async () => {
    if (!file) return avatar;
    let fd = new FormData();
    fd.append("image", file);
    const r = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_KEY}`, { method: "POST", body: fd });
    const d = await r.json();
    return d.data.url;
  };

  const load = async () => {
    // profile
    const { data: p } = await supabase.from("profiles").select("*").eq("username", viewingUser).single();
    setProfile(p);
    setBio(p?.bio || "");
    setAvatar(p?.avatar || "");

    // posts
    const { data: postData } = await supabase.from("posts").select("*").eq("username", viewingUser);
    setPosts(postData || []);

    // followers
    const { data: fols } = await supabase.from("follows").select("follower").eq("following", viewingUser);
    setFollowers(fols?.map((f) => f.follower) || []);

    // following
    const { data: flw } = await supabase.from("follows").select("following").eq("follower", viewingUser);
    setFollowing(flw?.map((f) => f.following) || []);
  };

  useEffect(() => {
    load();
  }, [viewingUser]);

  const saveProfile = async () => {
    const newAvatar = await uploadAvatar();
    await supabase.from("profiles").update({ bio, avatar: newAvatar }).eq("username", currentUser);
    setEditing(false);
    load();
  };

  const toggleFollow = async () => {
    if (followers.includes(currentUser)) {
      await supabase.from("follows").delete().eq("follower", currentUser).eq("following", viewingUser);
    } else {
      await supabase.from("follows").insert({ follower: currentUser, following: viewingUser });
    }
    load();
  };

  if (!profile) return <p>Loading...</p>;

  return (
    <div className="profile-page">
      <img src={avatar || "https://cdn-icons-png.flaticon.com/512/149/149071.png"} className="profile-avatar" />

      <h2>@{viewingUser}</h2>
      <div className="profile-stats">
        <span><b>{posts.length}</b> posts</span>
        <span><b>{followers.length}</b> followers</span>
        <span><b>{following.length}</b> following</span>
      </div>

      {viewingUser === currentUser ? (
        <>
          <button onClick={() => setEditing(true)}>Edit Profile</button>
          <button onClick={logout}>Logout</button>
        </>
      ) : (
        <button onClick={toggleFollow}>
          {followers.includes(currentUser) ? "Following" : "Follow"}
        </button>
      )}

      <p className="profile-bio">{profile.bio}</p>

      {/* posts grid */}
      <div className="profile-grid">
        {posts.map((p) => p.image && <img key={p.id} src={p.image} alt="" />)}
      </div>

      {editing && (
        <div className="edit-popup">
          <input value={bio} onChange={(e) => setBio(e.target.value)} />
          <input type="file" onChange={(e) => setFile(e.target.files[0])} />
          <button onClick={saveProfile}>Save</button>
          <button onClick={() => setEditing(false)}>Cancel</button>
        </div>
      )}
    </div>
  );
}
