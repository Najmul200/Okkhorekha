# অক্ষরেখা | React + Express

## Run locally

Requires Node.js 20 or later. Run the frontend and API in separate terminals.

## Styling

The frontend uses Tailwind CSS v4 through the Vite plugin. Design tokens live in the `@theme` block in `src/index.css`; layouts and component styling are expressed as Tailwind utility classes in JSX. `index.css` is reserved for base styles and custom behavior such as the carousel backdrop and reveal animations. The mobile hero keeps the full photo visible and uses a brighter, blurred copy of it to fill the portrait canvas.

1. From the project root, run `npm install`.
2. Copy `.env.example` to `.env`. Fill in the EmailJS values.
3. Create a MongoDB Atlas database and database user. Copy `server/.env.example` to `server/.env`, then set `MONGODB_URI`.
4. In the first terminal, from the project root, run `npm run dev`.
5. In a second terminal, run `cd server`, `npm install`, and `npm run dev`.
6. Open `http://localhost:5173`. Check the API at `http://localhost:5000/api/health`.

Never commit `.env` files. If your database password contains characters such as `@`, `#`, or `/`, URL-encode them in the connection string.

## MongoDB Atlas setup

1. Create a free cluster at [MongoDB Atlas](https://www.mongodb.com/atlas/database).
2. Under **Database Access**, create a database username and password. These are separate from your Atlas account credentials.
3. Under **Network Access**, allow your current development IP. In production, allow the API host's outbound IP. Avoid opening access to every IP (`0.0.0.0/0`) unless you have a specific reason.
4. Select **Connect → Drivers** and copy the connection string. Replace `<db-user>`, `<db-password>`, `<cluster-url>`, and `<database-name>` and put the result in `server/.env` as `MONGODB_URI`.
5. Set `CLIENT_ORIGIN` in `server/.env` to the exact Vite origin printed in the terminal (for example, `http://localhost:5173` or `http://localhost:5175`). Change it to your deployed website origin in production.
6. Start the API and check `/api/health`. It should return `database: "connected"`. The `akkhorekha` database and `reviews` collection are created automatically when the first review is submitted.

Each review stores its project ID and title, author name, review text, rating, and timestamps. The project page fetches its own reviews from the API. The API validates input and rate-limits submissions.

## EmailJS setup

1. Create an [EmailJS](https://www.emailjs.com/) account, add an email service, and connect the inbox where inquiries should arrive.
2. Create an email template. Set **To email** to `{{to_email}}` (do not hard-code a recipient address), **Subject** to `{{title}}`, and **Reply To** to `{{reply_to}}`. Use `{{from_name}}`, `{{title}}`, and `{{message}}` in the template body. The same template delivers contact notifications and admin replies.
3. Copy the Service ID, Template ID, and Public Key from EmailJS into `VITE_EMAILJS_SERVICE_ID`, `VITE_EMAILJS_TEMPLATE_ID`, and `VITE_EMAILJS_PUBLIC_KEY` in the root `.env` file.
4. Restart the Vite dev server. The contact form sends inquiries to `akkhorekhaarchitects@gmail.com`, configured in `src/data/content.js`.

The EmailJS Public Key is intended for browser use. Keep MongoDB credentials only in `server/.env`.

## Admin inbox

Run `supabase/migrations/20261110000001_contact_inbox.sql` once in the Supabase SQL Editor. Website contact form submissions are saved in `contact_messages` and email the studio using the EmailJS configuration above. In `/admin`, open **Inbox** to read submissions and reply; replies are emailed to the sender and saved in the thread. Inbox messages are readable only by signed-in users, while visitors can only submit new contact messages.

## WhatsApp Contact

The floating WhatsApp icon opens a prefilled chat to the number in `SITE.whatsapp` in `src/data/content.js`. Update that value to change the WhatsApp destination.

## Add a project

Create a folder for the project under `src/assets/projects/Ready Project/`, `Ongoing Project/`, or `Complete Project/` and place its images there. The folder name becomes the project title. Add its `sector` (`commercial`, `residential`, or `religious`) and optional details in `PROJECT_INFO` in `src/data/content.js` so it appears in the right group on the Projects page. WebP copies are generated automatically before dev and build; original project images remain unchanged.

Images uploaded from `/admin` are resized to a maximum 1920-pixel edge and compressed to WebP when that reduces their size. Public project galleries load images lazily to reduce initial page loading; previously uploaded originals are not changed automatically.

## Edit About Us content

Run `supabase/migrations/20261110000000_about_content.sql` in the Supabase SQL Editor once to create the About Us content table and its public-read/authenticated-write policies. Then sign in at `/admin`, choose **About Us**, edit the fields, and select **Save and Publish**. The homepage About section and `/about` page read the same content and receive live updates.

## Production deployment

Deploy the frontend to Vercel or Netlify with `npm run build`. Deploy the Express API separately to a Node.js service. Set `MONGODB_URI` and `CLIENT_ORIGIN` in the API service. In the frontend hosting settings, add `VITE_API_URL=https://your-api-domain.com/api` and the EmailJS variables `VITE_EMAILJS_SERVICE_ID`, `VITE_EMAILJS_TEMPLATE_ID`, and `VITE_EMAILJS_PUBLIC_KEY`. These `VITE_` variables are embedded into the frontend at build time, so redeploy the frontend after adding or changing them. Keep server credentials in environment settings, not in the repository.

Update the site domain in `index.html`, `public/robots.txt`, and `src/hooks/useSeo.js`. The sitemap is generated during the build.
