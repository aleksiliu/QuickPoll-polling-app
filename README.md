# QuickPoll - Create and Share Polls Instantly

QuickPoll is a modern, user-friendly web application that allows users to create, share, and participate in polls with ease. Get instant results and insights from your audience.

## Features

- Create polls with multiple options
- Vote on existing polls
- Responsive design for mobile and desktop

## Technologies Used

- **Next.js**: React framework for server-side rendering and routing
- **TypeScript**: For type-safe code
- **Tailwind CSS**: For responsive and customizable styling
- **Prisma**: ORM for database management
- **SQLite**: Lightweight database for storing polls and votes

## API Routes

The following API routes are available:

- `POST /api/poll`: Create a new poll
- `GET /api/poll`: Fetch all polls
- `GET /api/poll/[id]`: Fetch a specific poll
- `POST /api/poll/[id]`: Submit a vote for a specific poll

## Installation Guide

1. Clone the repository:

   ```
   git clone https://github.com/yourusername/quickpoll.git
   cd quickpoll
   ```

2. Install dependencies:

   ```
   npm install
   ```

3. Set up the database:

   - Create a `.env` file in the root directory
   - Add the following line to the `.env` file:
     ```
     DATABASE_URL="file:./dev.db"
     ```
   - Run Prisma migrations:
     ```
     npx prisma migrate dev
     ```

4. Start the development server:

   ```
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.
