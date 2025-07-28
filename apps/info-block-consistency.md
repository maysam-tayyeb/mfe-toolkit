# MFE Info Block Consistency

## Changes Made

To ensure the info blocks render identically across both MFEs:

1. **Created an inline `InfoBlock` component** in both MFEs with identical implementation
2. **Standardized the structure** with:
   - Same CSS classes: `bg-muted/50 rounded-lg p-6`
   - Same grid layout: `grid grid-cols-1 md:grid-cols-3 gap-4 text-sm`
   - Same text styling: `text-muted-foreground` for labels, `font-medium` for values
   - Support for highlighted values with `text-primary` class

3. **Updated both MFEs** to display:
   - **MFE Configuration** section with name, version, port, format, bundle size, and specific details
   - **Shared Dependencies** section with consistent formatting

## Info Block Component

```typescript
interface InfoBlockProps {
  title: string;
  sections: Array<{
    label: string;
    value: string | React.ReactNode;
    highlight?: boolean;
  }>;
  className?: string;
}

const InfoBlock: React.FC<InfoBlockProps> = ({ title, sections, className = '' }) => (
  <div className={`bg-muted/50 rounded-lg p-6 ${className}`}>
    <h3 className="font-semibold mb-3">{title}</h3>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
      {sections.map((section, index) => (
        <div key={index}>
          <span className="text-muted-foreground">{section.label}:</span>
          <p className={`font-medium ${section.highlight ? 'text-primary' : ''}`}>
            {section.value}
          </p>
        </div>
      ))}
    </div>
  </div>
);
```

## Result

Both MFEs now display their information in identical layouts with:
- Consistent visual styling
- Same grid structure
- Highlighted important values (bundle size, format, etc.)
- Responsive design that works on all screen sizes