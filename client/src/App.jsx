import Navbar from "./components/Navbar";
import Events from "./pages/Events";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Welcome from "./pages/Welcome";
import Auction from "./pages/Auctionfirst";
import Auction1 from "./pages/Auctionsecond";
import Admin from "./pages/Admin";
import TeamRegister from "./controllers/TeamRegister";
import PlayerRegister from "./controllers/PlayerRegister";
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
function App() {
  return (
    <Router>
    <Navbar />
    <Routes>
      <Route path="/" element={<Welcome />} />
      <Route path="/events" element={<Events />} />
      <Route path="/auction" element={<Auction />} />
      <Route path="/auction1" element={<Auction1 />} />
      <Route path="/admin" element={<Admin />} />
      <Route path="/register-team" element={<TeamRegister />} />
      <Route path="/register-player" element={<PlayerRegister />} />
      <Route path="/login" element={<Login />} /> 
      <Route path="/signup" element={<Signup />} /> 
    </Routes>
  </Router>
  );
}

export default App;
