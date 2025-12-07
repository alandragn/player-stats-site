// Replace with actual API URLs
const nbaApiUrl = 'https://api.example.com/nba/stats';  // NBA Player Stats API
const nflApiUrl = 'https://api.example.com/nfl/stats';  // NFL Player Stats API

const players = []; // Store player data here

// Fetch NBA and NFL player stats
async function fetchStats(apiUrl) {
    try {
        const response = await fetch(apiUrl);
        const data = await response.json();
        return data.players;  // Assuming the API returns an array of player objects
    } catch (error) {
        console.error('Error fetching data:', error);
    }
}

// Generate a simple player list for NBA and NFL
async function loadPlayerStats() {
    const nbaPlayers = await fetchStats(nbaApiUrl);
    const nflPlayers = await fetchStats(nflApiUrl);
    
    const allPlayers = [...nbaPlayers, ...nflPlayers];

    const playerListContainer = document.getElementById('player-list');
    allPlayers.forEach(player => {
        const playerDiv = document.createElement('div');
        playerDiv.innerHTML = `<h4>${player.name}</h4><p>Position: ${player.position}</p>`;
        playerDiv.onclick = () => showPlayerDetails(player);
        playerListContainer.appendChild(playerDiv);
        players.push(player);
    });
}

// Show detailed stats and defense stats for the selected player
function showPlayerDetails(player) {
    document.getElementById('player-stats').style.display = 'none';
    document.getElementById('player-details').style.display = 'block';
    document.getElementById('player-name').innerText = player.name;

    // Show Player Stats
    createStatChart(player);

    // Display Defensive Stats
    const defenseStats = document.getElementById('defense-stats');
    defenseStats.innerHTML = `
        <p>Defensive Rating: ${player.defensiveRating || 'N/A'}</p>
        <p>Tackles (NFL) / Steals (NBA): ${player.tackles || player.steals}</p>
    `;
}

// Create chart for player stats (e.g., points per game, tackles, etc.)
function createStatChart(player) {
    const ctx = document.getElementById('statsChart').getContext('2d');
    const statsChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Points/Tackles', 'Rebounds', 'Assists'], // You can add more stats as needed
            datasets: [{
                label: `${player.name}'s Stats`,
                data: [
                    player.points || player.tackles,  // Player points for NBA, tackles for NFL
                    player.rebounds || 0,             // Rebounds for NBA
                    player.assists || 0               // Assists for NBA, or passing stats for NFL
                ],
                backgroundColor: 'rgba(54, 162, 235, 0.2)',
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

// Call the function to load stats when the page loads
window.onload = loadPlayerStats;
