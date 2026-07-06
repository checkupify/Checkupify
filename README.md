# Checkupify — Patient-Facing Website

> India's fastest growing health platform. Book lab tests, consult doctors, get reports in 6 hours.

## 🚀 Quick Start

### 1. Clone & Install
```bash
git clone https://github.com/checkupify/Checkupify.git
cd Checkupify
npm install
```

### 2. Environment Variables
Copy `.env.example` to `.env.local` and fill in your values:
```bash
cp .env.example .env.local
```

```env
VITE_SUPABASE_URL=https://lguoussmsusadvmexjkb.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
VITE_RAZORPAY_KEY=your_razorpay_key_here
```

### 3. Setup Supabase Database
1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Open your project → SQL Editor
3. Paste and run the entire `supabase-schema.sql` file
4. This creates all tables, RLS policies, triggers, and seeds test data

### 4. Run Locally
```bash
npm run dev
# → http://localhost:5173
```

### 5. Build for Production
```bash
npm run build
# → /dist folder ready to deploy
```

---

## 📁 Project Structure

```
src/
├── App.jsx                    # Root component
├── main.jsx                   # Entry point
├── index.css                  # Global styles (all CSS variables & classes)
├── context/
│   └── AppContext.jsx          # Auth, modals, toast, city — unified state
├── data/
│   └── index.js               # All static data (tests, packages, labs, doctors)
├── lib/
│   └── supabase.js            # Supabase client
└── components/
    ├── layout/
    │   ├── AnnounceBanner.jsx  # Top announcement strip
    │   ├── Navbar.jsx          # Sticky nav with city, search, auth
    │   └── Footer.jsx          # Full 5-column footer
    ├── sections/
    │   ├── HeroSection.jsx     # Hero with live search + phone mockup
    │   ├── TrustBar.jsx        # Trust indicators (also exports QuickActions + Offers)
    │   ├── TestsSection.jsx    # 8 test cards grid
    │   ├── PackagesSection.jsx # Packages with tab filter
    │   ├── HowItWorks.jsx      # 4-step process (navy bg)
    │   ├── LabsSection.jsx     # Scrollable lab cards
    │   ├── DoctorsSection.jsx  # 4 doctor cards
    │   ├── TestimonialsSection.jsx # Reviews + Plans (combined)
    │   ├── FAQSection.jsx      # Accordion FAQ + contact options
    │   └── AppDownload.jsx     # Mobile app CTA
    ├── modals/
    │   ├── LoginModal.jsx      # Phone → OTP flow (Supabase auth)
    │   ├── BookingModal.jsx    # 4-step: details → slot → pay → confirm
    │   ├── CityModal.jsx       # City picker
    │   └── AccountModal.jsx    # User profile + quick links
    └── ui/
        └── Toast.jsx           # Toast + WhatsAppFloat + MobileDrawer (combined)
```

---

## 🔧 Key Features

| Feature | Status |
|---|---|
| Live search (tests + packages) | ✅ |
| WhatsApp OTP login | ✅ (Supabase phone auth) |
| 4-step booking modal | ✅ |
| Promo codes (FIRST200, HOMEFREE, etc.) | ✅ |
| City selector | ✅ |
| Supabase booking save | ✅ |
| Responsive (mobile + tablet) | ✅ |
| Scroll-based nav highlighting | ✅ |
| Toast notifications | ✅ |
| Mobile drawer | ✅ |
| WhatsApp float button | ✅ |

---

## 🌐 Deploying to Vercel

1. Push this repo to GitHub
2. Go to [vercel.com](https://vercel.com) → Import project
3. Add environment variables in Vercel dashboard:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
4. Deploy → checkupify.com goes live automatically

---

## 🗃️ Supabase Tables

| Table | Purpose |
|---|---|
| `profiles` | Patient accounts (linked to auth.users) |
| `bookings` | All test/doctor bookings |
| `family_members` | Add family profiles |
| `labs` | Partner lab centre data |
| `doctors` | Doctor profiles |
| `tests` | Test catalogue |
| `reports` | Uploaded PDF reports |
| `notifications` | In-app notifications |

---

## 🎨 Design Tokens

```css
--g: #00CC8E       /* Teal (primary CTA) */
--navy: #0A2747    /* Navy (dark sections) */
--ink: #0f172a     /* Dark text */
--slate: #475569   /* Secondary text */
--font: 'Plus Jakarta Sans'
--mono: 'DM Mono'
```

---

## 📌 Promo Codes (Demo)
| Code | Discount |
|---|---|
| FIRST200 | ₹200 off |
| HOMEFREE | ₹50 off (home collection) |
| FULLBODY40 | 40% off |
| CORP20 | 20% off |
| WEEKEND15 | 15% off |

---

## 🔜 Coming Next (Phase 2)

- **Partner Portal** — Labs accept/manage appointments, upload reports
- **Doctor Portal** — Video consult scheduling
- **Admin Dashboard** — Bookings, revenue, lab management
- **Flutter Mobile App** — iOS + Android
- **Razorpay Live** — Real payment gateway integration
- **MSG91 WhatsApp OTP** — Production OTP delivery

---

Built by **Unicribe Technologies Pvt. Ltd.** · © 2026
