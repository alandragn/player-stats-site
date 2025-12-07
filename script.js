// script.js — Debuggable version
(function () {
  const BASE = 'https://www.thesportsdb.com/api/v1/json/3/searchplayers.php?p=';
  const dbgEl = document.getElementById('debug');
  const statusEl = document.getElementById('status');
  const playerInfoEl = document.getElementById('playerInfo');
  const inputEl = document.getElementById('playerInput');
  const btn = document.getElementById('searchBtn');
  const clearBtn = document.getElementById('clearDebug');

  function log(msg) {
    const time = new Date().toLocaleTimeString();
    const line = `[${time}] ${msg}`;
    console.log(line);
    if (dbgEl) {
      dbgEl.textContent = (dbgEl.textContent ? dbgEl.textContent + '\n' : '') + line;
      dbgEl.scrollTop = dbgEl.scrollHeight;
    }
  }

  function showStatus(msg) {
    if (!statusEl) return;
    statusEl.classList.remove('hidden');
    statusEl.textContent = msg;
  }

  function hideStatus() {
    if (!statusEl) return;
    statusEl.classList.add('hidden');
    statusEl.textContent = '';
  }

  function showPlayer(p) {
    playerInfoEl.classList.remove('hidden');
    const img = p.strCutout || p.strThumb || p.strRender || '';
    playerInfoEl.innerHTML = `
      <div style="display:flex; gap:12px; align-items:flex-start;">
        <div style="flex:0 0 220px;">
          ${img ? `<img src="${img}" alt="${p.strPlayer}">` : ''}
        </div>
        <div style="flex:1;">
          <h2 style="margin:0 0 6px 0;">${p.strPlayer}</h2>
          <p style="margin:0 0 4px 0;"><strong>Team:</strong> ${p.strTeam || 'N/A'}</p>
          <p style="margin:0 0 4px 0;"><strong>Position:</strong> ${p.strPosition || 'N/A'}</p>
          <p style="margin:0 0 4px 0;"><strong>Birth:</strong> ${p.strBirthLocation || 'N/A'}</p>
          <p style="margin:0 0 4px 0;"><strong>Height / Weight:</strong> ${p.strHeight || 'N/A'} / ${p.strWeight || 'N/A'}</p>
          <p style="margin-top:8px;">${p.strDescriptionEN ? (p.strDescriptionEN.substring(0,400)+'...') : ''}</p>
        </div>
      </div>
    `;
  }

  async function searchPlayer(name) {
    log(`searchPlayer called with "${name}"`);
    showStatus('Searching...');
    playerInfoEl.classList.add('hidden');
    try {
      const url = BASE + encodeURIComponent(name);
      log(`fetch -> ${url}`);
      const resp = await fetch(url, {cache: 'no-store'});
      log(`fetch finished — response.ok=${resp.ok}, status=${resp.status}`);
      if (!resp.ok) {
        const txt = await resp.text().catch(()=>'<no-body>');
        log(`Non-OK response body: ${txt}`);
        showStatus(`Error: API returned ${resp.status}`);
        return;
      }
      const payload = await resp.json().catch(e => {
        log('JSON parse failed: ' + e);
        return null;
      });
      log(`payload keys: ${payload ? Object.keys(payload).join(', ') : 'null'}`);
      if (!payload || !payload.player || payload.player.length === 0) {
        showStatus('No player found.');
        log('No player array or empty.');
        return;
      }
      hideStatus();
      const p = payload.player[0];
      log(`Found player: ${p.strPlayer} (team: ${p.strTeam})`);
      showPlayer(p);
    } catch (err) {
      log('Fetch error: ' + err);
      showStatus('Network/Error fetching player (see debug).');
    }
  }

  // initialization
  document.addEventListener('DOMContentLoaded', () => {
    // confirm DOM binding
    log('DOM loaded — binding events');
    if (!btn || !inputEl) {
      log('ERROR: required elements missing from DOM');
      return;
    }

    btn.addEventListener('click', () => {
      const v = inputEl.value.trim();
      if (!v) {
        alert('Please enter a player name.');
        return;
      }
      searchPlayer(v);
    });

    // Enter key triggers search
    inputEl.addEventListener('keydown', (ev) => {
      if (ev.key === 'Enter') {
        ev.preventDefault();
        btn.click();
      }
    });

    clearBtn.addEventListener('click', () => {
      dbgEl.textContent = '';
      log('Debug cleared');
    });

    // initial log to help debug whether script loaded
    log('Script initialized — ready.');
  });

})();
