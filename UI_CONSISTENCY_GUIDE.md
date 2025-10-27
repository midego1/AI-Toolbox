# UI Consistency Guide

## Overview

This guide ensures UI consistency across the entire AI Toolbox platform. All pages and components should follow these guidelines to provide a cohesive user experience.

## Component Standards

### Tabs Component

**Always use the platform Tabs component for tabbed interfaces.**

**Location**: `src/components/ui/tabs.tsx`

**Usage:**
```tsx
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

<Tabs defaultValue="overview" className="space-y-6">
  <TabsList>
    <TabsTrigger value="overview">Overview</TabsTrigger>
    <TabsTrigger value="activity">Activity</TabsTrigger>
    <TabsTrigger value="analytics">Analytics</TabsTrigger>
  </TabsList>

  <TabsContent value="overview">
    {/* Overview content */}
  </TabsContent>
  
  <TabsContent value="activity">
    {/* Activity content */}
  </TabsContent>
  
  <TabsContent value="analytics">
    {/* Analytics content */}
  </TabsContent>
</Tabs>
```

**With Icons:**
```tsx
<TabsList>
  <TabsTrigger value="overview" className="flex items-center space-x-2">
    <BarChart3 className="h-4 w-4" />
    <span>Overview</span>
  </TabsTrigger>
  <TabsTrigger value="users" className="flex items-center space-x-2">
    <Users className="h-4 w-4" />
    <span>Users</span>
  </TabsTrigger>
</TabsList>
```

**❌ Don't do this:**
```tsx
// Don't create custom tab navigation with buttons
{tabs.map((tab) => (
  <Button
    variant={activeTab === tab.id ? "default" : "outline"}
    onClick={() => setActiveTab(tab.id)}
  >
    {tab.label}
  </Button>
))}
```

**✅ Do this:**
```tsx
// Use the Tabs component
<Tabs defaultValue="overview">
  <TabsList>
    <TabsTrigger value="overview">Overview</TabsTrigger>
    <TabsTrigger value="activity">Activity</TabsTrigger>
  </TabsList>
  <TabsContent value="overview">...</TabsContent>
  <TabsContent value="activity">...</TabsContent>
</Tabs>
```

### Cards Component

**Always use Card components for content sections.**

```tsx
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
    <CardDescription>Description</CardDescription>
  </CardHeader>
  <CardContent>
    {/* Content */}
  </CardContent>
</Card>
```

### Buttons

**Use consistent button variants:**

```tsx
import { Button } from "@/components/ui/button";

// Primary action
<Button>Primary</Button>

// Secondary action
<Button variant="outline">Secondary</Button>

// Destructive action
<Button variant="destructive">Delete</Button>

// Ghost/minimal
<Button variant="ghost">Ghost</Button>

// With icon
<Button>
  <Icon className="h-4 w-4 mr-2" />
  Label
</Button>
```

### Badges

**Use badges for status and labels:**

```tsx
import { Badge } from "@/components/ui/badge";

<Badge>Default</Badge>
<Badge variant="secondary">Secondary</Badge>
<Badge variant="outline">Outline</Badge>
<Badge variant="destructive">Error</Badge>
```

### Input Fields

**Use consistent form inputs:**

```tsx
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

<div className="space-y-2">
  <Label htmlFor="email">Email</Label>
  <Input
    id="email"
    type="email"
    placeholder="you@example.com"
    value={email}
    onChange={(e) => setEmail(e.target.value)}
  />
</div>
```

## Layout Standards

### Page Header

**Consistent page header pattern:**

```tsx
<div className="mb-6">
  <div className="flex items-center justify-between mb-2">
    <div className="flex items-center space-x-3">
      <Icon className="h-8 w-8 text-primary" />
      <h1 className="text-3xl font-bold tracking-tight">Page Title</h1>
    </div>
    {/* Optional: Status badge or action button */}
  </div>
  <p className="text-muted-foreground">
    Page description
  </p>
</div>
```

