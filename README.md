# LiveSign - Digital Signage Platform

A modern, multi-tenant digital signage platform built with Next.js 14 and Supabase.

## 🚀 Features

### Multi-Tenant Architecture
- **Organization-based isolation**: Complete data separation between organizations
- **Row-level security**: Database-level tenant isolation using Supabase RLS
- **Organization switching**: Users can belong to multiple organizations
- **Tenant-scoped routing**: `/org/[slug]` routes for organization-specific access

### Authentication & Authorization
- **Supabase Auth**: Secure authentication with social providers (Google, GitHub)
- **Role-based permissions**: Owner, Admin, Editor, Viewer roles
- **User invitation system**: Invite team members via email with token-based acceptance
- **Protected routes**: Middleware-based route protection

### Dashboard & UI
- **Responsive design**: Mobile-first design with Tailwind CSS
- **Organization dashboard**: Clean, intuitive interface for managing digital signage
- **Navigation sidebar**: Context-aware navigation based on user permissions
- **Stats overview**: Display counts for screens, content, users, and plan status

## 🛠 Tech Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Database**: Supabase (PostgreSQL)
- **Auth**: Supabase Auth
- **Styling**: Tailwind CSS
- **UI Components**: Custom components with Headless UI patterns

## 📁 Project Structure

```
src/
├── app/                          # Next.js App Router
│   ├── auth/                    # Authentication pages
│   │   ├── signin/              # Sign in page
│   │   ├── signup/              # Sign up page
│   │   └── callback/            # OAuth callback handler
│   ├── dashboard/               # Organization selector
│   └── org/[slug]/              # Tenant-scoped routes
│       └── layout.tsx           # Organization layout wrapper
├── components/
│   ├── auth/                    # Authentication components
│   ├── dashboard/               # Dashboard components
│   └── ui/                      # Reusable UI components
├── lib/
│   ├── auth.ts                  # Authentication utilities
│   └── supabase.ts              # Supabase client setup
├── middleware.ts                # Route protection & tenant routing
└── types/
    └── database.ts              # TypeScript database types

supabase/
└── migrations/
    └── 001_initial_schema.sql   # Database schema with RLS policies
```

## 🗄 Database Schema

### Core Tables
- **organizations**: Tenant isolation unit with settings and plan info
- **users**: User profiles linked to auth.users
- **roles**: System roles with configurable permissions
- **user_roles**: Junction table for user-organization-role relationships
- **invitations**: Email-based user invitation system

### Security Features
- **Row Level Security (RLS)**: All tables protected with organization-scoped policies
- **Role-based permissions**: Granular permissions stored as string arrays
- **Secure functions**: Database triggers for user creation and updates

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Supabase account

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd livesign-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Fill in your Supabase credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   ```

4. **Set up the database**
   - Create a new Supabase project
   - Run the migration file `supabase/migrations/001_initial_schema.sql` in the SQL editor
   - Enable authentication providers (Google, GitHub) in Supabase Auth settings

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Visit the application**
   Open [http://localhost:3000](http://localhost:3000) in your browser

### First Run Setup

1. **Create an account** via the sign-up page
2. **Create your first organization** during onboarding
3. **Explore the dashboard** and familiarize yourself with the interface
4. **Invite team members** using the invitation system

## 🔧 Configuration

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | ✅ |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key | ✅ |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key | ✅ |
| `NEXTAUTH_URL` | Application URL | ✅ |
| `NEXTAUTH_SECRET` | NextAuth secret key | ✅ |

### Supabase Setup

1. **Enable Auth Providers**: Configure Google and GitHub OAuth in Supabase Auth settings
2. **Set Auth Callbacks**: Add your domain to the Auth redirect URLs
3. **Configure RLS**: The migration script automatically sets up Row Level Security policies

## 📋 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript checks

## 🗺 Roadmap

### Phase 1: Foundation ✅
- [x] Multi-tenant database schema
- [x] Authentication system
- [x] User invitation flow
- [x] Basic dashboard layout
- [x] Organization switching

### Phase 2: Digital Signage Core (Next)
- [ ] Display management
- [ ] Content upload and management
- [ ] Playlist creation and scheduling
- [ ] Real-time display updates

### Phase 3: Advanced Features
- [ ] Analytics and reporting
- [ ] Template system
- [ ] Advanced scheduling
- [ ] Mobile app for management

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

- Create an [issue](../../issues) for bug reports or feature requests
- Check the [documentation](../../wiki) for detailed guides
- Join our [community discussions](../../discussions) for questions and support

---

Built with ❤️ using Next.js and Supabase