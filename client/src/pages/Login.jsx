import { useState } from "react";
import API from "../../api/axios";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setUser } from "../store/userSlice";

const Login = () => {
  const [form, setForm] = useState({ email: "", password: "" });
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await API.post("/auth/login", form);
      localStorage.setItem("token", res.data.token);

      // Adjust these according to your API response structure
      const userInfo = res.data.user || null;
      const userRole = res.data.user.role || null;
      const userTeam = res.data.team || null;

      // Save user info, role, and team to localStorage for persistence
      localStorage.setItem("user", JSON.stringify(userInfo));
      localStorage.setItem("role", userRole);
      localStorage.setItem("team", JSON.stringify(userTeam));

      dispatch(setUser({ user: userInfo, role: userRole, team: userTeam }));

      navigate("/profile");
    } catch (err) {
      alert(err.response?.data?.error || "Login failed");
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto p-4 mt-10 border rounded">
      <h2 className="text-2xl font-bold mb-4">Login</h2>
      <input type="email" name="email" placeholder="Email" required className="w-full mb-2 p-2 border" onChange={handleChange} disabled={isLoading} />
      <input type="password" name="password" placeholder="Password" required className="w-full mb-2 p-2 border" onChange={handleChange} disabled={isLoading} />
      <button
        type="submit"
        className={`${isLoading ? "bg-gray-400" : "bg-blue-600"} text-white p-2 w-full`}
        disabled={isLoading}
      >
        {isLoading ? "Loading..." : "Login"}
      </button>
    </form>
  );
};

export default Login;
