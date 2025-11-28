# MCP Inspector Tutorial: Testing the Pizzaz MCP Server

This tutorial walks you through using the MCP Inspector to test and debug the Pizzaz MCP server, which serves pizza-themed widgets for ChatGPT.

## Table of Contents

1. [What is MCP Inspector?](#what-is-mcp-inspector)
2. [Prerequisites](#prerequisites)
3. [Starting the Pizzaz Server](#starting-the-pizzaz-server)
4. [Launching MCP Inspector](#launching-mcp-inspector)
5. [Connecting to the Server](#connecting-to-the-server)
6. [Exploring the Tools Tab](#exploring-the-tools-tab)
7. [Testing a Tool](#testing-a-tool)
8. [Exploring the Resources Tab](#exploring-the-resources-tab)
9. [Viewing the Notifications Pane](#viewing-the-notifications-pane)
10. [Configuration Options](#configuration-options)
11. [Troubleshooting](#troubleshooting)

---

## What is MCP Inspector?

The **MCP Inspector** is an interactive developer tool for testing and debugging MCP (Model Context Protocol) servers. It provides a visual interface to:

- View available tools, resources, and prompts
- Execute tools with custom inputs
- Inspect resource content
- Monitor server logs and notifications
- Test different transport types (stdio, SSE, Streamable HTTP)

Think of it as a "Postman for MCP servers" - it lets you interact with your MCP server without needing to connect it to an LLM client like ChatGPT.

---

## Prerequisites

Before starting, ensure you have:

- **Node.js** (v18 or later)
- **pnpm** installed (`npm install -g pnpm`)
- The repository cloned and dependencies installed:
  ```bash
  cd openai-apps-sdk-examples
  pnpm install
  ```
- Widget assets built:
  ```bash
  pnpm build
  ```

---

## Starting the Pizzaz Server

The Pizzaz server is an MCP server that exposes pizza-themed widgets. Start it on port 8000:

```bash
cd pizzaz_server_node
pnpm start
```

You should see:
```
Pizzaz MCP server listening on http://localhost:8000
  SSE stream: GET http://localhost:8000/mcp
  Message post endpoint: POST http://localhost:8000/mcp/messages?sessionId=...
```

**Keep this terminal running** - you'll need it for the Inspector to connect.

---

## Launching MCP Inspector

Open a **new terminal** and launch the MCP Inspector:

```bash
npx @modelcontextprotocol/inspector --transport sse --server-url http://localhost:8000/mcp
```

### Command breakdown:
- `npx @modelcontextprotocol/inspector` - Runs the Inspector without installing it
- `--transport sse` - Use Server-Sent Events transport (required for HTTP-based servers)
- `--server-url http://localhost:8000/mcp` - The Pizzaz server's SSE endpoint

You'll see output like:
```
Starting MCP inspector...
⚙️ Proxy server listening on localhost:6277
🔑 Session token: abc123...

🚀 MCP Inspector is up and running at:
   http://localhost:6274/?MCP_PROXY_AUTH_TOKEN=abc123...

🌐 Opening browser...
```

The Inspector UI should open automatically in your browser at `http://localhost:6274`.

---

## Connecting to the Server

When the Inspector opens, you'll see the **Server Connection Pane** on the left:

### Step 1: Verify Transport Settings
- **Transport Type**: Should show `SSE`
- **URL**: Should show `http://localhost:8000/mcp`

### Step 2: Click "Connect"
Click the **Connect** button to establish a connection to the Pizzaz server.

### Step 3: Verify Connection
Once connected, you should see:
- A green "Connected" status indicator
- The server name "pizzaz-node" and version "0.1.0" displayed
- The tabs (Tools, Resources, Prompts) become active

---

## Exploring the Tools Tab

Click on the **Tools** tab to see all available tools exposed by the Pizzaz server.

### Available Tools

The Pizzaz server exposes **5 tools**:

| Tool Name | Description | Input Schema |
|-----------|-------------|--------------|
| `pizza-map` | Show Pizza Map | `{ pizzaTopping: string }` |
| `pizza-carousel` | Show Pizza Carousel | `{ pizzaTopping: string }` |
| `pizza-albums` | Show Pizza Album | `{ pizzaTopping: string }` |
| `pizza-list` | Show Pizza List | `{ pizzaTopping: string }` |
| `pizza-shop` | Open Pizzaz Shop | `{ pizzaTopping: string }` |

### What You'll See

For each tool, the Inspector displays:
- **Name**: The tool identifier (e.g., `pizza-map`)
- **Title**: Human-readable name (e.g., "Show Pizza Map")
- **Description**: What the tool does
- **Input Schema**: The JSON Schema defining required parameters
- **Annotations**: Hints like `readOnlyHint: true`
- **Metadata**: OpenAI-specific metadata for widget rendering

Click on any tool to expand its details.

---

## Testing a Tool

Let's test the `pizza-map` tool:

### Step 1: Select the Tool
Click on `pizza-map` in the Tools list.

### Step 2: Enter Input Parameters
In the input form, you'll see a field for `pizzaTopping` (required).

Enter a value:
```json
{
  "pizzaTopping": "pepperoni"
}
```

Or simply type `pepperoni` in the input field.

### Step 3: Click "Run Tool"
Click the **Run Tool** or **Execute** button.

### Step 4: View the Response

The response will appear in the results pane:

```json
{
  "content": [
    {
      "type": "text",
      "text": "Rendered a pizza map!"
    }
  ],
  "structuredContent": {
    "pizzaTopping": "pepperoni"
  },
  "_meta": {
    "openai/toolInvocation/invoking": "Hand-tossing a map",
    "openai/toolInvocation/invoked": "Served a fresh map"
  }
}
```

### Understanding the Response

- **content**: The text response the LLM sees
- **structuredContent**: Data passed to the widget for rendering
- **_meta**: OpenAI-specific metadata for UI states during tool invocation

---

## Exploring the Resources Tab

Click on the **Resources** tab to see resources exposed by the server.

### What are MCP Resources?

Resources are data/content the server exposes that can be read by clients. In the Pizzaz server, resources are the widget HTML templates.

### Available Resources

| Resource URI | Name | MIME Type |
|-------------|------|-----------|
| `ui://widget/pizza-map.html` | Show Pizza Map | `text/html+skybridge` |
| `ui://widget/pizza-carousel.html` | Show Pizza Carousel | `text/html+skybridge` |
| `ui://widget/pizza-albums.html` | Show Pizza Album | `text/html+skybridge` |
| `ui://widget/pizza-list.html` | Show Pizza List | `text/html+skybridge` |
| `ui://widget/pizza-shop.html` | Open Pizzaz Shop | `text/html+skybridge` |

### Reading a Resource

1. Click on a resource (e.g., `ui://widget/pizza-map.html`)
2. Click **Read Resource** or **Fetch**
3. View the HTML content in the response pane

The response contains the full widget HTML that ChatGPT would render.

---

## Viewing the Notifications Pane

The **Notifications** pane (often at the bottom or side) shows:

- Server logs
- Connection events
- Errors and warnings
- Real-time notifications from the server

### What to Look For

- **Connection established**: Confirms successful SSE connection
- **Request/Response logs**: Shows MCP protocol messages
- **Errors**: Any issues with tool execution or resource fetching

---

## Configuration Options

### Timeout Settings

Click the **Configuration** or **Settings** button to adjust:

| Setting | Default | Description |
|---------|---------|-------------|
| `MCP_SERVER_REQUEST_TIMEOUT` | 10000ms | Timeout for individual requests |
| `MCP_REQUEST_TIMEOUT_RESET_ON_PROGRESS` | true | Reset timeout on progress updates |
| `MCP_REQUEST_MAX_TOTAL_TIMEOUT` | 60000ms | Maximum total timeout |

### Using Configuration Files

For complex setups, create a `config.json`:

```json
{
  "mcpServers": {
    "pizzaz": {
      "transport": "sse",
      "url": "http://localhost:8000/mcp"
    },
    "solar-system": {
      "transport": "streamable-http",
      "url": "http://localhost:8001/mcp"
    }
  }
}
```

Launch with:
```bash
npx @modelcontextprotocol/inspector --config config.json
```

---

## Troubleshooting

### Connection Failed

**Symptom**: "Failed to connect" or timeout errors

**Solutions**:
1. Verify the Pizzaz server is running (`pnpm start`)
2. Check the URL is correct (`http://localhost:8000/mcp`)
3. Ensure transport type is `SSE` (not stdio)
4. Check for port conflicts (`lsof -i :8000`)

### "Premature Close" Errors

**Symptom**: SSE connection drops repeatedly

**Solutions**:
1. Restart both the server and Inspector
2. Check server logs for errors
3. Ensure only one Inspector instance is connected

### Tools Not Showing

**Symptom**: Tools tab is empty after connecting

**Solutions**:
1. Click **List Tools** or **Refresh**
2. Check the Notifications pane for errors
3. Verify server capabilities include `tools: {}`

### Widget Assets Not Found

**Symptom**: Server error about missing assets

**Solution**:
```bash
pnpm build
```
Then restart the server.

---

## Quick Reference

### Commands

```bash
# Start Pizzaz server
cd pizzaz_server_node && pnpm start

# Launch Inspector for Pizzaz (SSE)
npx @modelcontextprotocol/inspector --transport sse --server-url http://localhost:8000/mcp

# Launch Inspector for Python server (Streamable HTTP)
npx @modelcontextprotocol/inspector --transport streamable-http --server-url http://localhost:8002/mcp
```

### Pizzaz Tools

| Tool | Input | Response |
|------|-------|----------|
| `pizza-map` | `{ "pizzaTopping": "..." }` | Rendered a pizza map! |
| `pizza-carousel` | `{ "pizzaTopping": "..." }` | Rendered a pizza carousel! |
| `pizza-albums` | `{ "pizzaTopping": "..." }` | Rendered a pizza album! |
| `pizza-list` | `{ "pizzaTopping": "..." }` | Rendered a pizza list! |
| `pizza-shop` | `{ "pizzaTopping": "..." }` | Rendered the Pizzaz shop! |

### Keyboard Shortcuts (if available)

- `Ctrl/Cmd + Enter` - Execute selected tool
- `Ctrl/Cmd + R` - Refresh lists

---

## Next Steps

After completing this tutorial, try:

1. **Test edge cases**: What happens with empty input? Invalid JSON?
2. **Compare Python vs Node**: Run `pizzaz_server_python` on port 8002 and compare
3. **Monitor in real-time**: Keep Inspector open while making server code changes
4. **Explore solar-system server**: Connect to port 8001 to see different tool types

Happy debugging!
