# Client Feedback Monthly

A modern web application for managing monthly client feedback surveys. Built with Next.js, Prisma, and Tailwind CSS.

## Features

- 🔐 Authentication with NextAuth.js
- 📊 Survey creation and management
- 👥 Team member management
- 📝 Client feedback collection
- 🌓 Dark mode support
- 📱 Responsive design
- 🔔 Toast notifications
- ✨ Modern UI with Tailwind CSS

## Tech Stack

- **Framework:** Next.js 14
- **Database:** SQLite with Prisma
- **Authentication:** NextAuth.js
- **Styling:** Tailwind CSS
- **UI Components:** Radix UI
- **Form Handling:** React Hook Form
- **Validation:** Zod
- **State Management:** React Query

## Getting Started

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/client-feedback-monthly.git
   cd client-feedback-monthly
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env
   ```

4. Initialize the database:
   ```bash
   npm run db:push
   npm run db:seed
   ```

5. Start the development server:
   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Development

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run db:push` - Push database schema changes
- `npm run db:seed` - Seed the database

## License

MIT