### Container

**Use consistent container pattern:**

```tsx
<div className="container mx-auto p-6 max-w-7xl">
  {/* Page content */}
</div>
```

**Responsive max-widths:**
- Dashboard: `max-w-7xl`
- Settings: `max-w-4xl`
- Forms: `max-w-2xl`
- Full-width: No max-width

### Spacing

**Consistent spacing classes:**

- Section spacing: `space-y-6`
- Card spacing: `space-y-4`
- Form spacing: `space-y-2`
- Inline spacing: `space-x-2`, `space-x-3`, `space-x-4`

### Grid Layouts

**Stats cards (4 columns):**
```tsx
<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
  <Card>...</Card>
  <Card>...</Card>
  <Card>...</Card>
  <Card>...</Card>
</div>
```

**Two column layout:**
```tsx
<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
  <div>...</div>
  <div>...</div>
</div>
```

**Three column layout:**
```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {items.map(item => <Card key={item.id}>...</Card>)}
</div>
```

## Color Standards

### Status Colors

```tsx
// Success/Completed
className="text-green-500"
variant="default"

// Error/Failed
className="text-red-500"
variant="destructive"

// Warning
className="text-orange-500"
variant="secondary"

// Info/Processing
className="text-blue-500"

// Neutral
className="text-muted-foreground"
variant="outline"
```

### Admin-specific

```tsx
// Admin elements use red
className="text-red-500"
className="text-red-600"
className="bg-red-500"
```

## Icon Standards

### Import

```tsx
import { IconName } from "lucide-react";
```

### Sizes

```tsx
// Small icon (in buttons, badges)
<Icon className="h-4 w-4" />

// Medium icon (section headers)
<Icon className="h-5 w-5" />

// Large icon (page headers)
<Icon className="h-8 w-8" />

// Extra large icon (empty states)
<Icon className="h-12 w-12" />
```

### With Text

```tsx
<div className="flex items-center space-x-2">
  <Icon className="h-4 w-4" />
  <span>Label</span>
</div>
```

## Loading States

### Spinner

```tsx
import { Loader2 } from "lucide-react";

<div className="flex items-center justify-center py-8">
  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
</div>
```

### Inline Loading

```tsx
{isLoading ? (
  <div className="flex items-center space-x-2">
    <Loader2 className="h-4 w-4 animate-spin" />
    <span className="text-sm text-muted-foreground">Loading...</span>
  </div>
) : (
  <div>{content}</div>
)}
```

## Empty States

**Consistent empty state pattern:**

```tsx
<div className="text-center py-12 text-muted-foreground">
  <Icon className="h-12 w-12 mx-auto mb-3 opacity-50" />
  <p className="text-sm font-medium">No items yet</p>
  <p className="text-xs mt-1">Get started by creating your first item</p>
  <Button variant="outline" size="sm" className="mt-4">
    Create Item
  </Button>
</div>
```

## Error States

**Error display:**

```tsx
{error && (
  <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md">
    {error}
  </div>
)}
```

## Responsive Design

### Hide on Mobile

```tsx
className="hidden lg:block"  // Hide on mobile, show on desktop
className="lg:hidden"         // Show on mobile, hide on desktop
```

### Responsive Grids

```tsx
// Stack on mobile, 2 cols on tablet, 3 cols on desktop
className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
```

### Responsive Flex

```tsx
className="flex flex-col lg:flex-row"  // Stack on mobile, row on desktop
```

## Typography

### Headings

```tsx
<h1 className="text-3xl font-bold tracking-tight">Main Title</h1>
<h2 className="text-2xl font-bold">Section Title</h2>
<h3 className="text-xl font-semibold">Subsection</h3>
```

### Body Text

```tsx
<p className="text-sm">Normal text</p>
<p className="text-muted-foreground">Secondary text</p>
<p className="text-xs text-muted-foreground">Caption/meta text</p>
```

