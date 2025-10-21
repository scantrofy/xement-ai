# Authentication System

## Overview
The Xement.AI dashboard includes a complete authentication system with role-based access control.

## Features

### 🔐 Login Page (`/login`)
- Email and password authentication
- Role selection: **Admin** or **Operator**
- Password visibility toggle
- "Forgot password" link
- Redirect to signup page
- Form validation

### 📝 Signup Page (`/signup`)
- User registration with:
  - Full name
  - Email
  - Organization
  - Password (with strength requirements)
  - Password confirmation
- Role selection: **Admin** or **Operator**
- Password visibility toggles
- Form validation with error messages
- Redirect to login page

### 👤 User Roles

#### Admin
- Full access to all features and settings
- Can view and modify all configurations
- Access to advanced analytics
- Icon: Shield

#### Operator
- Access to monitoring and operational features
- Can view dashboards and reports
- Limited configuration access
- Icon: Users

## Components

### AuthContext
Location: `/src/contexts/AuthContext.jsx`

Provides authentication state management:
- `user` - Current user object
- `isAuthenticated` - Boolean auth status
- `loading` - Loading state
- `login(userData)` - Login function
- `logout()` - Logout function

### ProtectedRoute
Location: `/src/components/ProtectedRoute.jsx`

Wraps dashboard routes to require authentication. Redirects to `/login` if not authenticated.

### Header Integration
The header displays:
- User avatar with role icon
- User name and role
- Dropdown menu with:
  - User details
  - Organization
  - Role badge
  - Sign out button

## Usage

### Accessing Auth Context
```jsx
import { useAuth } from '../../contexts/AuthContext';

const MyComponent = () => {
  const { user, isAuthenticated, logout } = useAuth();
  
  return (
    <div>
      {isAuthenticated && (
        <p>Welcome, {user.name}! Role: {user.role}</p>
      )}
    </div>
  );
};
```

### Protected Routes
All dashboard routes are automatically protected. Users must be authenticated to access them.

## Data Storage
User data is stored in `localStorage`:
- `isAuthenticated` - Auth status
- `userEmail` - User email
- `userRole` - User role (admin/operator)
- `userName` - User full name
- `userOrganization` - User organization

## Routes
- `/login` - Login page
- `/signup` - Signup page
- `/` - Dashboard (protected)
- `/overview-dashboard` - Overview (protected)
- All other dashboard routes (protected)

## Styling
- Fully responsive design
- Dark mode support
- TailwindCSS styling
- Lucide React icons
- Smooth transitions and animations

## Security Notes
⚠️ **Important**: This is a frontend-only authentication system for demonstration purposes.

For production use, implement:
- Backend API authentication
- JWT tokens
- Secure password hashing
- Session management
- HTTPS only
- CSRF protection
- Rate limiting
