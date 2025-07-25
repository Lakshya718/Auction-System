import { FaGavel, FaPaperPlane } from 'react-icons/fa';

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
    <div className="player-card bg-white/10 backdrop-blur-lg rounded-2xl shadow-lg overflow-hidden border border-gray-200/20 transition-all duration-300 hover:shadow-2xl hover:scale-105">
      <div className="flex flex-col md:flex-row items-center p-6 gap-6">
        {/* Player Photo */}
        <div className="relative flex-shrink-0">
          <img
            src={player.profilePhoto}
            alt={player.playerName || "Player Photo"}
            className="w-32 h-32 object-cover rounded-full shadow-md border-4 border-purple-500/50"
          />
          {player.playerRole && (
            <span className="absolute bottom-2 right-0 bg-purple-600 text-white text-xs font-bold px-2 py-1 rounded-full">
              {player.playerRole}
            </span>
          )}
        </div>

        {/* Player Info */}
        <div className="flex-1 text-center md:text-left">
          <h3 className="text-3xl font-bold text-white tracking-wide">
            {player.playerName || "Unnamed Player"}
          </h3>
          <p className="text-purple-300 font-semibold text-lg">
            Base Price: ${player.basePrice?.toLocaleString()}
          </p>
          {currentBid !== undefined && (
            <p className="text-green-400 font-bold text-xl">
              Current Bid: ${currentBid?.toLocaleString()}
            </p>
          )}
          {currentTeam && (
            <p className="text-gray-300">
              Highest Bidder: <span className="font-semibold text-white">{currentTeam}</span>
            </p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col items-center justify-center gap-4">
          {isAdminView && (
            <button
              className="flex items-center gap-2 text-white bg-green-500 px-6 py-3 rounded-lg hover:bg-green-600 transition-all duration-300 transform hover:scale-110 shadow-lg"
              onClick={() => onSendPlayer(player)}
            >
              <FaPaperPlane />
              <span>Send Player</span>
            </button>
          )}
          {!isAdminView && role === "team_owner" && (
            <button
              className={`flex items-center gap-2 p-4 rounded-lg px-6 text-white font-bold transition-all duration-300 transform hover:scale-110 shadow-lg ${
                isSelling || placeBidDisabled
                  ? "bg-gray-600 cursor-not-allowed"
                  : "bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
              }`}
              disabled={isSelling || placeBidDisabled}
              onClick={onPlaceBid}
              aria-label={`Place bid for ${player.playerName}`}
            >
              <FaGavel />
              <span>Place Bid</span>
            </button>
          )}
        </div>
      </div>

      {/* Bidding History */}
      {biddingHistory && biddingHistory.length > 0 && (
        <div className="bidding-history bg-black/20 p-4 mt-4 border-t border-gray-200/10">
          <h4 className="font-semibold text-white mb-2 text-center">Bidding History</h4>
          <ul className="text-sm text-gray-300 list-none max-h-40 overflow-y-auto space-y-2 pr-2">
            {biddingHistory.map((bid, index) => (
              <li key={index} className="flex justify-between items-center bg-white/5 p-2 rounded-md">
                <span>
                  <span className="font-bold text-purple-300">{bid.teamName || bid.team}</span> bid <span className="font-bold text-green-400">${bid.amount?.toLocaleString()}</span>
                </span>
                <span className="text-xs text-gray-400">
                  {new Date(bid.timestamp).toLocaleTimeString()}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default PlayerCard;