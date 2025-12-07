const BASE_URL = "https://nfl.balldontlie.io/api/v1";

document.getElementById("searchBtn").addEventListener("click", async () => {
  const name = document.getElementById("playerInput").value.trim();
  if (!name) {
    alert("Please enter a player name.");
    return;
  }
  await fetchPlayer(name);
});

async function fetchPlayer(name) {
  const res = await fetch(`${BASE_URL}/players?search=${encodeURIComponent(name)}`);
  const data = await res.json();

  if (!data.data || data.data.length === 0) {
    alert("No player found.");
    return;
  }

  const player = data.data[0];
  showPlayer(player);
  fetchGames(player.id);
}

function showPlayer(player) {
  const div = document.getElementById("playerInfo");
  div.classList.remove("hidden");
  div.innerHTML = `
    <h2>${player.first_name} ${player.last_name}</h2>
    <p><strong>Team:</strong> ${player.team ? player.team.full_name : "Unknown"}</p>
    <p><strong>Position:</strong> ${player.position || "N/A"}</p>
  `;
}

async function fetchGames(playerId) {
  const res = await fetch(`${BASE_URL}/games?player_ids[]=${playerId}&per_page=10`);
  const data = await res.json();

  const container = document.getElementById("statsContainer");
  const list = document.getElementById("statsList");
  container.classList.remove("hidden");
  list.innerHTML = "";

  if (!data.data || data.data.length === 0) {
    list.innerHTML = "<p>No games found.</p>";
    return;
  }

  for (const game of data.data) {
    // fetch player stats for that game
    const statsRes = await fetch(`${BASE_URL}/stats?game_ids[]=${game.id}&player_ids[]=${playerId}`);
    const statsData = await statsRes.json();
    const stat = (statsData.data && statsData.data.length > 0) ? statsData.data[0] : null;

    list.innerHTML += `
      <div class="statCard">
        <h3>${game.date.substring(0, 10)}</h3>
        <p>${game.visitor_team.abbreviation} @ ${game.home_team.abbreviation}</p>
        ${ stat
           ? `<p><strong>Passing Yards:</strong> ${stat.passing_yards || 0}</p>
              <p><strong>Rushing Yards:</strong> ${stat.rushing_yards || 0}</p>
              <p><strong>Receiving Yards:</strong> ${stat.receiving_yards || 0}</p>`
           : `<p>No stat data available for this game.</p>` }
      </div>
    `;
  }
}
