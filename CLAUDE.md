# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

This repository contains example UI components (widgets) for the Apps SDK and MCP servers that expose these components as tools. The widgets are React components bundled into standalone HTML/JS/CSS assets that can be served and rendered in ChatGPT.

## Build & Development Commands

**Install dependencies:**
```bash
pnpm install
pre-commit install
```

**Build all widget bundles:**
```bash
pnpm run build
```
This runs `build-all.mts` which produces versioned `.html`, `.js`, and `.css` files in `assets/`. Each widget is self-contained with its CSS.

**Development mode (Vite dev server):**
```bash
pnpm run dev
```

**Serve static assets (required for MCP servers):**
```bash
pnpm run serve
```
Serves assets at `http://localhost:4444` with CORS enabled. **Must be running** before launching any MCP server.

**Type checking:**
```bash
pnpm run tsc          # Check all
pnpm run tsc:app      # Check src/ only
pnpm run tsc:node     # Check build scripts only
```

## MCP Server Commands

### Pizzaz Node Server
```bash
cd pizzaz_server_node
pnpm start
```

### Python Servers (Pizzaz or Solar System)
```bash
# Create venv once (reusable for all Python servers)
python -m venv .venv
source .venv/bin/activate

# Install dependencies (one-time per server)
pip install -r pizzaz_server_python/requirements.txt
pip install -r solar-system_server_python/requirements.txt

# Run Pizzaz server
uvicorn pizzaz_server_python.main:app --port 8000

# OR run Solar System server
uvicorn solar-system_server_python.main:app --port 8000
```

## Architecture

### Widget Build System

The build system (`build-all.mts`) discovers all `src/**/index.{tsx,jsx}` entry points and bundles each into a standalone widget:

1. **Widget discovery**: Scans `src/` for entry points (e.g., `src/pizzaz/index.jsx`, `src/solar-system/index.tsx`)
2. **CSS bundling**: Each widget includes global CSS (`src/index.css`) + per-widget CSS found via glob
3. **Hashing**: Assets are versioned with a 4-char hash derived from `package.json` version
4. **HTML generation**: Creates `{widget}-{hash}.html` and `{widget}.html` files that load the JS/CSS

The build process uses Vite with React, Tailwind, and inlines all chunks (no code splitting).

### MCP Server Integration

MCP servers expose tools that return widget HTML via the `_meta.openai/outputTemplate` metadata field:

- **Node server** (`pizzaz_server_node/`): Uses `@modelcontextprotocol/sdk` TypeScript SDK, SSE transport over HTTP
- **Python servers**: Use `mcp[fastapi]` with FastAPI and Uvicorn, SSE transport

**Key pattern**: Tool handlers read widget HTML from `assets/` and return it in the response metadata alongside structured content that the widget can consume.

### Widget Structure

Each widget is a React component in `src/{widget-name}/`:
- `index.jsx/tsx` - Entry point (exported as `App` or default export)
- Component-specific files (e.g., `Sidebar.jsx`, `Inspector.jsx`)
- Optional CSS files (bundled automatically)

**Shared utilities** in `src/`:
- `types.ts` - Shared TypeScript types
- `use-widget-props.ts` - Hook for accessing widget props
- `use-widget-state.ts` - Hook for widget state management
- `use-openai-global.ts` - Hook for OpenAI global context
- `use-display-mode.ts`, `use-max-height.ts` - Display utilities
- `media-queries.ts` - Media query helpers

### Python Server Implementation Pattern

Python servers use `functools.lru_cache` to cache widget HTML. **Important**: If you rebuild widgets or modify files in `assets/`, you must restart the Python MCP server to pick up changes.

### BASE_URL Configuration

The build script generates HTML with asset URLs. By default uses `http://localhost:4444`. For deployment, set:
```bash
BASE_URL=https://your-server.com pnpm run build
```

## Testing the MCP Servers

### Using MCP Inspector (Local Testing)

The MCP Inspector works with these HTTP/SSE-based servers using the SSE transport option:

```bash
# First, start the static asset server
pnpm run serve

# In another terminal, start the MCP server you want to test
cd pizzaz_server_node && pnpm start
# OR: uvicorn pizzaz_server_python.main:app --port 8000
# OR: uvicorn solar-system_server_python.main:app --port 8000

# In a third terminal, launch the inspector connected to the server
npx @modelcontextprotocol/inspector --transport sse --server-url http://localhost:8000/mcp
```

The inspector will open in your browser where you can:
- Browse available tools in the **Tools** tab
- Test tool calls with custom arguments
- View widget HTML responses and metadata
- Monitor server logs in the **Notifications** pane

### Testing in ChatGPT (Primary Method)

1. Ensure the static asset server is running: `pnpm run serve`
2. Start the MCP server you want to test (Node or Python)
3. Enable [developer mode](https://platform.openai.com/docs/guides/developer-mode)
4. Expose your local server via ngrok: `ngrok http 8000`
5. In ChatGPT:
   - Go to Settings > Connectors
   - Add connector using URL: `https://<your-ngrok-url>.ngrok-free.app/mcp`
   - Add the connector to conversation context via "More" options
6. Invoke tools by asking related questions:
   - Pizzaz: "Show me some pizzas" or "Open the pizza shop"
   - Solar System: "Show me the solar system"

### Available Tools

**Pizzaz Server** (Node or Python):
- `pizza-map` - Interactive pizza location map
- `pizza-carousel` - Carousel of pizza options
- `pizza-albums` - Album view of pizzas
- `pizza-list` - List view of pizzas
- `pizza-shop` - E-commerce pizza shop interface

**Solar System Server** (Python):
- `show-solar-system` - Interactive 3D solar system visualization

## Chrome 142+ Local Network Access

If widgets don't render on Chrome 142+, disable the local network access flag:
1. Go to `chrome://flags/`
2. Find `#local-network-access-check`
3. Set to Disabled

## Package Manager

This project uses `pnpm` (specified in `packageManager` field). The workspace includes the root project and `pizzaz_server_node/` subproject.
