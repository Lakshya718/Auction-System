import Navbar from "./components/Navbar";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Profile from "./pages/Profile"

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
function App() {
  return (
    <Router>
    <Navbar />
    <Routes>
      <Route path="/register" element={<Register />} />
      <Route path="/login" element={<Login />} /> 
      <Route path="/profile" element={<Profile />} /> 
    </Routes>
  </Router>
  );
}

export default App;
