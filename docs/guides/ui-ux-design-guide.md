# UI/UX Design Guide

This guide documents the design principles, patterns, and best practices for the MFE Toolkit platform UI/UX.

## Design Philosophy

Our design philosophy focuses on **efficiency**, **clarity**, and **scalability** to support complex microfrontend architectures while maintaining excellent user experience.

### Core Principles

1. **Maximum Content Density** - Show more information in less space without sacrificing readability
2. **Clear Visual Hierarchy** - Use consistent typography and spacing to guide user attention
3. **Responsive by Default** - Design for all screen sizes from mobile to ultra-wide displays
4. **Performance First** - Optimize for fast load times and smooth interactions

## Navigation Architecture

### Top Navigation Bar

We use a **top navigation bar with dropdown menus** instead of a sidebar to maximize content area.

```tsx
// Navigation structure
const navSections = [
  {
    title: 'Main',
    items: [
      { path: '/', label: 'Home', icon: <Home /> },
      { path: '/dashboard', label: 'Dashboard', icon: <LayoutDashboard /> }
    ]
  },
  {
    title: 'Services',
    items: [
      { path: '/services/modal', label: 'Modal', icon: <Layers /> },
      { path: '/services/event-bus', label: 'Event Bus', icon: <Radio /> }
    ]
  }
];
```

**Benefits:**
- Saves ~250px of horizontal space compared to sidebar
- Better for wide-screen displays
- Cleaner mobile experience
- Faster navigation with dropdown menus

## Typography System

### Font Sizes

We use a compact typography scale optimized for information density:

| Element | Class | Size | Usage |
|---------|-------|------|-------|
| Page Title | `text-xl` | 20px | Main page headings |
| Section Title | `text-lg` | 18px | Major section headers |
| Card Title | `text-base` | 16px | Card and panel headers |
| Body Text | `text-sm` | 14px | General content |
| Small Text | `text-xs` | 12px | Labels, captions, metadata |
| Tiny Text | `text-[10px]` | 10px | Badges, pills, dense data |

### Font Weights

- **Bold** (`font-bold`) - Page titles only
- **Semibold** (`font-semibold`) - Section titles, important labels
- **Medium** (`font-medium`) - Buttons, interactive elements
- **Normal** (`font-normal`) - Body text

## Spacing System

### Padding and Margins

We use a compact spacing scale to maximize content area:

| Space | Class | Pixels | Usage |
|-------|-------|--------|-------|
| Tiny | `p-1`, `m-1` | 4px | Between inline elements |
| Small | `p-2`, `m-2` | 8px | Inside compact components |
| Medium | `p-3`, `m-3` | 12px | Standard component padding |
| Large | `p-4`, `m-4` | 16px | Page sections |
| XL | `p-6`, `m-6` | 24px | Major page divisions |

### Component Spacing

- **Cards**: `py-3` for headers, `p-4` for content
- **Buttons**: `px-2 py-1` for small, `px-3 py-1.5` for medium
- **Form inputs**: `px-2 py-1` for compact inputs
- **Lists**: `space-y-1` or `space-y-2` for vertical spacing

## Layout Patterns

### Page Width

Constrain content width for better readability:

```tsx
<main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
  {/* Content */}
</main>
```

### Grid Systems

#### 3-Column Layout (Complex Interfaces)

Perfect for service demo pages with controls, content, and info panels:

```tsx
<div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
  <div className="lg:col-span-2">
    {/* Main content area */}
  </div>
  <div>
    {/* Info/control panel */}
  </div>
</div>
```

#### 2-Column Layout (Standard Pages)

For forms, settings, and comparison views:

```tsx
<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
  <div>{/* Left column */}</div>
  <div>{/* Right column */}</div>
</div>
```

## Component Patterns

### Event Bus Demo Layout

The Event Bus demo page showcases our optimized layout approach:

1. **Compact Header** - `text-xl` title with `text-sm` description
2. **Service Info Card** - Two-column grid for features and API methods
3. **Container Controls** - Emitter buttons in 3-column grid
4. **Tabbed MFE Interface** - Multiple MFEs in tabs to save space
5. **Info Panel** - Right sidebar with MFE details and quick actions

### Active Subscriptions (Pill Badges)

Visual representation of active subscriptions using color-coded pills:

```tsx
<div className="inline-flex items-center gap-1 px-2 py-1 rounded-full border">
  <div className={`w-1.5 h-1.5 rounded-full ${colorClass} animate-pulse`} />
  <span className="text-xs font-mono">{event}</span>
  <button onClick={unsubscribe}>
    <X className="h-3 w-3" />
  </button>
</div>
```

### EventLog Component

Reusable component for displaying event streams:

```tsx
<EventLog
  messages={messages}
  onClear={() => setMessages([])}
  maxHeight="max-h-64"
  showSearch={false}
  showStats={false}
/>
```

Features:
- Compact message display with `text-xs` typography
- Grayscale color scheme for minimal distraction
- Collapsible data payloads
- Clear timestamp and source indicators

