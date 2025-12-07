// Stories.js
import React, { useEffect, useState } from "react";
import { supabase } from "./supabase";

const IMGBB_KEY = "668793f8372c594c8dc0efe3410ededc";

export default function Stories({ user }) {
  const username = user;
  const [stories, setStories] = useState([]);
  const [file, setFile] = useState(null);
  const [viewer, setViewer] = useState(null);
  const [index, setIndex] = useState(0);

  const loadStories = async () => {
    const now = Date.now();
    const { data } = await supabase.from("stories").select("*");
    const valid = (data || []).filter((s) => now - s.time < 86400000);
    setStories(valid);
  };

  useEffect(() => {
    loadStories();
    const ch = supabase.channel("stories")
      .on("postgres_changes", { event: "*", schema: "public", table: "stories" }, loadStories)
      .subscribe();
    return () => supabase.removeChannel(ch);
  }, []);

  const uploadStory = async () => {
    if (!file) return alert("Select an image");
    let fd = new FormData();
    fd.append("image", file);
    const r = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_KEY}`, { method: "POST", body: fd });
    const d = await r.json();
    await supabase.from("stories").insert({ username, image: d.data.url, time: Date.now() });
    setFile(null);
  };

  const deleteStory = async (story) => {
    await supabase.from("stories").delete().eq("id", story.id);
    setViewer(null);
  };

  const next = () => {
    if (index === viewer.length - 1) return setViewer(null);
    setIndex(index + 1);
  };

  return (
    <div className="stories-page">
      <div className="add-story-box">
        <input type="file" onChange={(e) => setFile(e.target.files[0])} />
        <button onClick={uploadStory}>Add Story</button>
      </div>

      <div className="story-row">
        {stories.map((s, i) => (
          <div key={s.id} className="story-bubble" onClick={() => { setViewer(stories); setIndex(i); }}>
            <img src={s.image} />
            <p>@{s.username}</p>
          </div>
        ))}
      </div>

      {viewer && (
        <div className="story-viewer" onClick={next}>
          <img src={viewer[index].image} />

          <div className="story-user">@{viewer[index].username}</div>

          {viewer[index].username === username && (
            <button className="story-delete" onClick={(e) => { e.stopPropagation(); deleteStory(viewer[index]); }}>
              🗑 Delete
            </button>
          )}
        </div>
      )}
    </div>
  );
}