### Font Weights

- Normal: No class
- Medium: `font-medium`
- Semibold: `font-semibold`
- Bold: `font-bold`

## Animation

### Transitions

```tsx
className="transition-colors"     // For hover states
className="transition-all"        // For multiple properties
className="hover:bg-muted/50"     // Hover backgrounds
```

### Loading Spinner

```tsx
className="animate-spin"
```

## Platform-Wide Components

### Components to Use

✅ Always use these:
- `Tabs` from `@/components/ui/tabs`
- `Card` from `@/components/ui/card`
- `Button` from `@/components/ui/button`
- `Input` from `@/components/ui/input`
- `Label` from `@/components/ui/label`
- `Badge` from `@/components/ui/badge`
- Icons from `lucide-react`

❌ Don't create custom versions:
- Don't make custom tab navigation
- Don't make custom buttons
- Don't make custom input styles
- Don't use other icon libraries

## Pages Using Consistent Patterns

### Examples of Good Patterns

1. **Dashboard** (`/dashboard`)
   - Uses platform Tabs component
   - Consistent card layouts
   - Proper spacing and grid

2. **Admin Settings** (`/settings/admin`)
   - Uses same Tabs component as dashboard
   - Consistent header pattern
   - Matching spacing and styling

3. **Chat** (`/tools/chat`)
   - Consistent button styles
   - Standard card usage
   - Platform typography

### Before Adding New UI

**Checklist:**
- [ ] Check if component exists in `src/components/ui/`
- [ ] Use existing component instead of creating new
- [ ] Follow spacing standards
- [ ] Use color standards
- [ ] Match typography patterns
- [ ] Test responsive behavior
- [ ] Verify icon sizes

## When to Create New Components

Only create new components when:
1. Pattern will be reused 3+ times
2. Component doesn't exist in UI library
3. Significant unique functionality needed

**Process:**
1. Check shadcn/ui for existing component
2. Create in `src/components/ui/` if needed
3. Follow existing component patterns
4. Document in this guide

## Common Mistakes

### ❌ Mistake 1: Custom Tab Navigation
```tsx
// Wrong
const [activeTab, setActiveTab] = useState("overview");
<Button onClick={() => setActiveTab("overview")}>Overview</Button>
{activeTab === "overview" && <div>Content</div>}
```

### ✅ Solution 1: Use Tabs Component
```tsx
// Right
<Tabs defaultValue="overview">
  <TabsList>
    <TabsTrigger value="overview">Overview</TabsTrigger>
  </TabsList>
  <TabsContent value="overview">Content</TabsContent>
</Tabs>
```

### ❌ Mistake 2: Inconsistent Spacing
```tsx
// Wrong - mixing spacing units
<div className="space-y-3">
  <div className="mb-5">...</div>
  <div className="mt-4">...</div>
</div>
```

### ✅ Solution 2: Consistent Spacing
```tsx
// Right - consistent spacing
<div className="space-y-6">
  <div>...</div>
  <div>...</div>
</div>
```

### ❌ Mistake 3: Custom Button Styles
```tsx
// Wrong
<button className="bg-blue-500 text-white px-4 py-2 rounded">
  Click me
</button>
```

### ✅ Solution 3: Use Button Component
```tsx
// Right
<Button>Click me</Button>
```

## Resources

- **shadcn/ui Docs**: https://ui.shadcn.com
- **Tailwind CSS**: https://tailwindcss.com
- **Lucide Icons**: https://lucide.dev
- **Component Source**: `src/components/ui/`

## Questions?

When in doubt:
1. Check existing pages for patterns
2. Look in `src/components/ui/`
3. Refer to Dashboard or Admin Settings for examples
4. Follow this guide

---

**Last Updated**: October 26, 2025  
**Version**: 1.0.0

Remember: **Consistency is key** to a professional, maintainable UI. 🎨


