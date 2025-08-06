import { useState } from 'react';
import API from '../../api/axios';
import { useNavigate, Link } from 'react-router-dom';
import {
  FaUser,
  FaEnvelope,
  FaLock,
  FaUsers,
  FaBuilding,
  FaInfoCircle,
  FaImage,
  FaUserPlus,
  FaTrophy,
} from 'react-icons/fa';

const Register = () => {
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'team_owner', // Default role
    teamName: '',
    bio: '',
    teamLogo: null,
    sport: 'cricket', // Default sport
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setForm({ ...form, [name]: files ? files[0] : value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    const data = new FormData();
    Object.keys(form).forEach((key) => {
      if (form[key]) data.append(key, form[key]);
    });

    try {
      await API.post('/auth/register', data, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      navigate('/login');
    } catch (err) {
      setError(
        err.response?.data?.error || 'Registration failed. Please try again.'
      );
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 p-4">
      <div className="h-[10vh]"></div>
      <div className="w-full max-w-4xl flex flex-col md:flex-row rounded-2xl shadow-2xl overflow-hidden">
        {/* Info Panel */}
        <div className="w-full md:w-1/2 p-10 flex flex-col justify-center items-center bg-gradient-to-br from-purple-600 to-pink-600 text-white">
          <h1 className="text-4xl font-bold mb-4 text-center">
            Join the League!
          </h1>
          <p className="text-center mb-8">
            Create your account to start building your team and competing in
            auctions.
          </p>
          <div className="w-32 h-1 bg-white/50 rounded-full"></div>
        </div>

        {/* Form Panel */}
        <div className="w-full md:w-1/2 p-10 bg-gray-800">
          <h2 className="text-3xl font-bold text-white mb-8 text-center">
            Create Account
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <FaUser className="absolute top-1/2 left-4 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                name="name"
                placeholder="Full Name"
                required
                className="w-full bg-gray-700 text-white pl-12 pr-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                onChange={handleChange}
                disabled={isLoading}
              />
            </div>
            <div className="relative">
              <FaEnvelope className="absolute top-1/2 left-4 transform -translate-y-1/2 text-gray-400" />
              <input
                type="email"
                name="email"
                placeholder="Email"
                required
                className="w-full bg-gray-700 text-white pl-12 pr-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
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
                className="w-full bg-gray-700 text-white pl-12 pr-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                onChange={handleChange}
                disabled={isLoading}
              />
            </div>
            <div className="relative">
              <FaUsers className="absolute top-1/2 left-4 transform -translate-y-1/2 text-gray-400" />
              <select
                name="role"
                className="w-full bg-gray-700 text-white pl-12 pr-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 appearance-none"
                onChange={handleChange}
                disabled={isLoading}
              >
                <option value="team_owner">Team Owner</option>
              </select>
            </div>
            {form.role === 'team_owner' && (
              <div className="space-y-4 p-4 border-l-2 border-purple-500">
                <div className="relative">
                  <FaBuilding className="absolute top-1/2 left-4 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    name="teamName"
                    placeholder="Team Name"
                    required
                    className="w-full bg-gray-700 text-white pl-12 pr-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    onChange={handleChange}
                    disabled={isLoading}
                  />
                </div>
                <div className="relative">
                  <FaTrophy className="absolute top-1/2 left-4 transform -translate-y-1/2 text-gray-400" />
                  <select
                    name="sport"
                    value={form.sport}
                    className="w-full bg-gray-700 text-white pl-12 pr-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 appearance-none"
                    onChange={handleChange}
                    disabled={isLoading}
                  >
                    <option value="cricket">Cricket</option>
                    <option value="football">Football</option>
                    <option value="basketball">Basketball</option>
                    <option value="volleyball">Volleyball</option>
                    <option value="kabaddi">Kabaddi</option>
                  </select>
                </div>
                <div className="relative">
                  <FaInfoCircle className="absolute top-4 left-4 text-gray-400" />
                  <textarea
                    name="bio"
                    placeholder="Team Bio"
                    className="w-full bg-gray-700 text-white pl-12 pr-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    onChange={handleChange}
                    disabled={isLoading}
                  ></textarea>
                </div>
                <div className="relative">
                  <FaImage className="absolute top-1/2 left-4 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="file"
                    name="teamLogo"
                    accept="image/*"
                    className="w-full bg-gray-700 text-white pl-12 pr-4 py-3 rounded-lg file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-500 file:text-white hover:file:bg-purple-600"
                    onChange={handleChange}
                    disabled={isLoading}
                  />
                </div>
              </div>
            )}
            {error && (
              <p className="text-red-500 text-sm text-center">{error}</p>
            )}
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold py-3 rounded-lg shadow-lg transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isLoading}
            >
              <FaUserPlus />
              <span>{isLoading ? 'Creating Account...' : 'Register'}</span>
            </button>
            <p className="text-center text-gray-400">
              Already have an account?
              <Link
                to="/login"
                className="font-semibold text-purple-400 hover:text-purple-300 transition-colors duration-300"
              >
                Login Here
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;
