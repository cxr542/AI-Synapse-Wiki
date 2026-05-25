/** 등록용 제목: 영문·한글이 함께 있으면 영문 우선 (scripts/prefer-english-title.mjs 와 동일 규칙) */
const hasHangul = (text: string) => /[\uAC00-\uD7A3]/.test(text);
const hasLatin = (text: string) => /[A-Za-z]/.test(text);
const LATIN_RUN = /[A-Za-z][A-Za-z0-9.'+\s-]*/g;

function latinChars(text: string): number {
  return (text.match(/[A-Za-z]/g) ?? []).length;
}

export function preferEnglishTopicTitle(text: string): string {
  const t = text.trim();
  if (!t || !hasHangul(t)) return t;

  const paren = t.match(/[(\[（]([^)\]）]+)[)\]）]/);
  if (paren) {
    const inner = paren[1].trim();
    if (hasLatin(inner) && !hasHangul(inner)) return inner;
    if (hasLatin(inner)) {
      const nested = preferEnglishTopicTitle(inner);
      if (nested !== inner) return nested;
      if (!hasHangul(nested)) return nested;
    }
  }

  for (const sep of [" / ", " | ", " · ", " - ", " – ", " — ", "/"]) {
    if (t.includes(sep)) {
      const parts = t
        .split(sep)
        .map((s) => s.trim())
        .filter(Boolean);
      const english = parts.find((p) => hasLatin(p) && !hasHangul(p));
      if (english) return preferEnglishTopicTitle(english);
      const latinHeavy = parts
        .filter((p) => hasLatin(p))
        .sort((a, b) => latinChars(b) - latinChars(a))[0];
      if (latinHeavy) return preferEnglishTopicTitle(latinHeavy);
    }
  }

  const lead = t.match(/^([A-Za-z][A-Za-z0-9.'+\s-]*?)(?=[\uAC00-\uD7A3]|$)/);
  if (lead) {
    const s = lead[1].trim();
    if (s.length >= 2) return s;
  }

  const trail = t.match(/(?:^|[\uAC00-\uD7A3\s]+)([A-Za-z][A-Za-z0-9.'+\s-]+)$/);
  if (trail) {
    const s = trail[1].trim();
    if (s.length >= 2) return s;
  }

  const chunks = [...t.matchAll(LATIN_RUN)]
    .map((m) => m[0].trim())
    .filter((s) => s.length >= 2);
  if (chunks.length) {
    return chunks.sort((a, b) => b.length - a.length)[0];
  }

  return t;
}
