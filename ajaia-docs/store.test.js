import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeState, visibleDocs, shareDocument, revokeAccess } from './store.js';

const doc = { id: '1', title: 'Plan', content: '<p>Hello</p>', ownerId: 'maya', sharedWith: [], createdAt: '2026-01-01', updatedAt: '2026-01-01' };

test('visibility is limited to owner and explicitly shared users', () => {
  assert.equal(visibleDocs([doc], 'maya').length, 1);
  assert.equal(visibleDocs([doc], 'jonah').length, 0);
  assert.equal(visibleDocs([{ ...doc, sharedWith: ['jonah'] }], 'jonah').length, 1);
});

test('only the owner can grant and revoke access', () => {
  const shared = shareDocument(doc, 'maya', 'jonah');
  assert.deepEqual(shared.sharedWith, ['jonah']);
  assert.throws(() => shareDocument(doc, 'priya', 'jonah'), /Only the owner/);
  assert.deepEqual(revokeAccess(shared, 'maya', 'jonah').sharedWith, []);
});

test('invalid persisted data falls back safely', () => {
  const state = normalizeState({ currentUserId: 'intruder', docs: [{ broken: true }] });
  assert.equal(state.currentUserId, 'maya');
  assert.deepEqual(state.docs, []);
});
