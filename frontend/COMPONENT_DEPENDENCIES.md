# Component Dependencies

This template includes advanced UI components copied from vadimcastro.me. Some components require additional dependencies:

## Required Additional Dependencies

For the toast system components (`toast.tsx`, `toaster.tsx`, `use-toast.ts`):

```bash
npm install @radix-ui/react-toast class-variance-authority
```

## Template Variables to Replace

When using this template, replace these placeholders:

- `{{PROJECT_NAME}}` - Your project's name (kebab-case)
- `{{PROJECT_DISPLAY_NAME}}` - Your project's display name
- `{{ADMIN_EMAIL}}` - Admin contact email
- `{{ADMIN_NAME}}` - Admin name for AdminMenu  
- `{{ADMIN_INITIALS}}` - Admin initials for AdminMenu
- `{{GITHUB_URL}}` - GitHub profile URL
- `{{LINKEDIN_URL}}` - LinkedIn profile URL 
- `{{WEBSITE_URL}}` - Website URL

## Required Assets

Add a profile image at: `frontend/public/images/profile.jpg`

## Advanced Components Included

### Layout Components
- **ProfileDropdown** - Professional dropdown with social links and authentication
- **AdminMenu** - Admin user dropdown with dashboard access
- **Enhanced Navbar** - Responsive navigation with professional styling

### UI Components  
- **MobileActionMenu** - Mobile navigation system with theming
- **DesktopActionMenu** - Desktop action menu with dropdown support
- **Toast System** - Complete toast notification system

### Dashboard Components
- **Enhanced MetricCard** - Professional metric display cards
- **DiskMetricCard** - Advanced disk usage visualization
- **DashboardHeader** - Dashboard header with refresh functionality
- **Enhanced DashboardComponent** - Comprehensive metrics dashboard

### Utilities
- **cn function** - Tailwind class name utility for conditional styling