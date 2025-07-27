# Build stage
FROM node:18-alpine as builder

WORKDIR /app

# Copy workspace files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages ./packages
COPY apps/mfe-example ./apps/mfe-example

# Install pnpm
RUN npm install -g pnpm

# Install dependencies
RUN pnpm install --frozen-lockfile

# Build the MFE
WORKDIR /app/apps/mfe-example
RUN pnpm build

# Production stage
FROM nginx:alpine

# Copy built files
COPY --from=builder /app/apps/mfe-example/dist /usr/share/nginx/html

# Copy nginx configuration
COPY apps/mfe-example/nginx.conf /etc/nginx/conf.d/default.conf

# Remove default nginx config
RUN rm /etc/nginx/conf.d/default.conf || true

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]