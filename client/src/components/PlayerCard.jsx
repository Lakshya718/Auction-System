const PlayerCard = ({
  player,
  biddingHistory,
  onSendPlayer,
  isAdminView,
  onPlaceBid,
  placeBidDisabled,
  isSelling,
  role,
  currentBid,
  currentTeam,
}) => {
  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-around gap-4 player-card border p-4 mb-4 rounded-lg shadow-md bg-white">
      {/* Player Photo */}
      <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-gray-400">
        <img
          src={player.profilePhoto}
          alt={player.playerName || "Player Photo"}
          className="w-full h-full object-contain"
        />
      </div>

      {/* Player Info */}
      <div className="text-center md:text-left flex-1">
        <h3 className="font-semibold text-lg">
          {player.playerName || "Unnamed Player"}
        </h3>
        <p>Base Price: {player.basePrice}</p>
        {currentBid !== undefined && <p>Current Bid: {currentBid}</p>}
        {currentTeam !== undefined && (
          <p>Current Team: {currentTeam ? currentTeam : "null"}</p>
        )}
        {player.playerRole && <p>Role: {player.playerRole}</p>}
      </div>

      {/* Admin View: Send Player Button */}
      {isAdminView && (
        <button
          className="text-white bg-green-500 px-4 py-2 rounded-lg hover:bg-green-600 self-center md:self-auto"
          onClick={() => onSendPlayer(player)}
        >
          Send Player
        </button>
      )}

      {/* Bidding History */}
      {biddingHistory && biddingHistory.length > 0 && (
        <div className="bidding-history border-t pt-2 md:border-0 md:pt-0 max-w-xs">
          <h4 className="font-medium">Bidding History:</h4>
          <ul className="text-sm list-disc ml-4 max-h-40 overflow-y-auto">
            {biddingHistory.map((bid, index) => (
              <li key={index}>
                {bid.teamName || bid.team} bid {bid.amount} at{" "}
                {new Date(bid.timestamp).toLocaleTimeString()}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Team Owner View: Place Bid Button */}
      {!isAdminView && role === "team_owner" && (
        <button
          className={`p-2 rounded-lg px-4 text-white ${
            isSelling || placeBidDisabled
              ? "bg-gray-500 cursor-not-allowed"
              : "bg-blue-500 hover:bg-blue-600"
          }`}
          disabled={isSelling || placeBidDisabled}
          onClick={onPlaceBid}
          aria-label={`Place bid for ${player.playerName}`}
        >
          Place Bid
        </button>
      )}
    </div>
  );
};

export default PlayerCard;
