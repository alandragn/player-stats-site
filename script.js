const nbaApiUrl = 'https://www.thesportsdb.com/api/v1/json/1/searchplayers.php?t=NBA';
const nflApiUrl = 'https://www.thesportsdb.com/api/v1/json/1/searchplayers.php?t=NFL';

// Fallback demo players, always visible if API fails
const demoPlayers = [
    {
        strPlayer: "LeBron James",
        strPosition: "Forward",
        strPoints: 27,
        strAssists: 7,
        strRebounds: 8,
        strDefensive: "98",
        strSteals: "2"
    },
    {
        strPlayer: "Patrick Mahomes",
        strPosition: "Quarterback",
        strPoints: "N/A",
        strAssists: "N/A",
        strRebounds: "N/A",
        strDefensive: "N/A",
        strTackles: "1"
    }
];

async function fetchStats(apiUrl) {
    try {
        const response = await fetch(apiUrl);
        const data = await response.json();
        return data.player || [];
    } catch (error) {
        console.error('Error fetching data:', error);
        return [];
    }
}

async function loadPlayerStats() {
    let nbaPlayers = await fetchStats(nbaApiUrl);
    let nflPlayers = await fetchStats(nflApiUrl);

    // Use demo data if both fetches fail
    if ((!nbaPlayers || nbaPlayers.length === 0) && (!nflPlayers || nflPlayers.length === 0)) {
        nbaPlayers = demoPlayers;
        nflPlayers = [];
    }

    const allPlayers = [...nbaPlayers, ...nflPlayers];

    console.log("Loaded Players:", allPlayers); // Debugging log

    const playerListContainer = document.getElementById('player-list');
    playerListContainer.innerHTML = "";
    allPlayers.forEach(player => {
        const playerDiv = document.createElement('div');
        playerDiv.className = "player-card";
        playerDiv.innerHTML = `<h4>${player.strPlayer}</h4><p>Position: ${player.strPosition}</p>`;
        playerDiv.onclick = () => showPlayerDetails(player);  // Pass correct player data
        playerListContainer.appendChild(playerDiv);
    });
    document.getElementById('player-details').style.display = 'none';
    document.getElementById('player-stats').style.display = 'block';
}

function showPlayerDetails(player) {
    console.log("Clicked Player:", player);  // Debugging log
    document.getElementById('player-stats').style.display = 'none';
    document.getElementById('player-details').style.display = 'block';
    document.getElementById('player-name').innerText = player.strPlayer;

    createStatChart(player);

    const defenseStats = document.getElementById('defense-stats');
    defenseStats.innerHTML = `
        <p>Defensive Rating: ${player.strDefensive || 'N/A'}</p>
        <p>Tackles (NFL): ${player.strTackles || 'N/A'}</p>
        <p>Steals (NBA): ${player.strSteals || 'N/A'}</p>
    `;

    const prediction = document.getElementById('prediction');
    prediction.innerText = makePrediction(player);

    document.getElementById('back-button').onclick = loadPlayerStats;
}

function createStatChart(player) {
    const canvas = document.getElementById('statsChart');

    // Destroy previous chart if present
    if (canvas.chartInstance) {
        canvas.chartInstance.destroy();
    }

    const ctx = canvas.getContext('2d');
    const statsData = [
        parseFloat(player.strPoints) || parseFloat(player.strTackles) || 0,
        parseFloat(player.strRebounds) || 0,
        parseFloat(player.strAssists) || 0
    ];

    console.log("Stats Data:", statsData);  // Debugging log

    const statsChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Points/Tackles', 'Rebounds', 'Assists'],
            datasets: [{
                label: `${player.strPlayer}'s Stats`,
                data: statsData,
                backgroundColor: 'rgba(54, 162, 235, 0.2)',
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 1
            }]
        },
        options: {
            scales: { y: { beginAtZero: true }}
        }
    });

    canvas.chartInstance = statsChart;
}

function makePrediction(player) {
    const avgPoints = parseFloat(player.strPoints) || 0;
    const avgAssists = parseFloat(player.strAssists) || 0;
    const avgRebounds = parseFloat(player.strRebounds) || 0;

    const predictedPoints = avgPoints ? (avgPoints * 1.05).toFixed(1) : "N/A";
    const predictedAssists = avgAssists ? (avgAssists * 1.03).toFixed(1) : "N/A";
    const predictedRebounds = avgRebounds ? (avgRebounds * 1.02).toFixed(1) : "N/A";
    return `Prediction: Points: ${predictedPoints}, Assists: ${predictedAssists}, Rebounds: ${predictedRebounds}`;
}

// Run when the page loads
window.onload = loadPlayerStats;
