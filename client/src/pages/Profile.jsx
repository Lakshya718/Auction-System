import { useEffect, useState, useRef } from "react";
import API from "../../api/axios";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { clearUser, setUser, updateUser } from "../store/userSlice";
import Sidebar from "../components/Sidebar";

const decodeJWT = (token) => {
  if (!token) return null;
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
};

const Profile = () => {
  const [data, setData] = useState(null);
  const [tokenInfo, setTokenInfo] = useState({
    token: null,
    expiresIn: null,
    matched: false,
  });
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState({ name: "", password: "" });
  const [profilePic, setProfilePic] = useState(null);
  const [showProfilePopup, setShowProfilePopup] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const timerRef = useRef(null);

  useEffect(() => {
    const fetchProfile = () => {
      setLoading(true);
      API.get("/auth/profile")
        .then((res) => {
          setData(res.data);
          dispatch(
            setUser({
              user: res.data.user,
              role: res.data.user.role,
              team: res.data.team || null,
            })
          );
          setForm({
            name: res.data.user.name || "",
            password: "",
          });
          if (res.data.user.profilePhoto) {
            setProfilePic(res.data.user.profilePhoto);
          } else {
            setProfilePic(null);
          }
          setLoading(false);
        })
        .catch(() => {
          setLoading(false);
          navigate("/login");
        });
    };

    fetchProfile();
  }, [navigate, dispatch]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const decoded = decodeJWT(token);
    if (decoded) {
      const currentTime = Math.floor(Date.now() / 1000);
      const expiresIn = decoded.exp - currentTime;
      setTokenInfo({
        token,
        expiresIn,
        matched: true,
      });
      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = setInterval(() => {
        setTokenInfo((prev) => {
          if (prev.expiresIn <= 0) {
            clearInterval(timerRef.current);
            return { ...prev, expiresIn: 0 };
          }
          return { ...prev, expiresIn: prev.expiresIn - 1 };
        });
      }, 1000);
    } else {
      setTokenInfo({
        token: null,
        expiresIn: null,
        matched: false,
      });
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const handleLogout = () => {
    setShowLogoutConfirm(false);
    setLoading(true);
    API.get("/auth/logout")
      .then(() => {
        localStorage.clear();
        dispatch(clearUser());
        setLoading(false);
        navigate("/login");
      })
      .catch(() => {
        setLoading(false);
        alert("Logout failed. Please try again.");
      });
  };

  const handleInputChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSave = () => {
    setLoading(true);
    setError(null);
    const formData = new FormData();
    formData.append("name", form.name);
    if (form.password) formData.append("password", form.password);
    if (profilePic && profilePic instanceof File) {
      formData.append("profilePicture", profilePic);
    }

    API.put("/auth/profile", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    })
      .then((res) => {
        setData(res.data);
        dispatch(updateUser(res.data.user));
        setIsEditing(false);
        setLoading(false);
        setShowProfilePopup(!setShowProfilePopup);
      })
      .catch((err) => {
        setError(
          err.response?.data?.message ||
            "Failed to update profile. Please try again."
        );
        setLoading(false);
      });
  };

  if (loading) return <p className="text-center mt-10">Loading...</p>;

  if (!data) return <p className="text-center mt-10">Loading profile...</p>;

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar role={data?.user?.role || ""} />
      <div className="flex-grow max-w-4xl ml-10 p-6 mt-10 bg-white rounded-lg shadow-lg">
        <div className="flex flex-col md:flex-row items-center md:items-start space-y-6 md:space-y-0 md:space-x-10">
          <div className="flex flex-col items-center w-full md:w-1/3">
            <button
              onClick={() => setShowProfilePopup(!showProfilePopup)}
              className="fixed top-4 right-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 z-50"
            >
              {showProfilePopup ? "Hide Profile" : "Edit Profile"}
            </button>
            {showProfilePopup && (
              <div
                className="fixed inset-0 bg-gray-500 bg-opacity-50 flex items-center justify-center z-50"
                onClick={() => setShowProfilePopup(false)}
              >
                <div
                  className="bg-white border border-gray-300 rounded shadow-lg p-6 w-80 relative"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    onClick={() => setShowProfilePopup(false)}
                    className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
                    aria-label="Close Profile Popup"
                  >
                    &#x2715;
                  </button>
                  <h2 className="text-xl font-bold mb-4">Edit Profile</h2>
                  <div className="mb-4">
                    <label htmlFor="name" className="block font-semibold mb-1">
                      Name
                    </label>
                    <input
                      id="name"
                      name="name"
                      type="text"
                      value={form.name}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="mb-4">
                    <label
                      htmlFor="profilePic"
                      className="block font-semibold mb-1"
                    >
                      Upload Profile Photo
                    </label>
                    <input
                      id="profilePic"
                      name="profilePic"
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          setProfilePic(e.target.files[0]);
                        }
                      }}
                      className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  {/* Password change removed as per user feedback */}
                  <div className="flex justify-end space-x-2">
                    <button
                      onClick={handleSave}
                      disabled={loading}
                      className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                    >
                      Save Changes
                    </button>
                    <button
                      onClick={() => setShowProfilePopup(false)}
                      className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}
            <div className="w-40 h-40 rounded-full overflow-hidden border-4 border-gray-300 mb-4">
              {profilePic ? (
                typeof profilePic === "string" ? (
                  <img
                    src={profilePic}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <img
                    src={URL.createObjectURL(profilePic)}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                )
              ) : (
                <img
                  src="/default-profile.png"
                  alt=""
                  className="w-full h-full object-cover"
                />
              )}
            </div>
          </div>
          <div className="w-full md:w-2/3">
            <div className="mb-6 p-4 bg-green-100 rounded text-center">
              <h3 className="font-semibold mb-2">Token Information</h3>
              {tokenInfo.token ? (
                <p>
                  <strong>Login Expires In:</strong>{" "}
                  {tokenInfo.expiresIn > 0
                    ? `${tokenInfo.expiresIn} seconds`
                    : "Expired"}
                </p>
              ) : (
                <p>No valid token found.</p>
              )}
            </div>
            {error && (
              <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
                {error}
              </div>
            )}
            {!isEditing ? (
              <>
                <h2 className="text-2xl font-bold mb-4 text-center md:text-left">
                  User Profile
                </h2>
                <p className="mb-2">
                  <strong>Name:</strong> {data.user.name}
                </p>
                <p className="mb-2">
                  <strong>Email:</strong> {data.user.email}
                </p>
                <div className="mb-6">
                  <strong>Role:</strong> {data.user.role}
                </div>
                {data.team && (
                  <div className="mb-6 p-4 bg-gray-100 rounded">
                    <h3 className="font-semibold mb-2">Team Info</h3>
                    <p>
                      <strong>Team Name:</strong> {data.team.name}
                    </p>
                    <img
                      src={data.team.teamLogo}
                      alt="Team Logo"
                      className="w-32 mt-2 rounded"
                    />
                  </div>
                )}
              </>
            ) : (
              <form className="space-y-4">
                <div>
                  <label htmlFor="name" className="block font-semibold mb-1">
                    Name
                  </label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    value={form.name}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block font-semibold mb-1">
                    Email
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label
                    htmlFor="password"
                    className="block font-semibold mb-1"
                  >
                    Password
                  </label>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    value={form.password}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter new password"
                  />
                </div>
              </form>
            )}
            <div className="mt-6 space-y-3">
              <button
                onClick={() => navigate("/all-auctions")}
                className="w-full bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
              >
                All Auctions
              </button>
              {data.user.role === "user" && (
                <button
                  onClick={() => navigate("/live-auction")}
                  className="w-full bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
                >
                  Live Auction (View Only)
                </button>
              )}
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
                  <button
                    onClick={() => navigate("/pending-players")}
                    className="w-full bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 mt-2"
                  >
                    Review Pending Player Requests
                  </button>
                  <button
                    onClick={() => navigate("/matches/create")}
                    className="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 mt-2"
                  >
                    Create Match
                  </button>
                </>
              )}
            </div>
            <button
              onClick={() => setShowLogoutConfirm(true)}
              className="mt-6 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
              aria-label="Logout"
            >
              Logout
            </button>
            {showLogoutConfirm && (
              <div
                role="dialog"
                aria-modal="true"
                className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50"
              >
                <div className="bg-white p-6 rounded shadow-md max-w-sm w-full">
                  <h3 className="text-lg font-semibold mb-4">Confirm Logout</h3>
                  <p className="mb-6">Are you sure you want to logout?</p>
                  <div className="flex justify-end space-x-4">
                    <button
                      onClick={() => setShowLogoutConfirm(false)}
                      className="px-4 py-2 rounded border border-gray-300 hover:bg-gray-100"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleLogout}
                      className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700"
                    >
                      Logout
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
