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

export function isValidPayload({ roomId, username }) {
  const safeName = sanitizeName(username);
  return {
    valid: validateRoomId(roomId) && safeName.length >= 2,
    safeName
  };
}
