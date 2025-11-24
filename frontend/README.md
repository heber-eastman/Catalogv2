
  # Design Customers Module UI

  This is a code bundle for Design Customers Module UI. The original project is available at https://www.figma.com/design/S4WvVjogBTRJwHW7RbgJNz/Design-Customers-Module-UI.

  ## Running the code

  1. Install dependencies
     ```bash
     npm install
     ```

  2. Configure the required environment variables by creating a `.env.local`
     file in this directory:
     ```env
     VITE_CLERK_PUBLISHABLE_KEY=pk_test_your_key_here
     VITE_API_BASE_URL=http://localhost:3000/api
     VITE_ORGANIZATION_SLUG=oakmont
     ```
     - `VITE_CLERK_PUBLISHABLE_KEY` – the publishable key from your Clerk instance.
     - `VITE_API_BASE_URL` – the origin + `/api` for the Nest backend.
     - `VITE_ORGANIZATION_SLUG` – the tenant slug to send with every API call while
       developing locally. In production this will come from the subdomain.

  3. Start the development server
     ```bash
     npm run dev
     ```
  