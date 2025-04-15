import { useNavigate } from "react-router-dom";
export default function Signup() {
  const navigate = useNavigate();
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100">
        <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md">
          <h2 className="text-2xl font-bold text-left mb-6">Sign Up</h2>
          <form>
            <div className="mb-4">
              <label className="block text-gray-700 font-medium mb-2 text-left">Full Name</label>
              <input
                type="text"
                placeholder="Enter your full name"
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 font-medium mb-2 text-left">Email</label>
              <input
                type="email"
                placeholder="Enter your email"
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 font-medium mb-2 text-left">Password</label>
              <input
                type="password"
                placeholder="Enter your password"
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition"
            >
              Sign Up
            </button>
          </form>
                <h1 className="mt-2 text-center">Already have an Account ?
                <span className="text-blue-500 size-2 font-bold hover:cursor-pointer"onClick={() => navigate('/login')}> Login</span>
            </h1>
            </div>
      </div>
    );
  }
  