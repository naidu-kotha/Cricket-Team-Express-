const express = require("express");
const path = require("path");
const sqlite3 = require("sqlite3");
const { open } = require("sqlite");

const dbpath = path.join(__dirname, "cricketTeam.db");
const app = express();
app.use(express.json());

let db = null;


// Initialization
const InitializeDBAndServer = async() => {
    try {
        db = await open({
            filename: dbpath,
            driver: sqlite3.Database,
        });
    } catch(e) {
        console.log(`DBError: ${e.message}`);
        process.exit(1);
    }

    return app.listen(3000, () => {
        console.log("Server Running as http;//localhost:3000");
    });
};

InitializeDBAndServer();

// Convert DB Object to Response Object
const convertDbObjectToResponseObject = (dbObject) => {
  return {
    playerId: dbObject.player_id,
    playerName: dbObject.player_name,
    jerseyNumber: dbObject.jersey_number,
    role: dbObject.role,
  };
};


// Get All Players API
app.get('/players/', async(request, response) => {
    const getPlayersQuery = `
    SELECT
      *
    FROM
      cricket_team
    ORDER BY
      player_id;`;

    const playersArray = await db.all(getPlayersQuery);

    let resultArray = []
    for (let player of playersArray) {
        let result = convertDbObjectToResponseObject(player);
        resultArray.push(result);
    };
    
    response.send(resultArray);
    
});


// Add New Player API
app.post('/players/', async(request, response) => {
    const playerDetails = request.body;

    const { player_name, jersey_number, role } = playerDetails;

    const addPlayerQuery = `
    INSERT INTO
      cricket_team (player_name, jersey_number, role)
    VALUES
      ('${player_name}', '${jersey_number}', '${role}');`;

    const dbResponse = await db.run(addPlayerQuery);

    response.send("Player Added to Team");
});


// Get Player by player_id API
app.get("/players/:playerId/", async(request, response) => {
    const { playerId } = request.params;

    const getPlayerQuery = `
    SELECT
      *
    FROM
      cricket_team
    WHERE
      player_id = ${playerId};`;
    
    const player = await db.get(getPlayerQuery);

    let result = convertDbObjectToResponseObject(player);

    response.send(result);
});


// Update Player Details API
app.put("/players/:playerId/", async(request, response) => {
    const {playerId} = request.params;

    const playerDetails = request.body;

    const { player_name, jersey_number, role } = playerDetails

    const updatePlayerQuery = `
    UPDATE
      cricket_team
    SET
      player_name = '${player_name}',
      jersey_number = '${jersey_number}',
      role = '${role}'
    WHERE
      player_id = ${playerId};`;
    
    await db.run(updatePlayerQuery);

    response.send("Player Details Updated");
});


// Delete Player by player_id API
app.delete("/players/:playerId/", async(request, response) => {
    const { playerId } = request.params;

    const deletePlayerQuery = `
    DELETE FROM
      cricket_team
    WHERE
      player_id = ${playerId};`;
    
    await db.run(deletePlayerQuery);

    response.send("Player Removed");
});


module.exports = app;