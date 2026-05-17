// Alphabet without visually ambiguous chars: 0/O, 1/I, 5/S, 2/Z
const ALPHABET = "ABCDEFGHJKLMNPQRTUVWXY3467";

export function generateRoomCode(length = 6): string {
  let code = "";
  for (let i = 0; i < length; i++) {
    code += ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
  }
  return code;
}
