let counter = 0;

// Collision-resistant id — Date.now() alone repeats within the same
// millisecond on a fast double-tap (common on mobile), which caused
// duplicate React keys and visual ghosting in lists built from it.
export function generateId(prefix = 'id') {
  counter += 1;
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return `${prefix}-${crypto.randomUUID()}`;
  }
  return `${prefix}-${Date.now()}-${counter}-${Math.random().toString(36).slice(2, 8)}`;
}
