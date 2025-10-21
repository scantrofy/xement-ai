# Logo Component Usage

The Logo component provides theme-aware branding for the Xement AI dashboard.

## Features

- **Theme-aware**: Automatically switches between white logo (dark mode) and blue logo (light mode)
- **Multiple sizes**: small, medium, large, xlarge
- **Flexible display**: Can show/hide text, be clickable
- **Fallback support**: Shows icon if image fails to load
- **Accessibility**: Proper alt text and focus states

## Usage Examples

### Basic Logo
```jsx
import { Logo } from '../../components/ui';

<Logo />
```

### Clickable Logo (Header)
```jsx
<Logo 
  size="medium"
  showText={true}
  onClick={() => navigate('/overview-dashboard')}
  className="cursor-pointer"
/>
```

### Small Logo (Mobile Menu)
```jsx
<Logo 
  size="small"
  showText={false}
  onClick={() => navigate('/overview-dashboard')}
/>
```

### Large Logo (Loading/Error Pages)
```jsx
<Logo 
  size="large"
  showText={true}
  className="animate-pulse"
/>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `size` | `'small' \| 'medium' \| 'large' \| 'xlarge'` | `'medium'` | Logo size |
| `showText` | `boolean` | `true` | Show/hide company name text |
| `className` | `string` | `''` | Additional CSS classes |
| `textClassName` | `string` | `''` | CSS classes for text only |
| `onClick` | `function` | `null` | Click handler (makes logo clickable) |

## Logo Assets

- **Light mode**: `/assets/images/xement-ai-blue-logo.png`
- **Dark mode**: `/assets/images/xement-ai-white-logo.png`

## Implementation Locations

- ✅ Header component (main navigation)
- ✅ Mobile navigation drawer
- ✅ 404 Not Found page
- ✅ Loading screens
- ✅ Error boundary fallback
- ✅ All dashboard pages (via header)
