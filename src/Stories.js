import React, { useState, useEffect } from "react";
import { supabase } from "./supabase";

export default function Stories() {
  const [stories, setStories] = useState([]);
  const [uploading, setUploading] = useState(false);

  // Load all stored stories from DB
  const loadStories = async () => {
    const { data, error } = await supabase.from("stories").select("*").order("id", { ascending: false });
    if (!error) setStories(data);
  };

  useEffect(() => {
    loadStories();
  }, []);

  const uploadStory = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);

    // Step 1 → Upload to Supabase Storage
    const fileName = `${Date.now()}-${file.name}`;
    const { error: storageError } = await supabase.storage
      .from("stories") // bucket name
      .upload(fileName, file);

    if (storageError) {
      alert("Upload failed!");
      setUploading(false);
      return;
    }

    // Step 2 → Get the public URL of uploaded image
    const { data: urlData } = supabase.storage
      .from("stories")
      .getPublicUrl(fileName);

    const imageUrl = urlData.publicUrl;   // ← this is the URL returned (imageRes equivalent)

    // Step 3 → Store URL in DB
    const { error } = await supabase
      .from("stories")
      .insert([{ image: imageUrl }]);

    if (!error) {
      setStories((prev) => [{ image: imageUrl }, ...prev]); // display instantly
    }

    setUploading(false);
  };

  return (
    <div>
      <h2>Stories</h2>

      <input type="file" accept="image/*" onChange={uploadStory} />
      {uploading && <p>Uploading...</p>}

      <div className="stories-container">
        {stories.map((story, index) => (
          <img
            key={index}
            src={story.image}
            alt="story"
            className="story-image"
          />
        ))}
      </div>
    </div>
  );
}
