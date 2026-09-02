export const USERS = [
  { id: 'maya', name: 'Maya Chen', initials: 'MC', color: '#7c5cff' },
  { id: 'jonah', name: 'Jonah Reed', initials: 'JR', color: '#e2684a' },
  { id: 'priya', name: 'Priya Shah', initials: 'PS', color: '#168b75' }
];

export const DEFAULT_DOCS = [
  { id: 'welcome', title: 'Welcome to Draftly', content: '<h1>A calmer place to think.</h1><p>Draftly keeps writing, feedback, and sharing in one focused workspace.</p><h2>Try the essentials</h2><ul><li>Select text and use the toolbar to format it.</li><li>Rename this document from the title above.</li><li>Share it with Jonah or Priya.</li></ul><p>Your changes save automatically in this browser.</p>', ownerId: 'maya', sharedWith: [], createdAt: '2026-09-01T09:00:00.000Z', updatedAt: '2026-09-02T08:30:00.000Z' },
  { id: 'launch-notes', title: 'September launch notes', content: '<h1>September launch</h1><p>Focus the release around a faster first-run experience.</p><h2>Open questions</h2><ol><li>Which template should new teams see first?</li><li>What belongs in the empty state?</li></ol>', ownerId: 'jonah', sharedWith: ['maya'], createdAt: '2026-08-28T10:00:00.000Z', updatedAt: '2026-09-01T14:20:00.000Z' }
];

export function normalizeState(raw) {
  const state = raw && typeof raw === 'object' ? raw : {};
  return {
    version: 1,
    currentUserId: USERS.some(u => u.id === state.currentUserId) ? state.currentUserId : USERS[0].id,
    docs: Array.isArray(state.docs) ? state.docs.filter(validDoc) : structuredClone(DEFAULT_DOCS)
  };
}

function validDoc(doc) {
  return doc && typeof doc.id === 'string' && typeof doc.title === 'string' && typeof doc.content === 'string' && USERS.some(u => u.id === doc.ownerId) && Array.isArray(doc.sharedWith);
}

export function canAccess(doc, userId) { return doc.ownerId === userId || doc.sharedWith.includes(userId); }
export function isOwner(doc, userId) { return doc.ownerId === userId; }
export function visibleDocs(docs, userId) { return docs.filter(doc => canAccess(doc, userId)); }

export function createDocument(ownerId, overrides = {}) {
  const now = new Date().toISOString();
  return { id: overrides.id || crypto.randomUUID(), title: overrides.title?.trim() || 'Untitled document', content: overrides.content || '<h1>Untitled document</h1><p>Start writing here…</p>', ownerId, sharedWith: [], createdAt: now, updatedAt: now };
}

export function shareDocument(doc, ownerId, recipientId) {
  if (!isOwner(doc, ownerId)) throw new Error('Only the owner can share this document.');
  if (!USERS.some(u => u.id === recipientId) || recipientId === ownerId) throw new Error('Choose another workspace member.');
  if (doc.sharedWith.includes(recipientId)) return doc;
  return { ...doc, sharedWith: [...doc.sharedWith, recipientId], updatedAt: new Date().toISOString() };
}

export function revokeAccess(doc, ownerId, recipientId) {
  if (!isOwner(doc, ownerId)) throw new Error('Only the owner can change access.');
  return { ...doc, sharedWith: doc.sharedWith.filter(id => id !== recipientId), updatedAt: new Date().toISOString() };
}
