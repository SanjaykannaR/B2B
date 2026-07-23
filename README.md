# 🚚 Smart B2B Logistics & Delivery Optimization Platform

> Enterprise-grade freight management system with real-time tracking, role-based dashboards, and executive analytics.

**Stack:** MERN (MongoDB, Express.js, React.js, Node.js) + TypeScript  
**Team Size:** 3 Developers | **Timeline:** 28 Days  
**Date:** July 2026

---

## 📋 Table of Contents

1. [Quick Start](#-quick-start)
2. [Prerequisites & Downloads](#-prerequisites--downloads)
3. [Client Setup (Frontend)](#-client-setup-frontend)
4. [Server Setup (Backend)](#-server-setup-backend)
5. [Running Both Together](#-running-both-together)
6. [Project File Map](#-project-file-map)
7. [Team Task Division](#-team-task-division)
8. [Design System](#-design-system)
9. [API Endpoints Quick Reference](#-api-endpoints-quick-reference)
10. [Demo Accounts](#-demo-accounts)
11. [Deployment](#-deployment)

---

## 🚀 Quick Start

```bash
# 1. Clone the repo
git clone https://github.com/SanjaykannaR/B2B.git
cd B2B

# 2. Install all dependencies (client + server)
npm run install:all

# 3. Set up environment variables
cp server/.env.example server/.env     # Edit with your MongoDB URI & JWT secret
cp client/.env.example client/.env     # Edit API URL if needed

# 4. Seed the database with demo data
cd server && npm run seed && cd ..

# 5. Run both client and server
npm run dev
```

- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:5000/api
- **Health Check:** http://localhost:5000/api/health

---

## 📦 Prerequisites & Downloads

### Required Software

| Software | Version | Download Link | Purpose |
|---|---|---|---|
| **Node.js** | `v20.x LTS` or `v22.x LTS` | [nodejs.org/en/download](https://nodejs.org/en/download) | JavaScript runtime for both client & server |
| **npm** | `v10.x+` (bundled with Node) | Comes with Node.js | Package manager |
| **Git** | `v2.40+` | [git-scm.com/downloads](https://git-scm.com/downloads) | Version control |
| **MongoDB Atlas** | Free tier (M0) | [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas/register) | Cloud database (no local install needed) |

### Recommended Tools

| Tool | Purpose | Download |
|---|---|---|
| **VS Code** | Code editor | [code.visualstudio.com](https://code.visualstudio.com/) |
| **Postman** | API testing | [postman.com/downloads](https://www.postman.com/downloads/) |
| **MongoDB Compass** | Database GUI | [mongodb.com/try/download/compass](https://www.mongodb.com/try/download/compass) |

### VS Code Extensions (Recommended)

- **ESLint** — JavaScript/TypeScript linting
- **Prettier** — Code formatting
- **Tailwind CSS IntelliSense** — Tailwind autocomplete
- **ES7+ React Snippets** — React boilerplate shortcuts
- **Thunder Client** — API testing inside VS Code

### Check Your Versions

```bash
node -v    # Should show v20.x.x or v22.x.x
npm -v     # Should show v10.x.x
git -v     # Should show git version 2.x.x
```

---

## 🖥️ Client Setup (Frontend)

> **For team members working ONLY on frontend:**
> Right-click the `client/` folder → "Open with VS Code" (or your editor).
> You do NOT need the `server/` folder to work on UI components.

### Tech Stack

| Package | Version | Purpose |
|---|---|---|
| React | `18.3.x` | UI framework |
| TypeScript | `5.6.x` | Type safety |
| Vite | `6.0.x` | Dev server & bundler |
| Tailwind CSS | `4.0.x` | Utility-first CSS framework |
| Redux Toolkit | `2.5.x` | State management |
| React Router | `6.28.x` | Client-side routing |
| Axios | `1.7.x` | HTTP client |
| Recharts | `2.15.x` | Charts & data visualization |
| Leaflet | `1.9.x` | Interactive maps (free, no API key) |
| React Hot Toast | `2.5.x` | Toast notifications |

### Install & Run

```bash
cd client
npm install        # Install all frontend dependencies
npm run dev        # Start dev server on http://localhost:5173
```

### Available Scripts

```bash
npm run dev        # Start development server (hot reload)
npm run build      # Build for production (outputs to dist/)
npm run preview    # Preview production build locally
npm run lint       # Run ESLint
```

### Environment Variables

Copy `client/.env.example` to `client/.env`:
```env
VITE_API_URL=http://localhost:5000/api
```

---

## ⚙️ Server Setup (Backend)

> **For team members working ONLY on backend:**
> Right-click the `server/` folder → "Open with VS Code".
> You do NOT need the `client/` folder to work on APIs.

### Tech Stack

| Package | Version | Purpose |
|---|---|---|
| Express.js | `4.21.x` | REST API framework |
| Mongoose | `8.9.x` | MongoDB ODM |
| jsonwebtoken | `9.0.x` | JWT auth tokens |
| bcryptjs | `2.4.x` | Password hashing |
| express-validator | `7.2.x` | Input validation |
| node-cron | `3.0.x` | Scheduled jobs |
| nodemailer | `6.9.x` | Email notifications |
| multer | `1.4.x` | File uploads |
| cors | `2.8.x` | Cross-origin requests |
| dotenv | `16.4.x` | Environment variables |
| nodemon | `3.1.x` | Auto-restart on changes (dev) |

### Install & Run

```bash
cd server
npm install        # Install all backend dependencies
cp .env.example .env  # Create .env from template
# Edit .env with your MongoDB URI, JWT secret, etc.
npm run seed       # Populate database with demo data
npm run dev        # Start server with nodemon on http://localhost:5000
```

### Available Scripts

```bash
npm run dev        # Start with nodemon (auto-restart on file changes)
npm start          # Start without nodemon (production)
npm run seed       # Seed database with demo data
```

### Environment Variables

Copy `server/.env.example` to `server/.env` and fill in:

```env
PORT=5000
MONGODB_URI=mongodb+srv://username:password@cluster.xxxxx.mongodb.net/b2b-logistics
JWT_SECRET=your-secret-key-here
JWT_EXPIRES_IN=7d
NODE_ENV=development
CLIENT_URL=http://localhost:5173

# Email (optional — for overdue notifications)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

### MongoDB Atlas Setup

1. Go to [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas/register)
2. Create a free M0 cluster
3. Create a database user (username + password)
4. Add your IP to the Network Access whitelist (or use `0.0.0.0/0` for dev)
5. Click "Connect" → "Drivers" → Copy the connection string
6. Paste it into `server/.env` as `MONGODB_URI`

---

## 🔗 Running Both Together

From the **root** `BtwoB/` directory:

```bash
npm install        # Install concurrently (root dependency)
npm run dev        # Runs both client and server simultaneously
```

Or run them separately in two terminals:

```bash
# Terminal 1 — Server
npm run server

# Terminal 2 — Client
npm run client
```

---

## 🗂️ Project File Map

> Use this to quickly find the file you need. Each file has an inline comment explaining its purpose.

### Root

```
BtwoB/
├── .gitignore              # Git ignore rules (node_modules, .env, dist)
├── package.json            # Root scripts: run both client & server via concurrently
└── README.md               # This file — setup guide & file map
```

---

### 📁 client/ — Frontend (React + Vite + TypeScript)

#### Config Files
```
client/
├── index.html              # HTML entry point with SEO meta tags
├── package.json            # Frontend dependencies & scripts
├── vite.config.ts          # Vite dev server config + Tailwind plugin + API proxy
├── tsconfig.json           # TypeScript compiler options (strict mode)
└── .env.example            # Environment variable template (API URL)
```

#### Entry Points
```
client/src/
├── main.tsx                # React DOM render — wraps app in Provider + Router + Toaster
└── App.tsx                 # All route definitions + ProtectedRoute wrappers
```

#### State Management (Redux Toolkit)
```
client/src/store/
├── store.ts                # configureStore — combines all 4 slices
├── authSlice.ts            # User session: login/logout, JWT, isAuthenticated
├── manifestSlice.ts        # Shipment data: list, filters, selected manifest
├── vehicleSlice.ts         # Fleet data: vehicle list, selected vehicle
└── uiSlice.ts              # UI state: sidebar open/close, modal state, loading
```

#### API Services (Axios)
```
client/src/services/
├── api.ts                  # Axios instance + JWT interceptor + 401 redirect
├── authApi.ts              # login, register, getProfile
├── manifestApi.ts          # CRUD + assign + start-trip + status + complete
├── vehicleApi.ts           # CRUD + available + stats
├── invoiceApi.ts           # generate, list, pay, stats
├── analyticsApi.ts         # fleet, route, monthly, delivery, revenue endpoints
└── notificationApi.ts      # get, markRead, markAllRead, unreadCount
```

#### Custom Hooks
```
client/src/hooks/
├── useAuth.ts              # Current user, role, isAuthenticated from Redux
├── useRecovery.ts          # Trip timer recovery from localStorage (mobile resilience)
├── useLocalStorage.ts      # Generic localStorage hook with JSON serialization
└── useDebounce.ts          # Debounce search inputs (300ms default)
```

#### Layout Components
```
client/src/components/layout/
├── AppShell.tsx             # Main layout: sidebar (left) + topbar (top) + content
├── Sidebar.tsx              # Role-based navigation menu (admin/client/driver/executive)
├── Topbar.tsx               # User info, notification bell, logout button
└── ProtectedRoute.tsx       # Auth guard + role-based access check
```

#### Shared/Reusable Components
```
client/src/components/shared/
├── StatusBadge.tsx          # Colored status pill (Pending=amber, Delivered=green, etc.)
├── DataTable.tsx            # Generic sortable table with column definitions
├── StatCard.tsx             # Dashboard metric card (icon + title + value + trend)
├── ProgressStepper.tsx      # 4-step progress: Pending → Assigned → In-Transit → Delivered
├── ConfirmModal.tsx         # "Are you sure?" dialog with confirm/cancel
├── LoadingSpinner.tsx       # Animated spinner (full-page or inline)
├── EmptyState.tsx           # "No data" placeholder with optional CTA
└── SearchInput.tsx          # Debounced search bar with clear button
```

#### Admin Components
```
client/src/components/admin/
├── FleetGrid.tsx            # Vehicle data grid with status badges & actions
├── AddEditVehicleModal.tsx  # Create/edit vehicle form modal
├── ManifestWizard/
│   ├── WizardContainer.tsx  # 3-step wizard manager with localStorage persistence
│   ├── StepPartner.tsx      # Step 1: client select + origin/destination + dates
│   ├── StepCargo.tsx        # Step 2: weight, volume, items, hazmat toggle
│   └── StepRoute.tsx        # Step 3: vehicle suggestions + route preview + submit
├── LiveMap.tsx              # Leaflet.js map with vehicle markers (color by status)
├── DispatchPanel.tsx        # Assign driver + vehicle to pending manifests
└── ManifestDetailModal.tsx  # Full manifest details + status timeline
```

#### Client Components
```
client/src/components/client/
├── ClientOverview.tsx       # Stats: outstanding deliveries, total spent, fulfillment %
├── OrderForm.tsx            # Bulk freight request form (origin, dest, cargo, dates)
├── ShipmentTracker.tsx      # Progress stepper + timeline for tracking by ID
└── InvoiceList.tsx          # Invoice table with status badges & "Mark Paid"
```

#### Driver Components (Mobile-First)
```
client/src/components/driver/
├── RunSheet.tsx             # Daily delivery checklist with stop details
├── StopTerminal.tsx         # Warehouse info + loading protocols + action buttons
├── TripTimer.tsx            # HH:MM:SS timer with delta-time recovery (survives browser kill)
└── DeliveryConfirm.tsx      # Photo capture + signature + "Complete Delivery" submit
```

#### Executive Chart Components
```
client/src/components/executive/
├── FleetUtilizationChart.tsx    # Pie: Available vs In-Transit vs Maintenance
├── RouteEfficiencyChart.tsx     # Line: estimated vs actual distance/duration
├── MonthlyCapacityWidget.tsx    # Bar: monthly cargo throughput (kg & m³)
├── DeliveryPerformance.tsx      # Donut: on-time % vs delayed % vs cancelled %
└── RevenueSummary.tsx           # Area: monthly revenue + paid vs pending
```

#### Pages (Route Targets)
```
client/src/pages/
├── Login.tsx                    # Unified login for all 4 roles
├── NotFound.tsx                 # 404 page
├── admin/
│   ├── AdminDashboard.tsx       # 4 stat cards + recent manifests table
│   ├── FleetMonitor.tsx         # Vehicle grid with filter tabs
│   ├── ManifestCreate.tsx       # Multi-step wizard page
│   └── LiveOperations.tsx       # Map + dispatch panel
├── client/
│   ├── ClientDashboard.tsx      # Stats + recent orders + pending invoices
│   ├── PlaceOrder.tsx           # Simplified order form
│   ├── TrackShipment.tsx        # Search + progress stepper + timeline
│   └── ClientInvoices.tsx       # Invoice stats + filterable table
├── driver/
│   ├── DriverDashboard.tsx      # Today's deliveries (mobile-first)
│   └── ActiveDelivery.tsx       # Timer + run sheet + status actions (mobile-first)
└── executive/
    └── ExecutiveAnalytics.tsx   # All 5 charts + 4 KPI cards
```

#### Utilities
```
client/src/utils/
├── constants.ts             # Roles, statuses, status-to-color mapping, route paths
├── formatters.ts            # formatDate, formatCurrency, formatWeight, formatElapsedTime, etc.
└── validators.ts            # validateEmail, validatePhone, validateRequired, etc.
```

#### Styles
```
client/src/styles/
└── globals.css              # ✅ COMPLETE — Design tokens, Tailwind imports, dark mode,
                             #    typography, spacing, shadows, animations, utility classes
```

---

### 📁 server/ — Backend (Node.js + Express + MongoDB)

#### Config
```
server/
├── server.js                # Express app entry point — registers all routes & middleware
├── package.json             # Backend dependencies & scripts
├── .env.example             # Environment variable template
└── config/
    ├── db.js                # MongoDB connection with retry logic
    ├── cors.js              # CORS origin whitelist config
    └── env.js               # Environment variable loader & validation
```

#### Middleware
```
server/middleware/
├── auth.js                  # JWT verification + attach user to request
├── roleGuard.js             # Role-based access control (403 if wrong role)
├── errorHandler.js          # Centralized error catcher + structured JSON response
└── validate.js              # express-validator chain wrapper
```

#### Database Models (Mongoose)
```
server/models/
├── User.js                  # All 4 roles: admin, client, driver, executive
├── Vehicle.js               # Fleet registry: registration, capacity, status, driver
├── Manifest.js              # Core entity: cargo, routing, status timeline, scheduling
├── Invoice.js               # Billing: line items, amounts, payment status
└── Notification.js          # In-app alerts: type, read status, related manifest
```

#### API Routes
```
server/routes/
├── auth.routes.js           # /api/auth — login, register, me, refresh
├── user.routes.js           # /api/users — admin user management
├── vehicle.routes.js        # /api/vehicles — fleet CRUD + availability
├── manifest.routes.js       # /api/manifests — shipment lifecycle
├── invoice.routes.js        # /api/invoices — billing & payments
├── analytics.routes.js      # /api/analytics — executive aggregation queries
└── notification.routes.js   # /api/notifications — user alerts
```

#### Controllers (Business Logic)
```
server/controllers/
├── auth.controller.js       # Register, login, getMe, token refresh
├── user.controller.js       # List, get, update, deactivate users
├── vehicle.controller.js    # Vehicle CRUD, status, availability queries
├── manifest.controller.js   # Create, assign, start-trip, status update, complete, cancel
├── invoice.controller.js    # Generate, list, pay, revenue stats
├── analytics.controller.js  # MongoDB aggregation pipelines for dashboards
└── notification.controller.js # Get, markRead, markAllRead, unread count
```

#### Services (Business Logic Helpers)
```
server/services/
├── routeCalculator.js       # Haversine distance + duration estimation (60 km/h avg)
├── capacityMatcher.js       # Auto-match cargo to available vehicles by weight/volume
├── invoiceGenerator.js      # Build invoice: distance × contractRate, 30-day window
└── emailService.js          # Nodemailer wrapper for SMTP email delivery
```

#### Cron Jobs
```
server/cron/
└── overdueSweep.js          # Daily midnight: find overdue manifests → mark Delayed → email
```

#### Utilities
```
server/utils/
├── ApiError.js              # Custom error class: new ApiError(404, "Not found")
├── ApiResponse.js           # Standardized response: { success, data, message }
└── helpers.js               # generateTrackingId, formatDate, paginate, etc.
```

#### Seed Data
```
server/seeds/
├── seed.js                  # Master runner (clears DB → seeds all). Run: npm run seed
├── users.seed.js            # Demo accounts: admin, 2 clients, 2 drivers, 1 executive
├── vehicles.seed.js         # 5 trucks: Volvo, Mercedes, Iveco, MAN, DAF
└── manifests.seed.js        # 15 sample shipments across all statuses
```

---

## 👥 Team Task Division

| Developer | Area | Key Files |
|---|---|---|
| **Dev 1 — Backend** | All APIs, models, middleware, services, cron, seeds | Everything in `server/` |
| **Dev 2 — Web Frontend** | Layout, login, admin pages, executive charts, Redux, API services | `client/src/components/layout/`, `admin/`, `executive/`, `store/`, `services/`, `pages/admin/`, `pages/executive/`, `Login.tsx` |
| **Dev 3 — Mobile Frontend** | Client pages, driver pages, shared components, hooks | `client/src/components/shared/`, `client/`, `driver/`, `hooks/`, `pages/client/`, `pages/driver/` |

---

## 🎨 Design System

| Category | Details |
|---|---|
| **Primary Color** | Deep Navy `#1B2A4A` |
| **Accent Color** | Operational Orange `#FF6B2C` |
| **Body Font** | Inter (Variable) — [Google Fonts](https://fonts.google.com/specimen/Inter) |
| **Mono Font** | IBM Plex Mono — [Google Fonts](https://fonts.google.com/specimen/IBM+Plex+Mono) |
| **CSS Variables** | All tokens defined in `client/src/styles/globals.css` |
| **Dark Mode** | Auto via `prefers-color-scheme` + manual `data-theme="dark"` toggle |

See `client/src/styles/globals.css` for the full design token reference.

---

## 📡 API Endpoints Quick Reference

| Route Group | Base Path | Endpoints |
|---|---|---|
| Auth | `/api/auth` | `POST /login`, `POST /register`, `GET /me`, `POST /refresh` |
| Users | `/api/users` | `GET /`, `GET /drivers`, `GET /clients`, `GET /:id`, `PUT /:id`, `PATCH /:id/deactivate` |
| Vehicles | `/api/vehicles` | `GET /`, `GET /available`, `GET /stats`, `POST /`, `PUT /:id`, `PATCH /:id/status`, `DELETE /:id` |
| Manifests | `/api/manifests` | `GET /`, `GET /my`, `GET /driver/my`, `GET /:id`, `POST /`, `PUT /:id`, `PATCH assign/start-trip/status/complete`, `DELETE /:id` |
| Invoices | `/api/invoices` | `GET /`, `GET /my`, `GET /:id`, `POST /generate/:manifestId`, `PATCH /:id/pay`, `GET /stats` |
| Analytics | `/api/analytics` | `GET /fleet-utilization`, `GET /route-efficiency`, `GET /monthly-capacity`, `GET /delivery-performance`, `GET /revenue-summary` |
| Notifications | `/api/notifications` | `GET /`, `PATCH /:id/read`, `PATCH /read-all`, `GET /unread-count` |

---

## 🔐 Demo Accounts

| Role | Email | Password |
|---|---|---|
| Admin | `admin@logistics.com` | `admin123` |
| Executive | `exec@logistics.com` | `exec123` |
| Client (ABC) | `client@abc.com` | `client123` |
| Client (XYZ) | `client@xyz.com` | `client123` |
| Driver 1 | `driver1@logistics.com` | `driver123` |
| Driver 2 | `driver2@logistics.com` | `driver123` |

---

## 🚢 Deployment

| Service | Provider | Purpose |
|---|---|---|
| Backend | [Render](https://render.com) or [Railway](https://railway.app) | Node.js server hosting |
| Frontend | [Vercel](https://vercel.com) or [Netlify](https://netlify.com) | Static site / Vite build hosting |
| Database | [MongoDB Atlas](https://mongodb.com/atlas) | Cloud MongoDB (free M0 tier) |

---

**Built with ❤️ by the B2B Logistics Team — July 2026**
