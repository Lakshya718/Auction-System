import { useState } from "react";
import API from "../../api/axios";
import { useNavigate, Link } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setUser } from "../store/userSlice";
import { FaEnvelope, FaLock, FaSignInAlt } from "react-icons/fa";

const Login = () => {
  const [form, setForm] = useState({ email: "", password: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    try {
      const res = await API.post("/auth/login", form);
      localStorage.setItem("token", res.data.token);

      const userInfo = res.data.user || null;
      const userRole = res.data.user.role || null;
      const userTeam = res.data.team || null;

      localStorage.setItem("user", JSON.stringify(userInfo));
      localStorage.setItem("role", userRole);
      localStorage.setItem("team", JSON.stringify(userTeam));

      dispatch(setUser({ user: userInfo, role: userRole, team: userTeam }));

      navigate("/home");
    } catch (err) {
      setError(err.response?.data?.error || "Login failed. Please check your credentials.");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 p-4">
      <div className="w-full max-w-4xl flex flex-col md:flex-row rounded-2xl shadow-2xl overflow-hidden">
        {/* Info Panel */}
        <div className="w-full md:w-1/2 p-10 flex flex-col justify-center items-center bg-gradient-to-br from-purple-600 to-pink-600 text-white">
          <h1 className="text-4xl font-bold mb-4 text-center">Welcome Back!</h1>
          <p className="text-center mb-8">
            Enter your credentials to access your account and dive back into the action.
          </p>
          <div className="w-32 h-1 bg-white/50 rounded-full"></div>
        </div>

        {/* Form Panel */}
        <div className="w-full md:w-1/2 p-10 bg-gray-800">
          <h2 className="text-3xl font-bold text-white mb-8 text-center">Login</h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="relative">
              <FaEnvelope className="absolute top-1/2 left-4 transform -translate-y-1/2 text-gray-400" />
              <input
                type="email"
                name="email"
                placeholder="Email"
                required
                className="w-full bg-gray-700 text-white pl-12 pr-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-300"
                onChange={handleChange}
                disabled={isLoading}
              />
            </div>
            <div className="relative">
              <FaLock className="absolute top-1/2 left-4 transform -translate-y-1/2 text-gray-400" />
              <input
                type="password"
                name="password"
                placeholder="Password"
                required
                className="w-full bg-gray-700 text-white pl-12 pr-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-300"
                onChange={handleChange}
                disabled={isLoading}
              />
            </div>
            {error && <p className="text-red-500 text-sm text-center">{error}</p>}
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold py-3 rounded-lg shadow-lg transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isLoading}
            >
              <FaSignInAlt />
              <span>{isLoading ? "Signing In..." : "Login"}</span>
            </button>
            <p className="text-center text-gray-400">
              Not registered yet? 
              <Link to="/register" className="font-semibold text-purple-400 hover:text-purple-300 transition-colors duration-300">
                Create an Account
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;