const BASE_URL = "https://nfl.balldontlie.io/api/v1";

document.getElementById("searchBtn").addEventListener("click", () => {
    const name = document.getElementById("playerInput").value;
    if (!name) return alert("Enter a player name.");
    fetchPlayer(name);
});

// Fetch player by name
async function fetchPlayer(name) {
    const res = await fetch(`${BASE_URL}/players?search=${name}`);
    const data = await res.json();

    if (data.data.length === 0) {
        alert("No player found.");
        return;
    }

    const player = data.data[0];
    displayPlayer(player);
    fetchGames(player.id);
}

// Display player info
function displayPlayer(player) {
    const div = document.getElementById("playerInfo");
    div.classList.remove("hidden");

    div.innerHTML = `
        <h2>${player.first_name} ${player.last_name}</h2>
        <p><strong>Team:</strong> ${player.team ? player.team.full_name : "Unknown"}</p>
        <p><strong>Position:</strong> ${player.position || "N/A"}</p>
    `;
}

// Fetch all games for player
async function fetchGames(playerId) {
    const res = await fetch(`${BASE_URL}/games?player_ids[]=${playerId}&per_page=10`);
    const data = await res.json();

    const container = document.getElementById("statsContainer");
    const list = document.getElementById("statsList");

    container.classList.remove("hidden");
    list.innerHTML = "";

    if (data.data.length === 0) {
        list.innerHTML = "<p>No games found.</p>";
        return;
    }

    for (const game of data.data) {
        const statsRes = await fetch(`${BASE_URL}/stats?game_ids[]=${game.id}&player_ids[]=${playerId}`);
        const stats = await statsRes.json();

        const stat = stats.data[0];

        list.innerHTML += `
            <div class="statCard">
                <h3>${game.date.substring(0, 10)}</h3>
                <p><strong>${game.visitor_team.abbreviation}</strong> @ <strong>${game.home_team.abbreviation}</strong></p>
                ${
                    stat
                        ? `<p><strong>Passing Yards:</strong> ${stat.passing_yards}</p>
                           <p><strong>Rushing Yards:</strong> ${stat.rushing_yards}</p>
                           <p><strong>Receiving Yards:</strong> ${stat.receiving_yards}</p>`
                        : "<p>No stat data available.</p>"
                }
            </div>
        `;
    }
}
