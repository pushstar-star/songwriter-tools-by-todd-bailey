import { readFileSync, writeFileSync } from "node:fs";

const lines = readFileSync("/private/tmp/codex_songs.txt", "utf8")
  .replaceAll("\u00a0", " ")
  .split(/\r?\n/);
const lines2 = readFileSync("/private/tmp/codex_songs2.txt", "utf8")
  .replaceAll("\u00a0", " ")
  .split(/\r?\n/);

const range = (start, end) =>
  lines
    .slice(start - 1, end)
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

const range2 = (start, end) =>
  lines2
    .slice(start - 1, end)
    .join("\n")
    .replace(/^Intro\. Chords:\s*(.+)$/gm, "[Intro]\n$1")
    .replace(/^Verse (\d+):$/gm, "[Verse $1]")
    .replace(/^Chrous:$/gm, "[Chorus]")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

const songs = [
  {
    id: "toes",
    title: "Toes",
    artist: "Zac Brown Band",
    meta: "Capo 2",
    content: range(54, 260),
  },
  {
    id: "all-the-pretty-girls",
    title: "All the Pretty Girls",
    artist: "Kenny Chesney",
    meta: "Capo 4",
    content: range(323, 418),
  },
  {
    id: "good",
    title: "Good",
    artist: "Better Than Ezra",
    meta: "No capo",
    content: range(469, 553),
  },
  {
    id: "sex-and-candy",
    title: "Sex and Candy",
    artist: "Marcy Playground",
    meta: "No capo",
    content: range(619, 693),
  },
  {
    id: "time-of-your-life",
    title: "Good Riddance (Time of Your Life)",
    artist: "Green Day",
    meta: "Key G · No capo",
    content: range(816, 883),
  },
  {
    id: "talladega",
    title: "Talladega",
    artist: "Eric Church",
    meta: "Capo 1",
    content: range(921, 1017),
  },
  {
    id: "steal-my-kisses",
    title: "Steal My Kisses",
    artist: "Ben Harper & The Innocent Criminals",
    meta: "No capo",
    content: range(1052, 1137),
  },
  {
    id: "cold-beer-take-it-easy",
    title: "Cold Beer Calling My Name → Take It Easy",
    artist: "Jameson Rodgers feat. Luke Combs / Eagles",
    meta: "Medley · Key G · No capo",
    content: `${range(1191, 1278)}


━━━━━━━━━━━━━━━━━━━━━━━━━━━━
MEDLEY CHANGE → TAKE IT EASY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${range(1358, 1430)}`,
  },
  {
    id: "good-lord-lorrie",
    title: "Good Lord Lorrie",
    artist: "Turnpike Troubadours",
    meta: "No capo",
    content: range2(57, 145),
  },
  {
    id: "give-me-one-reason",
    title: "Give Me One Reason",
    artist: "Tracy Chapman",
    meta: "Key F# · Capo 2",
    content: range2(175, 246),
  },
  {
    id: "sixth-avenue-heartache",
    title: "6th Avenue Heartache",
    artist: "The Wallflowers",
    meta: "No capo",
    content: range2(258, 372),
  },
  {
    id: "country-girl-shake-it-for-me",
    title: "Country Girl (Shake It for Me)",
    artist: "Luke Bryan",
    meta: "No capo",
    content: range2(398, 587),
  },
  {
    id: "need-a-favor",
    title: "Need a Favor",
    artist: "Jelly Roll",
    meta: "Capo 4",
    content: range2(623, 734),
  },
];

writeFileSync("public/songs.json", JSON.stringify(songs, null, 2));
