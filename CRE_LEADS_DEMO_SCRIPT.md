# DuPage County CRE Leads Dashboard – Demo Script

## 1. Create the MCP Connection
- Open ChatGPT's MCP Connections panel
- Add new connection:
  - **Name:** sparkybot
  - **URL:** https://sparkybot.ngrok.app/mcp
  - **Authentication:** Select "No Authentication"

## 2. View Available Tools (connection page)
- Open the connection details to view MCP tools:
  - `cre-leads-dashboard` – Show main dashboard with all DuPage County properties
  - `property-tracker` – Track commercial properties with buy/sell status
  - `lead-contacts` – View contacts, notes, and relationship history

## 3. View Available Tools (via ChatGPT)
- Ask ChatGPT: **"What can sparkybot do?"**
- ChatGPT reads the MCP schema and summarizes the 3 CRE tools automatically
- Confirms connection to DuPage County commercial real estate database

## 4. Live Dashboard Demo – Overview
Ask ChatGPT:
> **"Using sparkybot, show me my commercial real estate leads dashboard for DuPage County"**

- Interactive widget appears showing:
  - **6 active properties** across DuPage County
  - **Total portfolio value:** $33.6M
  - **11 contacts** with detailed notes
  - Buy/Sell filtering
  - Priority badges (High/Medium/Low)

## 5. Property Analysis Demo
Ask ChatGPT:
> **"Sparkybot, which properties are priced above $5M and what's their current status?"**

- Shows filtered view:
  - **Office Building** - Butterfield Rd, Downers Grove ($8.5M)
  - **Industrial Warehouse** - Warrenville Rd, Lisle ($6.8M)
  - **Mixed Use** - Ogden Ave, Naperville ($7.2M)
  - **Office Building** - Park Blvd, Itasca ($5.2M)

## 6. Contact & Notes Deep Dive
Ask ChatGPT:
> **"Show me all contacts for the office building on Butterfield Rd using sparkybot. What are the recent notes?"**

- Widget displays expandable contact cards:
  - **Michael Chen** (Owner) - 3 notes including motivation to sell before Q2
  - **Sarah Martinez** (CFO) - 1 note about financial decisions and comp analysis
- Each note includes timestamp and author
- Action buttons: Call, Email, Add Note

## 7. Decision Support Demo
Ask ChatGPT:
> **"Based on my sparkybot CRE dashboard, what are the 3 most urgent actions I should take today?"**

- ChatGPT analyzes the dashboard data and provides:
  1. Follow up with David Thompson (Thompson Investment Group) - LOI due this week
  2. Address Patricia O'Brien's IT team walk-through request
  3. Respond to Lisa Anderson's competing offer ($6.8M) with better proposal

## 8. Interactive Widget Features
- **Click any property card** to see full details
- **Expand contact cards** to read conversation history
- **Filter by Buy/Sell** to focus on specific deal types
- **Real-time metrics** showing pipeline health
- **Smooth animations** for professional presentation

## Closing Line
**"MCP transforms ChatGPT into a powerful CRE workspace—tracking $33M+ in DuPage County properties, managing 11+ client relationships, and organizing 23 detailed notes—all through conversational queries. Your entire commercial real estate pipeline, accessible through natural language."**

---

## Technical Highlights
- **Protocol:** Model Context Protocol (MCP)
- **Transport:** StreamableHTTP via ngrok
- **Framework:** FastMCP (Python), React + Vite
- **Data:** 6 properties, 11 contacts, 23 timestamped notes
- **Location:** DuPage County, IL (Downers Grove, Glen Ellyn, Lisle, Itasca, Naperville)
- **Property Types:** Office, Retail, Industrial, Mixed-Use, Restaurant
- **Price Range:** $1.85M - $8.5M

## Demo Tips
1. **Always mention "sparkybot"** in the first prompt to activate the MCP
2. **Use specific filters** like "high priority" or "buy properties" for targeted views
3. **Ask for analysis** – ChatGPT can provide insights beyond just displaying data
4. **Show the contact notes** – demonstrates the relationship tracking power
5. **Highlight the metrics** – $33.6M total portfolio, instant analytics
