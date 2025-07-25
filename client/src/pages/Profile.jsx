import { useEffect, useState } from 'react';
import API from '../../api/axios';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { clearUser, setUser, updateUser } from '../store/userSlice';
import Sidebar from '../components/Sidebar';
import { FaUser, FaSignOutAlt, FaCamera, FaEdit, FaTimes, FaEnvelope, FaUsers } from 'react-icons/fa';

import LoadingSpinner from '../components/LoadingSpinner';

const Profile = () => {
  const [showEditModal, setShowEditModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user, team, role } = useSelector((state) => state.user);

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      try {
        const res = await API.get('/auth/profile');
        dispatch(setUser({ user: res.data.user, role: res.data.user.role, team: res.data.team || null }));
      } catch (err) {
        console.error('Failed to fetch profile:', err);
        navigate('/login');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [navigate, dispatch]);

  const handleLogout = async () => {
    try {
      await API.get('/auth/logout');
      localStorage.clear();
      dispatch(clearUser());
      navigate('/login');
    } catch (err) {
      console.error('Logout failed:', err);
      alert('Logout failed. Please try again.');
    }
  };

  if (loading) return <div className="flex h-screen items-center justify-center bg-gray-900"><LoadingSpinner /></div>;

  return (
    <div className="flex min-h-screen bg-gray-900 text-white">
      <Sidebar role={role} />
      <main className="flex-grow p-8 transition-all duration-300">
        <div className="max-w-6xl mx-auto">
          {/* Profile Header */}
          <div className="relative bg-gradient-to-r from-purple-700 to-indigo-800 rounded-3xl shadow-2xl p-8 mb-12 overflow-hidden">
            <img src="https://images.unsplash.com/photo-1517649763962-0c623066013b?q=80&w=2070&auto=format&fit=crop" alt="Cover" className="absolute inset-0 w-full h-full object-cover opacity-20" />
            <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start gap-8">
              <div className="relative w-40 h-40 rounded-full border-4 border-white shadow-lg flex-shrink-0">
                <img
                  src={user?.profilePhoto || 'https://via.placeholder.com/150'}
                  alt="Profile"
                  className="w-full h-full object-cover rounded-full"
                />
              </div>
              <div className="text-center md:text-left mt-4 md:mt-0">
                <h2 className="text-4xl font-extrabold text-white">{user?.name}</h2>
                <p className="text-purple-200 text-lg capitalize mt-1">{role?.replace('_', ' ')}</p>
                {user && (
                  <button onClick={() => setShowEditModal(true)} className="mt-4 flex items-center justify-center gap-2 px-6 py-3 bg-white text-purple-800 rounded-full hover:bg-gray-200 transition-colors shadow-md font-semibold">
                    <FaEdit /> Edit Profile
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Personal Information Card */}
            <div className="lg:col-span-2 bg-gray-800 rounded-3xl shadow-xl p-8">
              <h3 className="text-3xl font-bold text-white mb-6 border-b border-gray-700 pb-4">Personal Information</h3>
              <div className="space-y-5">
                <div className="flex items-center text-lg">
                  <FaEnvelope className="text-purple-400 mr-4 text-xl" />
                  <p><strong className="text-gray-300">Email:</strong> {user?.email}</p>
                </div>
                {/* Add more personal details here if available, e.g., phone, address */}
                {/*
                <div className="flex items-center text-lg">
                  <FaPhone className="text-purple-400 mr-4 text-xl" />
                  <p><strong className="text-gray-300">Phone:</strong> +1 234 567 8900</p>
                </div>
                <div className="flex items-center text-lg">
                  <FaMapMarkerAlt className="text-purple-400 mr-4 text-xl" />
                  <p><strong className="text-gray-300">Location:</strong> New York, USA</p>
                </div>
                */}
              </div>
            </div>

            {/* Team Information Card */}
            {team && (
              <div className="bg-gray-800 rounded-3xl shadow-xl p-8 flex flex-col items-center text-center">
                <h3 className="text-3xl font-bold text-white mb-6 border-b border-gray-700 pb-4 w-full">Team Information</h3>
                <img src={team.teamLogo || 'https://via.placeholder.com/100'} alt="Team Logo" className="w-32 h-32 rounded-full object-cover mb-6 border-4 border-purple-500 shadow-lg" />
                <p className="text-2xl font-semibold text-white mb-2">{team.name}</p>
                <p className="text-gray-400 text-md leading-relaxed">{team.bio}</p>
                <button className="mt-6 flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-full hover:bg-purple-700 transition-colors shadow-md font-semibold">
                  <FaUsers /> View Team
                </button>
              </div>
            )}

            {/* Placeholder for Additional Sections */}
            <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-gray-800 rounded-3xl shadow-xl p-8">
                <h3 className="text-3xl font-bold text-white mb-6 border-b border-gray-700 pb-4">Recent Activity</h3>
                <ul className="space-y-4 text-gray-300">
                  <li><span className="text-purple-400">•</span> Joined "Fantasy League 2025"</li>
                  <li><span className="text-purple-400">•</span> Bid on "Player X" in Auction #123</li>
                  <li><span className="text-purple-400">•</span> Updated profile picture</li>
                  <li><span className="text-purple-400">•</span> Created new auction "Summer Draft"</li>
                </ul>
              </div>
              <div className="bg-gray-800 rounded-3xl shadow-xl p-8">
                <h3 className="text-3xl font-bold text-white mb-6 border-b border-gray-700 pb-4">Statistics</h3>
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <p className="text-purple-400 text-4xl font-bold">12</p>
                    <p className="text-gray-300">Auctions Joined</p>
                  </div>
                  <div>
                    <p className="text-purple-400 text-4xl font-bold">8</p>
                    <p className="text-gray-300">Players Owned</p>
                  </div>
                  <div>
                    <p className="text-purple-400 text-4xl font-bold">$5,000</p>
                    <p className="text-gray-300">Total Spend</p>
                  </div>
                  <div>
                    <p className="text-purple-400 text-4xl font-bold">3</p>
                    <p className="text-gray-300">Teams Managed</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Logout Button */}
          <div className="mt-12 text-center">
            <button onClick={handleLogout} className="flex items-center justify-center mx-auto gap-3 px-8 py-4 bg-red-600 rounded-full hover:bg-red-700 transition-colors shadow-lg text-xl font-semibold">
              <FaSignOutAlt /> Logout
            </button>
          </div>
        </div>
      </main>
      {showEditModal && <EditProfileModal user={user} dispatch={dispatch} setShowEditModal={setShowEditModal} />}
    </div>
  );
};

