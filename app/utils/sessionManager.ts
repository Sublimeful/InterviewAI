export function generateSessionId() {
  return `interview_${Date.now()}_${crypto.randomUUID()}`;
}
