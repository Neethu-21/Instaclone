import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(
  "https://bzzjrnutddparghpzxst.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ6empybnV0ZGRwYXJnaHB6eHN0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUxMDYzMzYsImV4cCI6MjA4MDY4MjMzNn0.fUmye9UrT6DHanF3sUlic910Mp-lZMTuJyzYDbuKkzk"
);
