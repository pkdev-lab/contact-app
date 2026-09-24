# Contact Form with MongoDB

A minimal contact form: static HTML/CSS/JS frontend + Express backend that saves submissions to MongoDB.

## Structure
```
contact-form-app/
├── public/
│   └── index.html      # The contact form (frontend)
├── server.js            # Express server + MongoDB logic
├── package.json
├── .env.example          # Copy to .env and fill in
└── README.md
```

## Setup

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Configure MongoDB**
   Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
   Then edit `.env`:
   - For a **local MongoDB** instance (make sure `mongod` is running):
     ```
     MONGO_URI=mongodb://localhost:27017
     ```
   - For **MongoDB Atlas** (free cloud tier): go to your cluster → "Connect" → "Drivers", copy the connection string, and replace `<username>`/`<password>` with your database user credentials:
     ```
     MONGO_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
     ```

3. **Run the server**
   ```bash
   npm start
   ```
   or, for auto-restart during development:
   ```bash
   npm run dev
   ```

4. **Open the form**
   Visit `http://localhost:3000` in your browser.

## How it works

- The form (`public/index.html`) submits via `fetch()` as JSON to `POST /api/contact`.
- `server.js` validates the input (required fields, basic email format, length limits), then inserts a document into the `messages` collection:
  ```js
  { name, email, message, createdAt }
  ```
- `GET /api/contact` returns the 50 most recent submissions as JSON — handy for testing. Remove or add authentication before deploying publicly, since it's unprotected right now.

## Notes on going to production

- Add authentication/rate-limiting to the API routes.
- Add CSRF protection if the form will be embedded on a different domain.
- Consider a spam filter (e.g. a honeypot field or reCAPTCHA).
- Restrict or remove the `GET /api/contact` endpoint, or put it behind an admin login.
- Use environment-specific `.env` files and never commit real credentials.
