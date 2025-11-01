# BIM Resource Share - Admin Panel

A modern Next.js admin panel for managing the BIM Resource Share platform.

## Features

- 🔐 **Authentication**: Secure JWT-based authentication
- 👥 **User Management**: View, search, and manage user profiles
- 📰 **News Management**: Create, edit, publish, and manage news articles with validity periods
- 📊 **Analytics Dashboard**: Real-time statistics and insights
- 🎨 **Modern UI**: Beautiful, responsive design with Tailwind CSS
- 🚀 **Fast & Efficient**: Built with Next.js 14 and React 18

## Prerequisites

- Node.js 18+ and npm/yarn
- Django backend running on `http://localhost:8000`

## Installation

1. Navigate to the admin panel directory:
```bash
cd admin-panel
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables:
Create a `.env.local` file with:
```
NEXT_PUBLIC_API_URL=http://localhost:8000
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

```
admin-panel/
├── src/
│   ├── app/                    # Next.js app directory
│   │   ├── dashboard/          # Dashboard pages
│   │   │   ├── users/          # User management
│   │   │   ├── news/           # News management
│   │   │   └── analytics/      # Analytics
│   │   ├── login/              # Login page
│   │   ├── layout.tsx          # Root layout
│   │   └── page.tsx            # Home page
│   ├── components/             # Reusable components
│   │   └── Sidebar.tsx         # Navigation sidebar
│   └── lib/                    # Utilities
│       ├── api.ts              # API client
│       └── types.ts            # TypeScript types
├── public/                     # Static assets
├── package.json
├── tsconfig.json
├── tailwind.config.js
└── next.config.js
```

## Features Overview

### User Management
- View all users with search and filtering
- View detailed user profiles
- Toggle user verification status
- Toggle user active status
- View user activity statistics (posts, materials, news, donations)

### News Management
- Create new news articles
- Edit existing articles
- Publish/unpublish articles
- Archive articles
- Set validity periods (valid_from, valid_until)
- Upload featured images
- Add tags and SEO metadata
- Mark articles as featured

### Analytics
- User statistics dashboard
- Active/inactive user breakdown
- Verification rates
- Trending metrics

## API Integration

The admin panel connects to the Django backend API:

- **Authentication**: `/api/token/`
- **Users**: `/api/admin/users/`
- **News**: `/api/news/articles/`
- **Categories**: `/api/news/categories/`

## Building for Production

```bash
npm run build
npm start
```

## Technologies Used

- **Next.js 14**: React framework with App Router
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first CSS framework
- **Axios**: HTTP client
- **React Hook Form**: Form management
- **date-fns**: Date formatting
- **Lucide React**: Icon library

## Default Login

Use your Django admin credentials to log in:
- Email: Your admin email
- Password: Your admin password

## Support

For issues or questions, please contact the development team.
