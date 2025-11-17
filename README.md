# AJAX Panel Plugin for Grafana (run-as-daemon fork)

**Production-ready Grafana panel plugin with Docker support** — Load external HTTP content (GET/POST/iframe) directly into your Grafana dashboards.

[English] | [Русский](README.ru.md)

## What is This?

The AJAX Panel plugin provides a flexible way to load and display external content directly in Grafana dashboards. Whether you need to integrate third-party APIs, embed status pages, or display custom HTML/JSON responses, this plugin makes it possible without leaving your monitoring environment.

**This repository includes a production-ready Docker setup** that provides a complete Grafana instance with the AJAX Panel plugin pre-installed and configured.

### Typical Use Cases

- Embedding external status pages or monitoring dashboards
- Calling REST APIs and displaying the response in various formats
- Displaying JSON, HTML, or text from internal services
- Creating simple control panels or custom widgets within Grafana dashboards
- Loading dynamic images or webcam feeds
- Integrating custom authentication-protected endpoints

## Key Features

- **Multiple HTTP methods**: Supports GET, POST, and iframe embedding
- **Grafana variable integration**: Use template variables (`$__from`, `$__to`, `$__interval`, and custom variables) in URLs and parameters
- **Flexible display modes**: Render content as HTML, plain text, JSON tree, preformatted text, images, or Angular templates
- **Configurable headers**: Set custom HTTP headers and authentication
- **Parameter scripting**: JavaScript object for parameters with access to `ctrl` object and dashboard context
- **Loading indicators**: Built-in spinner and improved error handling
- **Data source integration**: Can utilize Grafana data source configurations for authentication
- **TypeScript implementation**: Modern, type-safe codebase

## How It Works

The AJAX Panel operates as follows:

1. Configure the panel with a target URL, HTTP method, and optional parameters
2. When the dashboard refreshes or the time range changes, the panel issues a request
3. The response is processed according to the selected display mode
4. Template variables and dashboard context (time range, interval) are automatically available for use in requests
5. The rendered content updates dynamically within the panel

## Production Docker Image (Quick Start)

This repository includes a **multi-stage Dockerfile** that builds a complete Grafana image with the AJAX Panel plugin pre-installed. This is the recommended way to run the plugin in production or development environments.

### Prerequisites

- Docker (20.10+)
- Docker Compose (2.0+)

### Quick Start with Docker Compose

1. Clone this repository:
   ```bash
   git clone https://github.com/ranas-mukminov/ajax-panel.git
   cd ajax-panel
   ```

2. Start the services:
   ```bash
   docker compose up -d
   ```

3. Open your browser and navigate to `http://localhost:3000`

4. Log in with default credentials:
   - **Username**: `admin`
   - **Password**: `admin`

5. Create a new dashboard and add an **AJAX** panel

6. Try the demo backend endpoints:
   - Text response: `http://ajax-demo-backend:8080/api/demo/text`
   - JSON response: `http://ajax-demo-backend:8080/api/demo/json`

The setup includes:
- **grafana-ajax**: Grafana 10.4.0 with AJAX Panel plugin pre-installed
- **ajax-demo-backend**: A simple demo HTTP server for testing the panel

### Manual Docker Build and Run

Build the image:
```bash
docker build -t ajax-panel-grafana .
```

Run the container:
```bash
docker run -d \
  -p 3000:3000 \
  -e GF_SECURITY_ADMIN_PASSWORD=admin \
  --name grafana-ajax \
  ajax-panel-grafana
```

### Using Pre-built Images from GitHub Container Registry

Images are automatically built and published on every release:

```bash
docker pull ghcr.io/ranas-mukminov/ajax-panel:latest
docker run -d -p 3000:3000 ghcr.io/ranas-mukminov/ajax-panel:latest
```

### Demo Backend

The `ajax-demo-backend` service is an optional demonstration server that provides sample endpoints for testing the AJAX panel:

