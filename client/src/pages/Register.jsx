import { useState } from "react";
import API from "../../api/axios";
import { useNavigate } from "react-router-dom";

const Register = () => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "user",
    logo: null,
    bio: "",
  });
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setForm({ ...form, [name]: files ? files[0] : value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();
    Object.keys(form).forEach((key) => {
      if (form[key]) data.append(key, form[key]);
    });

    try {
      const res = await API.post("/auth/register", data);
      localStorage.setItem("token", res.data.token);
      navigate("/profile");
    } catch (err) {
      alert(err.response?.data?.error || "Registration failed");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-indigo-600 via-purple-700 to-pink-600 flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background SVG objects */}
      <svg
        className="absolute top-10 left-10 w-24 h-24 text-purple-300 opacity-50 animate-pulse"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle cx="12" cy="12" r="10" strokeWidth="2" />
      </svg>
      <svg
        className="absolute bottom-20 right-10 w-32 h-32 text-pink-300 opacity-40 animate-bounce"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect x="4" y="4" width="16" height="16" strokeWidth="2" />
      </svg>
      <svg
        className="absolute top-1/2 left-1/4 w-20 h-20 text-indigo-300 opacity-30 animate-spin-slow"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <polygon points="12 2 19 21 5 21" strokeWidth="2" />
      </svg>

      <div className="relative max-w-md w-full bg-white bg-opacity-90 rounded-xl shadow-lg p-8 backdrop-blur-md z-10">
        {/* Animated SVG illustration */}
        <div className="absolute -top-5 left-1/2 transform -translate-x-1/2 w-32 h-32 animate-spin-slow">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            className="w-32 h-32 text-teal-500"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 5v4m0 8v4m6-8h-4M4 12H0m16.24-4.24l-2.83 2.83m-7.07 7.07l-2.83 0.1m1-12.02l2.83 2.83m7.07 7.07l2.83 2.83"
            />
          </svg>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 mt-20">
          <h2 className="text-3xl font-extrabold text-center text-gray-900 mb-6">
            Register
          </h2>
          <input
            type="text"
            name="name"
            placeholder="Name"
            required
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 transition"
            onChange={handleChange}
          />
          <input
            type="email"
            name="email"
            placeholder="Email"
            required
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 transition"
            onChange={handleChange}
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            required
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 transition"
            onChange={handleChange}
          />
          <select
            name="role"
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 transition"
            onChange={handleChange}
          >
            <option value="admin">Admin</option>
            <option value="team_owner">Team Owner</option>
          </select>
          {form.role === "team_owner" && (
            <>
              <input
                type="text"
                name="teamName"
                placeholder="Team Name"
                required
                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 transition"
                onChange={handleChange}
              />
              <textarea
                name="bio"
                placeholder="Team Bio"
                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 transition"
                value={form.bio}
                onChange={handleChange}
              />
              <input
                type="file"
                name="logo"
                accept="image/*"
                className="w-full"
                onChange={handleChange}
              />
            </>
          )}
          <button
            type="submit"
            className="w-full bg-pink-500 hover:bg-pink-600 text-white font-semibold py-3 rounded-md transition"
          >
            Register
          </button>
        </form>
      </div>
    </div>
  );
};

export default Register;
