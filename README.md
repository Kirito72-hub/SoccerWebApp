# ⚽ Rakla Football Manager

<div align="center">

![Rakla Football Manager](https://img.shields.io/badge/Status-Production%20Ready-success?style=for-the-badge)
![Version](https://img.shields.io/badge/Version-1.2.0--beta-blue?style=for-the-badge)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)

**A modern, full-stack football league management system with real-time updates**

[Live Demo](https://rakla.vercel.app) • [Developer Guide](DEVELOPER_GUIDE.md) • [Security](SECURITY.md) • [Report Bug](https://github.com/Kirito72-hub/SoccerWebApp/issues)

</div>

---

## 📖 Table of Contents

- [Overview](#-overview)
- [What's New in v1.2](#-whats-new-in-v12)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Getting Started](#-getting-started)
- [User Roles](#-user-roles)
- [Security](#-security)
- [Deployment](#-deployment)
- [Documentation](#-documentation)

---

## 🎯 Overview

**Rakla Football Manager** is a comprehensive web application designed to manage football leagues, track player statistics, and organize tournaments with **real-time updates**. Built with React, TypeScript, and Supabase, it provides a modern, secure platform for managing competitive football leagues.

### **Key Highlights:**

- 🔴 **Real-Time Updates** - See changes instantly across all devices
- 🏆 **League Management** - Create and manage multiple league formats
- ⚽ **Match Tracking** - Record results with automatic standings updates
- 📊 **Statistics** - Comprehensive player and league analytics
- 🔒 **Secure** - Role-based access control with Supabase RLS
- 🎨 **Modern UI** - Beautiful, responsive design with animations
- 📱 **Mobile-Friendly** - Works seamlessly on all devices

---

## 🆕 What's New in v1.2

### **Real-Time Features** 🔴
- ✨ **Live League Updates** - New leagues appear instantly for all users
- ⚡ **Live Match Scores** - Score updates sync in real-time
- 👥 **Live User Management** - Role changes reflect immediately
- 🎯 **Visual Feedback** - Flash animations show what changed
- 🟢 **Connection Indicators** - Know when you're connected

### **Security Enhancements** 🔒
- 🛡️ **Authorization Checks** - Proper role-based access control
- 🚫 **Protected Routes** - Unauthorized users blocked from admin pages
- 📝 **Activity Log Protection** - Superuser-only access
- ✅ **Comprehensive Security Audit** - All pages reviewed

### **UI/UX Improvements** 🎨
- ✨ **Consistent Avatars** - Anime-style avatars across all pages
- 🎭 **In-App Notifications** - No more browser alerts
- 💚 **Success Messages** - Beautiful confirmation modals
- 🔄 **Smooth Animations** - Enhanced user experience

### **Bug Fixes** 🐛
- ✅ Fixed user deletion issues
- ✅ Fixed avatar inconsistencies
- ✅ Fixed realtime subscription cleanup
- ✅ Fixed permission checks for participants

---

## ✨ Features

### **For Normal Users:**
- ✅ View running and finished leagues
- ✅ Track personal statistics
- ✅ Participate in leagues
- ✅ Edit profile and avatar
- ✅ See real-time updates

### **For Pro Managers:**
- ✅ Everything Normal Users can do
- ✅ **Create custom leagues**
- ✅ **Manage league participants**
- ✅ **Add match results**
- ✅ **Real-time league updates**
- ✅ View league analytics

### **For Superusers:**
- ✅ Everything Pro Managers can do
- ✅ **Manage all users and roles**
- ✅ **Access all leagues**
- ✅ **View activity logs**
- ✅ **System administration**
- ✅ **Delete users** (with protection)

---

## 🛠️ Tech Stack

### **Frontend:**
- React 19 - UI library
- TypeScript - Type safety
- React Router 7 - Client-side routing
- Lucide React - Icon library
- Vanilla CSS - Custom styling

### **Backend:**
- Supabase - Backend as a Service
  - PostgreSQL database
  - Row Level Security (RLS)
  - **Real-time subscriptions** 🔴
  - Authentication ready

### **Development:**
- Vite 6 - Build tool
- TypeScript 5.8 - Type checking

### **Deployment:**
- Vercel - Frontend hosting
- Supabase Cloud - Database hosting

---

## 🚀 Getting Started

### **Prerequisites:**
- Node.js 18+
- npm or yarn
- Supabase account (free tier works)

### **Quick Start:**

1. **Clone and install:**
   ```bash
   git clone https://github.com/Kirito72-hub/SoccerWebApp.git
   cd SoccerWebApp
   npm install
   ```

2. **Configure environment:**
   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_key
   ```

3. **Set up database:**
   ```bash
   # Run supabase-schema.sql in Supabase SQL Editor
   # Run enable-realtime.sql for real-time features
   ```

4. **Create superuser:**
   ```sql
   -- Sign up first, then run:
   UPDATE users SET role = 'superuser' 
   WHERE email = 'your-email@example.com';
   ```

5. **Start development:**
   ```bash
   npm run dev
   ```

For detailed setup instructions, see [DEVELOPER_GUIDE.md](DEVELOPER_GUIDE.md)

---

## 👥 User Roles

| Role | Permissions |
|------|-------------|
| **Normal User** | View leagues, track stats, participate |
| **Pro Manager** | + Create leagues, manage matches |
| **Superuser** | + Manage users, access all features |

See [SECURITY.md](SECURITY.md) for complete authorization matrix.

---

## 🔒 Security

### **Authorization:**
- ✅ Role-based access control
- ✅ Protected admin routes
- ✅ Supabase RLS policies
- ✅ Cannot delete superusers
- ✅ Cannot delete yourself

### **Data Protection:**
- ✅ Row Level Security on all tables
- ✅ Permission-based filtering
- ✅ Secure user deletion
- ✅ Activity logging

See [SECURITY.md](SECURITY.md) for full security documentation.

---

## 🌐 Deployment

### **Vercel (Frontend):**
1. Connect GitHub repository
2. Set environment variables
3. Deploy automatically

### **Supabase (Backend):**
1. Create project
2. Run `supabase-schema.sql`
3. Run `enable-realtime.sql`
4. Copy credentials to Vercel

See [DEVELOPER_GUIDE.md](DEVELOPER_GUIDE.md) for detailed instructions.

---

## 📚 Documentation

- **[DEVELOPER_GUIDE.md](DEVELOPER_GUIDE.md)** - Complete development guide
- **[SECURITY.md](SECURITY.md)** - Security and authorization
- **[docs/archive/](docs/archive/)** - Historical documentation

---

## 🏗️ Project Structure

```
SoccerWebApp/
├── components/          # UI components
├── pages/              # Page components
├── services/           # Business logic
├── hooks/              # Custom React hooks
├── utils/              # Utility functions
├── public/             # Static assets
├── docs/               # Documentation
│   └── archive/        # Old docs
├── supabase-schema.sql # Database schema
└── enable-realtime.sql # Realtime setup
```

---

## 🤝 Contributing

Contributions welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push and open a PR

---

## 📝 License

MIT License - see [LICENSE](LICENSE) file

---

## 🙏 Acknowledgments

- **Supabase** - Backend platform
- **Vercel** - Deployment
- **Lucide** - Icons
- **React Community** - Tools and libraries

---

## 📞 Support

- **Live App:** [https://rakla.vercel.app](https://rakla.vercel.app)
- **Issues:** [GitHub Issues](https://github.com/Kirito72-hub/SoccerWebApp/issues)
- **Docs:** [DEVELOPER_GUIDE.md](DEVELOPER_GUIDE.md)

---

<div align="center">

**Made with ❤️ for the football community**

⭐ Star this repo if you find it helpful!

**Version 1.2.0-beta** | December 2025

</div>