**Available endpoints:**
- `http://ajax-demo-backend:8080/api/demo/text` — Returns plain text with server time
- `http://ajax-demo-backend:8080/api/demo/json` — Returns JSON with timestamp and random data
- `http://ajax-demo-backend:8080/health` — Health check endpoint

**Note**: When running outside Docker Compose, use `http://localhost:8080/...` instead.

## Traditional Installation (Without Docker)

### Option 1: Install from Plugin Directory

1. Download or clone this repository
2. Copy the plugin folder to your Grafana plugins directory:
   ```bash
   cp -r ajax-panel /var/lib/grafana/plugins/
   ```
3. If the plugin is unsigned, enable it in `grafana.ini`:
   ```ini
   [plugins]
   allow_loading_unsigned_plugins = ryantxu-ajax-panel
   ```
4. Restart Grafana:
   ```bash
   systemctl restart grafana-server
   ```

> **NOTE**: Adjust the plugin directory path (e.g., `/var/lib/grafana/plugins`) and configuration according to your Grafana installation.

### Option 2: Build from Source

1. Install dependencies:
   ```bash
   yarn install
   ```
2. Build the plugin:
   ```bash
   yarn build
   ```
3. Copy the `dist` directory to your Grafana plugins folder:
   ```bash
   cp -r dist /var/lib/grafana/plugins/ryantxu-ajax-panel
   ```
4. Enable unsigned plugins (if needed) and restart Grafana as described above

## Configuration

### Basic Setup

1. Open a dashboard in Grafana
2. Add a new panel
3. Select **AJAX** as the visualization type
4. Configure the panel options

### Panel Options

#### Method

Choose the request method:

- **GET**: Standard HTTP GET request (default)
- **POST**: HTTP POST request with parameters sent in the body
- **iframe**: Embed content in an iframe

#### URL

The target endpoint to request. Supports Grafana template variables:

- `$__from` - Dashboard time range start (Unix timestamp in milliseconds)
- `$__to` - Dashboard time range end
- `$__interval` - Current auto-interval
- `$__interval_ms` - Current auto-interval in milliseconds
- Any custom dashboard variables

Example:
```
https://api.example.com/status?from=$__from&to=$__to
```

#### Parameters

A JavaScript object that defines query parameters (for GET) or the request body (for POST). You have access to:

- `ctrl` - The panel controller object
- `ctrl.range.from` / `ctrl.range.to` - Time range objects
- `ctrl.height` - Panel height
- Template variables via `ctrl.template('$variable')`

Example:
```javascript
{
  from: ctrl.range.from.format('x'),
  to: ctrl.range.to.format('x'),
  interval: ctrl.template('$__interval'),
  custom_var: ctrl.template('$my_variable')
}
```

#### Headers

Custom HTTP headers as a JavaScript object. Useful for authentication:

```javascript
{
  'Authorization': 'Bearer YOUR_TOKEN',
  'Accept': 'application/json'
}
```

#### Display Mode

Choose how to render the response:

- **HTML**: Render as HTML (unsafe content will be sanitized)
- **Text**: Display as escaped plain text
- **JSON**: Pretty-print JSON with collapsible tree view
- **Pre**: Display in preformatted text block
- **Image**: Display as an image (for binary image responses)
- **Template**: Use Angular template to format the response

### Examples

#### Example 1: Simple GET Request

**URL**: `https://httpbin.org/anything?interval=$__interval`  
**Method**: GET  
**Parameters**:
```javascript
{
  from: ctrl.range.from.format('x'),
  to: ctrl.range.to.format('x')
}
```
**Display Mode**: JSON

#### Example 2: Embed Status Page in iframe

**URL**: `https://status.example.com`  
**Method**: iframe  
**Parameters**: `{}`

## Security Notes

When using the AJAX Panel, keep these security considerations in mind:

