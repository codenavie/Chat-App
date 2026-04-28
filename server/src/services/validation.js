const roomRegex = /^[A-Za-z0-9_-]{3,24}$/;

export function sanitizeName(input) {
  return String(input || '')
    .replace(/[^\w\s-]/g, '')
    .trim()
    .slice(0, 24);
}

export function validateRoomId(roomId) {
  return roomRegex.test(String(roomId || '').trim());
}

export function validatePassword(password) {
  const value = String(password || '');
  return value.length >= 6 && value.length <= 64;
}

export function isValidPayload({ roomId, username }) {
  const safeName = sanitizeName(username);
  return {
    valid: validateRoomId(roomId) && safeName.length >= 2,
    safeName
  };
}
