# Peter - AI-Powered Portfolio Management

Peter is an intelligent portfolio management platform that leverages AI to provide investment insights, strategy recommendations, and portfolio optimization.

## Features

- AI-driven portfolio analysis and insights
- Intelligent strategy recommendations
- Market opportunity identification
- Portfolio health monitoring
- Goal-based investment planning

## Tech Stack

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Auth0 for authentication
- Redis for data storage
- AI-powered analytics

## Getting Started

1. Clone the repository:
```bash
git clone [your-repository-url]
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
Create a `.env.local` file with the following variables:
```env
# Auth0 Configuration
AUTH0_SECRET='your-auth0-secret'
AUTH0_BASE_URL='your-auth0-base-url'
AUTH0_ISSUER_BASE_URL='your-auth0-issuer-url'
AUTH0_CLIENT_ID='your-auth0-client-id'
AUTH0_CLIENT_SECRET='your-auth0-client-secret'

# Redis Configuration
REDIS_URL='your-redis-url'
```

4. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Project Structure

```
peter/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── auth/              # Authentication pages
│   ├── dashboard/         # Dashboard pages
│   └── components/        # Shared components
├── public/                # Static files
└── types/                 # TypeScript type definitions
```

## Contributing

1. Create a feature branch (`git checkout -b feature/amazing-feature`)
2. Commit your changes (`git commit -m 'Add some amazing feature'`)
3. Push to the branch (`git push origin feature/amazing-feature`)
4. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