const EditProfileModal = ({ user, dispatch, setShowEditModal }) => {
  const [form, setForm] = useState({ name: user?.name || '' });
  const [upImg, setUpImg] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleInputChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.addEventListener('load', () => setUpImg(reader.result));
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    setError(null);
    const formData = new FormData();
    formData.append('name', form.name);

    if (upImg) {
      const response = await fetch(upImg);
      const blob = await response.blob();
      formData.append('profilePicture', blob, 'profilePicture.jpeg');
    }

    try {
      const res = await API.put('/auth/profile', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      dispatch(updateUser(res.data.user));
      setShowEditModal(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 animate-fade-in">
      <div className="bg-gray-800 rounded-2xl shadow-xl p-8 w-full max-w-md m-4">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-bold">Edit Profile</h3>
          <button onClick={() => setShowEditModal(false)} className="text-gray-400 hover:text-white"><FaTimes size={20} /></button>
        </div>
        <div className="space-y-6">
          <div className="flex flex-col items-center">
            <div className="relative w-32 h-32 rounded-full mb-4">
              <img src={upImg || user?.profilePhoto || 'https://via.placeholder.com/150'} alt="Profile Preview" className="w-full h-full object-cover rounded-full" />
              <label htmlFor="profilePicInput" className="absolute -bottom-2 -right-2 bg-purple-600 p-3 rounded-full cursor-pointer hover:bg-purple-700 transition-colors z-10">
                <FaCamera />
                <input id="profilePicInput" type="file" className="hidden" onChange={handleFileChange} accept="image/*" />
              </label>
            </div>
          </div>

          <div className="relative">
            <FaUser className="absolute top-1/2 left-4 transform -translate-y-1/2 text-gray-400" />
            <input type="text" name="name" value={form.name} onChange={handleInputChange} placeholder="Full Name" className="w-full bg-gray-700 text-white pl-12 pr-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500" />
          </div>
          {error && <p className="text-red-500 text-sm text-center">{error}</p>}
          <div className="flex justify-end gap-4 mt-8">
            <button onClick={() => setShowEditModal(false)} className="px-6 py-3 bg-gray-600 rounded-lg hover:bg-gray-500 transition-colors">Cancel</button>
            <button onClick={handleSave} disabled={loading} className="px-6 py-3 bg-green-600 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50">
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
export default Profile;