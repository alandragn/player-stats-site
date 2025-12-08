const searchForm = document.getElementById("searchForm");
const searchInput = document.getElementById("searchInput");
const resultsContainer = document.getElementById("resultsContainer");
const statsContainer = document.getElementById("statsContainer");

// Fetch players from backend
async function fetchPlayers(name = "") {
  try {
    const response = await fetch(`http://localhost:3000/api/players?name=${encodeURIComponent(name)}`);
    const data = await response.json();
    displayPlayers(data.players);
  } catch (err) {
    console.error("Error fetching players:", err);
  }
}

// Display player cards
function displayPlayers(players) {
  resultsContainer.innerHTML = "";
  statsContainer.innerHTML = ""; // clear previous chart

  if (!players.length) {
    resultsContainer.innerHTML = "<p>No players found</p>";
    return;
  }

  players.forEach(player => {
    const card = document.createElement("div");
    card.classList.add("player-card");

    card.innerHTML = `
      <img src="${player.image}" alt="${player.name}" class="player-img">
      <h3>${player.name}</h3>
      <p>${player.position} - ${player.team}</p>
      <p>Weight: ${player.weight} lbs</p>
      <p>Birth: ${player.birthDate}</p>
    `;

    // Click card to show stats
    card.addEventListener("click", () => showStats(player));
    resultsContainer.appendChild(card);
  });
}

// Show chart for player's recent stats
function showStats(player) {
  statsContainer.innerHTML = `<h3>${player.name} - Recent Stats</h3>
                              <canvas id="statsChart"></canvas>`;

  const ctx = document.getElementById("statsChart").getContext("2d");
  const labels = player.recentStats.map(s => s.game);
  const yards = player.recentStats.map(s => s.yards);
  const td = player.recentStats.map(s => s.td);

  new Chart(ctx, {
    type: "line",
    data: {
      labels,
      datasets: [
        { label: "Yards", data: yards, borderColor: "blue", fill: false },
        { label: "Touchdowns", data: td, borderColor: "red", fill: false }
      ]
    },
    options: { responsive: true }
  });
}

// Handle search
searchForm.addEventListener("submit", e => {
  e.preventDefault();
  fetchPlayers(searchInput.value);
});

// AUTO LOAD ALL PLAYERS ON PAGE LOAD
window.addEventListener("DOMContentLoaded", () => {
  fetchPlayers();
});
