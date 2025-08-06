import { useState } from 'react';
import API from '../../api/axios';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setUser } from '../store/userSlice';
import { FaEnvelope, FaLock, FaSignInAlt } from 'react-icons/fa';

const Login = () => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Email validation for @gmail.com or @nith.ac.in
    if (
      !form.email.endsWith('@gmail.com') &&
      !form.email.endsWith('@nith.ac.in')
    ) {
      setError('Please enter a valid email like firstlast@gmail.com');
      return;
    }

    setIsLoading(true);
    try {
      const res = await API.post('/auth/login', form);
      localStorage.setItem('token', res.data.token);

      const userInfo = res.data.user || null;
      const userRole = res.data.user.role || null;
      const userTeam = res.data.team || null;

      // Make sure to store all user data including the role property
      if (userInfo && userRole) {
        // Ensure role is also included in the user object
        userInfo.role = userRole;
      }

      localStorage.setItem('user', JSON.stringify(userInfo));
      localStorage.setItem('role', userRole);
      localStorage.setItem('team', JSON.stringify(userTeam));

      dispatch(setUser({ user: userInfo, role: userRole, team: userTeam }));

      navigate('/home');
    } catch (err) {
      setError(
        err.response?.data?.error ||
          'Login failed. Please check your credentials.'
      );
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 p-4">
      <div className="w-full max-w-3xl flex flex-col md:flex-row rounded-xl shadow-xl overflow-hidden">
        {/* Info Panel */}
        <div className="w-full md:w-1/2 p-8 flex flex-col justify-center items-center bg-gradient-to-br from-purple-600 to-pink-600 text-white">
          <h1 className="text-2xl font-bold mb-3 text-center">Welcome Back!</h1>
          <p className="text-sm text-center mb-6">
            Enter your credentials to access your account and dive back into the
            action.
          </p>
          <div className="w-24 h-0.5 bg-white/50 rounded-full"></div>
        </div>

        {/* Form Panel */}
        <div className="w-full md:w-1/2 p-8 bg-gray-800">
          <h2 className="text-2xl font-bold text-white mb-6 text-center">
            Login
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <FaEnvelope className="absolute top-1/2 left-3 transform -translate-y-1/2 text-gray-400 text-sm" />
              <input
                type="email"
                name="email"
                placeholder="Email"
                required
                className="w-full bg-gray-700 text-white text-sm pl-10 pr-4 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-300"
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
                className="w-full bg-gray-700 text-white text-sm pl-10 pr-4 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-300"
                onChange={handleChange}
                disabled={isLoading}
              />
            </div>
            {error && (
              <p className="text-red-500 text-xs text-center">{error}</p>
            )}
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-sm font-medium py-2.5 rounded-lg shadow-md transform hover:scale-102 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isLoading}
            >
              <FaSignInAlt className="text-sm" />
              <span>{isLoading ? 'Signing In...' : 'Login'}</span>
            </button>
            <p className="text-center text-gray-400 text-sm">
              Not registered yet?{' '}
              <Link
                to="/register"
                className="font-medium text-purple-400 hover:text-purple-300 transition-colors duration-300"
              >
                Create an Account
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
