# AMS Backend API

Backend API for Academic Management System built with Node.js, Express, TypeScript, and Supabase.

## Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account

## Installation

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Edit .env with your configuration
```

## Development

```bash
# Run in development mode with hot reload
npm run dev

# Build for production
npm run build

# Run production build
npm start
```

## Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run unit tests only
npm run test:unit

# Run integration tests
npm run test:integration
```

## Code Quality

```bash
# Lint code
npm run lint

# Fix linting issues
npm run lint:fix

# Format code
npm run format

# Type checking
npm run typecheck
```

## Project Structure

```
backend/
├── src/
│   ├── config/         # Configuration files
│   ├── controllers/    # Request handlers
│   ├── services/       # Business logic
│   ├── repositories/   # Data access
│   ├── middleware/     # Express middleware
│   ├── models/         # TypeScript interfaces
│   ├── routes/         # Route definitions
│   ├── utils/          # Utility functions
│   ├── types/          # TypeScript types
│   ├── app.ts          # Express app setup
│   └── server.ts       # Server entry point
├── tests/              # Test files
├── dist/               # Compiled output
└── logs/               # Application logs
```

## Environment Variables

See `.env.example` for all required environment variables.

## API Documentation

API documentation will be available at `/api/docs` (Swagger) when implemented.

## License

ISC

