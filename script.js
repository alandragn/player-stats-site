// script.js — ready to copy

// Backend URL
const PROXY = (location.hostname === 'localhost' || location.hostname === '127.0.0.1') 
    ? 'http://localhost:3000' 
    : 'https://espn-nfl-backend.onrender.com';

const searchInput = document.getElementById('searchInput');
const searchButton = document.getElementById('searchButton');
const playerContainer = document.getElementById('playerContainer');

// Fetch all players from backend
async function fetchAllPlayers() {
    try {
        const res = await fetch(`${PROXY}/api/players`);
        const data = await res.json();
        return data.players || [];
    } catch (err) {
        console.error('Error fetching players:', err);
        return [];
    }
}

// Render a single player card
function renderPlayer(player) {
    const card = document.createElement('div');
    card.className = 'player-card';
    card.innerHTML = `
        <img src="${player.headshot || ''}" alt="${player.name}" class="player-img">
        <h3>${player.name}</h3>
        <p>Team: ${player.team || 'N/A'}</p>
        <p>Position: ${player.position || 'N/A'}</p>
        <button class="stats-btn">View Stats</button>
        <div class="player-stats" style="display:none;"></div>
    `;

    // Show more stats on button click
    const btn = card.querySelector('.stats-btn');
    const statsDiv = card.querySelector('.player-stats');
    btn.addEventListener('click', async () => {
        if (statsDiv.style.display === 'none') {
            statsDiv.innerHTML = '<p>Loading stats...</p>';
            statsDiv.style.display = 'block';
            try {
                const res = await fetch(`${PROXY}/api/player/${player.id}`);
                const data = await res.json();
                statsDiv.innerHTML = `
                    <p>Height: ${data.height || 'N/A'}</p>
                    <p>Weight: ${data.weight || 'N/A'}</p>
                    <p>Birth Date: ${data.birthDate || 'N/A'}</p>
                    <p>Yards: ${data.yards || 'N/A'}</p>
                    <p>Touchdowns: ${data.touchdowns || 'N/A'}</p>
                `;
            } catch (err) {
                statsDiv.innerHTML = '<p>Error loading stats.</p>';
                console.error(err);
            }
        } else {
            statsDiv.style.display = 'none';
        }
    });

    playerContainer.appendChild(card);
}

// Handle search
searchButton.addEventListener('click', async () => {
    const query = searchInput.value.trim().toLowerCase();
    playerContainer.innerHTML = '<p>Searching...</p>';
    const players = await fetchAllPlayers();
    const filtered = players.filter(p => p.name.toLowerCase().includes(query));
    playerContainer.innerHTML = '';
    if (filtered.length === 0) {
        playerContainer.innerHTML = '<p>No players found.</p>';
    } else {
        filtered.forEach(renderPlayer);
    }
});

// Optionally, load all players on page load
window.addEventListener('DOMContentLoaded', async () => {
    playerContainer.innerHTML = '<p>Loading players...</p>';
    const players = await fetchAllPlayers();
    playerContainer.innerHTML = '';
    players.forEach(renderPlayer);
});
