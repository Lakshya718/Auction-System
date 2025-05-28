import { Link } from "react-router-dom";
import { useSelector } from "react-redux";

const Navbar = () => {
  const user = useSelector((state) => state.user.user);

  return (
    <nav className="bg-blue-600 text-white p-4 flex justify-between">
      <h1 className="font-bold">Team Portal</h1>
      <div className="space-x-4">
        {!user && (
          <>
            <Link to="/register">Register</Link>
            <Link to="/login">Login</Link>
          </>
        )}
        {user && (
          <>
            <Link to="/profile">Profile</Link>
            {/* Future role-based links can be added here */}
            {/* Example: {role === 'admin' && <Link to="/admin">Admin</Link>} */}
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
