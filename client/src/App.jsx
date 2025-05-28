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
import LiveAuction from './pages/LiveAuction.jsx';
import AllAuctions from './pages/AllAuctions.jsx';
import TeamProfile from './pages/TeamProfile.jsx';
import AddPlayer from './pages/AddPlayer.jsx';
import AllTeams from './pages/AllTeams.jsx';
import CreateAuction from './pages/CreateAuction.jsx';

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
            path="/profile"
            element={
              <PrivateRoute>
                <Profile />
              </PrivateRoute>
            }
          />
          <Route
            path="/live-auction"
            element={
              <PrivateRoute>
                <LiveAuction />
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
        </Routes>
      </Router>
    </Provider>
  );
};

export default App;
