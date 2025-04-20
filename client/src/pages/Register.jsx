import { useState } from "react";
import API from "../../services/apiEndPoints";
import { useNavigate } from "react-router-dom";

const Register = () => {
  const [form, setForm] = useState({
    name: "", email: "", password: "", role: "user", teamLogo: null,
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
    <form onSubmit={handleSubmit} className="max-w-md mx-auto p-4 mt-10 border rounded">
      <h2 className="text-2xl font-bold mb-4">Register</h2>
      <input type="text" name="name" placeholder="Name" required className="w-full mb-2 p-2 border" onChange={handleChange} />
      <input type="email" name="email" placeholder="Email" required className="w-full mb-2 p-2 border" onChange={handleChange} />
      <input type="password" name="password" placeholder="Password" required className="w-full mb-2 p-2 border" onChange={handleChange} />
      <select name="role" className="w-full mb-2 p-2 border" onChange={handleChange}>
        <option value="user">User</option>
        <option value="admin">Admin</option>
        <option value="team_owner">Team Owner</option>
      </select>
      {form.role === "team_owner" && (
        <input type="file" name="teamLogo" accept="image/*" className="w-full mb-2" onChange={handleChange} />
      )}
      <button type="submit" className="bg-blue-600 text-white p-2 w-full">Register</button>
    </form>
  );
};

export default Register;
