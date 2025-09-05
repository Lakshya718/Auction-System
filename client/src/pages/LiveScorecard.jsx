import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import axios from '../../api/axios';
import useSocket from '../hooks/useSocket';

const LiveScorecard = () => {
  const { matchId } = useParams();
  const [scorecard, setScorecard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Socket integration for real-time updates
  const handleMatchUpdate = useCallback((updatedMatch) => {
    // Update scorecard from socket data
    fetchScorecardFromMatch(updatedMatch);
  }, []);

  useSocket(matchId, handleMatchUpdate);

  const fetchScorecardFromMatch = (match) => {
    // Convert match data to scorecard format (similar to backend)
    const currentInnings = match.innings.find(
      (inn) => inn.inningsNumber === match.currentInnings
    );
    const scorecardData = {
      matchTitle: match.matchTitle,
      team1: match.team1,
      team2: match.team2,
      status: match.status,
      currentInnings: match.currentInnings,
      totalOvers: match.totalOvers,
      venue: match.venue,
      tossWinner: match.tossWinner,
      tossDecision: match.tossDecision,
      result: match.result,
    };

    if (currentInnings) {
      // Get current batsmen stats
      const strikerStats = currentInnings.batsmenStats.find(
        (b) => b.playerName === currentInnings.currentBatsmen.striker
      );
      const nonStrikerStats = currentInnings.batsmenStats.find(
        (b) => b.playerName === currentInnings.currentBatsmen.nonStriker
      );

      scorecardData.currentScore = {
        battingTeam: currentInnings.battingTeam,
        runs: currentInnings.totalRuns,
        wickets: currentInnings.wickets,
        overs: currentInnings.overs,
        runRate: currentInnings.runRate,
        currentBatsmen: {
          striker: {
            name: currentInnings.currentBatsmen.striker,
            runs: strikerStats?.runs || 0,
            ballsFaced: strikerStats?.ballsFaced || 0,
          },
          nonStriker: {
            name: currentInnings.currentBatsmen.nonStriker,
            runs: nonStrikerStats?.runs || 0,
            ballsFaced: nonStrikerStats?.ballsFaced || 0,
          },
        },
        currentBowler: currentInnings.currentBowler,
        target: currentInnings.target || null,
        requiredRunRate: currentInnings.requiredRunRate || null,
      };

      // Recent balls (last 6 balls)
      const allBalls = [];
      currentInnings.oversData.forEach((over) => {
        over.balls.forEach((ball) => {
          allBalls.push({
            over: over.overNumber,
            ball: ball.ballNumber,
            runs: ball.runs,
            isWicket: ball.isWicket,
            isExtra: ball.isExtra,
            extraType: ball.extraType,
          });
        });
      });
      scorecardData.recentBalls = allBalls.slice(-6);
    }

    // Previous innings summary (if completed)
    if (match.innings[0] && match.innings[0].isCompleted) {
      const firstInnings = match.innings[0];
      scorecardData.firstInningsScore = {
        battingTeam: firstInnings.battingTeam,
        runs: firstInnings.totalRuns,
        wickets: firstInnings.wickets,
        overs: firstInnings.overs,
      };
    }

    setScorecard(scorecardData);
  };

  useEffect(() => {
    const fetchScorecard = async () => {
      try {
        const response = await axios.get(`/live-matches/${matchId}/scorecard`);
        if (response.data.success) {
          setScorecard(response.data.scorecard);
          setError('');
        } else {
          setError('Failed to fetch scorecard');
        }
      } catch (error) {
        setError(error.response?.data?.message || 'Failed to fetch scorecard');
      } finally {
        setLoading(false);
      }
    };

    fetchScorecard();

    // Auto-refresh every 15 seconds if enabled
    let interval;
    if (autoRefresh) {
      interval = setInterval(fetchScorecard, 15000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [matchId, autoRefresh]);

  const refreshScorecard = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`/live-matches/${matchId}/scorecard`);
      if (response.data.success) {
        setScorecard(response.data.scorecard);
        setError('');
      } else {
        setError('Failed to fetch scorecard');
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to fetch scorecard');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'live':
        return 'text-green-600 bg-green-100';
      case 'completed':
        return 'text-blue-600 bg-blue-100';
      case 'upcoming':
        return 'text-yellow-600 bg-yellow-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading scorecard...</p>
        </div>
      </div>
    );
  }

  if (error || !scorecard) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            {error || 'Scorecard not found'}
          </h2>
          <button
            onClick={refreshScorecard}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 py-4">
      <div className="max-w-6xl mx-auto px-4">
        {/* Compact Header */}
        <div className="bg-white rounded-xl shadow-lg p-4 mb-4">
          <div className="flex justify-between items-start mb-3">
            <div>
              <h1 className="text-xl font-bold text-gray-800 mb-1 flex items-center gap-2">
                <span className="text-green-600">🏏</span>
                {scorecard.matchTitle}
              </h1>
              <p className="text-sm text-gray-600">
                📍 {scorecard.venue} • {scorecard.totalOvers} overs
              </p>
            </div>
            <div className="text-right">
              <span
                className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(scorecard.status)}`}
              >
                {scorecard.status.toUpperCase()}
              </span>
              <div className="mt-2">
                <button
                  onClick={() => setAutoRefresh(!autoRefresh)}
                  className={`text-xs px-3 py-1 rounded-full transition-colors ${
                    autoRefresh
                      ? 'bg-green-100 text-green-800 hover:bg-green-200'
                      : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                  }`}
                >
                  {autoRefresh ? '🔄 Live' : '⏸️ Paused'}
                </button>
              </div>
            </div>
          </div>

          {/* Compact Toss Info */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-3 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-800">
              🪙 <strong>{scorecard.tossWinner}</strong> won the toss and chose
              to <strong>{scorecard.tossDecision}</strong>
            </p>
          </div>
        </div>

        {/* Compact Current Score */}
        {scorecard.currentScore && (
          <div className="bg-white rounded-xl shadow-lg p-4 mb-4">
            <h2 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <span className="text-blue-600">📊</span>
              Innings {scorecard.currentInnings}
            </h2>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
              <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-3 rounded-lg text-center border border-blue-200">
                <h3 className="text-sm font-medium text-blue-800">
                  {scorecard.currentScore.battingTeam}
                </h3>
                <p className="text-2xl font-bold text-blue-900">
                  {scorecard.currentScore.runs}/{scorecard.currentScore.wickets}
                </p>
                <p className="text-xs text-blue-700">
                  {scorecard.currentScore.overs} ov • RR:{' '}
                  {scorecard.currentScore.runRate}
                </p>
              </div>

              {scorecard.currentScore.target && (
                <div className="bg-gradient-to-r from-orange-50 to-orange-100 p-3 rounded-lg text-center border border-orange-200">
                  <h3 className="text-sm font-medium text-orange-800">
                    Target
                  </h3>
                  <p className="text-xl font-bold text-orange-900">
                    {scorecard.currentScore.target}
                  </p>
                  <p className="text-xs text-orange-700">
                    Need{' '}
                    {scorecard.currentScore.target -
                      scorecard.currentScore.runs}{' '}
                    • RRR: {scorecard.currentScore.requiredRunRate}
                  </p>
                </div>
              )}

              <div className="bg-gradient-to-r from-green-50 to-green-100 p-3 rounded-lg border border-green-200 lg:col-span-2">
                <h3 className="text-sm font-medium text-green-800 mb-2">
                  Current Batsmen
                </h3>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="text-green-700">
                    <p className="font-medium">
                      *{scorecard.currentScore.currentBatsmen.striker.name}
                    </p>
                    <p>
                      {scorecard.currentScore.currentBatsmen.striker.runs} (
                      {scorecard.currentScore.currentBatsmen.striker.ballsFaced}
                      )
                    </p>
                  </div>
                  <div className="text-green-700">
                    <p className="font-medium">
                      {scorecard.currentScore.currentBatsmen.nonStriker.name}
                    </p>
                    <p>
                      {scorecard.currentScore.currentBatsmen.nonStriker.runs} (
                      {
                        scorecard.currentScore.currentBatsmen.nonStriker
                          .ballsFaced
                      }
                      )
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Current Bowler & Recent Balls */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
              <div className="bg-gradient-to-r from-red-50 to-red-100 p-3 rounded-lg border border-red-200">
                <h3 className="text-sm font-medium text-red-800 mb-1">
                  Current Bowler
                </h3>
                <p className="text-lg font-bold text-red-900">
                  {scorecard.currentScore.currentBowler}
                </p>
              </div>

              {/* Recent Balls */}
              {scorecard.recentBalls && scorecard.recentBalls.length > 0 && (
                <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                  <h3 className="text-sm font-medium text-gray-800 mb-2">
                    Recent Balls
                  </h3>
                  <div className="flex flex-wrap gap-1.5">
                    {scorecard.recentBalls.map((ball, index) => (
                      <span
                        key={index}
                        className={`px-2 py-1 rounded-full text-xs font-bold ${
                          ball.isWicket
                            ? 'bg-red-500 text-white'
                            : ball.isExtra
                              ? 'bg-orange-500 text-white'
                              : ball.runs >= 4
                                ? 'bg-green-500 text-white'
                                : 'bg-gray-300 text-gray-800'
                        }`}
                      >
                        {ball.isWicket ? 'W' : ball.runs}
                        {ball.isExtra && `+${ball.extraType}`}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* First Innings Summary (if completed) */}
        {scorecard.firstInningsScore && (
          <div className="bg-white rounded-xl shadow-lg p-4 mb-4">
            <h2 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <span className="text-gray-600">📈</span>
              First Innings Summary
            </h2>
            <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
              <div className="text-center">
                <h3 className="text-base font-medium text-gray-800">
                  {scorecard.firstInningsScore.battingTeam}
                </h3>
                <p className="text-xl font-bold text-gray-900">
                  {scorecard.firstInningsScore.runs}/
                  {scorecard.firstInningsScore.wickets}
                </p>
                <p className="text-sm text-gray-600">
                  {scorecard.firstInningsScore.overs} overs
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Match Result */}
        {scorecard.status === 'completed' && scorecard.result && (
          <div className="bg-white rounded-xl shadow-lg p-4 mb-4">
            <h2 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <span className="text-yellow-600">🏆</span>
              Match Result
            </h2>
            <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 p-4 rounded-lg border border-yellow-200 text-center">
              {scorecard.result.winner ? (
                <>
                  <h3 className="text-xl font-bold text-yellow-800 mb-2">
                    🏆 {scorecard.result.winner} Won!
                  </h3>
                  <p className="text-yellow-700 text-base">
                    {scorecard.result.margin}
                  </p>
                </>
              ) : (
                <h3 className="text-xl font-bold text-yellow-800">
                  🤝 {scorecard.result.margin}
                </h3>
              )}

              {scorecard.result.playerOfTheMatch && (
                <p className="mt-3 text-yellow-700 text-sm">
                  <strong>Player of the Match:</strong>{' '}
                  {scorecard.result.playerOfTheMatch}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Compact Footer */}
        <div className="text-center text-gray-600 py-3">
          <p className="text-xs mb-2">
            Last updated: {new Date().toLocaleTimeString()}
          </p>
          <button
            onClick={refreshScorecard}
            className="px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-xs transition-colors"
          >
            🔄 Refresh Now
          </button>
        </div>
      </div>
    </div>
  );
};

export default LiveScorecard;