## Color System

### Semantic Colors

We use semantic colors sparingly for important indicators:

| Color | Usage | Classes |
|-------|-------|---------|
| Primary | Interactive elements, active states | `text-primary`, `bg-primary` |
| Muted | Secondary text, borders | `text-muted-foreground`, `border-muted` |
| Success | Successful operations | `text-green-500`, `bg-green-500/10` |
| Warning | Warnings, cautions | `text-yellow-500`, `bg-yellow-500/10` |
| Error | Errors, destructive actions | `text-destructive`, `bg-destructive/10` |

### Event Category Colors

For event bus visualization:

```tsx
const categoryColors = {
  user: 'text-blue-500 bg-blue-500/10',
  theme: 'text-green-500 bg-green-500/10',
  data: 'text-orange-500 bg-orange-500/10',
  navigation: 'text-purple-500 bg-purple-500/10',
  modal: 'text-violet-500 bg-violet-500/10',
  notification: 'text-yellow-500 bg-yellow-500/10',
  settings: 'text-emerald-500 bg-emerald-500/10'
};
```

## Responsive Design

### Breakpoints

We follow Tailwind's default breakpoints:

| Breakpoint | Min Width | Usage |
|------------|-----------|-------|
| `sm` | 640px | Mobile landscape |
| `md` | 768px | Tablets |
| `lg` | 1024px | Desktop |
| `xl` | 1280px | Wide desktop |
| `2xl` | 1536px | Ultra-wide |

### Mobile Optimizations

1. **Collapsible Navigation** - Hamburger menu on mobile
2. **Stacked Layouts** - Single column on small screens
3. **Reduced Padding** - `px-4` on mobile, `px-6` on tablet+
4. **Hidden Elements** - Use `hidden sm:block` for non-essential items

## Animation and Transitions

### Subtle Animations

Use animations sparingly for important state changes:

```tsx
// Pulse for active indicators
<div className="animate-pulse" />

// Smooth transitions for hover states
<button className="transition-colors hover:bg-primary/90" />

// Scale on click
<button className="active:scale-[0.98]" />
```

### Performance Considerations

- Use `transition-colors` instead of `transition-all`
- Limit animations to 300ms or less
- Avoid animating layout properties (width, height)
- Use `transform` and `opacity` for smooth animations

## Best Practices

### Do's

✅ Use consistent spacing throughout the application
✅ Maintain clear visual hierarchy with typography
✅ Test on multiple screen sizes
✅ Use semantic HTML elements
✅ Provide keyboard navigation support
✅ Include ARIA labels for accessibility

### Don'ts

❌ Don't use more than 3 font sizes per component
❌ Don't mix spacing scales (stick to the system)
❌ Don't use inline styles (use Tailwind classes)
❌ Don't animate multiple properties simultaneously
❌ Don't use absolute positioning unless necessary
❌ Don't forget hover and focus states

## Component Library

### Design System Components

Located in `packages/design-system/src/components/`:

- **Card** - Container with header and content sections
- **InfoBlock** - Information display component
- **Section** - Page section wrapper
- **Grid** - Responsive grid layouts
- **EventLog** - Event stream display component

### UI Components

Located in `apps/container-react/src/components/ui/`:

- **Button** - Interactive button component
- **Badge** - Status and count indicators
- **Toast** - Notification messages
- **Dialog** - Modal dialogs
- **Alert** - Alert messages

## Implementation Examples

### Compact Form Layout

```tsx
<div className="space-y-3">
  <div>
    <label className="text-xs font-medium text-muted-foreground">
      EVENT NAME
    </label>
    <input
      type="text"
      className="w-full px-2 py-1 text-xs border rounded"
      placeholder="Enter event name"
    />
  </div>
  <button className="px-3 py-1.5 text-xs bg-primary text-white rounded">
    Submit
  </button>
</div>
```

### Status Indicators

```tsx
<div className="flex items-center gap-2">
  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
  <span className="text-xs text-muted-foreground">Active</span>
</div>
```

### Data Table

```tsx
<table className="w-full text-xs">
  <thead>
    <tr className="border-b">
      <th className="text-left py-1 font-medium">Name</th>
      <th className="text-left py-1 font-medium">Status</th>
    </tr>
  </thead>
  <tbody>
    <tr className="border-b">
      <td className="py-1">Service A</td>
      <td className="py-1">
        <Badge variant="success" className="text-[10px]">Active</Badge>
      </td>
    </tr>
  </tbody>
</table>
```

## Future Enhancements

- [ ] Dark mode optimization
- [ ] Accessibility audit and improvements
- [ ] Performance monitoring dashboard
- [ ] Advanced data visualization components
- [ ] Micro-interaction library
- [ ] Design token system

## Resources

- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [ShadCN UI Components](https://ui.shadcn.com)
- [React Aria](https://react-spectrum.adobe.com/react-aria/)
- [Web Content Accessibility Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)