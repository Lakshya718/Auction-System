import { useEffect, useState } from "react";
import API from "../../api/axios";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { clearUser, setUser } from "../store/userSlice";

const decodeJWT = (token) => {
  if (!token) return null;
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
};

const Profile = () => {
  const [data, setData] = useState(null);
  const [tokenInfo, setTokenInfo] = useState({ token: null, expiresIn: null, matched: false });
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user.user);

  useEffect(() => {
    const fetchProfile = () => {
      API.get("/auth/profile")
        .then((res) => {
          setData(res.data);
          // Dispatch setUser with user and team info to Redux store
          dispatch(setUser({
            user: res.data.user,
            role: res.data.user.role,
            team: res.data.team || null
          }));
        })
        .catch(() => {
          // Instead of alert, redirect silently to login
          navigate("/login");
        });
    };

    if (user) {
      // Check if user data is complete (has name and email)
      if (user.name && user.email) {
        setData({ user });
      } else {
        // Incomplete user data, fetch full profile
        fetchProfile();
      }
    } else {
      fetchProfile();
    }
  }, [user, navigate]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const decoded = decodeJWT(token);
    if (decoded) {
      const currentTime = Math.floor(Date.now() / 1000);
      const expiresIn = decoded.exp - currentTime;
      setTokenInfo({
        token,
        expiresIn,
        matched: true
      });
    } else {
      setTokenInfo({
        token: null,
        expiresIn: null,
        matched: false
      });
    }
  }, []);

  const handleLogout = () => {
    API.post("/auth/logout")
      .then(() => {
        localStorage.clear();  // Clear local storage on logout
        dispatch(clearUser());
        navigate("/login");
      })
      .catch(() => {
        alert("Logout failed. Please try again.");
      });
  };

  if (!data) return <p className="text-center mt-10">Loading...</p>;

  return (
    <div className="max-w-md mx-auto p-4 mt-10 border rounded">
      <h2 className="text-xl font-bold mb-2">User Info</h2>
      <p>
        <strong>Hey Welcome!</strong> {data.user.name}
      </p>
      <p>
        <strong>Logged in as </strong> {data.user.email}
      </p>
      <p>
        <strong>Role-</strong> {data.user.role}
      </p>

      {data.team && (
        <>
          <h3 className="mt-4 font-semibold">Team Info</h3>
          <p>
            <strong>Team Name:</strong> {data.team.name}
          </p>
          <img src={data.team.teamLogo} alt="Team Logo" className="w-32 mt-2" />
        </>
      )}

      {/* Token Info Section */}
      <div className="mt-6 p-4 bg-green-100 rounded">
        <h3 className="font-semibold mb-2">Token Information</h3>
        {tokenInfo.token ? (
          <>
            <p><strong>Login Expires In:</strong> {tokenInfo.expiresIn > 0 ? `${tokenInfo.expiresIn} seconds` : "Expired"}</p>
          </>
        ) : (
          <p>No valid token found.</p>
        )}
      </div>

      {/* Buttons based on role */}
      <div className="mt-6 space-y-4">
        {/* Common routes */}
        <button
          onClick={() => navigate("/live-auction")}
          className="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Another Common Router here like Auction (Common)
        </button>
        <button
          onClick={() => navigate("/all-auctions")}
          className="w-full bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          All Auctions
        </button>

        {/* User role */}
        {data.user.role === "user" && (
          <button
            onClick={() => navigate("/live-auction")}
            className="w-full bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
          >
            Live Auction (View Only)
          </button>
        )}

        {/* Team owner role */}
        {data.user.role === "team_owner" && (
          <>
            <button
              onClick={() => navigate("/team-profile")}
              className="w-full bg-yellow-600 text-white px-4 py-2 rounded hover:bg-yellow-700"
            >
              Team Profile
            </button>
            <div className="p-4 bg-yellow-100 rounded">
              <p>
                <strong>Remaining Purse Balance:</strong> $100,000
              </p>
            </div>
          </>
        )}

        {/* Admin role */}
        {data.user.role === "admin" && (
          <>
            <button
              onClick={() => navigate("/add-player")}
              className="w-full bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
            >
              Add Player
            </button>
            <button
              onClick={() => navigate("/all-players")}
              className="w-full bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
            >
              All Players
            </button>
            <button
              onClick={() => navigate("/all-teams")}
              className="w-full bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
            >
              All Teams
            </button>
            <button
              onClick={() => navigate("/create-auction")}
              className="w-full bg-pink-600 text-white px-4 py-2 rounded hover:bg-pink-700"
            >
              Create Auction
            </button>
          </>
        )}
      </div>

      <button
        onClick={handleLogout}
        className="mt-6 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
      >
        Logout
      </button>
    </div>
  );
};

export default Profile;
