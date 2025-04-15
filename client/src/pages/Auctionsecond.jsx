import { useState } from "react";

export default function Auction() {
  const [teams, setTeams] = useState([
    { name: "Team A", money: 2000, inAuction: true },
    { name: "Team B", money: 2000, inAuction: true },
    { name: "Team C", money: 2000, inAuction: true },
  ]);
  const [currentBid, setCurrentBid] = useState(100);
  const [player, setPlayer] = useState(null);
  const [newPlayer, setNewPlayer] = useState("");

  const handleBid = () => {
    setCurrentBid((prevBid) => prevBid + 20);
  };

  const handleOptOut = (teamIndex) => {
    const updatedTeams = teams.map((team, index) =>
      index === teamIndex ? { ...team, inAuction: false } : team
    );
    setTeams(updatedTeams);

    const remainingTeams = updatedTeams.filter((team) => team.inAuction);
    if (remainingTeams.length === 1) {
      finalizeAuction(remainingTeams[0]);
    }
  };

  const finalizeAuction = (winningTeam) => {
    const updatedTeams = teams.map((team) =>
      team.name === winningTeam.name
        ? { ...team, money: team.money - currentBid }
        : team
    );
    setTeams(updatedTeams);
    setPlayer(null);
  };

  const addNewPlayer = () => {
    if (newPlayer.trim() !== "") {
      setPlayer({ name: newPlayer, team: null });
      setCurrentBid(100);
      setTeams(teams.map((team) => ({ ...team, inAuction: true })));
      setNewPlayer("");
    }
  };

  return (
    <div className="flex flex-col items-center p-8 bg-gray-100 min-h-screen">
      <h2 className="text-3xl font-bold mb-6">Auction</h2>
      
      {/* Admin Section to Add Player */}
      <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-xl text-center mb-6">
        <input
          type="text"
          placeholder="Enter Player Name"
          value={newPlayer}
          onChange={(e) => setNewPlayer(e.target.value)}
          className="border p-2 rounded-lg w-3/4 mr-2"
        />
        <button onClick={addNewPlayer} className="bg-green-500 text-white px-4 py-2 rounded-lg">
          Add Player
        </button>
      </div>
      
      {/* Player Auction Info */}
      {player && (
        <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-xl text-center">
          <h3 className="text-xl font-semibold mb-4">{player.name}</h3>
          <p className="text-gray-600 mb-2">Current Bid: ₹{currentBid}</p>
          <p className="text-gray-600 mb-4">
            {player.team ? `Sold to ${player.team}` : "Bidding in Progress"}
          </p>
        </div>
      )}
      
      {/* Team Bidding Section */}
      {player && (
        <div className="mt-6 w-full max-w-xl">
          {teams.map((team, index) => (
            team.inAuction && (
              <div key={index} className="flex justify-between bg-white p-4 rounded-lg shadow-md mb-4">
                <span className="font-semibold">{team.name}</span>
                <span>₹{team.money}</span>
                <button
                  className="bg-blue-500 text-white px-4 py-2 rounded-lg"
                  onClick={() => handleBid(index)}
                  disabled={player.team !== null}
                >
                  Bid +₹20
                </button>
                <button
                  className="bg-red-500 text-white px-4 py-2 rounded-lg"
                  onClick={() => handleOptOut(index)}
                  disabled={player.team !== null}
                >
                  Opt Out
                </button>
              </div>
            )
          ))}
        </div>
      )}
    </div>
  );
}
