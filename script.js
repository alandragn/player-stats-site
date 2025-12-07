const nbaApiUrl = 'https://www.thesportsdb.com/api/v1/json/1/searchplayers.php?t=NBA';
const nflApiUrl = 'https://www.thesportsdb.com/api/v1/json/1/searchplayers.php?t=NFL';

async function fetchStats(apiUrl) {
    try {
        const response = await fetch(apiUrl);
        const data = await response.json();
        return data.player || [];
    } catch (error) {
        console.error('API fetch failed:', error);
        return [];
    }
}

async function loadPlayerStats() {
    const nbaPlayers = await fetchStats(nbaApiUrl);
    const nflPlayers = await fetchStats(nflApiUrl);
    const allPlayers = [...nbaPlayers, ...nflPlayers];

    const playerListContainer = document.getElementById('player-list');
    playerListContainer.innerHTML = '';

    allPlayers.forEach(player => {
        const playerDiv = document.createElement('div');
        playerDiv.className = "player-card";
        playerDiv.innerHTML = `<h4>${player.strPlayer}</h4><p>Position: ${player.strPosition}</p>`;
        playerDiv.onclick = () => showPlayerDetails(player);
        playerListContainer.appendChild(playerDiv);
    });

    document.getElementById('player-details').style.display = 'none';
    document.getElementById('player-stats').style.display = 'block';
}

function showPlayerDetails(player) {
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
    document.getElementById('prediction').innerText = makePrediction(player);

    document.getElementById('back-button').onclick = loadPlayerStats;
}

function createStatChart(player) {
    const canvas = document.getElementById('statsChart');
    if (canvas.chartInstance) canvas.chartInstance.destroy();
    const ctx = canvas.getContext('2d');
    const statsData = [
        parseFloat(player.strPoints) || parseFloat(player.strTackles) || 0,
        parseFloat(player.strRebounds) || 0,
        parseFloat(player.strAssists) || 0
    ];
    canvas.chartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Points/Tackles', 'Rebounds', 'Assists'],
            datasets: [{
                label: `${player.strPlayer}'s Stats`,
                data: statsData,
                backgroundColor: 'rgba(54,162,235,0.2)',
                borderColor: 'rgba(54,162,235,1)',
                borderWidth: 1
            }]
        },
        options: { scales: { y: { beginAtZero: true } } }
    });
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

window.onload = loadPlayerStats;
