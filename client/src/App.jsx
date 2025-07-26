import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useSelector } from 'react-redux';
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
import AuctionBidPage from './pages/AuctionBidPage.jsx';
import Homescreen from './pages/Homescreen.jsx';
import ImageSlider from './components/ImageSlider.jsx';
import Sidebar from './components/Sidebar.jsx';

const App = () => {
  const user = useSelector((state) => state.user.user);
  const role = useSelector((state) => state.user.role);

  return (
    <Router>
      <Navbar />
      {user && <Sidebar role={role} />}
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
          path="/welcome"
          element={
            <PublicRoute>
              <ImageSlider />
            </PublicRoute>
          }
        />
        <Route
          path="/"
          element={
            <PrivateRoute>
              <Homescreen />
            </PrivateRoute>
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
          path="/auction-bid-page/:auctionId"
          element={
            <PrivateRoute>
              <AuctionBidPage />
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
  );
};

export default App;
