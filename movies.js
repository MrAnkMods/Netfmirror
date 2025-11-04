// small catalog used by script.js / player.js
const movies = [
  {
    id: "sample-1",
    title: "Big Buck Bunny (Demo)",
    year: 2008,
    duration: "10m",
    poster: "poster1.jpg",      // replace by uploading poster1.jpg at root
    description: "Public domain demo video (Big Buck Bunny).",
    sources: {
      "720": "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
      "1080": "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
    },
    subtitles: {
      en: "sample.vtt" // If you have .srt, player.js will convert .srt -> vtt automatically
    }
  },
  {
    id: "sample-2",
    title: "Short Demo",
    year: 2024,
    duration: "7m",
    poster: "poster2.jpg",
    description: "Second demo title.",
    sources: {
      "720": "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4"
    },
    subtitles: {}
  }
];