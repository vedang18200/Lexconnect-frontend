# Lexconnect Frontend - Implementation Guide

Welcome to your Lexconnect React frontend! This guide will help you implement your Figma design.

## 📁 Project Structure

```
src/
├── components/       # Reusable UI components
│   └── Layout.tsx    # Main layout wrapper
├── pages/            # Page components (one per route)
│   └── Home.tsx      # Home page example
├── stores/           # Zustand state management
│   └── appStore.ts   # Global app state
├── types/            # TypeScript type definitions
│   └── index.ts      # Shared types
├── styles/           # Global styles (currently using Tailwind)
├── utils/            # Helper functions
│   └── helpers.ts    # Utility functions
├── App.tsx           # Main app component with routing
├── main.tsx          # Entry point
└── index.css         # Global styles with Tailwind directives
```

## 🚀 Getting Started

### 1. Start the Development Server
```bash
npm run dev
```
The app will run at `http://localhost:5173/`

### 2. Build for Production
```bash
npm run build
```

### 3. Preview Production Build
```bash
npm run preview
```

## 🎨 Implementing Your Figma Design

### Step 1: Create a Component from Figma
For each design element in Figma, create a corresponding React component:

```bash
# Create a new component file
src/components/MyComponent.tsx
```

Example component structure:
```tsx
import React from 'react'

interface MyComponentProps {
  title: string
  // Add other props based on your Figma design
}

export default function MyComponent({ title }: MyComponentProps) {
  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h2 className="text-xl font-bold">{title}</h2>
      {/* Add your design here using Tailwind classes */}
    </div>
  )
}
```

### Step 2: Use Tailwind CSS for Styling
Map your Figma colors, spacing, and typography to Tailwind classes:

**Figma → Tailwind mapping:**
- Colors: `text-primary`, `bg-secondary`, `text-dark`, `text-light`
- Spacing: `p-4`, `m-2`, `gap-6`
- Typography: `text-lg`, `font-bold`, `font-semibold`
- Responsive: `sm:`, `md:`, `lg:` prefixes

Customize theme in `tailwind.config.js`:
```js
theme: {
  extend: {
    colors: {
      primary: '#007AFF',
      secondary: '#5AC8FA',
      // Add more colors from your Figma design
    },
  },
}
```

### Step 3: Add Pages and Routes
1. Create page components in `src/pages/`
2. Add routes in `src/App.tsx`

Example:
```tsx
// src/pages/Dashboard.tsx
import Layout from '../components/Layout'

export default function Dashboard() {
  return (
    <Layout>
      <h1>Dashboard</h1>
      {/* Your dashboard content */}
    </Layout>
  )
}
```

```tsx
// In App.tsx
import Dashboard from './pages/Dashboard'

<Route path="/dashboard" element={<Dashboard />} />
```

## 📦 Managing State (Zustand)

Create stores for global state:

```tsx
// src/stores/userStore.ts
import { create } from 'zustand'

interface UserState {
  user: any
  setUser: (user: any) => void
}

export const useUserStore = create<UserState>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
}))
```

Use in components:
```tsx
import { useUserStore } from '../stores/userStore'

export default function UserProfile() {
  const { user } = useUserStore()
  return <div>{user?.name}</div>
}
```

## 📋 Using React Hook Form

For form implementation:

```tsx
import { useForm } from 'react-hook-form'

export default function LoginForm() {
  const { register, handleSubmit, formState: { errors } } = useForm()

  const onSubmit = (data) => console.log(data)

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <input
          {...register('email', { required: true })}
          type="email"
          className="w-full px-4 py-2 border rounded"
          placeholder="Email"
        />
        {errors.email && <span className="text-red-500">Email is required</span>}
      </div>
      <button type="submit" className="bg-primary text-white px-4 py-2 rounded">
        Submit
      </button>
    </form>
  )
}
```

## 🔀 Adding Navigation

Use React Router's `Link` component:

```tsx
import { Link } from 'react-router-dom'

<Link to="/dashboard" className="text-primary hover:underline">
  Go to Dashboard
</Link>
```

## 📱 Responsive Design

Use Tailwind's responsive prefixes:

```tsx
<div className="p-4 sm:p-6 md:p-8 lg:p-12">
  <h1 className="text-2xl sm:text-3xl md:text-4xl">Responsive Title</h1>
</div>
```

## 🎯 Key Technologies

- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Tailwind CSS** - Utility-first CSS
- **React Router** - Navigation
- **Zustand** - State management
- **React Hook Form** - Form handling

## 📚 Useful Resources

- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [React Docs](https://react.dev)
- [React Router Docs](https://reactrouter.com)
- [Zustand Docs](https://github.com/pmndrs/zustand)
- [React Hook Form Docs](https://react-hook-form.com)

## 🛠️ Troubleshooting

**Issue: Tailwind styles not working**
- Make sure `tailwind.config.js` has correct content paths
- Restart dev server: `npm run dev`

**Issue: TypeScript errors**
- Check types are defined in `src/types/`
- Ensure components are properly typed

**Issue: Routes not working**
- Make sure `BrowserRouter` wraps all routes in `App.tsx`
- Check route paths match your navigation links

## 📞 Next Steps

1. Review your Figma design
2. Break it down into reusable components
3. Create components in `src/components/`
4. Create pages in `src/pages/`
5. Add routes in `App.tsx`
6. Style using Tailwind CSS
7. Add state management with Zustand as needed

Happy coding! 🎉
