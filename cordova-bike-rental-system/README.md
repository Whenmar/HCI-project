# Cordova Bike Rental — Full-Stack Starter

A working starter project for a bike rental management system:
- Frontend: React + TypeScript + Vite
- Backend: Laravel 12 API + Sanctum bearer-token authentication
- Database: MySQL
- Features: registration/login, dashboard, bike CRUD, bookings, payment records (manual/demo status only)

> **Figma note:** The supplied Figma URL could not be opened by the assistant, so this starter uses a clean bike-rental admin layout rather than claiming a pixel-perfect match. Share screenshots or an accessible view link to align the UI to your exact design.

## Requirements (Windows)
- PHP 8.2+
- Composer
- Node.js LTS + npm
- MySQL 8+ (or MariaDB)
- VS Code (recommended)

## 1. Set up the Laravel backend
Open PowerShell in this project folder:

```powershell
cd backend
composer install
Copy-Item .env.example .env
php artisan key:generate
```

Create a MySQL database named `cordova_bike_rental` (for example in phpMyAdmin or MySQL Workbench). Update `backend/.env`:
```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=cordova_bike_rental
DB_USERNAME=root
DB_PASSWORD=
```

Then run:
```powershell
php artisan migrate --seed
php artisan serve --host=127.0.0.1 --port=8000
```

The API runs at `http://127.0.0.1:8000`.

## 2. Set up the React frontend
Open a **second** PowerShell terminal:
```powershell
cd frontend
npm install
Copy-Item .env.example .env
npm run dev
```
Open the URL printed by Vite, usually `http://localhost:5173`.

## Demo account
After running the seed:
- Email: `admin@cordova.test`
- Password: `Password123!`

Change this password before using the system outside a local demo.

## Included API routes
- `POST /api/register`
- `POST /api/login`
- `POST /api/logout` (auth)
- `GET /api/me` (auth)
- `GET/POST /api/bikes` (auth)
- `GET/PUT/DELETE /api/bikes/{bike}` (auth)
- `GET/POST /api/bookings` (auth)
- `PATCH /api/bookings/{booking}/status` (auth)
- `GET/POST /api/payments` (auth)
- `GET /api/dashboard` (auth)

## Payment safety
This starter stores payment method and payment status as records for manual/admin tracking. It does **not** collect card numbers and does **not** charge real money. For live payments, integrate a provider such as PayMongo or Stripe on the server and follow its current compliance instructions. Never store raw card details.

## Troubleshooting on Windows
### `npm.ps1 cannot be loaded because running scripts is disabled`
Use Command Prompt instead of PowerShell, or run:
```powershell
npm.cmd install
npm.cmd run dev
```
You do not need to change your machine-wide execution policy.

### MySQL connection error
Check that MySQL is running and that the database/user/password in `.env` are correct.

### API says unauthenticated
Log out and sign in again. The frontend stores the Sanctum token in `localStorage` for this local starter. For production, prefer a properly configured same-site cookie-based Sanctum SPA setup.

### `composer` or `php` is not recognized
Install PHP and Composer, reopen the terminal, then verify:
```powershell
php -v
composer -V
node -v
npm -v
```
