import { useNavigate } from 'react-router-dom';
export default function Welcome() {
  const navigate = useNavigate();
    return (
      <div className="flex h-screen w-full ">
        {/* Left Side - Gray Background */}
        <div className="w-1/2 h-full bg-gray-300"></div>
        
        {/* Right Side - Buttons */}
        <div className="w-1/2 h-full flex flex-col justify-center items-center bg-white">
          <h2 className="text-3xl font-bold mb-8 ">Welcome</h2>
          
          <button 
           onClick={() => navigate('/login')}
            className="w-64 py-3 mb-4 text-blue-500 bg-white border border-blue-500 rounded-lg text-center text-lg font-semibold shadow-md hover:bg-blue-100"
          >
            Login
          </button>
          
          <button 
            onClick={() => navigate('/register-team')}
            className="w-64 py-3 mb-4 text-white bg-green-500 rounded-lg text-center text-lg font-semibold shadow-md hover:bg-green-600"
          >
            Register as Team
          </button>
          
          <button 
            onClick={() => navigate('/register-player')}
            className="w-64 py-3 text-white bg-blue-500 rounded-lg text-center text-lg font-semibold shadow-md hover:bg-blue-600"
          >
            Register as Player
          </button>
        </div>
      </div>
    );
  }