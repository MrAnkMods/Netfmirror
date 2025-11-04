// small movie catalog used by script.js / player.js
const movies = [
  {
    id: "sample-1",
    title: "Big Buck Bunny (Demo)",
    year: 2008,
    duration: "10m",
    poster: "poster1.jpg", // upload poster1.jpg at root
    description:
      "A fun, high-quality animated short film — perfect for testing playback and streaming features.",
    sources: {
      "720p": "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
      "1080p": "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
    },
    subtitles: {
      en: "sample.vtt" // auto-handled by player.js (supports .vtt or .srt)
    }
  },

  {
    id: "sample-2",
    title: "For Bigger Joyrides",
    year: 2024,
    duration: "7m",
    poster: "poster2.jpg", // upload poster2.jpg at root
    description:
      "Another public-domain sample — ideal for testing responsive UI and controls.",
    sources: {
      "720p": "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4",
      "1080p": "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4"
    },
    subtitles: {}
  },

  {
    id: "sample-3",
    title: "Sintel (Demo Movie)",
    year: 2010,
    duration: "15m",
    poster: "poster3.jpg", // optional third poster
    description:
      "Blender Foundation’s short fantasy film — beautiful visuals and story, free for demo playback.",
    sources: {
      "720p": "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4",
      "1080p": "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4"
    },
    subtitles: {}
  }
];