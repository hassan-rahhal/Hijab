# Admin Panel — Setup & Usage

## Where it lives
The admin login is NOT linked anywhere in your site's nav, header, or footer —
it's only reachable if you know the exact URL. That's the "secret" part.

- Login page: `http://localhost:5173/portal-x7k9-login`
- Dashboard:  `http://localhost:5173/portal-x7k9` (redirects to login if not signed in)

You can change `portal-x7k9` to any string you like in `App.jsx`,
`AdminLogin.jsx`, and `lib/adminSession.js` (search for `portal-x7k9`) —
the weirder and less guessable, the better.

## One-time setup

1. In `backend/.env`, set your own admin credentials:
   ```
   ADMIN_USERNAME=your_choice
   ADMIN_PASSWORD=a_strong_password
   JWT_SECRET=any_long_random_string_no_spaces
   ```
2. Run the database migration (adds product sizes, reviews, delivery charge):
   ```powershell
   Get-Content migration_add_admin_features.sql | & "C:\xampp\mysql\bin\mysql.exe" -u root
   ```
3. Install the two new backend packages:
   ```powershell
   cd backend
   npm install
   ```
4. Restart the backend (`Ctrl+C` then `npm run dev`).

## What the admin panel can do

**Orders tab**
- View every order with customer details and items
- Change status: pending → confirmed → shipped → delivered → cancelled
- Set a delivery charge per order (grand total updates automatically)

**Products tab**
- Add new products: name, category, price, description, photo upload, sizes with stock per size
- Edit any existing product the same way
- Delete a product
- Set a size's stock to 0 to mark just that size sold out — when every size hits 0, the whole item shows "Sold out" automatically on the shop

**Categories tab**
- Add, rename, or delete categories (delete only works if no products use that category)

## Security notes for a real deployment
This setup is solid for a school project or small personal store, but if you
ever put this online for real customers, upgrade these before launching:
- Hash the admin password instead of storing it plain in `.env` (bcrypt)
- Serve everything over HTTPS
- Rate-limit the login endpoint against brute-force attempts
- Move `JWT_SECRET` to a real secrets manager rather than a committed `.env`
