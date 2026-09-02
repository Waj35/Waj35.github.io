import { USERS, DEFAULT_DOCS, normalizeState, visibleDocs, isOwner, createDocument, shareDocument, revokeAccess } from './store.js';

const STORAGE_KEY = 'draftly.workspace.v1';
const $ = selector => document.querySelector(selector);
const els = Object.fromEntries(['dashboard','editor-view','document-grid','empty-state','user-select','avatar','search','view-title','all-count','owned-count','shared-count','title-input','editor','save-state','access-badge','share-button','share-modal','share-user','people-list','share-error','toast','more-menu','word-count','updated-at'].map(id => [id.replaceAll('-', '_'), $(`#${id}`)]));
let state = loadState();
let activeDocId = null;
let activeFilter = 'all';
let saveTimer;

function loadState() {
  try { return normalizeState(JSON.parse(localStorage.getItem(STORAGE_KEY))); }
  catch { return normalizeState({ docs: structuredClone(DEFAULT_DOCS) }); }
}
function persist() { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }
function user(id) { return USERS.find(item => item.id === id); }
function activeDoc() { return state.docs.find(doc => doc.id === activeDocId); }
function escapeHTML(value = '') { const node = document.createElement('div'); node.textContent = value; return node.innerHTML; }
function textFromHTML(html) { const node = document.createElement('div'); node.innerHTML = html; return (node.textContent || '').replace(/\s+/g, ' ').trim(); }
function formatDate(date) { const diff = Date.now() - new Date(date).getTime(); if (diff < 60000) return 'Just now'; if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`; if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`; return new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric' }).format(new Date(date)); }

function init() {
  els.user_select.innerHTML = USERS.map(u => `<option value="${u.id}">${u.name}</option>`).join('');
  els.user_select.value = state.currentUserId;
  bindEvents(); updateUser(); renderDashboard();
}

function bindEvents() {
  ['#new-doc','#new-doc-secondary','#empty-new'].forEach(id => $(id).addEventListener('click', newDocument));
  document.querySelectorAll('.filter').forEach(button => button.addEventListener('click', () => { activeFilter = button.dataset.filter; document.querySelectorAll('.filter').forEach(b => b.classList.toggle('active', b === button)); els.view_title.textContent = button.childNodes[2].textContent.trim(); renderDashboard(); closeMobileNav(); }));
  els.user_select.addEventListener('change', () => { state.currentUserId = els.user_select.value; persist(); activeDocId = null; showDashboard(); updateUser(); renderDashboard(); });
  els.search.addEventListener('input', renderDashboard);
  $('#back-button').addEventListener('click', showDashboard);
  els.title_input.addEventListener('input', queueSave);
  els.title_input.addEventListener('blur', () => { if (!els.title_input.value.trim()) els.title_input.value = 'Untitled document'; saveActive(); });
  els.editor.addEventListener('input', () => { updateWordCount(); queueSave(); });
  document.querySelectorAll('[data-command]').forEach(button => button.addEventListener('click', () => { document.execCommand(button.dataset.command, false); els.editor.focus(); queueSave(); }));
  $('#format-block').addEventListener('change', e => { document.execCommand('formatBlock', false, e.target.value); els.editor.focus(); queueSave(); });
  $('#import-trigger').addEventListener('click', () => $('#file-input').click());
  $('#file-input').addEventListener('change', importFile);
  els.share_button.addEventListener('click', openShare);
  $('#close-share').addEventListener('click', closeShare);
  els.share_modal.addEventListener('click', e => { if (e.target === els.share_modal) closeShare(); });
  $('#grant-access').addEventListener('click', grantAccess);
  $('#more-button').addEventListener('click', () => els.more_menu.hidden = !els.more_menu.hidden);
  $('#duplicate-button').addEventListener('click', duplicateActive);
  $('#delete-button').addEventListener('click', deleteActive);
  $('#mobile-nav').addEventListener('click', () => $('.sidebar').classList.add('open'));
  document.addEventListener('keydown', e => { if (e.key === 'Escape') { closeShare(); els.more_menu.hidden = true; closeMobileNav(); } if ((e.ctrlKey || e.metaKey) && e.key === 's') { e.preventDefault(); saveActive(); toast('Document saved'); } });
  window.addEventListener('beforeunload', saveActive);
}

function updateUser() { const u = user(state.currentUserId); els.avatar.textContent = u.initials; els.avatar.style.background = u.color; }
function docsForView() {
  let docs = visibleDocs(state.docs, state.currentUserId);
  if (activeFilter === 'owned') docs = docs.filter(d => d.ownerId === state.currentUserId);
  if (activeFilter === 'shared') docs = docs.filter(d => d.ownerId !== state.currentUserId);
  const query = els.search.value.trim().toLowerCase();
  if (query) docs = docs.filter(d => `${d.title} ${textFromHTML(d.content)}`.toLowerCase().includes(query));
  return docs.sort((a,b) => new Date(b.updatedAt) - new Date(a.updatedAt));
}
function renderDashboard() {
  const visible = visibleDocs(state.docs, state.currentUserId);
  els.all_count.textContent = visible.length;
  els.owned_count.textContent = visible.filter(d => d.ownerId === state.currentUserId).length;
  els.shared_count.textContent = visible.filter(d => d.ownerId !== state.currentUserId).length;
  const docs = docsForView(); els.document_grid.innerHTML = '';
  docs.forEach(doc => { const owner = user(doc.ownerId); const card = document.createElement('button'); card.className = 'doc-card'; card.innerHTML = `<div class="doc-preview"><div class="preview-lines">${doc.content}</div></div><div class="doc-meta"><span class="status-pill ${doc.ownerId === state.currentUserId ? 'owned' : 'shared'}">${doc.ownerId === state.currentUserId ? 'Owned' : 'Shared'}</span><h3>${escapeHTML(doc.title)}</h3><p>${escapeHTML(textFromHTML(doc.content).slice(0, 105)) || 'Empty document'}</p><div><span class="mini-avatar" style="background:${owner.color}">${owner.initials}</span><span>${doc.ownerId === state.currentUserId ? 'You' : owner.name}</span><time>${formatDate(doc.updatedAt)}</time></div></div>`; card.addEventListener('click', () => openDocument(doc.id)); els.document_grid.append(card); });
  els.empty_state.hidden = docs.length > 0; els.document_grid.hidden = docs.length === 0;
}
function showDashboard() { saveActive(); activeDocId = null; els.editor_view.hidden = true; els.dashboard.hidden = false; els.search.closest('label').hidden = false; renderDashboard(); }
function openDocument(id) {
  const doc = state.docs.find(d => d.id === id); if (!doc || !visibleDocs([doc], state.currentUserId).length) return toast('You do not have access to this document', true);
  activeDocId = id; els.dashboard.hidden = true; els.editor_view.hidden = false; els.search.closest('label').hidden = true; els.title_input.value = doc.title; els.editor.innerHTML = doc.content; els.access_badge.textContent = isOwner(doc, state.currentUserId) ? 'Owner' : `Shared by ${user(doc.ownerId).name}`; els.share_button.hidden = !isOwner(doc, state.currentUserId); $('#delete-button').hidden = !isOwner(doc, state.currentUserId); els.updated_at.textContent = `Last edited ${formatDate(doc.updatedAt)}`; updateWordCount(); els.editor.focus();
}
function newDocument() { const doc = createDocument(state.currentUserId); state.docs.push(doc); persist(); openDocument(doc.id); toast('New document created'); }
function queueSave() { clearTimeout(saveTimer); els.save_state.textContent = 'Saving…'; saveTimer = setTimeout(saveActive, 450); }
function saveActive() { const doc = activeDoc(); if (!doc) return; doc.title = els.title_input.value.trim() || 'Untitled document'; doc.content = els.editor.innerHTML; doc.updatedAt = new Date().toISOString(); persist(); els.save_state.textContent = 'All changes saved'; els.updated_at.textContent = 'Last edited just now'; }
function updateWordCount() { const words = textFromHTML(els.editor.innerHTML).split(/\s+/).filter(Boolean).length; els.word_count.textContent = `${words} ${words === 1 ? 'word' : 'words'}`; }

async function importFile(event) {
  const file = event.target.files[0]; event.target.value = ''; if (!file) return;
  if (!/\.(txt|md)$/i.test(file.name)) return toast('Please choose a .txt or .md file', true);
  if (file.size > 1024 * 1024) return toast('File must be smaller than 1 MB', true);
  try { const content = await file.text(); const title = file.name.replace(/\.(txt|md)$/i, ''); const html = file.name.toLowerCase().endsWith('.md') ? markdownToHTML(content) : `<p>${escapeHTML(content).replace(/\n\n+/g, '</p><p>').replace(/\n/g, '<br>')}</p>`; const doc = createDocument(state.currentUserId, { title, content: html }); state.docs.push(doc); persist(); openDocument(doc.id); toast(`${file.name} imported`); } catch { toast('That file could not be read', true); }
}
function markdownToHTML(source) { return source.split(/\n/).map(line => { const safe = escapeHTML(line); if (/^### /.test(line)) return `<h3>${safe.slice(4)}</h3>`; if (/^## /.test(line)) return `<h2>${safe.slice(3)}</h2>`; if (/^# /.test(line)) return `<h1>${safe.slice(2)}</h1>`; if (/^[-*] /.test(line)) return `<li>${safe.slice(2)}</li>`; return safe ? `<p>${safe.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>').replace(/\*(.+?)\*/g, '<em>$1</em>')}</p>` : '<p><br></p>'; }).join('').replace(/(?:<li>.*?<\/li>)+/g, match => `<ul>${match}</ul>`); }

function openShare() { renderShare(); els.share_modal.hidden = false; setTimeout(() => els.share_user.focus(), 0); }
function closeShare() { els.share_modal.hidden = true; els.share_error.textContent = ''; }
function renderShare() { const doc = activeDoc(); if (!doc) return; const candidates = USERS.filter(u => u.id !== doc.ownerId && !doc.sharedWith.includes(u.id)); els.share_user.innerHTML = candidates.length ? candidates.map(u => `<option value="${u.id}">${u.name}</option>`).join('') : '<option value="">Everyone already has access</option>'; $('#grant-access').disabled = !candidates.length; const ids = [doc.ownerId, ...doc.sharedWith]; els.people_list.innerHTML = ids.map(id => { const u = user(id); const owner = id === doc.ownerId; return `<div><span class="avatar" style="background:${u.color}">${u.initials}</span><span><b>${escapeHTML(u.name)}${id === state.currentUserId ? ' (you)' : ''}</b><small>${owner ? 'Owner' : 'Can edit'}</small></span>${!owner && isOwner(doc, state.currentUserId) ? `<button class="remove-access" data-user="${id}">Remove</button>` : ''}</div>`; }).join(''); document.querySelectorAll('.remove-access').forEach(button => button.addEventListener('click', () => { replaceActive(revokeAccess(activeDoc(), state.currentUserId, button.dataset.user)); renderShare(); toast('Access removed'); })); }
function grantAccess() { try { replaceActive(shareDocument(activeDoc(), state.currentUserId, els.share_user.value)); renderShare(); toast('Access granted'); } catch (error) { els.share_error.textContent = error.message; } }
function replaceActive(doc) { state.docs = state.docs.map(d => d.id === doc.id ? doc : d); persist(); }
function duplicateActive() { const source = activeDoc(); const copy = createDocument(state.currentUserId, { title: `${source.title} copy`, content: source.content }); state.docs.push(copy); persist(); els.more_menu.hidden = true; openDocument(copy.id); toast('Document duplicated'); }
function deleteActive() { const doc = activeDoc(); if (!doc || !isOwner(doc, state.currentUserId)) return; if (!confirm(`Delete “${doc.title}”? This cannot be undone.`)) return; state.docs = state.docs.filter(d => d.id !== doc.id); persist(); els.more_menu.hidden = true; showDashboard(); toast('Document deleted'); }
function closeMobileNav() { $('.sidebar').classList.remove('open'); }
function toast(message, error = false) { els.toast.textContent = message; els.toast.className = `toast show${error ? ' error' : ''}`; clearTimeout(els.toast.timer); els.toast.timer = setTimeout(() => els.toast.className = 'toast', 2600); }

init();
