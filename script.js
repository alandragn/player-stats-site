const searchForm = document.getElementById("searchForm");
const searchInput = document.getElementById("searchInput");
const resultsContainer = document.getElementById("resultsContainer");
const profileContainer = document.getElementById("profileContainer");
const PROXY = "http://localhost:3000";

// Search players by name (or get all)
async function fetchPlayers(name = "") {
  const res = await fetch(`${PROXY}/api/players?name=${encodeURIComponent(name)}`);
  const data = await res.json();
  displayPlayerList(data.players);
}

function displayPlayerList(players) {
  resultsContainer.innerHTML = "";
  profileContainer.innerHTML = "";
  if (!players.length) {
    resultsContainer.innerHTML = "<p>No players found.</p>";
    return;
  }
  players.forEach(p => {
    const btn = document.createElement("button");
    btn.textContent = `Player ID: ${p.id}`;
    btn.onclick = () => fetchPlayer(p.id);
    resultsContainer.appendChild(btn);
  });
}

async function fetchPlayer(id) {
  const res = await fetch(`${PROXY}/api/player/${id}`);
  const data = await res.json();
  showProfile(data.player);
}

function showProfile(player) {
  profileContainer.innerHTML = `<h2>${player.athlete?.displayName || "Unknown"}</h2>
    <p>Weight: ${player.athlete?.weight || ""}</p>
    <p>Position: ${player.athlete?.position?.abbreviation || ""}</p>
    <p>Team: ${player.athlete?.team?.shortDisplayName || ""}</p>
    <pre>${JSON.stringify(player, null, 2)}</pre>`;
}

searchForm.addEventListener("submit", e => {
  e.preventDefault();
  fetchPlayers(searchInput.value);
});

// On load, fetch many players (lazy load)
fetchPlayers();
