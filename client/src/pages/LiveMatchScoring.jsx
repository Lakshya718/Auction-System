import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from '../../api/axios';
import useSocket from '../hooks/useSocket';

const LiveMatchScoring = () => {
  const { matchId } = useParams();
  const navigate = useNavigate();
  const [match, setMatch] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [ballData, setBallData] = useState({
    runs: 0,
    isWicket: false,
    wicketType: '',
    dismissedPlayer: '',
    dismissedBy: '',
    isExtra: false,
    extraType: '',
    extraRuns: 0,
    commentary: '',
  });
  const [showWicketModal, setShowWicketModal] = useState(false);
  const [showExtraModal, setShowExtraModal] = useState(false);
  const [showNewBatsmanModal, setShowNewBatsmanModal] = useState(false);
  const [showNewOverModal, setShowNewOverModal] = useState(false);
  const [newBatsman, setNewBatsman] = useState('');
  const [newBowler, setNewBowler] = useState('');
  const [wicketOnLastBall, setWicketOnLastBall] = useState(false);

  // Socket integration for real-time updates
  const handleMatchUpdate = useCallback((updatedMatch) => {
    setMatch(updatedMatch);
  }, []);

  useSocket(matchId, handleMatchUpdate);

  useEffect(() => {
    const fetchMatch = async () => {
      try {
        const response = await axios.get(`/live-matches/${matchId}`);
        if (response.data.success) {
          setMatch(response.data.match);
        } else {
          setError('Failed to fetch match details');
        }
      } catch (error) {
        setError(
          error.response?.data?.message || 'Failed to fetch match details'
        );
      } finally {
        setLoading(false);
      }
    };

    fetchMatch();
  }, [matchId]);

  const getCurrentInnings = () => {
    if (!match) return null;
    return match.innings.find(
      (inn) => inn.inningsNumber === match.currentInnings
    );
  };

  const getCurrentOver = () => {
    const currentInnings = getCurrentInnings();
    if (!currentInnings) return null;
    return currentInnings.oversData[currentInnings.oversData.length - 1];
  };

  const getAvailableBatsmen = () => {
    if (!match) return [];
    const currentInnings = getCurrentInnings();
    if (!currentInnings) return [];

    const battingTeam = currentInnings.battingTeam;
    const teamPlayers =
      battingTeam === match.team1 ? match.team1Players : match.team2Players;

    // Get current batsmen at crease
    const currentBatsmen = [
      currentInnings.currentBatsmen.striker,
      currentInnings.currentBatsmen.nonStriker,
    ];

    // Filter available batsmen: exclude those who are out and exclude current batsmen
    const availableBatsmen = teamPlayers.filter((player) => {
      // Don't include current batsmen at crease
      if (currentBatsmen.includes(player.playerName)) {
        return false;
      }

      // Check if player has batted and is out
      const batsmanStats = currentInnings.batsmenStats.find(
        (b) => b.playerName === player.playerName
      );

      // If player hasn't batted yet, they are available
      if (!batsmanStats) {
        return true;
      }

      // If player has batted but is not out, they are available
      return !batsmanStats.isOut;
    });

    return availableBatsmen;
  };

  const getAvailableBowlers = () => {
    if (!match) return [];
    const currentInnings = getCurrentInnings();
    if (!currentInnings) return [];

    const bowlingTeam = currentInnings.bowlingTeam;
    const teamPlayers =
      bowlingTeam === match.team1 ? match.team1Players : match.team2Players;

    return teamPlayers.filter(
      (player) =>
        ['bowler', 'all-rounder'].includes(player.role) &&
        player.playerName !== currentInnings.currentBowler
    );
  };

  const recordBall = async () => {
    const currentInnings = getCurrentInnings();
    const currentOver = getCurrentOver();

    if (!currentInnings || !currentOver) {
      setError('Invalid match state');
      return;
    }

    const ballInfo = {
      ...ballData,
      overNumber: currentOver.overNumber,
      ballNumber: currentOver.balls.length + 1,
      batsman: currentInnings.currentBatsmen.striker,
      bowler: currentInnings.currentBowler,
    };

    try {
      const response = await axios.post(
        `/live-matches/${matchId}/ball`,
        ballInfo
      );
      if (response.data.success) {
        setMatch(response.data.match);

        // Reset ball data
        setBallData({
          runs: 0,
          isWicket: false,
          wicketType: '',
          dismissedPlayer: '',
          dismissedBy: '',
          isExtra: false,
          extraType: '',
          extraRuns: 0,
          commentary: '',
        });

        // Check if new batsman is needed after wicket
        if (ballData.isWicket) {
          // Check if this wicket happened on what would be the 6th ball of the over
          // We need to check the updated over from the response
          const updatedInnings = response.data.match.innings.find(
            (inn) => inn.inningsNumber === match.currentInnings
          );
          const updatedOver = updatedInnings?.oversData?.find(
            (over) => over.overNumber === currentOver.overNumber
          );

          // If the over is now completed after this ball, it was the 6th ball
          const isLastBallOfOver = updatedOver?.isCompleted || false;
          setWicketOnLastBall(isLastBallOfOver);

          setShowNewBatsmanModal(true);
        }

        // Check if new over is needed
        const updatedOver = response.data.match.innings
          .find((inn) => inn.inningsNumber === match.currentInnings)
          ?.oversData?.find(
            (over) => over.overNumber === currentOver.overNumber
          );

        if (updatedOver?.isCompleted) {
          setShowNewOverModal(true);
        }
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to record ball');
    }
  };

  const addNewBatsman = async () => {
    if (!newBatsman) return;

    // Determine position based on whether wicket happened on last ball of over
    // If wicket on 6th ball, new batsman goes to non-striker end (will become striker after over swap)
    // Otherwise, new batsman takes striker position
    const position = wicketOnLastBall ? 'nonStriker' : 'striker';

    try {
      const response = await axios.put(
        `/live-matches/${matchId}/change-batsman`,
        {
          newBatsman,
          position,
        }
      );

      if (response.data.success) {
        setMatch(response.data.match);
        setNewBatsman('');
        setShowNewBatsmanModal(false);
        setWicketOnLastBall(false); // Reset the flag
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to add new batsman');
    }
  };

  const startNewOver = async () => {
    if (!newBowler) return;

    const currentOver = getCurrentOver();
    const nextOverNumber = currentOver ? currentOver.overNumber + 1 : 1;

    try {
      const response = await axios.post(`/live-matches/${matchId}/new-over`, {
        bowler: newBowler,
        overNumber: nextOverNumber,
      });

      if (response.data.success) {
        setMatch(response.data.match);
        setNewBowler('');
        setShowNewOverModal(false);
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to start new over');
    }
  };

  const handleRunsClick = (runs) => {
    setBallData((prev) => ({ ...prev, runs, isExtra: false, extraType: '' }));
  };

  const handleWicket = () => {
    setShowWicketModal(true);
  };

  const handleExtra = () => {
    setShowExtraModal(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!match || match.status !== 'live') {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            {!match ? 'Match not found' : 'Match is not live'}
          </h2>
          <button
            onClick={() => navigate('/live-matches')}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Back to Matches
          </button>
        </div>
      </div>
    );
  }

  const currentInnings = getCurrentInnings();
  const currentOver = getCurrentOver();

  return (
    <div className="min-h-screen bg-gray-100 py-4">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">
            {match.matchTitle}
          </h1>

          {/* Current Score */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-semibold text-blue-800">
                {currentInnings?.battingTeam}
              </h3>
              <p className="text-2xl font-bold text-blue-900">
                {currentInnings?.totalRuns}/{currentInnings?.wickets}
              </p>
              <p className="text-sm text-blue-700">
                {currentInnings?.overs} overs (RR: {currentInnings?.runRate})
              </p>
            </div>

            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="font-semibold text-green-800">Current Batsmen</h3>
              <p className="text-sm text-green-700">
                <strong>
                  *{currentInnings?.currentBatsmen.striker}{' '}
                  {currentInnings?.batsmenStats.find(
                    (b) =>
                      b.playerName === currentInnings?.currentBatsmen.striker
                  )?.runs || 0}
                  (
                  {currentInnings?.batsmenStats.find(
                    (b) =>
                      b.playerName === currentInnings?.currentBatsmen.striker
                  )?.ballsFaced || 0}
                  )
                </strong>
              </p>
              <p className="text-sm text-green-700">
                {currentInnings?.currentBatsmen.nonStriker}{' '}
                {currentInnings?.batsmenStats.find(
                  (b) =>
                    b.playerName === currentInnings?.currentBatsmen.nonStriker
                )?.runs || 0}
                (
                {currentInnings?.batsmenStats.find(
                  (b) =>
                    b.playerName === currentInnings?.currentBatsmen.nonStriker
                )?.ballsFaced || 0}
                )
              </p>
            </div>

            <div className="bg-red-50 p-4 rounded-lg">
              <h3 className="font-semibold text-red-800">Current Bowler</h3>
              <p className="text-lg font-bold text-red-900">
                {currentInnings?.currentBowler}
              </p>
              <p className="text-sm text-red-700">
                Over {currentOver?.overNumber}.{currentOver?.balls.length || 0}
              </p>
            </div>

            <div className="bg-yellow-50 p-4 rounded-lg">
              <h3 className="font-semibold text-yellow-800">This Over</h3>
              <div className="flex flex-wrap gap-1">
                {currentOver?.balls.map((ball, index) => (
                  <span
                    key={index}
                    className={`px-2 py-1 rounded text-xs font-bold ${
                      ball.isWicket
                        ? 'bg-red-500 text-white'
                        : ball.isExtra
                          ? 'bg-orange-500 text-white'
                          : ball.runs >= 4
                            ? 'bg-green-500 text-white'
                            : 'bg-gray-300 text-gray-800'
                    }`}
                  >
                    {ball.isWicket
                      ? 'W'
                      : ball.isExtra
                        ? `${ball.extraType.charAt(0).toUpperCase()}${ball.extraRuns}`
                        : ball.runs}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {/* Scoring Panel */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Ball Entry */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-6">
              Record Ball
            </h2>

            {/* Runs */}
            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-700 mb-3">Runs</h3>
              <div className="grid grid-cols-4 gap-2">
                {[0, 1, 2, 3, 4, 6].map((runs) => (
                  <button
                    key={runs}
                    onClick={() => handleRunsClick(runs)}
                    className={`p-3 rounded-lg font-bold text-lg ${
                      ballData.runs === runs && !ballData.isExtra
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                    }`}
                  >
                    {runs}
                  </button>
                ))}
              </div>
            </div>

            {/* Special Events */}
            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-700 mb-3">
                Special Events
              </h3>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={handleWicket}
                  className={`p-3 rounded-lg font-bold ${
                    ballData.isWicket
                      ? 'bg-red-600 text-white'
                      : 'bg-red-100 text-red-800 hover:bg-red-200'
                  }`}
                >
                  Wicket
                </button>
                <button
                  onClick={handleExtra}
                  className={`p-3 rounded-lg font-bold ${
                    ballData.isExtra
                      ? 'bg-orange-600 text-white'
                      : 'bg-orange-100 text-orange-800 hover:bg-orange-200'
                  }`}
                >
                  Extra
                </button>
              </div>
            </div>

            {/* Commentary */}
            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-700 mb-3">
                Commentary
              </h3>
              <textarea
                value={ballData.commentary}
                onChange={(e) =>
                  setBallData((prev) => ({
                    ...prev,
                    commentary: e.target.value,
                  }))
                }
                placeholder="Add ball commentary..."
                rows="3"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Submit Ball */}
            <button
              onClick={recordBall}
              disabled={
                ballData.isWicket &&
                (!ballData.wicketType || !ballData.dismissedPlayer)
              }
              className="w-full py-3 bg-green-600 text-white rounded-lg font-bold text-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              Record Ball
            </button>
          </div>

          {/* Match Information */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-6">
              Match Information
            </h2>

            {/* Batting Stats */}
            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-700 mb-3">
                Batting ({currentInnings?.battingTeam}) - Top 3
              </h3>
              <div className="space-y-2">
                {currentInnings?.batsmenStats
                  .filter((b) => b.ballsFaced > 0 || !b.isOut)
                  .sort((a, b) => b.runs - a.runs)
                  .slice(0, 3)
                  .map((batsman, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-center p-2 bg-gray-50 rounded"
                    >
                      <span
                        className={`font-medium ${
                          batsman.playerName ===
                          currentInnings.currentBatsmen.striker
                            ? 'text-green-600'
                            : ''
                        }`}
                      >
                        {batsman.playerName}{' '}
                        {batsman.playerName ===
                          currentInnings.currentBatsmen.striker && '*'}
                      </span>
                      <span className="text-sm">
                        {batsman.runs}({batsman.ballsFaced})
                        {batsman.isOut && (
                          <span className="text-red-600 ml-2">OUT</span>
                        )}
                      </span>
                    </div>
                  ))}
              </div>
            </div>

            {/* Bowling Stats */}
            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-700 mb-3">
                Bowling ({currentInnings?.bowlingTeam}) - Top 5
              </h3>
              <div className="space-y-2">
                {currentInnings?.bowlerStats
                  .sort(
                    (a, b) =>
                      b.wickets - a.wickets || a.runsConceded - b.runsConceded
                  )
                  .slice(0, 5)
                  .map((bowler, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-center p-2 bg-gray-50 rounded"
                    >
                      <span
                        className={`font-medium ${
                          bowler.playerName === currentInnings.currentBowler
                            ? 'text-blue-600'
                            : ''
                        }`}
                      >
                        {bowler.playerName}{' '}
                        {bowler.playerName === currentInnings.currentBowler &&
                          '*'}
                      </span>
                      <span className="text-sm">
                        {bowler.oversBowled}-{bowler.runsConceded}-
                        {bowler.wickets}
                      </span>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>

        {/* Wicket Modal */}
        {showWicketModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <h3 className="text-xl font-semibold mb-4">Wicket Details</h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Wicket Type *
                  </label>
                  <select
                    value={ballData.wicketType}
                    onChange={(e) =>
                      setBallData((prev) => ({
                        ...prev,
                        wicketType: e.target.value,
                        isWicket: true,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select wicket type</option>
                    <option value="bowled">Bowled</option>
                    <option value="caught">Caught</option>
                    <option value="lbw">LBW</option>
                    <option value="run_out">Run Out</option>
                    <option value="stumped">Stumped</option>
                    <option value="hit_wicket">Hit Wicket</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Dismissed Player *
                  </label>
                  <select
                    value={ballData.dismissedPlayer}
                    onChange={(e) =>
                      setBallData((prev) => ({
                        ...prev,
                        dismissedPlayer: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select player</option>
                    <option value={currentInnings?.currentBatsmen.striker}>
                      {currentInnings?.currentBatsmen.striker} (Striker)
                    </option>
                    <option value={currentInnings?.currentBatsmen.nonStriker}>
                      {currentInnings?.currentBatsmen.nonStriker} (Non-striker)
                    </option>
                  </select>
                </div>

                {['caught', 'run_out', 'stumped'].includes(
                  ballData.wicketType
                ) && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Dismissed By (Fielder/Keeper)
                    </label>
                    <input
                      type="text"
                      value={ballData.dismissedBy}
                      onChange={(e) =>
                        setBallData((prev) => ({
                          ...prev,
                          dismissedBy: e.target.value,
                        }))
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Fielder name"
                    />
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-2 mt-6">
                <button
                  onClick={() => {
                    setShowWicketModal(false);
                    setBallData((prev) => ({
                      ...prev,
                      isWicket: false,
                      wicketType: '',
                      dismissedPlayer: '',
                      dismissedBy: '',
                    }));
                  }}
                  className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    setShowWicketModal(false);
                    recordBall();
                  }}
                  disabled={!ballData.wicketType || !ballData.dismissedPlayer}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:bg-gray-400"
                >
                  Confirm Wicket
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Extra Modal */}
        {showExtraModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <h3 className="text-xl font-semibold mb-4">Extra Details</h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Extra Type *
                  </label>
                  <select
                    value={ballData.extraType}
                    onChange={(e) =>
                      setBallData((prev) => ({
                        ...prev,
                        extraType: e.target.value,
                        isExtra: true,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select extra type</option>
                    <option value="wide">Wide</option>
                    <option value="no_ball">No Ball</option>
                    <option value="bye">Bye</option>
                    <option value="leg_bye">Leg Bye</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Extra Runs
                  </label>
                  <select
                    value={ballData.extraRuns}
                    onChange={(e) =>
                      setBallData((prev) => ({
                        ...prev,
                        extraRuns: parseInt(e.target.value),
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value={1}>1</option>
                    <option value={2}>2</option>
                    <option value={3}>3</option>
                    <option value={4}>4</option>
                    <option value={5}>5</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Additional Runs (off the bat)
                  </label>
                  <select
                    value={ballData.runs}
                    onChange={(e) =>
                      setBallData((prev) => ({
                        ...prev,
                        runs: parseInt(e.target.value),
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value={0}>0</option>
                    <option value={1}>1</option>
                    <option value={2}>2</option>
                    <option value={3}>3</option>
                    <option value={4}>4</option>
                    <option value={6}>6</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 mt-6">
                <button
                  onClick={() => {
                    setShowExtraModal(false);
                    setBallData((prev) => ({
                      ...prev,
                      isExtra: false,
                      extraType: '',
                      extraRuns: 0,
                    }));
                  }}
                  className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
                >
                  Cancel
                </button>
                <button
                  onClick={() => setShowExtraModal(false)}
                  disabled={!ballData.extraType}
                  className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 disabled:bg-gray-400"
                >
                  Confirm Extra
                </button>
              </div>
            </div>
          </div>
        )}

        {/* New Batsman Modal */}
        {showNewBatsmanModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <h3 className="text-xl font-semibold mb-4">New Batsman</h3>

              {/* Position indicator */}
              <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>New batsman will take: </strong>
                  {wicketOnLastBall ? (
                    <span className="text-green-600">
                      Non-striker end (will become striker after over)
                    </span>
                  ) : (
                    <span className="text-red-600">Striker end</span>
                  )}
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select New Batsman *
                  </label>
                  <select
                    value={newBatsman}
                    onChange={(e) => setNewBatsman(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select batsman</option>
                    {getAvailableBatsmen().map((player, index) => (
                      <option key={index} value={player.playerName}>
                        {player.playerName} ({player.role})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 mt-6">
                <button
                  onClick={() => setShowNewBatsmanModal(false)}
                  className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
                >
                  Cancel
                </button>
                <button
                  onClick={addNewBatsman}
                  disabled={!newBatsman}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400"
                >
                  Add Batsman
                </button>
              </div>
            </div>
          </div>
        )}

        {/* New Over Modal */}
        {showNewOverModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <h3 className="text-xl font-semibold mb-4">New Over</h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Bowler *
                  </label>
                  <select
                    value={newBowler}
                    onChange={(e) => setNewBowler(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select bowler</option>
                    {getAvailableBowlers().map((player, index) => (
                      <option key={index} value={player.playerName}>
                        {player.playerName} ({player.role})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 mt-6">
                <button
                  onClick={() => setShowNewOverModal(false)}
                  className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
                >
                  Cancel
                </button>
                <button
                  onClick={startNewOver}
                  disabled={!newBowler}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400"
                >
                  Start Over
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LiveMatchScoring;
