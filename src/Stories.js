import React, { useState, useEffect } from "react";
import { supabase } from "./supabase";

export default function Stories({ user }) {
  const [stories, setStories] = useState([]);
  const [file, setFile] = useState(null);

  const loadStories = async () => {
    const { data } = await supabase
      .from("stories")
      .select("*")
      .order("time", { ascending: false });
    setStories(data || []);
  };

  useEffect(() => {
    loadStories();
  }, []);

  const uploadStory = async () => {
    if (!file) return;

    const fileName = `${Date.now()}-${file.name}`;
    const { data: imageRes } = await supabase.storage
      .from("images")
      .upload(fileName, file);

    const url = supabase.storage.from("images").getPublicUrl(fileName).data
      .publicUrl;

    await supabase.from("stories").insert({
      username: user.email.split("@")[0],
      avatar: "",
      image: url,
      time: Date.now(),
    });

    setFile(null);
    loadStories();
  };

  return (
    <div className="stories-page">
      <div className="upload-box">
        <input type="file" onChange={(e) => setFile(e.target.files[0])} />
        <button onClick={uploadStory}>Upload Story</button>
      </div>

      <div className="stories-list">
        {stories.map((s) => (
          <img key={s.id} src={s.image} className="story-image" alt="" />
        ))}
      </div>
    </div>
  );
}
