# Questly - Daily Trivia Channel Platform

A full-stack trivia/quiz platform where anyone can create channels, post daily questions, and track audience participation. Built with React.js, Express.js, MongoDB, and JWT authentication.

## Features

- **Channel Management**: Create and manage trivia channels with custom names, descriptions, and avatars
- **Daily Questions**: Post questions with hidden answers that can be revealed later
- **Guest Mode**: Allow users to participate without creating an account
- **Leaderboards**: Track participant scores and rankings per channel
- **Responsive Design**: Mobile-first design with Tailwind CSS
- **Real-time Scoring**: Automatic scoring when answers are revealed

## Tech Stack

### Frontend
- React.js 18
- React Router DOM
- Axios for API calls
- Tailwind CSS
- Context API for state management

### Backend
- Node.js with Express.js
- MongoDB with Mongoose
- JWT authentication
- bcryptjs for password hashing
- Express validator for input validation

## Project Structure

```
questly/
├── backend/
│   ├── models/          # MongoDB models
│   ├── routes/          # API routes
│   ├── middleware/      # Authentication middleware
│   ├── server.js        # Express server
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/  # React components
│   │   ├── contexts/    # React contexts
│   │   ├── pages/       # Page components
│   │   ├── services/     # API services
│   │   └── App.js
│   ├── public/
│   └── package.json
└── README.md
```

## Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local installation or MongoDB Atlas)
- npm or yarn

### 1. Clone the Repository
```bash
git clone <repository-url>
cd questly
```

### 2. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Edit .env with your configuration
```

#### Environment Variables (.env)
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/questly
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
NODE_ENV=development
```

#### Start Backend Server
```bash
# Development mode (with nodemon)
npm run dev

# Production mode
npm start
```

### 3. Frontend Setup

```bash
cd ../frontend

# Install dependencies
npm install

# Create environment file (optional)
echo "REACT_APP_API_URL=http://localhost:5000/api" > .env
```

#### Start Frontend Development Server
```bash
npm start
```

The application will be available at `http://localhost:3000`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `POST /api/auth/guest` - Guest login
- `GET /api/auth/me` - Get current user

### Channels
- `POST /api/channels` - Create channel (auth required)
- `GET /api/channels/search?q=query` - Search channels
- `GET /api/channels/:slug` - Get channel details
- `POST /api/channels/:slug/join` - Join channel (auth required)
- `GET /api/channels/my/channels` - Get user's channels (auth required)

### Questions
- `POST /api/questions` - Create question (channel owner only)
- `GET /api/questions/:channelSlug/active` - Get active question
- `PATCH /api/questions/:id/reveal` - Reveal answer (channel owner only)
- `GET /api/questions/:channelSlug/history` - Get question history

### Submissions
- `POST /api/submissions` - Submit answer
- `GET /api/submissions/question/:questionId` - Get user submission (auth required)
- `GET /api/submissions/question/:questionId/all` - Get all submissions (owner only)

## Data Models

### User
```javascript
{
  username: String,
  email: String,
  password: String, // Hashed
  isGuest: Boolean,
  avatar: String,
  totalScore: Number,
  channelsOwned: [ObjectId],
  channelsJoined: [ObjectId]
}
```

### Channel
```javascript
{
  name: String,
  slug: String, // Auto-generated
  description: String,
  avatar: String,
  owner: ObjectId,
  members: [{
    user: ObjectId,
    joinedAt: Date,
    totalScore: Number
  }],
  isActive: Boolean,
  totalQuestions: Number
}
```

### Question
```javascript
{
  channel: ObjectId,
  questionText: String,
  correctAnswer: String,
  isActive: Boolean,
  isRevealed: Boolean,
  revealedAt: Date,
  submissions: [{
    user: ObjectId,
    guestName: String,
    answer: String,
    isCorrect: Boolean,
    submittedAt: Date
  }]
}
```

## Usage

### Creating a Channel
1. Register/login or continue as guest
2. Navigate to Dashboard → Create New Channel
3. Fill in channel details (name, description, avatar)
4. Channel is created with a unique slug (e.g., "tech-trivia")

### Managing Questions
1. Go to your channel page
2. As owner, you'll see options to create questions
3. Post a question with the correct answer (hidden from users)
4. Users can submit one answer per question
5. When ready, reveal the answer to automatically score submissions

### Joining Channels
1. Search for channels or use direct links
2. Click "Join Channel" (requires login or guest name)
3. Participate in active questions and track your score

## Development Notes

### Authentication
- JWT tokens expire after 7 days
- Guest users have limited functionality
- Protected routes require authentication middleware

### Scoring System
- 1 point per correct answer
- Leaderboards are per-channel
- Total score accumulates across all channels

### Security
- Passwords are hashed with bcryptjs
- Input validation on all endpoints
- CORS configured for frontend

## Deployment

### Backend Deployment
1. Set environment variables for production
2. Build and deploy to your preferred platform
3. Ensure MongoDB connection is configured

### Frontend Deployment
1. Build the React app: `npm run build`
2. Deploy to static hosting (Vercel, Netlify, etc.)
3. Set `REACT_APP_API_URL` to production backend URL

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For issues or questions, please open an issue on the repository.
