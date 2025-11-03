# Academic Management System (AMS)
## Comprehensive Educational Management System for Pakistani Institutions

A full-featured Academic Management System built with MERN stack (React, Node.js, Express, Supabase) designed specifically for Pakistani educational institutions with HEC compliance.

---

## 📋 Project Overview

This system provides comprehensive management for:
- Student lifecycle (Admission to Graduation)
- Academic operations (Courses, Timetables, Exams)
- Financial management (Fees, Payments, Budgeting)
- Administrative functions (HR, Payroll, Administration)
- Learning Management System (LMS)
- Library Management
- Multi-campus support

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn
- Supabase account

### Installation

For detailed setup instructions, see **[SETUP_GUIDE.md](./SETUP_GUIDE.md)**

**Quick Install:**
```bash
# Install dependencies
npm install
cd backend && npm install && cd ..

# Configure environment variables (see SETUP_GUIDE.md)
# Create .env files in root and backend/ directories

# Start backend server
cd backend
npm run dev

# In another terminal, start frontend
npm start

# Application will run on http://localhost:3000
```

---

## 📚 Documentation

**Comprehensive documentation is available in the `/docs` folder:**

### Quick References
- **[Setup Guide](./SETUP_GUIDE.md)** - Complete installation instructions
- **[Deployment Guide](./DEPLOYMENT.md)** - Production deployment guide
- **[Quick Reference](./QUICK_REFERENCE.md)** - Developer cheat sheet
- **[Testing Guide](./TESTING_GUIDE.md)** - Testing strategies and best practices
- **[Project Completion Summary](./PROJECT_COMPLETION_SUMMARY.md)** - Overall project status and achievements

### Core Documentation
- **[SRS Document](./docs/SRS_Document.md)** - Complete system requirements and specifications
- **[Database Schema](./docs/Database_Schema.md)** - Supabase database design
- **[Implementation Plan](./docs/Implementation_Plan.md)** - Step-by-step development guide
- **[Architecture Documentation](./docs/Architecture_Documentation.md)** - System architecture design
- **[Module Specifications](./docs/Module_Specifications.md)** - Detailed module documentation
- **[API Documentation](./docs/API_Documentation.md)** - Complete API reference
- **[Implementation Status](./docs/Implementation_Status.md)** - Current development status

### Setup & Deployment
- **[Setup Guide](./SETUP_GUIDE.md)** - Detailed installation and configuration guide
- **[Deployment Guide](./DEPLOYMENT.md)** - Production deployment instructions

### Quick Links
- [Documentation Index](./docs/README.md)
- [Quick Start Guide](./SETUP_GUIDE.md)

---

## 🏗️ Technology Stack

### Frontend
- **React 18** with TypeScript
- **Ant Design 5** - UI Component Library
- **React Router v6** - Routing
- **React Query** - Server state management
- **React Hook Form** - Form handling

### Backend
- **Node.js 18+** with Express.js
- **TypeScript** - Type safety
- **Supabase** - PostgreSQL database + Auth

### Database
- **Supabase (PostgreSQL 15+)**
- Row Level Security (RLS)
- Real-time subscriptions

---

## ✨ Key Features

### For Administrators
- Complete system configuration
- Multi-campus management
- Comprehensive reporting
- User and role management

### For Faculty
- Course management
- Attendance marking
- Grade entry and result processing
- Student communication

### For Students
- Course registration
- Fee payment
- Result viewing
- Assignment submission
- Library access

### For Parents
- Child's progress tracking
- Fee payment
- Attendance monitoring
- Communication with teachers

---

## 📦 Project Structure

```
AMS-Software/
├── docs/                    # Comprehensive documentation
│   ├── SRS_Document.md
│   ├── Database_Schema.md
│   ├── Implementation_Plan.md
│   ├── Architecture_Documentation.md
│   ├── Module_Specifications.md
│   └── API_Documentation.md
├── src/
│   ├── Admin/              # Admin panel components
│   ├── website/            # Public website
│   └── ...
├── public/                  # Static assets
└── package.json
```

---

## 🎯 Modules

1. **Admission Management** - Application, eligibility, enrollment
2. **Student Management** - Profiles, enrollment, performance
3. **Academic Management** - Programs, courses, curriculum
4. **Timetable Management** - Scheduling, room allocation
5. **Examination System** - Exams, results, grading
6. **Attendance Management** - Student and staff attendance
7. **Learning Management** - LMS features, assignments
8. **Library Management** - Catalog, borrowing, reservations
9. **Finance Management** - Fees, payments, reporting
10. **HR Management** - Employee records, recruitment
11. **Payroll System** - Salary processing, taxation
12. **Administration** - Staff, roles, events
13. **Certification** - Digital certificates, verification
14. **Multi-Campus** - Multi-location management

---

## 🔒 Security Features

- JWT-based authentication
- Role-based access control (RBAC)
- Row Level Security (RLS) in database
- Input validation and sanitization
- HTTPS encryption
- Audit logging

---

## 🌍 Pakistan Educational System

### HEC Compliance
- HEC curriculum guidelines
- Credit hour system
- Semester/Trimester support
- OBE (Outcome Based Education) alignment
- Transcript standards

### Local Features
- CNIC integration
- Urdu language support (RTL)
- Local payment gateways (JazzCash, EasyPaisa)
- Local SMS providers
- Pakistan tax calculations

---

## 📝 Development

### Available Scripts

```bash
# Start development server
npm start

# Build for production
npm run build

# Run tests
npm test

# Run linter
npm run lint
```

### Development Workflow
1. Create feature branch
2. Implement feature with tests
3. Create pull request
4. Code review
5. Merge to develop

---

## 🤝 Contributing

We welcome contributions! Please see our contributing guidelines:
- Follow TypeScript best practices
- Write unit tests for new features
- Follow ESLint rules
- Document your code

---

## 📞 Support

For support and questions:
- 📖 Read the [documentation](./docs/README.md)
- 🐛 Report bugs via GitHub Issues
- 💬 Join our discussion forum

---

## 📄 License

[Add your license information here]

---

## 🙏 Acknowledgments

- HEC (Higher Education Commission of Pakistan) guidelines
- Ant Design for UI components
- Supabase for backend infrastructure
- Open source community

---

**Last Updated**: 2024  
**Version**: 2.0

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you're on your own.

You don't have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn't feel obligated to use this feature. However we understand that this tool wouldn't be useful if you couldn't customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)
