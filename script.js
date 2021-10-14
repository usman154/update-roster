const csvFilePath = "./updated_players.csv";
const csv = require("csvtojson");
const fs = require("fs");
const players = require("./players");
const download = require("./download");
const gDriveAuth = require("./google-auth");

doParsing(csv, csvFilePath);

async function doParsing(csv, csvFilePath) {
  const jsonArray = await csv().fromFile(csvFilePath);
  const drive = await gDriveAuth();
  const updatedData = [];
  for (let i = 0; i < jsonArray.length; i++) {
    try {
      const player = jsonArray[i];
      const image = player["New Headshot link?"];
      let imageName = null;
      if (image && image.indexOf("https://drive.google.com") >= 0) {
        imageName =
          `${player["Current Player Listed on Roster"]}_${player["NHL Club Name"]}`.replace(
            / /g,
            "_"
          );
        await download(drive, getIdFromUrl(image)[0], imageName);
      }
      const updatedPlayer = {
        update: player["Requested change"],
        "player-img": imageName ? `${imageName}.png` : null,
        "player-name": player["Current Player Listed on Roster"],
        "player-name-updated": player["New Player to be Listed (Full Name)"],
        "club-name": player["NHL Club Name"],
        "team-number": player["Number"],
        position: player["Position"],
        height: player["Height"],
        weight: player["Weight"],
        "birth-place": player["Birthplace (FLAG)"],
        shoots: player["Shoots/Catches (Left/Right)"],
        birthday: player["Birthday (YYYY-MM-DD)"],
        "games-played": player["GP"],
        goals: player["Goals (G)"],
        assists: player["Assists (A)"],
        points: player["Points (P)"],
      };
      updatedData.push(updatedPlayer);
    } catch (error) {
      console.error(error);
    }
  }

  const teams = updateIfNeeded(updatedData, players);
  fs.writeFileSync(
    "updatedPlayers.js",
    `module.exports = {
        teams: ${JSON.stringify(teams, undefined, 2)}
    }`
  );
  console.log(`Done updating players`);
}
function updateIfNeeded(updatedData, data) {
  const teams = data.teams;
  for (let i = 0; i < updatedData.length; i++) {
    const updatedTeam = updatedData[i];
    for (const [team, teamData] of Object.entries(teams)) {
      if (
        `${teamData["franchise-location"]} ${teamData["franchise-name"]}`.trim() ===
          updatedTeam["club-name"].trim() &&
        teamData.players.some(
          (player) => player["player-name"] === updatedTeam["player-name"]
        )
      ) {
        const playerIndex = teamData.players.findIndex((player) => {
          return (
            player["player-name"].trim() === updatedTeam["player-name"].trim()
          );
        });
        if (playerIndex >= 0) {
          let player = teamData.players[playerIndex];
          player["player-name"] =
            updatedTeam["player-name-updated"] || player["player-name"];
          player["player-img"] =
            updatedTeam["player-img"] || player["player-img"];
          player["team-number"] =
            updatedTeam["team-number"] || player["team-number"];
          player["position"] = updatedTeam["position"] || player["position"];
          player["height"] = updatedTeam["height"] || player["height"];
          player["weight"] = updatedTeam["weight"] || player["weight"];
          player["birth-place"] =
            updatedTeam["birth-place"] || player["birth-place"];
          player["weight"] = updatedTeam["weight"] || player["weight"];
          player["shoots"] = updatedTeam["shoots"] || player["shoots"];
          player["birthday"] = updatedTeam["birthday"] || player["birthday"];
          player["games-played"] =
            updatedTeam["games-played"] || player["games-played"];
          player["goals"] = updatedTeam["goals"] || player["goals"];
          player["points"] = updatedTeam["points"] || player["points"];
          player["assists"] = updatedTeam["assists"] || player["assists"];
          teams[team].players[playerIndex] = player;
        }
        break;
      }
    }
  }

  return teams;
}
function getIdFromUrl(url) {
  return url.match(/[-\w]{25,}/);
}
