/* script.js - frontend
 - Uses TheSportsDB for player info (images, position, team).
 - If PROXY_BASE is set, it will call:
     GET {PROXY_BASE}/api/gamelogs?player_name=Tom%20Brady
   which should return JSON: { games: [{ date: "2023-09-10", passing_yards: 250, rushing_yards: 5, receiving_yards:0 }, ...] }
 - If PROXY_BASE is empty or proxy call fails, the script uses MOCK data so charts still render.
 - Renders three Chart.js line charts and a summary table.
*/

(function () {
  const debugEl = document.getElementById('debug');
  const statusEl = document.getElementById('status');
  const playerInfoEl = document.getElementById('playerInfo');
  const detailPanel = document.getElementById('detailPanel');
  const detailName = document.getElementById('detailName');
  const detailMeta = document.getElementById('detailMeta');
  const summaryTable = document.getElementById('summaryTable');

  const inputEl = document.getElementById('playerInput');
  const btn = document.getElementById('searchBtn');
  const clearBtn = document.getElementById('clearDebug');

  const BASE_TSDB = 'https://www.thesportsdb.com/api/v1/json/3/searchplayers.php?p=';

  // canvas contexts
  let passingChart = null, rushingChart = null, receivingChart = null;

  function log(msg) {
    const t = new Date().toLocaleTimeString();
    const line = `[${t}] ${msg}`;
    console.log(line);
    if (debugEl) {
      debugEl.textContent += line + '\n';
      debugEl.scrollTop = debugEl.scrollHeight;
    }
  }
  function showStatus(msg){ statusEl.classList.remove('hidden'); statusEl.textContent = msg; }
  function hideStatus(){ statusEl.classList.add('hidden'); statusEl.textContent = ''; }

  function clearPlayerArea() {
    playerInfoEl.classList.add('hidden');
    detailPanel.classList.add('hidden');
    playerInfoEl.innerHTML = '';
    detailMeta.innerHTML = '';
    summaryTable.innerHTML = '';
    if (passingChart) { passingChart.destroy(); passingChart = null; }
    if (rushingChart) { rushingChart.destroy(); rushingChart = null; }
    if (receivingChart) { receivingChart.destroy(); receivingChart = null; }
  }

  async function searchPlayer(name) {
    log(`Searching for "${name}" in TheSportsDB`);
    showStatus('Searching player info...');
    clearPlayerArea();
    try {
      const res = await fetch(BASE_TSDB + encodeURIComponent(name), {cache: 'no-store'});
      log(`TheSportsDB response: ${res.status}`);
      if (!res.ok) { showStatus('Player lookup error.'); log('TheSportsDB non-ok'); return; }
      const data = await res.json();
      if (!data || !data.player || data.player.length === 0) {
        showStatus('No player found.');
        log('no player in response');
        return;
      }

      // show multiple matches if present
      const players = data.player.slice(0, 8);
      renderPlayerList(players);
      hideStatus();
    } catch (err) {
      log('Player fetch error: ' + err);
      showStatus('Network error fetching player info.');
    }
  }

  function renderPlayerList(players) {
    playerInfoEl.classList.remove('hidden');
    const container = document.createElement('div');
    container.className = 'playerList';
    players.forEach(p => {
      const item = document.createElement('div');
      item.className = 'playerItem';
      const img = p.strCutout || p.strThumb || p.strRender || '';
      item.innerHTML = `
        <div style="display:flex;gap:8px;align-items:center">
          ${img ? `<img src="${img}" style="width:70px;height:70px;object-fit:cover;border-radius:6px">` : ''}
          <div>
            <strong>${p.strPlayer}</strong><br>
            <span style="color:#bdbdbd">${p.strTeam || ''} · ${p.strPosition || ''}</span>
          </div>
        </div>`;
      item.addEventListener('click', () => {
        onPlayerClicked(p);
      });
      container.appendChild(item);
    });
    playerInfoEl.innerHTML = '';
    playerInfoEl.appendChild(container);
  }

  async function onPlayerClicked(p) {
    // show primary details
    detailPanel.classList.remove('hidden');
    detailName.textContent = p.strPlayer;
    detailMeta.innerHTML = `
      <div style="min-width:200px"><img src="${p.strCutout || p.strThumb || ''}" alt="${p.strPlayer}" style="width:160px;border-radius:6px"></div>
      <div style="flex:1;padding-left:10px">
        <p><strong>Team:</strong> ${p.strTeam || 'N/A'}</p>
        <p><strong>Position:</strong> ${p.strPosition || 'N/A'}</p>
        <p><strong>Height:</strong> ${p.strHeight || 'N/A'} &nbsp; <strong>Weight:</strong> ${p.strWeight || 'N/A'}</p>
        <p><strong>Birthplace:</strong> ${p.strBirthLocation || 'N/A'}</p>
      </div>
    `;
    // attempt to get real game logs via proxy
    const playerName = p.strPlayer;
    let games = null;
    if (typeof PROXY_BASE === 'string' && PROXY_BASE.trim().length > 0) {
      const url = `${PROXY_BASE}/api/gamelogs?player_name=${encodeURIComponent(playerName)}`;
      try {
        showStatus('Fetching game logs from proxy...');
        log(`Proxy fetch -> ${url}`);
        const resp = await fetch(url, {cache:'no-store'});
        log(`Proxy status: ${resp.status}`);
        if (resp.ok) {
          const payload = await resp.json();
          if (payload && Array.isArray(payload.games) && payload.games.length > 0) {
            games = payload.games;
            log(`Proxy returned ${games.length} games`);
          } else {
            log('Proxy returned no games or malformed payload; falling back to mock');
          }
        } else {
          log('Proxy responded non-ok; falling back to mock');
        }
      } catch (err) {
        log('Proxy fetch error: ' + err + ' — falling back to mock');
      } finally {
        hideStatus();
      }
    } else {
      log('No PROXY_BASE configured — using mock data for charts');
    }

    if (!games) {
      games = makeMockGames();
      log('Using MOCK games: ' + games.map(g=>g.date).join(', '));
    }

    renderSummaryTable(games);
    renderCharts(games);
  }

  function makeMockGames() {
    // 10 mock recent games with randomized-ish yards
    const out = [];
    const today = new Date();
    for (let i=9;i>=0;i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i*7); // roughly weekly
      out.push({
        date: d.toISOString().substring(0,10),
        passing_yards: Math.round(Math.random()*300),
        rushing_yards: Math.round(Math.random()*60),
        receiving_yards: Math.round(Math.random()*120)
      });
    }
    return out;
  }

  function renderSummaryTable(games){
    // small summary table of last games
    let html = '<table style="width:100%;border-collapse:collapse"><thead><tr style="text-align:left"><th>Date</th><th>Pass Yds</th><th>Rush Yds</th><th>Rec Yds</th></tr></thead><tbody>';
    games.forEach(g=>{
      html += `<tr><td>${g.date}</td><td>${g.passing_yards ?? 0}</td><td>${g.rushing_yards ?? 0}</td><td>${g.receiving_yards ?? 0}</td></tr>`;
    });
    html += '</tbody></table>';
    summaryTable.innerHTML = html;
  }

  function renderCharts(games) {
    const labels = games.map(g => g.date);
    const pass = games.map(g => g.passing_yards ?? 0);
    const rush = games.map(g => g.rushing_yards ?? 0);
    const rec = games.map(g => g.receiving_yards ?? 0);

    const passCtx = document.getElementById('passingChart').getContext('2d');
    const rushCtx = document.getElementById('rushingChart').getContext('2d');
    const recCtx = document.getElementById('receivingChart').getContext('2d');

    if (passingChart) passingChart.destroy();
    if (rushingChart) rushingChart.destroy();
    if (receivingChart) receivingChart.destroy();

    passingChart = new Chart(passCtx, {
      type:'line',
      data: {
        labels, datasets: [{
          label:'Passing Yards',
          data: pass,
          fill:false,
          tension:0.3,
          pointRadius:4,
        }]
      },
      options: { plugins:{legend:{display:false}} }
    });

    rushingChart = new Chart(rushCtx, {
      type:'line',
      data: { labels, datasets:[{label:'Rushing Yards', data: rush, fill:false, tension:0.3, pointRadius:4}] },
      options: { plugins:{legend:{display:false}} }
    });

    receivingChart = new Chart(recCtx, {
      type:'line',
      data: { labels, datasets:[{label:'Receiving Yards', data: rec, fill:false, tension:0.3, pointRadius:4}] },
      options: { plugins:{legend:{display:false}} }
    });

    // show detail panel
    detailPanel.classList.remove('hidden');
  }

  document.addEventListener('DOMContentLoaded', () => {
    log('Frontend initialized');
    btn.addEventListener('click', () => {
      const v = inputEl.value.trim();
      if (!v) { alert('Enter a player name'); return; }
      searchPlayer(v);
    });
    inputEl.addEventListener('keydown', (ev) => {
      if (ev.key === 'Enter') { ev.preventDefault(); btn.click(); }
    });
    clearBtn.addEventListener('click', () => { debugEl.textContent = ''; log('debug cleared'); });
  });
})();
