import { useState } from "react";

const Register = () => {
  const [formData, setFormData] = useState({
    teamName: "",
    college: "",
    numPlayers: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      //   const res = await axios.post("http://localhost:5000/api/team/register", formData);
      alert("Team registered successfully!");
      setFormData({ teamName: "", college: "", numPlayers: "" });
    } catch (error) {
      console.error("Error registering team:", error);
      alert("Something went wrong. Try again.");
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded shadow-md w-96 space-y-4"
      >
        <h1 className="text-2xl font-bold text-center">Register Team</h1>

        <input
          type="text"
          name="teamName"
          placeholder="Team Name"
          value={formData.teamName}
          onChange={handleChange}
          required
          className="w-full px-3 py-2 border rounded"
        />

        <input
          type="text"
          name="college"
          placeholder="College"
          value={formData.college}
          onChange={handleChange}
          required
          className="w-full px-3 py-2 border rounded"
        />

        <input
          type="number"
          name="numPlayers"
          placeholder="Number of Players"
          value={formData.numPlayers}
          onChange={handleChange}
          required
          min="1"
          className="w-full px-3 py-2 border rounded"
        />

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
        >
          Register
        </button>
      </form>
    </div>
  );
};

export default Register;
