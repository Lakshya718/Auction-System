import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import store from './store/store.js';
import AllPlayers from './pages/AllPlayers.jsx';
import PlayerDetails from './pages/PlayerDetails.jsx';
import TeamDetails from './pages/TeamDetails.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Profile from './pages/Profile.jsx';
import PrivateRoute from './components/PrivateRoute.jsx';
import PublicRoute from './components/PublicRoute.jsx';
import Navbar from './components/Navbar.jsx';
import AllAuctions from './pages/AllAuctions.jsx';
import TeamProfile from './pages/TeamProfile.jsx';
import AddPlayer from './pages/AddPlayer.jsx';
import AllTeams from './pages/AllTeams.jsx';
import CreateAuction from './pages/CreateAuction.jsx';
import PendingPlayerRequests from './pages/PendingPlayerRequests.jsx';
import AuctionDetails from './pages/AuctionDetails.jsx';
import CreateMatch from './pages/CreateMatch.jsx';
import MatchDetails from './pages/MatchDetails.jsx';
import UpdateMatch from './pages/UpdateMatch.jsx';
import AdminLiveBidding from './pages/AdminLiveBidding.jsx';

const App = () => {
  return (
    <Provider store={store}>
      <Router>
        <Navbar/>
          <Routes>
            <Route
              path="/login"
              element={
                <PublicRoute>
                  <Login />
                </PublicRoute>
              }
            />
            <Route
              path="/register"
              element={
                <PublicRoute>
                  <Register />
                </PublicRoute>
              }
            />
            <Route
              path="/live-bidding"
              element={
                <PrivateRoute>
                  <AdminLiveBidding />
                </PrivateRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <PrivateRoute>
                  <Profile />
                </PrivateRoute>
              }
            />
            <Route
              path="/all-auctions"
              element={
                <PrivateRoute>
                  <AllAuctions />
                </PrivateRoute>
              }
            />
            <Route
              path="/team-profile"
              element={
                <PrivateRoute>
                  <TeamProfile />
                </PrivateRoute>
              }
            />
            <Route
              path="/add-player"
              element={
                <PrivateRoute>
                  <AddPlayer />
                </PrivateRoute>
              }
            />
            <Route
              path="/all-players"
              element={
                <PrivateRoute>
                  <AllPlayers />
                </PrivateRoute>
              }
            />
            <Route
              path="/players/:id"
              element={
                <PrivateRoute>
                  <PlayerDetails />
                </PrivateRoute>
              }
            />
            <Route
              path="/teams/:id"
              element={
                <PrivateRoute>
                  <TeamDetails />
                </PrivateRoute>
              }
            />
            <Route
              path="/all-teams"
              element={
                <PrivateRoute>
                  <AllTeams />
                </PrivateRoute>
              }
            />
            <Route
              path="/create-auction"
              element={
                <PrivateRoute>
                  <CreateAuction />
                </PrivateRoute>
              }
            />
            <Route
              path="/pending-players"
              element={
                <PrivateRoute>
                  <PendingPlayerRequests />
                </PrivateRoute>
              }
            />
            <Route
              path="/auctions/:id"
              element={
                <PrivateRoute>
                  <AuctionDetails />
                </PrivateRoute>
              }
            />
            <Route
              path="/matches/create"
              element={
                <PrivateRoute>
                  <CreateMatch />
                </PrivateRoute>
              }
            />
            <Route
              path="/matches/:id"
              element={
                <PrivateRoute>
                  <MatchDetails />
                </PrivateRoute>
              }
            />
            <Route
              path="/matches/:id"
              element={
                <PrivateRoute>
                  <UpdateMatch />
                </PrivateRoute>
              }
            />
          </Routes>
      </Router>
    </Provider>
  );
};

export default App;
