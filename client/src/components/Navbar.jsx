import { Link } from "react-router-dom";

const Navbar = () => (
  <nav className="bg-blue-600 text-white p-4 flex justify-between">
    <h1 className="font-bold">Team Portal</h1>
    <div className="space-x-4">
      <Link to="/register">Register</Link>
      <Link to="/login">Login</Link>
      <Link to="/profile">Profile</Link>
    </div>
  </nav>
);

export default Navbar;
