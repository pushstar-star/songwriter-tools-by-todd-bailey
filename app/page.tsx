"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

type Song = {
  id: string;
  title: string;
  artist: string;
  meta: string;
  content: string;
};

const chordLine = /^[\s|()xX0-9A-G#bmsujdi/\-.+]+$/;

function PlayIcon({ playing }: { playing: boolean }) {
  return playing ? (
    <span className="pause-icon" aria-hidden="true"><i /><i /></span>
  ) : (
    <span className="play-icon" aria-hidden="true" />
  );
}

export default function Home() {
  const [songs, setSongs] = useState<Song[]>([]);
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(28);
  const [fontSize, setFontSize] = useState(18);
  const [showChords, setShowChords] = useState(true);
  const [wakeActive, setWakeActive] = useState(false);
  const [offlineReady, setOfflineReady] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const wakeLock = useRef<{ release: () => Promise<void> } | null>(null);
  const frame = useRef<number | null>(null);
  const previousTime = useRef<number | null>(null);

  useEffect(() => {
    setIsOnline(navigator.onLine);
    fetch("/songs.json")
      .then((response) => response.json())
      .then(setSongs)
      .catch(() => undefined);
    const savedSpeed = Number(localStorage.getItem("stage-scroll-speed"));
    const savedFont = Number(localStorage.getItem("stage-font-size"));
    if (savedSpeed) setSpeed(savedSpeed);
    if (savedFont) setFontSize(savedFont);

    const online = () => setIsOnline(true);
    const offline = () => setIsOnline(false);
    window.addEventListener("online", online);
    window.addEventListener("offline", offline);

    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .then(() => navigator.serviceWorker.ready)
        .then(() => setOfflineReady(true))
        .catch(() => setOfflineReady(false));
    }

    return () => {
      window.removeEventListener("online", online);
      window.removeEventListener("offline", offline);
    };
  }, []);

  useEffect(() => localStorage.setItem("stage-scroll-speed", String(speed)), [speed]);
  useEffect(() => localStorage.setItem("stage-font-size", String(fontSize)), [fontSize]);

  const currentIndex = songs.findIndex((song) => song.id === currentId);
  const song = currentIndex >= 0 ? songs[currentIndex] : null;

  const stop = useCallback(() => {
    setPlaying(false);
    previousTime.current = null;
    if (frame.current) cancelAnimationFrame(frame.current);
  }, []);

  useEffect(() => {
    if (!playing) return;
    const tick = (now: number) => {
      if (previousTime.current !== null) {
        const delta = Math.min((now - previousTime.current) / 1000, 0.1);
        window.scrollBy(0, speed * delta);
        if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4) {
          stop();
          return;
        }
      }
      previousTime.current = now;
      frame.current = requestAnimationFrame(tick);
    };
    frame.current = requestAnimationFrame(tick);
    return () => {
      if (frame.current) cancelAnimationFrame(frame.current);
      previousTime.current = null;
    };
  }, [playing, speed, stop]);

  useEffect(() => {
    const resumeWakeLock = async () => {
      if (!playing || wakeLock.current || !("wakeLock" in navigator)) return;
      try {
        wakeLock.current = await navigator.wakeLock.request("screen");
        setWakeActive(true);
        wakeLock.current.addEventListener?.("release", () => setWakeActive(false));
      } catch {
        setWakeActive(false);
      }
    };
    resumeWakeLock();
    const onVisibility = () => {
      if (document.visibilityState === "visible") resumeWakeLock();
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, [playing]);

  const selectSong = (id: string) => {
    stop();
    setCurrentId(id);
    window.scrollTo({ top: 0 });
  };

  const goToSong = (offset: number) => {
    if (!songs.length) return;
    const next = (currentIndex + offset + songs.length) % songs.length;
    selectSong(songs[next].id);
  };

  const lines = useMemo(() => {
    if (!song) return [];
    return song.content.split("\n").filter((line) => showChords || !chordLine.test(line.trim()));
  }, [song, showChords]);

  if (!song) {
    return (
      <main className="library">
        <header className="library-hero">
          <div className="brand-mark">SC</div>
          <p className="eyebrow">YOUR STAGE SONGBOOK</p>
          <h1>Stage Chords</h1>
          <p className="intro">
            Pick a song, clip in, and let the page move with you.
          </p>
        </header>
        <section className="song-list" aria-label="Songs">
          <div className="list-heading">
            <span>SET LIST</span>
            <span>{songs.length || "—"} SONGS</span>
          </div>
          {songs.map((item, index) => (
            <button className="song-card" key={item.id} onClick={() => selectSong(item.id)}>
              <span className="track-number">{String(index + 1).padStart(2, "0")}</span>
              <span className="track-copy">
                <strong>{item.title}</strong>
                <small>{item.artist}</small>
                <em>{item.meta}</em>
              </span>
              <span className="arrow" aria-hidden="true">→</span>
            </button>
          ))}
        </section>
        <footer className="library-footer">
          <span className={`status-dot ${offlineReady ? "saved" : ""}`} />
          {!isOnline ? "Working offline" : offlineReady ? "Saved for offline use" : "Saving for offline use…"}
        </footer>
      </main>
    );
  }

  return (
    <main className="player" style={{ "--song-font": `${fontSize}px` } as React.CSSProperties}>
      <nav className="player-nav">
        <button onClick={() => { stop(); setCurrentId(null); }} aria-label="Back to set list">←</button>
        <div>
          <span>{String(currentIndex + 1).padStart(2, "0")} / {String(songs.length).padStart(2, "0")}</span>
          <strong>STAGE CHORDS</strong>
        </div>
        <button onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} aria-label="Scroll to top">↑</button>
      </nav>

      <article className="song-sheet">
        <header className="song-header">
          <p>{song.meta}</p>
          <h1>{song.title}</h1>
          <h2>{song.artist}</h2>
        </header>
        <div className="rule" />
        <div className="lyrics" aria-label={`Chords and lyrics for ${song.title}`}>
          {lines.map((line, index) => {
            const trimmed = line.trim();
            const isSection = /^\[.+\]$/.test(trimmed) || /^\*.+\*$/.test(trimmed);
            const isMedley = trimmed.includes("MEDLEY CHANGE");
            const isRule = /^━+$/.test(trimmed);
            const isChord = trimmed.length > 0 && chordLine.test(trimmed);
            if (isRule) return null;
            return (
              <div
                key={`${index}-${line}`}
                className={`${isSection ? "section-label" : ""} ${isMedley ? "medley-change" : ""} ${isChord ? "chord-line" : ""}`}
              >
                {line || "\u00a0"}
              </div>
            );
          })}
        </div>
        <div className="end-mark">
          <span>END</span>
          <div />
        </div>
      </article>

      <section className="control-dock" aria-label="Performance controls">
        <div className="control-row">
          <button className="side-button" onClick={() => goToSong(-1)} aria-label="Previous song">‹</button>
          <button className={`main-button ${playing ? "is-playing" : ""}`} onClick={() => setPlaying((value) => !value)}>
            <PlayIcon playing={playing} />
            <span>{playing ? "PAUSE" : "AUTO-SCROLL"}</span>
          </button>
          <button className="side-button" onClick={() => goToSong(1)} aria-label="Next song">›</button>
        </div>
        <div className="sliders">
          <label>
            <span>SCROLL SPEED</span>
            <output>{speed}</output>
            <input type="range" min="6" max="80" value={speed} onChange={(event) => setSpeed(Number(event.target.value))} />
            <small><i>SLOW</i><i>FAST</i></small>
          </label>
          <label>
            <span>TEXT SIZE</span>
            <output>{fontSize}</output>
            <input type="range" min="14" max="30" value={fontSize} onChange={(event) => setFontSize(Number(event.target.value))} />
            <small><i>A</i><i className="large-a">A</i></small>
          </label>
        </div>
        <div className="dock-footer">
          <button onClick={() => setShowChords((value) => !value)}>
            <span className={showChords ? "toggle on" : "toggle"}><i /></span>
            Chords
          </button>
          <span className={wakeActive ? "awake active" : "awake"}><i /> {wakeActive ? "Screen awake" : "Screen wakes when playing"}</span>
        </div>
      </section>
    </main>
  );
}
