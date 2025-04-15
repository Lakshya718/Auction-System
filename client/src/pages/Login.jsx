import { useState } from "react";
import API from "../../api/axios";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [form, setForm] = useState({ email: "", password: "" });
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await API.post("/auth/login", form);
      localStorage.setItem("token", res.data.token);
      navigate("/profile");
    } catch (err) {
      alert(err.response?.data?.error || "Login failed");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto p-4 mt-10 border rounded">
      <h2 className="text-2xl font-bold mb-4">Login</h2>
      <input type="email" name="email" placeholder="Email" required className="w-full mb-2 p-2 border" onChange={handleChange} />
      <input type="password" name="password" placeholder="Password" required className="w-full mb-2 p-2 border" onChange={handleChange} />
      <button type="submit" className="bg-blue-600 text-white p-2 w-full">Login</button>
    </form>
  );
};

export default Login;
