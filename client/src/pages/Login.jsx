import { useState } from "react";
import API from "../../api/axios";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setUser } from "../store/userSlice";
import Carousel from "../components/ImageSlider"; // Import the Carousel component

const Login = () => {
  const [form, setForm] = useState({ email: "", password: "" });
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

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
    <div className="flex flex-col md:flex-row h-[80vh] border-2 border-pink-900 p-2">
      <div className="w-full md:w-1/2 h-1/2 overflow-hidden md:h-[100%] border-green-500 border-2">
        <Carousel />
      </div>
      <div className="w-full p-4 md:w-1/2 h-1/2 md:h-full border-green-500 border-2 flex justify-center items-center">
        <form
          onSubmit={handleSubmit}
          className="p-3 md:h-[40vh] md:w-[35vw] h-[100%] w-[80%] rounded border-2 border-teal-500"
        >
          <h2 className="text-2xl font-bold mb-4 text-center">Login</h2>
          <div className="flex flex-col space-y-4">
            <input
              type="email"
              name="email"
              placeholder="Email"
              required
              className="bg-purple-600 text-white px-8 py-3 uppercase tracking-widest"
              style={{
                clipPath: "polygon(2% 0%, 100% 0%, 98% 100%, 0% 100%)",
              }}
              onChange={handleChange}
              disabled={isLoading}
            />
            <input
              type="password"
              name="password"
              placeholder="Password"
              required
              className="bg-purple-600 text-white px-8 py-3 uppercase tracking-widest"
              style={{
                clipPath: "polygon(2% 0%, 100% 0%, 98% 100%, 0% 100%)",
              }}
              onChange={handleChange}
              disabled={isLoading}
            />
            <button
              type="submit"
              className="bg-purple-900 text-white py-3 uppercase tracking-widest"
              style={{
                clipPath: "polygon(2% 0%, 100% 0%, 98% 100%, 0% 100%)",
              }}
              disabled={isLoading}
            >
              {isLoading ? "Loading..." : "Login"}
            </button>
            <div className="flex justify-center mt-2">
             <p className="text-center text-xl">Not Registered Yet?</p><p className="text-xl text-sky-500 hover:cursor-pointer" onClick={()=>navigate('/register')}>Register</p>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
