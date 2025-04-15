import { useEffect, useState } from "react";
import API from "../../api/axios";

const Profile = () => {
  const [data, setData] = useState(null);

  useEffect(() => {
    API.get("/auth/profile")
      .then((res) => setData(res.data))
      .catch((err) => alert("Please login again."));
  }, []);

  if (!data) return <p className="text-center mt-10">Loading...</p>;

  return (
    <div className="max-w-md mx-auto p-4 mt-10 border rounded">
      <h2 className="text-xl font-bold mb-2">User Info</h2>
      <p><strong>Name:</strong> {data.user.name}</p>
      <p><strong>Email:</strong> {data.user.email}</p>
      <p><strong>Role:</strong> {data.user.role}</p>

      {data.team && (
        <>
          <h3 className="mt-4 font-semibold">Team Info</h3>
          <p><strong>Team Name:</strong> {data.team.name}</p>
          <img src={data.team.teamLogo} alt="Team Logo" className="w-32 mt-2" />
        </>
      )}
    </div>
  );
};

export default Profile;
