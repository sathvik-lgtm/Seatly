# Seatly — Ticket Booking App

A modern, interactive ticket booking application with a FastAPI backend and a React frontend. Book tickets for movies, trains, and flights with a beautiful, themeable interface.

## Features

- 🎬 **Movie Ticket Booking** - Book tickets for your favorite movies
- 🚂 **Train Ticket Booking** - Reserve train tickets for your journey
- ✈️ **Flight Ticket Booking** - Book flight tickets (one-way or round trip) to your destination, with airline/train results, seat selection, and traveller details
- 💳 **Simulated Checkout** - A realistic payment step (Razorpay test mode — no real charges) before every booking is confirmed
- 🌓 **Light/Dark Theme** - Toggle between light and dark themes with a single click
- 🎨 **Distinct Color Themes** - Each booking type has its own unique color scheme:
  - Movies: Purple/Blue theme
  - Trains: Green/Teal theme
  - Flights: Orange/Red theme
- 📱 **Responsive Design** - Works seamlessly on desktop and mobile devices

## Architecture

- **Backend**: FastAPI (`main.py`) — a JSON API for bookings, airport/train-station autocomplete, country lists, and a simulated payment flow. Bookings are stored in a SQLite database (`bookings.db`, via SQLAlchemy — see `database.py`) and survive restarts. There is still no user authentication, so the Profile page shows a single shared list of bookings.
- **Frontend**: React + Vite, in `frontend/`. Client-side routing via `react-router-dom`. Talks to the backend exclusively through `/api/*` endpoints.
- In production, FastAPI serves the built React app directly (single origin, single process). In development, the Vite dev server runs separately and proxies `/api/*` to FastAPI.

## Payments (Test Mode Only)

Every booking goes through a checkout step powered by [Razorpay](https://razorpay.com)'s **test mode** — this is a portfolio/demo feature, not a real payment integration: no real money ever moves, and there is no server-side price catalog validating the charged amount (the frontend computes it from the mock flight/train prices). To enable it:

1. Sign up for a free Razorpay account and make sure the dashboard is switched to **Test Mode**.
2. Go to Settings → API Keys and generate a **Test** key pair (`key_id` starts with `rzp_test_`).
3. Copy `.env.example` to `.env` in the project root and fill in `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET`.
4. Restart the backend. Without these set, the "Pay & Confirm Booking" step will show a clear "payment gateway not configured" error instead of crashing — the rest of the app (search, results, seat selection) works fine either way.

Use Razorpay's own published test card/UPI credentials (see their Test Mode docs) to actually complete a sandbox payment.

## Persistence

Bookings are stored in a local SQLite file (`bookings.db`, created automatically on first run) via SQLAlchemy — see `database.py`. This survives normal restarts on the same machine. If you deploy somewhere with an ephemeral filesystem (disk resets on redeploy), set `DATABASE_URL` in `.env` to a hosted Postgres connection string (e.g. from Supabase, Neon, or Railway) instead — no code changes needed, just the env var.

## Running the Application

### Production (single command)

```bash
run.bat
```

This installs Python dependencies, builds the frontend (`frontend/dist`), and starts FastAPI on **http://localhost:8000**, which serves the built React app and the API from the same origin.

### Development (hot-reload)

```bash
run_dev.bat
```

This starts two servers in separate windows:
- FastAPI backend on `http://localhost:8000`
- Vite dev server on `http://localhost:5173` (open this one — it proxies `/api/*` to the backend)

Manual equivalent:
```bash
# Terminal 1
pip install -r requirements.txt
python main.py

# Terminal 2
cd frontend
npm install
npm run dev
```

## Project Structure

```
FWD project/
├── main.py                 # FastAPI backend — /api/* endpoints + SPA fallback
├── database.py              # SQLAlchemy engine/session + Booking model (SQLite by default)
├── bookings.db               # SQLite database file (generated, not committed)
├── requirements.txt        # Python dependencies
├── run.bat                 # Build frontend + run production (single origin, :8000)
├── run_dev.bat              # Run backend + Vite dev server side by side (hot-reload)
└── frontend/                # React app (Vite)
    ├── src/
    │   ├── pages/            # HomePage, MoviesPage, TrainsPage, FlightsPage, ProfilePage
    │   ├── components/       # layout/, booking/, movies/, routes/, profile/
    │   ├── hooks/             # useAutocomplete, useBookings, useCountries, useNavTransition
    │   ├── context/            # ThemeContext
    │   ├── api/client.js        # fetch wrapper for the backend API
    │   ├── data/                # movies.js, popularRoutes.js (client-side content)
    │   └── style.css             # global stylesheet (theming for all pages)
    └── dist/                   # production build output (generated, not committed)
```

## API Endpoints

- `POST /api/book/movie` - Book a movie ticket
- `POST /api/book/train` - Book a train ticket
- `POST /api/book/flight` - Book a flight ticket
- `GET /api/bookings` - Get all bookings (movies, trains, flights)
- `GET /api/bookings/{booking_type}` - Get bookings for one type
- `DELETE /api/cancel/{booking_type}/{booking_id}` - Cancel a booking
- `GET /api/autocomplete/airports?query=...&country=...` - Airport search
- `GET /api/autocomplete/train-stations?query=...&country=...` - Train station search
- `GET /api/countries` - List of countries covered by the airport/station data
- `POST /api/payment/create-order` - Create a Razorpay test-mode order for a given amount
- `POST /api/payment/verify` - Verify a completed Razorpay payment's signature

Any other path is handled by the React app (client-side routing).

## Theme Customization

The app uses CSS variables for easy theme customization, defined in `frontend/src/style.css`. Each booking type has its own color scheme, and the light/dark theme preference is saved in `localStorage` and persists across page reloads.

## Technologies Used

- **Backend**: FastAPI, Uvicorn
- **Database**: SQLite via SQLAlchemy (swappable to Postgres via `DATABASE_URL`)
- **Frontend**: React 18, Vite, react-router-dom
- **Payments**: Razorpay (test mode)
- **Styling**: CSS Variables, Flexbox, CSS Grid

## License

This project is open source and available for educational purposes.
