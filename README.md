# INFOTRACK Enterprises

A modern enterprise IT solutions platform built with React, TypeScript, Vite, and Tailwind CSS. INFOTRACK Enterprises provides a complete digital storefront for IT hardware sales, service bookings, customer portal management, and an admin dashboard — all in a single-page application.

![Platform](https://img.shields.io/badge/platform-React%2019%20%2B%20Vite%208-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-6.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)

---

## Features

### Store & Products
- Enterprise IT hardware catalog (laptops, servers, CCTV, networking, desktops, printers, software)
- AI-powered product search with semantic matching
- Product detail pages with full specifications, ratings, and reviews
- Shopping cart with quantity management and stock validation
- WhatsApp integration for B2B inquiries

### Service Booking
- 7 service categories: AMC, CCTV Setup, Network Design, IT Support, Cloud Backup, Web Services, IT Staffing
- Service request creation with preferred date scheduling
- Engineer assignment and status tracking

### Customer Portal
- Order history with status tracking (Pending → Processing → Shipped → Delivered)
- Service request management with real-time updates
- Profile management

### Admin Dashboard
- Product CRUD management with stock control
- Order fulfillment pipeline (status + payment management)
- Service request assignment and tracking
- Review moderation
- System settings (support phone, email, address, intro video)

### Website Stories (WhatsApp/Instagram-Style)
- Instagram-style story circles at the top of every page
- Full-screen story viewer with auto-advance, tap/swipe navigation, and keyboard controls
- Story categories: Offer, Product, Announcement, News, Promotion
- Configurable CTA buttons (Shop Now, View Offer, Contact Us, etc.)
- Auto-expiration engine (24h, 3 days, 7 days, or permanent)
- Story admin panel: create, edit, publish/unpublish, delete
- File upload with 10MB limit and live preview
- Analytics dashboard with view counts and performance charts
- URL sanitization and XSS protection

### AI Chatbot
- Intelligent product recommendation engine
- Natural language search with 5-dimensional embedding matching
- Cart integration from chat

### Additional Features
- Responsive design (mobile-first, tablet, desktop)
- Glassmorphism UI with smooth animations
- Scroll-reveal animations with Intersection Observer
- Role-based access (customer/admin) with mock authentication
- WhatsApp floating CTA with context-aware messaging

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, TypeScript 6, Vite 8 |
| Styling | Tailwind CSS 3.4, Custom glassmorphism utilities |
| Icons | Lucide React |
| Charts | Recharts 3 |
| State | React useState + localStorage (mock database) |
| Fonts | Inter (body), Poppins (headings) |

### Backend (Optional — `backend/` directory)
| Service | Technology |
|---------|-----------|
| REST API | NestJS (TypeScript) |
| AI Engine | Python FastAPI |
| Containerization | Docker + docker-compose |

---

## Installation

### Prerequisites
- **Node.js** >= 18.x
- **npm** >= 9.x

### Steps

```bash
# Clone the repository
git clone https://github.com/MohammedRameezuddin/INFOTRACK-Enterprises.git
cd INFOTRACK-Enterprises

# Install dependencies
npm install
```

---

## Development Setup

```bash
# Start the development server with hot reload
npm run dev
```

The app will be available at `http://localhost:5173` (or the next available port).

### Backend Services (Optional)

```bash
# Start all backend services with Docker
docker-compose up -d
```

This starts:
- **API Server** at `http://localhost:3000`
- **AI Engine** at `http://localhost:8000`

---

## Build Instructions

```bash
# Type-check without emitting
npx tsc --noEmit

# Build for production
npm run build
```

The production output will be in the `dist/` directory.

```bash
# Preview the production build locally
npm run preview
```

---

## Deployment

### Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### Netlify

```bash
# Build command: npm run build
# Publish directory: dist
netlify deploy --prod
```

### Docker

```bash
# Build the frontend container
docker build -t infotrack-frontend .

# Run
docker run -p 8080:80 infotrack-frontend
```

### Static Hosting (Nginx, Apache, S3)

Upload the contents of the `dist/` directory to your static hosting provider.

---

## Project Structure

```
INFOTRACK-Enterprises/
├── src/
│   ├── components/
│   │   ├── AdminDashboard.tsx    # Admin panel with product/order management
│   │   ├── AdminLogin.tsx        # Admin authentication
│   │   ├── AIChatbot.tsx         # AI-powered chat assistant
│   │   ├── CartDrawer.tsx        # Shopping cart sidebar
│   │   ├── CustomerPortal.tsx    # Customer order/service management
│   │   ├── Footer.tsx            # Site footer
│   │   ├── LandingPage.tsx       # Homepage with hero, products, services
│   │   ├── Logo.tsx              # Brand logo component
│   │   ├── Navbar.tsx            # Navigation bar with scroll progress
│   │   ├── ProductStore.tsx      # Product catalog with search & filters
│   │   ├── ServiceBooking.tsx    # Service request forms
│   │   ├── StoriesBar.tsx        # Instagram-style story circles
│   │   ├── StoriesViewer.tsx     # Full-screen story viewer
│   │   ├── StoryAdmin.tsx        # Story management admin panel
│   │   └── WhatsAppCTA.tsx       # Floating WhatsApp button
│   ├── db/
│   │   └── mockDb.ts            # LocalStorage-based mock database
│   ├── services/
│   │   └── aiEngine.ts          # AI product matching engine
│   ├── assets/                   # Images, icons, media
│   ├── App.tsx                   # Root application component
│   ├── index.css                 # Global styles & Tailwind config
│   └── main.tsx                  # Application entry point
├── public/                       # Static assets
├── backend/
│   ├── api/                      # NestJS REST API
│   └── ai/                       # Python AI/ML service
├── docker-compose.yml            # Docker orchestration
├── package.json
├── tailwind.config.js
├── tsconfig.json
└── vite.config.ts
```

---

## Environment Variables

The frontend runs entirely client-side with mock data. No environment variables are required for the base application.

For the optional backend services:

| Variable | Description | Default |
|----------|-------------|---------|
| `API_PORT` | REST API port | `3000` |
| `AI_PORT` | AI service port | `8000` |

---

## Security

This project implements the following security measures:

- **XSS Protection**: All user-provided URLs are validated against a strict allowlist (http/https/relative paths only)
- **Input Validation**: File upload size limits (10MB), form field sanitization
- **Safe External Links**: All `window.open()` calls use `noopener,noreferrer`
- **No Secrets in Code**: `.env` files are excluded via `.gitignore`
- **Mock Authentication**: Admin credentials are stored in the mock database for demo purposes only

---

## License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.

---

## Author

**Mohammed Rameezuddin**
Infotrack Enterprises — IT Solutions & Services

---

## Support

For support, contact: **infotrackenterprises@gmail.com**
