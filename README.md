# AJAX Panel for Grafana (fork by run-as-daemon.ru)

Production-ready Grafana panel plugin for loading external content via AJAX (GET/POST) or iframe into your dashboards.

[English] | [Русский](README.ru.md)

## Overview

The AJAX Panel plugin provides a flexible way to load and display external content directly in Grafana dashboards. Whether you need to integrate third-party APIs, embed status pages, or display custom HTML/JSON responses, this plugin makes it possible without leaving your monitoring environment.

Typical use cases include:

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

## Installation

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

## Fork Maintainer

This fork is maintained by **Ranas Mukminov** for internal and client projects. Ranas specializes in monitoring infrastructure setup and optimization, including Grafana, Zabbix, and Prometheus implementations. For professional services or custom plugin development, visit [run-as-daemon.ru](https://run-as-daemon.ru).

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
