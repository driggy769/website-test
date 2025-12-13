const API_KEY = "AIzaSyDRXu9kE4sVit3W6opZdasW83GnwM7ciiI";
const CHANNEL_ID = "UC3VLKH3P1dCoy9FNnkQVy0A";
const MAX_RESULTS = 6;

const url = `https://www.googleapis.com/youtube/v3/search?key=${API_KEY}&channelId=${CHANNEL_ID}&part=snippet,id&order=date&maxResults=${MAX_RESULTS}`;

fetch(url)
  .then(res => res.json())
  .then(data => {
    const container = document.getElementById("youtube-videos");
    container.innerHTML = ""; // remove skeletons

    data.items.forEach(item => {
      if (!item.id.videoId) return;

      const date = new Date(item.snippet.publishedAt)
        .toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });

      const video = document.createElement("div");
      video.className = "video";

      video.innerHTML = `
        <iframe
          src="https://www.youtube.com/embed/${item.id.videoId}"
          loading="lazy"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowfullscreen
        ></iframe>
        <div class="video-info">
          <h3>${item.snippet.title}</h3>
          <span>${date}</span>
        </div>
      `;

      container.appendChild(video);
    });
  })
  .catch(console.error);
