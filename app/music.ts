export const NOTE_NAMES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
export const FLAT_NAMES = ["C", "Db", "D", "Eb", "E", "F", "Gb", "G", "Ab", "A", "Bb", "B"];
const noteValue: Record<string, number> = { C:0,"B#":0,"C#":1,Db:1,D:2,"D#":3,Eb:3,E:4,Fb:4,"E#":5,F:5,"F#":6,Gb:6,G:7,"G#":8,Ab:8,A:9,"A#":10,Bb:10,B:11,Cb:11 };

export function transposeChord(token: string, semitones: number, flats = false) {
  const match = token.match(/^([A-G](?:#|b)?)([^/\s]*)(?:\/([A-G](?:#|b)?))?$/);
  if (!match) return token;
  const names = flats ? FLAT_NAMES : NOTE_NAMES;
  const shift = (note: string) => names[(noteValue[note] + semitones + 120) % 12];
  return shift(match[1]) + match[2] + (match[3] ? `/${shift(match[3])}` : "");
}

export function transposeChordPro(text: string, semitones: number, flats = false) {
  return text.replace(/\[([^\]]+)\]/g, (_, chord) => `[${transposeChord(chord, semitones, flats)}]`);
}

export const TUNINGS: Record<string, number[]> = {
  Standard: [40,45,50,55,59,64],
  "Drop D": [38,45,50,55,59,64],
  DADGAD: [38,45,50,55,57,62],
};

const chordPatterns: Array<[string, number[]]> = [
  ["maj",[0,4,7]],["min",[0,3,7]],["dim",[0,3,6]],["aug",[0,4,8]],
  ["sus2",[0,2,7]],["sus4",[0,5,7]],["7",[0,4,7,10]],["maj7",[0,4,7,11]],
  ["m7",[0,3,7,10]],["6",[0,4,7,9]],["m6",[0,3,7,9]],["9",[0,2,4,7,10]],
  ["add9",[0,2,4,7]],["m9",[0,2,3,7,10]],
];

export function identifyChord(positions: (number | null)[], tuning = TUNINGS.Standard, capo = 0) {
  const midi = positions.flatMap((fret, i) => fret === null ? [] : [tuning[i] + fret + capo]);
  if (midi.length < 2) return { notes: midi.map(noteFromMidi), primary: "Incomplete voicing", alternatives: [] as string[] };
  const pcs = [...new Set(midi.map(n => n % 12))];
  const bass = Math.min(...midi) % 12;
  const matches: { name: string; score: number }[] = [];
  for (let root=0; root<12; root++) for (const [suffix, pattern] of chordPatterns) {
    const wanted = pattern.map(n => (root+n)%12);
    const missing = wanted.filter(n => !pcs.includes(n)).length;
    const extra = pcs.filter(n => !wanted.includes(n)).length;
    if (missing <= (pattern.length > 4 ? 1 : 0) && extra <= 1) {
      const label = NOTE_NAMES[root] + (suffix === "maj" ? "" : suffix === "min" ? "m" : suffix) + (bass !== root ? `/${NOTE_NAMES[bass]}` : "");
      matches.push({ name: label, score: missing*3 + extra*2 + (bass === root ? 0 : .4) });
    }
  }
  matches.sort((a,b) => a.score-b.score);
  return { notes: midi.map(noteFromMidi), primary: matches[0]?.name ?? "Ambiguous voicing", alternatives: matches.slice(1,4).map(m=>m.name) };
}

export function noteFromMidi(midi: number) { return `${NOTE_NAMES[midi%12]}${Math.floor(midi/12)-1}`; }

export function frequencyToNote(frequency: number, reference=440) {
  const midi = 69 + 12 * Math.log2(frequency/reference);
  const rounded = Math.round(midi);
  return { midi: rounded, note: NOTE_NAMES[(rounded+120)%12], octave: Math.floor(rounded/12)-1, cents: Math.round((midi-rounded)*100), target: reference*Math.pow(2,(rounded-69)/12) };
}

export function autoCorrelate(buffer: Float32Array, sampleRate: number) {
  let rms=0; for (const v of buffer) rms += v*v; rms=Math.sqrt(rms/buffer.length);
  if (rms < .012) return -1;
  const minLag=Math.floor(sampleRate/1200), maxLag=Math.min(Math.floor(sampleRate/60), buffer.length-1);
  let bestLag=-1, best=0;
  for(let lag=minLag;lag<=maxLag;lag++) { let corr=0; for(let i=0;i<buffer.length-lag;i++) corr += buffer[i]*buffer[i+lag]; if(corr>best){best=corr;bestLag=lag;} }
  if(bestLag<0 || best/(buffer.length-bestLag)<.002) return -1;
  return sampleRate/bestLag;
}
