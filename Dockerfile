# ===================================
# Stage 1: Build the plugin
# ===================================
FROM node:20-alpine AS builder

WORKDIR /build

# Copy package files first for better layer caching
COPY package.json yarn.lock ./

# Install dependencies
RUN yarn config set strict-ssl false && \
    yarn install --frozen-lockfile --network-timeout 100000

# Copy source code and metadata files
COPY src/ ./src/
COPY static/ ./static/
COPY tsconfig.json .prettierrc.js jest.config.js ./
COPY README.md LICENSE CHANGELOG.md ./

# Build the plugin
# Note: Need --openssl-legacy-provider for Node 20 compatibility with older webpack
RUN NODE_OPTIONS=--openssl-legacy-provider yarn build

# ===================================
# Stage 2: Grafana runtime
# ===================================
FROM grafana/grafana:10.4.0

# Switch to root to install plugin
USER root

# Create plugin directory and copy built plugin from builder stage
RUN mkdir -p /var/lib/grafana/plugins/ryantxu-ajax-panel
COPY --from=builder /build/dist/ /var/lib/grafana/plugins/ryantxu-ajax-panel/

# Set proper permissions (grafana user is uid 472)
RUN chown -R 472:0 /var/lib/grafana/plugins/ryantxu-ajax-panel

# Switch back to grafana user
USER 472

# Set environment variables for Grafana configuration
ENV GF_SECURITY_ADMIN_USER=admin
ENV GF_SECURITY_ADMIN_PASSWORD=admin
ENV GF_PATHS_PLUGINS=/var/lib/grafana/plugins
ENV GF_PLUGINS_ALLOW_LOADING_UNSIGNED_PLUGINS=ryantxu-ajax-panel

# Expose Grafana port
EXPOSE 3000

# Use default Grafana entrypoint
# No custom ENTRYPOINT needed
