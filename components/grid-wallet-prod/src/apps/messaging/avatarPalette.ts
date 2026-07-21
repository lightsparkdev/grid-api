/** WhatsApp generic-avatar palette (sampled from the reference chat-list
 *  screenshots): a pastel tile with a deeper same-hue person glyph. Assigned
 *  to human bank recipients by name hash — random-looking but stable, so a
 *  recipient keeps their color across rows, lists, and re-renders. */
export interface AvatarColor {
  bg: string;
  fg: string;
}

export const AVATAR_COLORS: AvatarColor[] = [
  { bg: '#dff3d8', fg: '#59a85c' }, // green
  { bg: '#fbe2d4', fg: '#d9634b' }, // peach
  { bg: '#f8eccf', fg: '#b29140' }, // sand
  { bg: '#f7d7da', fg: '#c6444c' }, // rose
  { bg: '#d7eeef', fg: '#45969b' }, // teal
  { bg: '#f0e1d3', fg: '#be8968' }, // clay
];

/** Stable "random" pick: tiny string hash → palette index. */
export function avatarColor(name: string): AvatarColor {
  let h = 0;
  for (let i = 0; i < name.length; i += 1) {
    h = (h * 31 + name.charCodeAt(i)) | 0;
  }
  return AVATAR_COLORS[Math.abs(h) % AVATAR_COLORS.length];
}
