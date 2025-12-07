document.getElementById("searchBtn").addEventListener("click", async () => {
  const name = document.getElementById("playerInput").value.trim();

  if (!name) {
    alert("Enter a name.");
    return;
  }

  const url = `https://www.thesportsdb.com/api/v1/json/3/searchplayers.php?p=${encodeURIComponent(name)}`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (!data.player) {
      alert("Player not found.");
      return;
    }

    const p = data.player[0];
    displayPlayer(p);

  } catch (err) {
    console.error(err);
    alert("Error fetching player.");
  }
});

function displayPlayer(p) {
  const div = document.getElementById("playerInfo");
  div.classList.remove("hidden");

  div.innerHTML = `
    <h2>${p.strPlayer}</h2>
    <img src="${p.strCutout || p.strThumb || ""}" style="max-width:200px;">
    <p><strong>Team:</strong> ${p.strTeam || "Unknown"}</p>
    <p><strong>Position:</strong> ${p.strPosition || "Unknown"}</p>
    <p><strong>Height:</strong> ${p.strHeight || "N/A"}</p>
    <p><strong>Weight:</strong> ${p.strWeight || "N/A"}</p>
    <p><strong>Birthplace:</strong> ${p.strBirthLocation || "N/A"}</p>
  `;
}
