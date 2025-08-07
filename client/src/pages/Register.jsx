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
      <div className="h-[30vh]"></div>
      <div className="w-full max-w-2xl flex flex-col md:flex-row rounded-xl shadow-2xl overflow-hidden transform scale-95">
        {/* Info Panel */}
        <div className="w-full md:w-2/5 p-5 flex flex-col justify-center items-center bg-gradient-to-br from-purple-600 to-pink-600 text-white">
          <h1 className="text-xl md:text-2xl font-bold mb-3 text-center">
            Join the League!
          </h1>
          <p className="text-center mb-4 text-sm">
            Create your account to start building your team and competing in
            auctions.
          </p>
          <div className="w-24 h-0.5 bg-white/50 rounded-full"></div>
        </div>

        {/* Form Panel */}
        <div className="w-full md:w-3/5 p-5 bg-gray-800">
          <h2 className="text-xl font-bold text-white mb-5 text-center">
            Create Account
          </h2>
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="relative">
              <FaUser className="absolute top-1/2 left-3 transform -translate-y-1/2 text-gray-400 text-sm" />
              <input
                type="text"
                name="name"
                placeholder="Full Name"
                required
                className="w-full bg-gray-700 text-white pl-9 pr-4 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                onChange={handleChange}
                disabled={isLoading}
              />
            </div>
            <div className="relative">
              <FaEnvelope className="absolute top-1/2 left-3 transform -translate-y-1/2 text-gray-400 text-sm" />
              <input
                type="email"
                name="email"
                placeholder="Email"
                required
                className="w-full bg-gray-700 text-white pl-9 pr-4 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                onChange={handleChange}
                disabled={isLoading}
              />
            </div>
            <div className="relative">
              <FaLock className="absolute top-1/2 left-3 transform -translate-y-1/2 text-gray-400 text-sm" />
              <input
                type="password"
                name="password"
                placeholder="Password"
                required
                className="w-full bg-gray-700 text-white pl-9 pr-4 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                onChange={handleChange}
                disabled={isLoading}
              />
            </div>
            <div className="relative">
              <FaUsers className="absolute top-1/2 left-3 transform -translate-y-1/2 text-gray-400 text-sm" />
              <select
                name="role"
                className="w-full bg-gray-700 text-white pl-9 pr-4 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 appearance-none text-sm"
                onChange={handleChange}
                disabled={isLoading}
              >
                <option value="team_owner">Team Owner</option>
              </select>
            </div>
            {form.role === 'team_owner' && (
              <div className="space-y-3 p-3 border-l-2 border-purple-500 bg-gray-700/20 rounded-r-lg">
                <div className="relative">
                  <FaBuilding className="absolute top-1/2 left-3 transform -translate-y-1/2 text-gray-400 text-sm" />
                  <input
                    type="text"
                    name="teamName"
                    placeholder="Team Name"
                    required
                    className="w-full bg-gray-700 text-white pl-9 pr-4 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                    onChange={handleChange}
                    disabled={isLoading}
                  />
                </div>
                <div className="relative">
                  <FaTrophy className="absolute top-1/2 left-3 transform -translate-y-1/2 text-gray-400 text-sm" />
                  <select
                    name="sport"
                    value={form.sport}
                    className="w-full bg-gray-700 text-white pl-9 pr-4 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 appearance-none text-sm"
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
                  <FaInfoCircle className="absolute top-3 left-3 text-gray-400 text-sm" />
                  <textarea
                    name="bio"
                    placeholder="Team Bio"
                    rows="2"
                    className="w-full bg-gray-700 text-white pl-9 pr-4 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm resize-none"
                    onChange={handleChange}
                    disabled={isLoading}
                  ></textarea>
                </div>
                <div className="relative">
                  <FaImage className="absolute top-1/2 left-3 transform -translate-y-1/2 text-gray-400 text-sm" />
                  <input
                    type="file"
                    name="teamLogo"
                    accept="image/*"
                    className="w-full bg-gray-700 text-white pl-9 pr-4 py-2.5 rounded-lg file:mr-3 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-purple-500 file:text-white hover:file:bg-purple-600 text-sm"
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
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold py-2.5 rounded-lg shadow-lg transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              disabled={isLoading}
            >
              <FaUserPlus />
              <span>{isLoading ? 'Creating Account...' : 'Register'}</span>
            </button>
            <p className="text-center text-gray-400 text-sm">
              Already have an account?{' '}
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
