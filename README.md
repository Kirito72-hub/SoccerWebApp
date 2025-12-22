# ⚽ Rakla Football Manager

<div align="center">

![Rakla Football Manager](https://img.shields.io/badge/Status-Production%20Ready-success?style=for-the-badge)
![Version](https://img.shields.io/badge/Version-2.0.0-blue?style=for-the-badge)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)

**A modern, full-stack football league management system built with React, TypeScript, and Supabase**

[Live Demo](https://rakla.vercel.app) • [Developer Guide](DEVELOPER_GUIDE.md) • [Report Bug](https://github.com/Kirito72-hub/SoccerWebApp/issues)

</div>

---

## 📖 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Getting Started](#-getting-started)
- [User Roles](#-user-roles)
- [Core Features](#-core-features)
- [Screenshots](#-screenshots)
- [Database Schema](#-database-schema)
- [Deployment](#-deployment)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🎯 Overview

**Rakla Football Manager** is a comprehensive web application designed to manage football leagues, track player statistics, and organize tournaments. Whether you're running a casual weekend league or a competitive tournament, Rakla provides all the tools you need to manage matches, track standings, and engage your community.

### **Key Highlights:**

- 🏆 **League Management** - Create and manage multiple leagues with different formats
- ⚽ **Match Tracking** - Record match results and automatically update standings
- 📊 **Statistics** - Comprehensive player and league statistics
- 🎮 **Multiple Formats** - Support for Round Robin (1 & 2 legs) and Cup tournaments
- 👥 **Role-Based Access** - Three user roles with different permissions
- 🔒 **Secure** - Built with Supabase RLS policies for data security
- 🎨 **Modern UI** - Beautiful, responsive design with smooth animations
- 📱 **Mobile-Friendly** - Works seamlessly on all devices

---

## ✨ Features

### **For All Users:**
- ✅ Create account and manage profile
- ✅ View running and finished leagues
- ✅ Track personal statistics (matches played, goals, win rate)
- ✅ View activity feed of all league events
- ✅ Browse league standings and match results

### **For Pro Managers:**
- ✅ Create custom leagues with multiple formats
- ✅ Manage league participants
- ✅ Add match results
- ✅ View comprehensive analytics
- ✅ Track all leagues they administer

### **For Superusers:**
- ✅ All Pro Manager features
- ✅ Manage user roles and permissions
- ✅ Access to all leagues across the platform
- ✅ View and manage all users
- ✅ System-wide administration

---

## 🛠️ Tech Stack

### **Frontend:**
- **React 18** - UI library
- **TypeScript** - Type safety
- **React Router** - Client-side routing
- **Lucide React** - Icon library
- **Vanilla CSS** - Custom styling with modern design

### **Backend:**
- **Supabase** - Backend as a Service
  - PostgreSQL database
  - Row Level Security (RLS)
  - Real-time subscriptions
  - Authentication ready

### **Development:**
- **Vite** - Build tool and dev server
- **ESLint** - Code linting
- **TypeScript** - Type checking

### **Deployment:**
- **Vercel** - Frontend hosting
- **Supabase Cloud** - Database hosting

---

## 🚀 Getting Started

### **Prerequisites:**

- Node.js 18+ installed
- npm or yarn package manager
- Supabase account (free tier works)

### **Installation:**

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Kirito72-hub/SoccerWebApp.git
   cd SoccerWebApp
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   
   Create a `.env` file in the root directory:
   ```env
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Set up the database:**
   
   Run the SQL schema in your Supabase SQL Editor:
   ```bash
   # Copy the contents of supabase-schema.sql
   # Paste into Supabase SQL Editor and run
   ```

5. **Apply RLS policies:**
   ```bash
   # Run supabase-rls-complete-fix.sql in Supabase SQL Editor
   ```

6. **Create your admin account:**
   
   First, sign up through the app, then run in Supabase:
   ```sql
   UPDATE users 
   SET role = 'superuser' 
   WHERE email = 'your-email@example.com';
   ```

7. **Start the development server:**
   ```bash
   npm run dev
   ```

8. **Open your browser:**
   ```
   http://localhost:5173
   ```

---

## 👥 User Roles

### **1. Normal User** (Default)
- View leagues and standings
- Track personal statistics
- Participate in leagues

### **2. Pro Manager**
- Create and manage leagues
- Add match results
- Invite participants
- View league analytics

### **3. Superuser** (Admin)
- Full system access
- Manage all users and roles
- Access all leagues
- System administration

---

## 🎮 Core Features

### **1. League Management**

Create leagues with three different formats:

- **Round Robin (1 Leg)** - Each team plays every other team once
- **Round Robin (2 Legs)** - Each team plays every other team twice (home & away)
- **Cup Format** - Single-elimination knockout tournament

**Features:**
- Automatic fixture generation
- Customizable participant selection
- League status tracking (running/finished)
- Automatic standings calculation

### **2. Match Management**

- Add match results with scores
- Automatic standings updates
- Match history tracking
- Round-by-round organization

**Standings Calculation:**
- 3 points for a win
- 1 point for a draw
- 0 points for a loss
- Goal difference tiebreaker
- Goals scored secondary tiebreaker

### **3. Statistics Dashboard**

**Personal Stats:**
- Total matches played
- Leagues participated
- Goals scored/conceded
- Championships won
- Win rate percentage
- Favorite opponent
- Toughest rival

**League Stats:**
- Current standings
- Top scorers
- Match results
- Upcoming fixtures

### **4. Activity Feed**

Real-time activity tracking:
- League creation
- Match results
- League completion
- User actions

### **5. User Management** (Superuser only)

- View all registered users
- Update user roles
- Search and filter users
- Role-based permissions

---

## 📸 Screenshots

### **Dashboard**
![Dashboard](https://via.placeholder.com/800x450?text=Dashboard+Screenshot)

### **League Management**
![League Management](https://via.placeholder.com/800x450?text=League+Management+Screenshot)

### **Running Leagues**
![Running Leagues](https://via.placeholder.com/800x450?text=Running+Leagues+Screenshot)

### **Activity Log**
![Activity Log](https://via.placeholder.com/800x450?text=Activity+Log+Screenshot)

---

## 🗄️ Database Schema

### **Tables:**

1. **users** - User accounts and profiles
2. **leagues** - League information
3. **matches** - Match data and results
4. **user_stats** - Aggregated user statistics
5. **activity_logs** - System activity tracking

### **Key Relationships:**

```
users (1) ──→ (N) leagues (admin_id)
leagues (1) ──→ (N) matches (league_id)
users (1) ──→ (1) user_stats (user_id)
users (1) ──→ (N) activity_logs (user_id)
```

### **Security:**

All tables are protected with Row Level Security (RLS) policies:
- Users can view all data
- Only Pro Managers and Superusers can create leagues
- Only league admins can modify their leagues
- Activity logs are created by authenticated users

For detailed schema, see `supabase-schema.sql`

---

## 🌐 Deployment

### **Frontend (Vercel):**

1. Push your code to GitHub
2. Connect repository to Vercel
3. Set environment variables in Vercel dashboard
4. Deploy automatically on push

### **Backend (Supabase):**

1. Create a Supabase project
2. Run database schema
3. Apply RLS policies
4. Copy connection details to `.env`

For detailed deployment instructions, see [DEVELOPER_GUIDE.md](DEVELOPER_GUIDE.md)

---

## 🏗️ Project Structure

```
SoccerWebApp/
├── src/
│   ├── components/        # Reusable UI components
│   │   └── Layout.tsx    # Main app layout
│   ├── pages/            # Page components
│   │   ├── Auth.tsx      # Login/Signup
│   │   ├── Dashboard.tsx # User dashboard
│   │   ├── LeagueManagement.tsx
│   │   ├── RunningLeagues.tsx
│   │   ├── FinishedLeaguesLog.tsx
│   │   ├── ActivityLog.tsx
│   │   ├── Profile.tsx
│   │   └── Settings.tsx
│   ├── services/         # Business logic
│   │   ├── database.ts   # Supabase operations
│   │   ├── dataService.ts # Data abstraction layer
│   │   ├── storage.ts    # LocalStorage fallback
│   │   └── fixtures.ts   # Fixture generation
│   ├── types/            # TypeScript definitions
│   │   └── index.ts
│   ├── App.tsx           # Main app component
│   ├── main.tsx          # Entry point
│   └── index.css         # Global styles
├── supabase-schema.sql   # Database schema
├── supabase-rls-complete-fix.sql # RLS policies
└── package.json
```

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### **Development Guidelines:**

- Follow TypeScript best practices
- Write meaningful commit messages
- Test your changes thoroughly
- Update documentation as needed

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **Supabase** - For the amazing backend platform
- **Vercel** - For seamless deployment
- **Lucide** - For beautiful icons
- **React Community** - For excellent tools and libraries

---

## 📞 Support

- **Live App:** [https://rakla.vercel.app](https://rakla.vercel.app)
- **Issues:** [GitHub Issues](https://github.com/Kirito72-hub/SoccerWebApp/issues)
- **Developer Guide:** [DEVELOPER_GUIDE.md](DEVELOPER_GUIDE.md)

---

<div align="center">

**Made with ❤️ by the Rakla Team**

⭐ Star this repo if you find it helpful!

</div>