- **Untrusted content**: Be cautious loading external HTML or JavaScript. Malicious content can execute in the context of your Grafana instance (XSS attacks)
- **CORS restrictions**: Cross-origin requests may be blocked by browsers. Ensure target endpoints have appropriate CORS headers, or proxy requests through Grafana data sources
- **Authentication**: Avoid embedding API keys or secrets directly in panel configuration. Use Grafana data sources with authentication when possible
- **HTTPS**: Use HTTPS endpoints to prevent mixed content warnings and ensure data security
- **Internal endpoints**: Prefer loading content from trusted, internal services rather than arbitrary external URLs
- **Credentials exposure**: Panel configuration is visible to users with dashboard edit permissions

## Compatibility

This plugin is based on the original `ryantxu/ajax-panel` and has been used with multiple versions of Grafana over time. The codebase targets Grafana 7.4+ APIs.

> **Compatibility may vary across Grafana versions. Please test in your environment before using in production.**

If you encounter issues with specific Grafana versions, please report them in the repository issues.

## Fork Maintainer & Professional Services

This fork is maintained by **Ranas Mukminov** and the **run-as-daemon** team.

### About run-as-daemon

**run-as-daemon** ([https://run-as-daemon.ru](https://run-as-daemon.ru)) is a professional SRE and DevOps consultancy specializing in production monitoring infrastructure, containerization, and operational excellence.

### Professional Services We Offer

Our team provides enterprise-grade services for organizations seeking reliable monitoring and infrastructure solutions:

1. **Grafana Monitoring Stack Design & Deployment**
   - Custom dashboard development and plugin integration
   - Multi-tenant Grafana setups with authentication/authorization
   - High-availability Grafana clusters
   - Grafana Cloud migration and optimization

2. **Custom Plugin Development & Integration**
   - Bespoke Grafana panel, data source, and app plugins
   - Plugin maintenance, updates, and security hardening
   - Integration with proprietary APIs and internal systems
   - Performance optimization for high-load scenarios

3. **Docker & Kubernetes Infrastructure**
   - Container orchestration for monitoring stacks
   - CI/CD pipelines for infrastructure as code
   - Security hardening and compliance (CIS benchmarks)
   - Resource optimization and cost reduction

4. **SRE Practices & Operational Excellence**
   - SLI/SLO/SLA definition and implementation
   - Alerting strategy design and alert fatigue reduction
   - Incident response procedures and runbooks
   - On-call rotation setup and training
   - Observability best practices (logs, metrics, traces)

5. **Monitoring Integration & Migration**
   - Prometheus, Zabbix, InfluxDB, and other data source integrations
   - Legacy monitoring system migrations
   - Multi-cloud and hybrid infrastructure monitoring
   - Cost-effective monitoring architecture

**Contact us**: [https://run-as-daemon.ru](https://run-as-daemon.ru)

---

## Development

### Prerequisites

- Node.js (v14 or later recommended)
- Yarn package manager

### Development Workflow

1. Install dependencies:
   ```bash
   yarn install
   ```

2. Start development mode with live reload:
   ```bash
   yarn dev
   ```
   or
   ```bash
   yarn watch
   ```

3. Build for production:
   ```bash
   yarn build
   ```

4. Run tests:
   ```bash
   yarn test
   ```

The plugin source code is in the `src/` directory, and the build output goes to `dist/`.

## License

This project is licensed under the **MIT License**.

Original author: **Ryan McKinley** ([ryantxu/ajax-panel](https://github.com/ryantxu/ajax-panel))  
Fork maintainer: **Ranas Mukminov** ([ranas-mukminov/ajax-panel](https://github.com/ranas-mukminov/ajax-panel))

See the [LICENSE](LICENSE) file for details.

## Support & Contributions

### Supporting This Project

If you find this plugin useful:
- ⭐ **Star this repository** on GitHub
- 🔄 **Share it** with your team and network
- 🐛 **Report issues** or **submit pull requests**
- 💰 Consider supporting via [GitHub Sponsors](https://github.com/sponsors/ranas-mukminov) (if available)

### Contributing

Contributions are welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Make your changes with tests
4. Submit a pull request

For major changes, please open an issue first to discuss your proposed changes.
