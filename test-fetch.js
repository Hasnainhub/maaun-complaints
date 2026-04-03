
const url = "https://vugaqcmajxkpulajmiks.supabase.co/rest/v1/";
console.log("Testing fetch to:", url);
fetch(url, { method: "HEAD" })
    .then(res => console.log("Response status:", res.status))
    .catch(err => console.error("Fetch failed error:", err));
