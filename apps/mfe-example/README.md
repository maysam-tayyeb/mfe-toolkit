# Example MFE

This is an example microfrontend (MFE) that demonstrates how to build and deploy MFEs in the monorepo.

## Development

```bash
# Run in development mode (Vite dev server on port 3001)
pnpm dev
```

During development, the MFE runs on Vite's dev server with hot module replacement for a great developer experience.

## Production Build

```bash
# Build the MFE as an ES module bundle
pnpm build
```

This creates a production-ready ES module bundle in the `dist/` directory:

- `mfe-example.js` - The main MFE bundle (23.7KB with externalized dependencies)
- `style.css` - Any extracted styles (if applicable)

## Production Deployment

### Important: MFEs should NOT use Vite in production!

In production, MFEs should be served as static files from a web server. Here are deployment options:

### Option 1: Simple HTTP Server (for testing)

```bash
# Serve the built files on port 8080
pnpm serve:static
```

### Option 2: CDN Deployment

Upload the contents of `dist/` to your CDN:

- AWS S3 + CloudFront
- Cloudflare Pages
- Netlify
- Vercel (static hosting)

The MFE uses externalized dependencies via import map, so ensure the container's import map is available.

## Updating the Container's MFE Registry

After deploying your MFE, update the container app's MFE registry to point to the production URL:

```typescript
// In container app's MFE registry
{
  name: 'example',
  version: '1.0.0',
  url: 'https://mfe.example.com/mfe-example.js', // Production URL
  // url: 'http://localhost:3001/src/main.tsx', // Development URL
}
```

## Testing Production Build Locally

1. Build the MFE: `pnpm build`
2. Serve it statically: `pnpm serve:static`
3. Update the container's registry to point to `http://localhost:8080/mfe-example.js`
4. Start the container app and test the integration
