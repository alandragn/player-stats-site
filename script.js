// script.js
const PROXY = (location.hostname === 'localhost' || location.hostname === '127.0.0.1') ? 'http://localhost:3000' : 'https://REPLACE_WITH_YOUR_RENDER_URL';

const playersList = document.getElementById('playersList');
const playerDetail = document.getElementById('playerDetail');
const searchInput = document.getElementById('searchInput');
const searchButton = document.getElementById('searchButton');
const refreshButton = document.getElementById('refreshButton');

async function fetchPlayers(q='', forceRefresh=false) {
  try {
    const url = `${PROXY}/api/players?name=${encodeURIComponent(q)}${forceRefresh ? '&refresh=1' : ''}`;
    const res = await fetch(url);
    return await res.json();
  } catch (err) {
    console.error('fetchPlayers error', err);
    return { players: [] };
  }
}

function renderPlayerCard(p) {
  const el = document.createElement('div');
  el.className = 'card';
  el.innerHTML = `
    <div class="card-body">
      <strong>${escapeHtml(p.name || `#${p.id}`)}</strong>
      <div class="muted">ID: ${escapeHtml(p.id)}</div>
      <button class="btn" data-id="${p.id}">View</button>
    </div>
  `;
  el.querySelector('.btn').addEventListener('click', () => loadPlayer(p.id));
  return el;
}

async function loadAndRenderPlayers(q='', forceRefresh=false) {
  playersList.innerHTML = '<div class="loading">Loading players…</div>';
  const json = await fetchPlayers(q, forceRefresh);
  const players = json.players || [];
  playersList.innerHTML = '';
  if (!players.length) {
    playersList.innerHTML = '<div>No players found.</div>';
    return;
  }
  players.forEach(p => playersList.appendChild(renderPlayerCard(p)));
}

async function loadPlayer(id) {
  playerDetail.innerHTML = '<div class="loading">Loading player details…</div>';
  try {
    const res = await fetch(`${PROXY}/api/player/${encodeURIComponent(id)}`);
    const json = await res.json();
    if (json.error) {
      playerDetail.innerHTML = `<div class="error">Error: ${escapeHtml(json.error)}</div>`;
      return;
    }
    renderPlayerDetail(json.player);
  } catch (err) {
    console.error('loadPlayer error', err);
    playerDetail.innerHTML = `<div class="error">Fetch failed: ${escapeHtml(err.message)}</div>`;
  }
}

function renderPlayerDetail(player) {
  const p = player;
  playerDetail.innerHTML = `
    <div class="detail-header">
      <h2>${escapeHtml(p.displayName || p.raw?.athlete?.displayName || 'Unknown')}</h2>
      <div class="muted">Position: ${escapeHtml(p.position || p.raw?.athlete?.position?.displayName || '')}</div>
      <div class="muted">Team: ${escapeHtml(p.team || p.raw?.athlete?.team?.displayName || '')}</div>
      <div>Weight: ${escapeHtml(p.weight || p.raw?.athlete?.weight || '')}</div>
      <div>Birth: ${escapeHtml(p.birthDate || '')}</div>
      <div id="chartArea"></div>
      <h3>Raw data (ESPN JSON)</h3>
      <pre id="rawJson">${escapeHtml(JSON.stringify(p.raw, null, 2))}</pre>
    </div>
  `;
}

function escapeHtml(s) {
  if (!s && s !== 0) return '';
  return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}

searchButton.addEventListener('click', () => loadAndRenderPlayers(searchInput.value.trim()));
searchInput.addEventListener('keyup', e => { if (e.key === 'Enter') loadAndRenderPlayers(searchInput.value.trim()); });
refreshButton.addEventListener('click', () => loadAndRenderPlayers(searchInput.value.trim(), true));

window.addEventListener('DOMContentLoaded', () => loadAndRenderPlayers());
