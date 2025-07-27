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
# Build the MFE as a UMD bundle
pnpm build
```

This creates a production-ready UMD bundle in the `dist/` directory:
- `mfe-example.umd.js` - The main MFE bundle
- `style.css` - Any extracted styles (if applicable)

## Production Deployment

### Important: MFEs should NOT use Vite in production!

In production, MFEs should be served as static files from a web server. Here are several deployment options:

### Option 1: Simple HTTP Server (for testing)
```bash
# Serve the built files on port 8080
pnpm serve:static
```

### Option 2: Nginx Configuration
```nginx
server {
    listen 80;
    server_name mfe.example.com;
    
    location / {
        root /var/www/mfe-example/dist;
        add_header Access-Control-Allow-Origin *;
        add_header Cache-Control "public, max-age=3600";
    }
}
```

### Option 3: CDN Deployment
Upload the contents of `dist/` to your CDN:
- AWS S3 + CloudFront
- Cloudflare Pages
- Netlify
- Vercel (static hosting)

### Option 4: Docker + Nginx
```dockerfile
FROM nginx:alpine
COPY dist/ /usr/share/nginx/html/
COPY nginx.conf /etc/nginx/conf.d/default.conf
```

## Updating the Container's MFE Registry

After deploying your MFE, update the container app's MFE registry to point to the production URL:

```typescript
// In container app's MFE registry
{
  name: 'example',
  version: '1.0.0',
  url: 'https://mfe.example.com/mfe-example.umd.js', // Production URL
  // url: 'http://localhost:3001/src/main.tsx', // Development URL
}
```

## Testing Production Build Locally

1. Build the MFE: `pnpm build`
2. Serve it statically: `pnpm serve:static`
3. Update the container's registry to point to `http://localhost:8080/mfe-example.umd.js`
4. Start the container app and test the integration