// API URLs for NBA and NFL stats using TheSportsDB (free tier)
const nbaApiUrl = 'https://www.thesportsdb.com/api/v1/json/1/searchplayers.php?t=NBA';
const nflApiUrl = 'https://www.thesportsdb.com/api/v1/json/1/searchplayers.php?t=NFL';

const players = []; // Store player data here

// Fetch NBA and NFL player stats
async function fetchStats(apiUrl) {
    try {
        const response = await fetch(apiUrl);
        const data = await response.json();
        return data.player || [];  // Ensure we return the 'player' array from the API response
    } catch (error) {
        console.error('Error fetching data:', error);
        return [];
    }
}

// Generate a simple player list for NBA and NFL
async function loadPlayerStats() {
    // Fetch data for NBA and NFL players
    const nbaPlayers = await fetchStats(nbaApiUrl);
    const nflPlayers = await fetchStats(nflApiUrl);

    // Combine both NBA and NFL players
    const allPlayers = [...nbaPlayers, ...nflPlayers];

    const playerListContainer = document.getElementById('player-list');
    playerListContainer.innerHTML = ""; // Clear before adding
    allPlayers.forEach(player => {
        const playerDiv = document.createElement('div');
        playerDiv.innerHTML = `<h4>${player.strPlayer}</h4><p>Position: ${player.strPosition}</p>`;
        playerDiv.onclick = () => showPlayerDetails(player);
        playerListContainer.appendChild(playerDiv);
        players.push(player);
    });
}

// Show detailed stats and defense stats for the selected player
function showPlayerDetails(player) {
    document.getElementById('player-stats').style.display = 'none';
    document.getElementById('player-details').style.display = 'block';
    document.getElementById('player-name').innerText = player.strPlayer;

    // Show Player Stats (simplified for example purposes)
    createStatChart(player);

    // Display Defensive Stats (simplified example)
    const defenseStats = document.getElementById('defense-stats');
    defenseStats.innerHTML = `
        <p>Defensive Rating: ${player.strDefensive || 'N/A'}</p>
        <p>Tackles (NFL) / Steals (NBA): ${player.strTackles || player.strSteals || 'N/A'}</p>
    `;

    // Show Prediction for next game
    const prediction = document.getElementById('prediction');
    prediction.innerText = makePrediction(player);
}

// Create a chart for the player stats (points, assists, rebounds, etc.)
function createStatChart(player) {
    const canvas = document.getElementById('statsChart');
    // If there's already a chart, destroy it before making a new one.
    if (canvas.chartInstance) {
        canvas.chartInstance.destroy();
    }
    const ctx = canvas.getContext('2d');
    const statsChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Points/Tackles', 'Rebounds', 'Assists'],
            datasets: [{
                label: `${player.strPlayer}'s Stats`,
                data: [
                    parseFloat(player.strPoints) || parseFloat(player.strTackles) || 0,
                    parseFloat(player.strRebounds) || 0,
                    parseFloat(player.strAssists) || 0
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
    canvas.chartInstance = statsChart;
}

// Simple prediction algorithm (for demonstration)
function makePrediction(player) {
    // Example prediction logic: project based on recent performance
    const avgPoints = parseFloat(player.strPoints) || 0;
    const avgAssists = parseFloat(player.strAssists) || 0;
    const avgRebounds = parseFloat(player.strRebounds) || 0;

    // Predict next game performance (basic logic: increase by 5% for points, 3% for assists, etc.)
    const predictedPoints = avgPoints * 1.05;  // 5% increase
    const predictedAssists = avgAssists * 1.03; // 3% increase
    const predictedRebounds = avgRebounds * 1.02; // 2% increase

    return `Prediction: Points: ${predictedPoints.toFixed(1)}, Assists: ${predictedAssists.toFixed(1)}, Rebounds: ${predictedRebounds.toFixed(1)}`;
}

// Load player stats when the page loads
window.onload = loadPlayerStats;
