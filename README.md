# 🏆 Sports Auction System 🎯

A comprehensive real-time sports auction platform where administrators can create tournaments, manage player auctions, and teams can bid for players in real-time. Built with modern technologies including **React + Vite** frontend, **Node.js** backend, **Kafka** for real-time messaging, **Redis** for state management, and **Socket.io** for live bidding.

---

### 🎮 Demo Credentials

**Team Owner Account:**

- Email: `team1@gmail.com`
- Password: `12345678`

**Admin Account:**

- Contact the system administrator for admin credentials

## 🔗 Live Project

- 🌐 **Frontend (React)**: [https://auction-system.vercel.app](https://auction-system-lakshya.vercel.app)
- 🛠️ **Backend (API)**: [https://auction-server.onrender.com](https://auction-sytem.onrender.com)

> Replace the above URLs with your actual deployed frontend and backend links.

---

## 📸 Screenshots

| Home<img width="1895" height="957" alt="image" src="https://github.com/user-attachments/assets/560ab8d4-fe41-46e0-833b-b81dca41ad14" />

| Create Auction<img width="1895" height="946" alt="image" src="https://github.com/user-attachments/assets/99fdf3bd-0780-4187-96bd-1e65980cd772" />

| Edit Profile<img width="1890" height="960" alt="image" src="https://github.com/user-attachments/assets/d9d26768-a8e1-4789-bc35-d6c128a8fc2f" />

| Live Auction Page<img width="1919" height="957" alt="image" src="https://github.com/user-attachments/assets/491737aa-dcb8-4337-a8c2-bce8c3001a16" />

| Working <img width="1890" height="851" alt="image" src="https://github.com/user-attachments/assets/77db791e-500a-432d-934e-aeee490d8e20" />


| ![Add Player]<img width="1899" height="952" alt="image" src="https://github.com/user-attachments/assets/c9f894b7-cd36-4e9d-8120-b3af4d72b036" />

| ![Admin Dashboard]<img width="1897" height="953" alt="image" src="https://github.com/user-attachments/assets/e4c14121-d06c-4127-ba05-df33e36aff77" />


---

## 🌟 Key Features

### 🔐 Authentication & Authorization

- **Dual Role System**: Admin and Team Owner roles with specific permissions
- **Secure JWT Authentication**: Token-based authentication with refresh capabilities
- **Team Management**: Team owners can create and manage their teams

### 🏟️ Tournament & Auction Management

- **Multi-Sport Support**: Cricket, Football, Basketball, Volleyball, and Kabaddi
- **Tournament Creation**: Admins can create tournaments with custom rules and budgets
- **Player Registration**: Players can register for upcoming auctions with detailed profiles
- **Auction Scheduling**: Set specific dates and times for live auctions

### ⚡ Real-Time Bidding System

- **Live Bidding Interface**: Real-time bidding with Socket.io for instant updates
- **Kafka Message Queue**: Ensures reliable bid processing and distribution
- **Redis State Management**: Atomic operations for consistent auction state
- **Bid History**: Complete tracking of all bids with timestamps
- **Auto-bidding Prevention**: Smart controls to prevent bid manipulation

### 📊 Analytics & Management

- **Team Dashboard**: View purchased players, remaining budget, and team statistics
- **Player Profiles**: Detailed player information with sports-specific attributes
- **Match Management**: Create and manage matches between teams
- **Auction Analytics**: Bid history, player values, and auction insights

### 🎮 User Experience

- **Responsive Design**: Mobile-first design with Tailwind CSS
- **Real-time Notifications**: Toast notifications for bid updates and auction events
- **Loading States**: Smooth loading animations and connection status indicators
- **Interactive UI**: Modern interface with React Icons and smooth animations

---

## 🛠 Technology Stack

### Frontend Technologies

- **React 19**: Modern React with latest features and hooks
- **Vite**: Lightning-fast development server and build tool
- **React Router DOM**: Client-side routing for SPA navigation
- **Redux Toolkit**: State management with Redux best practices
- **Tailwind CSS**: Utility-first CSS framework for rapid UI development
- **Socket.io Client**: Real-time bidirectional communication
- **Axios**: HTTP client for API requests
- **React Hot Toast**: Beautiful toast notifications
- **React Icons**: Comprehensive icon library

### Backend Technologies

- **Node.js & Express**: RESTful API server with middleware support
- **MongoDB & Mongoose**: NoSQL database with object modeling
- **Socket.io**: Real-time WebSocket communication
- **JWT**: JSON Web Token for secure authentication
- **Bcrypt**: Password hashing and encryption
- **Multer & Cloudinary**: File upload and cloud storage
- **CORS**: Cross-origin resource sharing configuration

### Message Queue & Caching

- **Apache Kafka**: Distributed streaming platform for real-time data
- **Redis**: In-memory data structure store for caching and sessions
- **KafkaJS**: Modern Apache Kafka client for Node.js

### DevOps & Deployment

- **Docker**: Containerization for Kafka, Zookeeper, and Redis
- **Vercel**: Frontend hosting and deployment
- **Render**: Backend API hosting
- **Git & GitHub**: Version control and collaboration
- **Nodemon**: Development server with hot reloading

---

## 📁 Project Structure

```
Auction-System/
├── client/                          # React Frontend Application
│   ├── src/
│   │   ├── components/              # Reusable React components
│   │   │   ├── Navbar.jsx          # Navigation component
│   │   │   ├── Sidebar.jsx         # Side navigation
│   │   │   ├── PlayerCard.jsx      # Player display component
│   │   │   ├── LoadingSpinner.jsx  # Loading animations
│   │   │   └── ...                 # Other components
│   │   ├── pages/                  # Main application pages
│   │   │   ├── Homescreen.jsx      # Landing page
│   │   │   ├── Login.jsx           # Authentication
│   │   │   ├── AuctionBidPage.jsx  # Real-time bidding interface
│   │   │   ├── CreateAuction.jsx   # Auction creation (Admin)
│   │   │   ├── AllAuctions.jsx     # Auction listing
│   │   │   ├── TeamDetails.jsx     # Team management
│   │   │   └── ...                 # Other pages
│   │   ├── store/                  # Redux state management
│   │   │   ├── store.js            # Redux store configuration
│   │   │   └── userSlice.js        # User state slice
│   │   ├── context/                # React context providers
│   │   └── assets/                 # Static assets (images, icons)
│   ├── api/
│   │   └── axios.js                # API configuration
│   ├── package.json                # Frontend dependencies
│   └── vite.config.js              # Vite build configuration
│
├── server/                         # Node.js Backend Application
│   ├── src/
│   │   ├── controllers/            # Route handlers
│   │   │   ├── auth.controller.js  # Authentication logic
│   │   │   ├── auction.controller.js # Auction management
│   │   │   ├── team.controller.js  # Team operations
│   │   │   └── ...                 # Other controllers
│   │   ├── models/                 # MongoDB schemas
│   │   │   ├── User.js             # User model (Admin/Team Owner)
│   │   │   ├── Team.js             # Team model
│   │   │   ├── Player.js           # Player model
│   │   │   ├── Auction.js          # Auction model
│   │   │   └── ...                 # Other models
│   │   ├── routes/                 # API routes
│   │   │   ├── auth.route.js       # Authentication endpoints
│   │   │   ├── auction.route.js    # Auction API
│   │   │   └── ...                 # Other routes
│   │   ├── kafka/                  # Kafka message processing
│   │   │   ├── producer.js         # Kafka message producer
│   │   │   ├── consumer.js         # Kafka message consumer
│   │   │   └── testProducer.js     # Testing utilities
│   │   ├── middleware/             # Express middleware
│   │   │   ├── auth.js             # JWT authentication
│   │   │   └── errorHandler.js     # Error handling
│   │   └── utils/                  # Utility functions
│   │       ├── socket.js           # Socket.io configuration
│   │       ├── cloudinary.js       # File upload handling
│   │       └── redisClient.js      # Redis connection
│   ├── docker-compose.yml          # Infrastructure setup
│   ├── package.json                # Backend dependencies
│   └── index.js                    # Application entry point
│
└── README.md                       # Project documentation
```

---

## � Getting Started

### Prerequisites

- **Node.js** (v16 or higher)
- **MongoDB** (local or cloud instance)
- **Docker & Docker Compose** (for Kafka and Redis)
- **Git** for version control

### 1. Clone the Repository

```bash
git clone https://github.com/Lakshya718/Auction-Sytem.git
cd Auction-Sytem
```

### 2. Backend Setup

#### Install Dependencies

```bash
cd server
npm install
```

#### Environment Configuration

Create a `.env` file in the server directory:

```env
# Database
MONGODB_URI=mongodb://localhost:27017/auction-system
# or use MongoDB Atlas: mongodb+srv://username:password@cluster.mongodb.net/auction-system

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=7d

# Redis Configuration
REDIS_URL=redis://localhost:6379

# Cloudinary (for file uploads)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# CORS Origins (comma-separated)
CORS_ORIGIN=http://localhost:5173,https://your-frontend-domain.com

# Server Configuration
PORT=5000
NODE_ENV=development
```

#### Start Infrastructure Services

```bash
# Start Kafka, Zookeeper, and Redis using Docker
docker-compose up -d

# Verify services are running
docker-compose ps
```

#### Start the Server

```bash
# Development mode with hot reloading
npm run dev

# Production mode
npm start

# Start Kafka consumer (in a separate terminal)
npm run start:consumer
```

### 3. Frontend Setup

#### Install Dependencies

```bash
cd client
npm install
```

#### Environment Configuration

Create a `.env` file in the client directory:

```env
# API Configuration
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000

# Application Configuration
VITE_APP_NAME=Sports Auction System
```

#### Start the Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

### 4. Initial Setup & Demo Data

1. **Create Admin Account**: Register the first user as an admin through the API or database
2. **Login with Demo Credentials**:
   - Email: `team1@gmail.com`
   - Password: `12345678`
3. **Create Teams**: Team owners can create and manage their teams
4. **Add Players**: Register players for upcoming auctions
5. **Create Auctions**: Admins can create tournaments and schedule auctions
6. **Start Bidding**: Join live auctions and start bidding for players

### 5. Production Deployment

#### Frontend (Vercel)

```bash
# Build for production
npm run build

# Deploy to Vercel
# Connect your GitHub repository to Vercel for automatic deployments
```

#### Backend (Render/Railway/Heroku)

- Set up environment variables in your hosting platform
- Use MongoDB Atlas for database
- Use Redis Cloud for caching
- Configure Kafka using cloud services (Confluent Cloud recommended)

## 🔄 How the System Works

### User Roles & Permissions

**🔧 Admin**

- Create and manage tournaments across different sports
- Schedule auctions with specific dates and times
- Set auction rules (budget limits, minimum bid increments)
- Monitor and control live auctions
- Manage player registrations and approvals
- Access comprehensive analytics and reports

**👥 Team Owner**

- Register and create team profiles
- Participate in live auctions
- Bid for players within budget constraints
- Manage team roster and player assignments
- View team statistics and match schedules
- Track spending and remaining budget

**⚽ Player**

- Register for upcoming auctions
- Create detailed player profiles with sport-specific attributes
- Submit retention requests for existing teams
- View auction results and team assignments

### Auction Flow

1. **Tournament Creation**: Admin creates a tournament with sport, budget rules, and schedule
2. **Player Registration**: Players register with detailed profiles and sport-specific skills
3. **Team Setup**: Team owners create teams and prepare for bidding
4. **Auction Day**: Real-time bidding with live updates via Socket.io and Kafka
5. **Player Assignment**: Successful bids result in player-team assignments
6. **Match Management**: Teams can participate in matches and tournaments

### Real-Time Architecture

**Message Flow:**

```
User Action → Frontend → API → Kafka Producer → Kafka Topic → Consumer → Database → Socket.io → All Connected Clients
```

**Technologies Integration:**

- **Kafka**: Handles bid processing and ensures message delivery
- **Redis**: Maintains auction state and user sessions
- **Socket.io**: Provides real-time updates to all connected users
- **MongoDB**: Stores all application data with ACID compliance

### Security Features

- **JWT Authentication**: Secure token-based authentication
- **Role-based Access Control**: Different permissions for Admin and Team Owner
- **Input Validation**: Comprehensive validation using Zod schemas
- **CORS Configuration**: Secure cross-origin resource sharing
- **Password Encryption**: Bcrypt hashing for secure password storage

## 📡 API Endpoints

### Authentication

- `POST /api/auth/register` - Register new team owner
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile

### Auctions

- `GET /api/auctions` - List all auctions
- `POST /api/auctions/create` - Create auction (Admin only)
- `GET /api/auctions/:id` - Get auction details
- `POST /api/auctions/:id/join` - Join auction
- `POST /api/auctions/:id/bid` - Place bid
- `POST /api/auctions/start-services` - Start Kafka services (Admin)

### Teams

- `GET /api/teams` - List all teams
- `POST /api/teams/create` - Create team
- `GET /api/teams/:id` - Get team details
- `PUT /api/teams/:id` - Update team

### Players

- `GET /api/players` - List all players
- `POST /api/players/create` - Register player
- `GET /api/players/:id` - Get player details
- `PUT /api/players/:id` - Update player

### Matches

- `GET /api/matches` - List all matches
- `POST /api/matches/create` - Create match (Admin)
- `GET /api/matches/:id` - Get match details

## 🔧 Troubleshooting

### Common Issues

**Kafka Connection Issues**

```bash
# Check if Kafka services are running
docker-compose ps

# Restart Kafka services
docker-compose restart kafka zookeeper

# Check Kafka logs
docker-compose logs kafka
```

**Redis Connection Issues**

```bash
# Test Redis connection
redis-cli ping

# Restart Redis
docker-compose restart redis
```

**MongoDB Connection Issues**

```bash
# Check MongoDB connection string in .env
# Ensure MongoDB is running (local) or accessible (cloud)

# Test connection
mongosh "your-connection-string"
```

**Frontend Build Issues**

```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Clear Vite cache
npm run dev -- --force
```

**Backend Issues**

```bash
# Check environment variables
cat .env

# Restart development server
npm run dev

# Check for port conflicts
lsof -i :5000
```

### Development Tips

1. **Hot Reloading**: Both frontend (Vite) and backend (Nodemon) support hot reloading
2. **Database Seeding**: Create sample data for testing auctions
3. **Environment Setup**: Use different .env files for development and production
4. **Docker Management**: Use `docker-compose down -v` to reset all data
5. **Debugging**: Enable debug logs in development environment

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 👨‍💻 Author

**Lakshya** - [GitHub Profile](https://github.com/Lakshya718)
**Yuvraj** - [GitHub Profile](https://github.com/yuvraj-singh-cs)

## 🙏 Acknowledgments

- React team for the amazing framework
- Socket.io for real-time communication
- Apache Kafka for distributed messaging
- MongoDB team for the excellent database
- Tailwind CSS for the utility-first approach
- All open-source contributors who made this project possible

---

**⭐ If you found this project helpful, please give it a star on GitHub!**
