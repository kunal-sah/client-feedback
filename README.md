# Monthly Survey Platform

A web-based platform for outsourcing agencies to manage monthly performance feedback surveys for their clients.

## Features

- 🔄 Monthly survey scheduling system
- 📝 Customizable survey templates
- 📧 Automated email delivery and reminders
- 📊 Survey response dashboard
- 👥 Role-based access control (Admin, Client, Team Member)
- 📈 Feedback analytics and reporting

## Tech Stack

- **Frontend**: Next.js 14 with TypeScript
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js
- **Email**: SendGrid
- **Styling**: Tailwind CSS
- **Form Handling**: React Hook Form with Zod validation
- **Data Fetching**: TanStack Query

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- PostgreSQL database
- SendGrid account for email delivery

### Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/dbname"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key"

# SendGrid
SENDGRID_API_KEY="your-sendgrid-api-key"
EMAIL_FROM="noreply@yourdomain.com"

# Cron Job
CRON_SECRET="your-cron-secret"
```

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/monthly-survey-platform.git
   cd monthly-survey-platform
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up the database:
   ```bash
   npx prisma generate
   npx prisma db push
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

## Project Structure

```
src/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   │   ├── auth/         # Authentication endpoints
│   │   ├── surveys/      # Survey management
│   │   ├── responses/    # Survey responses
│   │   └── cron/         # Cron job handlers
│   └── (routes)/         # Page routes
├── components/            # React components
│   ├── ui/               # UI components
│   └── forms/            # Form components
├── lib/                  # Utility functions
│   ├── prisma.ts        # Prisma client
│   ├── auth.ts          # Auth configuration
│   └── email.ts         # Email utilities
├── types/               # TypeScript type definitions
└── validations/         # Zod validation schemas
```

## API Endpoints

### Authentication
- `POST /api/auth/[...nextauth]` - NextAuth.js endpoints

### Surveys
- `GET /api/surveys` - List surveys
- `POST /api/surveys` - Create a new survey
- `GET /api/surveys/:id` - Get survey details
- `PUT /api/surveys/:id` - Update survey
- `DELETE /api/surveys/:id` - Delete survey

### Responses
- `GET /api/responses` - List responses
- `POST /api/responses` - Submit a response
- `GET /api/responses/:id` - Get response details

### Cron Jobs
- `GET /api/cron/send-reminders` - Send survey reminders

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
