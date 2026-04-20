export interface DiffSegment {
  text: string;
  type: 'match' | 'wrong' | 'missing';
}

export function charDiff(userText: string, correctText: string): DiffSegment[] {
  const segments: DiffSegment[] = [];
  const u = userText.toLowerCase();
  const c = correctText.toLowerCase();
  let ui = 0;
  let ci = 0;

  while (ui < u.length && ci < c.length) {
    if (u[ui] === c[ci]) {
      let matchStart = ui;
      while (ui < u.length && ci < c.length && u[ui] === c[ci]) {
        ui++;
        ci++;
      }
      segments.push({ text: userText.slice(matchStart, ui), type: 'match' });
    } else {
      let wrongStart = ui;
      ui++;
      segments.push({ text: userText.slice(wrongStart, ui), type: 'wrong' });
      ci++;
    }
  }

  if (ui < u.length) {
    segments.push({ text: userText.slice(ui), type: 'wrong' });
  }
  if (ci < c.length) {
    segments.push({ text: correctText.slice(ci), type: 'missing' });
  }

  return segments;
}
