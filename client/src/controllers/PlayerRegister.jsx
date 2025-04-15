import { useState } from "react";

const PlayerRegister = () => {
  const [formData, setFormData] = useState({
    name: "",
    rollNo: "",
    address: "",
    college: "",
    type: "batsman", // default selection
  });

  const handleChange = (e) => {
    setFormData({ 
      ...formData, 
      [e.target.name]: e.target.value 
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
    //   await axios.post("http://localhost:5000/api/player/register", formData);
      alert("Player registered successfully!");
      setFormData({ name: "", rollNo: "", address: "", college: "", type: "batsman" });
    } catch (err) {
      console.error(err);
      alert("Failed to register player.");
    }
  };

  return (
    <div className="min-h-screen flex justify-center items-center bg-gray-100">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded shadow-md w-96 space-y-4">
        <h2 className="text-2xl font-bold text-center">Register Player</h2>

        <input
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="Name"
          required
          className="w-full border p-2 rounded"
        />

        <input
          name="rollNo"
          value={formData.rollNo}
          onChange={handleChange}
          placeholder="Roll Number"
          required
          className="w-full border p-2 rounded"
        />

        <input
          name="address"
          value={formData.address}
          onChange={handleChange}
          placeholder="Address"
          required
          className="w-full border p-2 rounded"
        />

        <input
          name="college"
          value={formData.college}
          onChange={handleChange}
          placeholder="College"
          required
          className="w-full border p-2 rounded"
        />

        <select
          name="type"
          value={formData.type}
          onChange={handleChange}
          className="w-full border p-2 rounded"
        >
          <option value="batsman">Batsman</option>
          <option value="bowler">Bowler</option>
          <option value="all-rounder">All-Rounder</option>
          <option value="keeper">Keeper</option>
        </select>

        <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">
          Register
        </button>
      </form>
    </div>
  );
};

export default PlayerRegister;
