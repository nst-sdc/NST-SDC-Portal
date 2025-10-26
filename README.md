# NST-SDC-Portal

**Tracks and visualizes GitHub activity of NST-SDC club members. Includes dashboards for commits, pull requests, issues, leaderboards, achievements, and repository analytics to help monitor contributions and foster collaboration across all club projects.**

## Features

- **Commit Dashboard:** See daily, weekly, and monthly commit activity by club members and across projects.
- **Pull Requests Tracking:** Monitor open/closed PRs, PR reviewers, and contribution patterns.
- **Issues Overview:** Visualize open/closed issues, assignees, and trending topics.
- **Leaderboards:** Highlight top contributors based on commits, PRs, issue resolution, and activity streaks.
- **Achievements:** Showcase milestone badges for individual and team accomplishments.
- **Repository Analytics:** Analyze project-level stats, growth trends, and participation quality.

## Project Structure

```
nstsdc-portal/
├── client/              # React frontend (Vite)
│   ├── src/
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   ├── App.css
│   │   ├── index.css
│   │   └── assets/
│   ├── public/
│   ├── index.html
│   ├── vite.config.js
│   ├── eslint.config.js
│   └── package.json
├── server/              # Node.js backend (Express)
│   ├── index.js
│   └── package.json
└── README.md
```

## Technologies Used

### Frontend
- **React** 19.1.1 - UI library
- **Vite** 7.1.7 - Build tool and dev server
- **ESLint** - Code linting

### Backend
- **Node.js** - Runtime environment
- **Express** 5.1.0 - Web framework
- **Passport** 0.7.0 - Authentication middleware
- **Passport-GitHub** 1.1.0 - GitHub OAuth strategy
- **JWT** (jsonwebtoken 9.0.2) - Token-based authentication
- **Prisma**  - Prisma ODM
- **CORS** 2.8.5 - Cross-origin resource sharing
- **dotenv** 17.2.3 - Environment variable management
- **Database** - Postgres

### Development Tools
- **Nodemon** 3.1.10 - Auto-restart on file changes

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- MongoDB instance (for database)
- GitHub OAuth App credentials

### Installation

1. **Clone the Repository**
   ```bash
   git clone https://github.com/nst-sdc/NST-SDC-Portal.git
   cd NST-SDC-Portal
   ```

2. **Install Dependencies**

   Install server dependencies:
   ```bash
   cd server
   npm install
   ```

   Install client dependencies:
   ```bash
   cd ../client
   npm install
   ```

3. **Configure Environment Variables**

   Create a `.env` file in the `server` directory:
   ```env
   # Server Configuration
   PORT=3000

   # GitHub OAuth
   GITHUB_CLIENT_ID=your_github_client_id
   GITHUB_CLIENT_SECRET=your_github_client_secret
   GITHUB_CALLBACK_URL=http://localhost:3000/auth/github/callback

   # JWT
   JWT_SECRET=your_jwt_secret_key

   # Client URL (for CORS)
   CLIENT_URL=http://localhost:5173
   ```

   **Setting up GitHub OAuth:**
   1. Go to GitHub Settings > Developer settings > OAuth Apps
   2. Create a new OAuth App
   3. Set Authorization callback URL to `http://localhost:3000/auth/github/callback`
   4. Copy Client ID and Client Secret to your `.env` file

### Running the Application

1. **Start the Backend Server**
   ```bash
   cd server
   npm start
   # Or use nodemon for development:
   npx nodemon index.js
   ```
   Server will run on http://localhost:3000

2. **Start the Frontend Development Server**
   ```bash
   cd client
   npm run dev
   ```
   Client will run on http://localhost:5173

### Build for Production

Build the frontend:
```bash
cd client
npm run build
```

Preview production build:
```bash
npm run preview
```

## Development

### Frontend Development
- The client uses Vite with React and Hot Module Replacement (HMR)
- Edit files in `client/src/` and changes will reflect immediately
- Run `npm run lint` to check for linting errors

### Backend Development
- The server uses Express with a basic static file serving setup
- Use nodemon for automatic server restarts during development
- API endpoints can be added in `server/index.js`

## Basic Flow Diagram

```
User                   Server/API                    Admin
 |                        |                           |
 |---Login via GitHub---->| OAuth callback            |
 |<---JWT/Session Auth----|                           |
 |----Profile Form------->| Save user profile         |
 |<--Dashboard Data-------| Fetch GH & DB             |
 |                        |                           |
                                  |-----Admin login-->|
                                  |<--User/list data--|
                                  |---User details--->|
```

## Usage

- **Dashboards** – Real-time visualizations of contribution statistics
- **Admin Panel** – Manage member list, add new projects, and customize achievements
- **Analytics Export** – Download CSV or PDF reports for club meetings or reviews

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

Distributed under the MIT License.

---

**Repository:** [nst-sdc/NST-SDC-Portal](https://github.com/nst-sdc/NST-SDC-Portal)
