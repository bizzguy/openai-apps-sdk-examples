"""Commercial Real Estate Leads Dashboard MCP server implemented with the Python FastMCP helper.

The server exposes widget-backed tools that render the DuPage County CRE Leads Dashboard UI bundle.
Each handler returns the HTML shell via an MCP resource and echoes query parameters
as structured content so the ChatGPT client can hydrate the widget with commercial real estate data."""

from __future__ import annotations

import logging
import sys
from copy import deepcopy
from dataclasses import dataclass
from functools import lru_cache
from pathlib import Path
from typing import Any, Dict, List

import mcp.types as types

# Configure logging
logging.basicConfig(
    level=logging.DEBUG,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    datefmt="%H:%M:%S",
    stream=sys.stdout,
)
logger = logging.getLogger("cre-leads-dashboard-server")
from mcp.server.fastmcp import FastMCP
from pydantic import BaseModel, ConfigDict, Field, ValidationError


@dataclass(frozen=True)
class SalesDashboardWidget:
    identifier: str
    title: str
    template_uri: str
    invoking: str
    invoked: str
    html: str
    response_text: str


ASSETS_DIR = Path(__file__).resolve().parent.parent / "assets"


@lru_cache(maxsize=None)
def _load_widget_html(component_name: str) -> str:
    logger.debug(f"Loading widget HTML for: {component_name}")
    html_path = ASSETS_DIR / f"{component_name}.html"
    if html_path.exists():
        logger.info(f"Loaded widget from: {html_path}")
        return html_path.read_text(encoding="utf8")

    fallback_candidates = sorted(ASSETS_DIR.glob(f"{component_name}-*.html"))
    if fallback_candidates:
        logger.info(f"Loaded widget from fallback: {fallback_candidates[-1]}")
        return fallback_candidates[-1].read_text(encoding="utf8")

    logger.error(f"Widget HTML not found for: {component_name}")
    raise FileNotFoundError(
        f'Widget HTML for "{component_name}" not found in {ASSETS_DIR}. '
        "Run `pnpm run build` to generate the assets before starting the server."
    )


widgets: List[SalesDashboardWidget] = [
    SalesDashboardWidget(
        identifier="cre-leads-dashboard",
        title="Show Commercial Real Estate Leads Dashboard",
        template_uri="ui://widget/sales-dashboard.html",
        invoking="Loading DuPage County CRE leads...",
        invoked="Leads dashboard ready",
        html=_load_widget_html("sales-dashboard"),
        response_text="Here's your DuPage County commercial real estate leads dashboard showing active properties, contacts, and notes.",
    ),
    SalesDashboardWidget(
        identifier="property-tracker",
        title="Track Properties",
        template_uri="ui://widget/sales-dashboard.html",
        invoking="Fetching properties...",
        invoked="Properties loaded",
        html=_load_widget_html("sales-dashboard"),
        response_text="Displaying your commercial properties in DuPage County with buy/sell status and contact information.",
    ),
    SalesDashboardWidget(
        identifier="lead-contacts",
        title="View Lead Contacts",
        template_uri="ui://widget/sales-dashboard.html",
        invoking="Loading contacts and notes...",
        invoked="Contacts loaded",
        html=_load_widget_html("sales-dashboard"),
        response_text="Here are your lead contacts with their associated notes and property information.",
    ),
]


MIME_TYPE = "text/html+skybridge"


WIDGETS_BY_ID: Dict[str, SalesDashboardWidget] = {
    widget.identifier: widget for widget in widgets
}
WIDGETS_BY_URI: Dict[str, SalesDashboardWidget] = {
    widget.template_uri: widget for widget in widgets
}

logger.info("=" * 60)
logger.info("DuPage County CRE Leads Dashboard MCP Server initialized")
logger.info(f"  Assets directory: {ASSETS_DIR}")
logger.info(f"  Loaded {len(widgets)} widgets: {[w.identifier for w in widgets]}")
logger.info("=" * 60)


class SalesDashboardInput(BaseModel):
    """Schema for commercial real estate leads dashboard tools."""

    query: str = Field(
        default="",
        description="Optional query to filter or focus the dashboard view (e.g., 'buy properties', 'high priority', 'office buildings').",
    )

    model_config = ConfigDict(populate_by_name=True, extra="forbid")


mcp = FastMCP(
    name="cre-leads-dashboard-python",
    stateless_http=True,
)


TOOL_INPUT_SCHEMA: Dict[str, Any] = {
    "type": "object",
    "properties": {
        "query": {
            "type": "string",
            "description": "Optional query to filter or focus the dashboard view (e.g., 'buy properties', 'high priority', 'office buildings').",
        }
    },
    "required": [],
    "additionalProperties": False,
}


def _resource_description(widget: SalesDashboardWidget) -> str:
    return f"{widget.title} widget markup"


def _tool_meta(widget: SalesDashboardWidget) -> Dict[str, Any]:
    return {
        "openai/outputTemplate": widget.template_uri,
        "openai/toolInvocation/invoking": widget.invoking,
        "openai/toolInvocation/invoked": widget.invoked,
        "openai/widgetAccessible": True,
        "openai/resultCanProduceWidget": True,
    }


def _tool_invocation_meta(widget: SalesDashboardWidget) -> Dict[str, Any]:
    return {
        "openai/toolInvocation/invoking": widget.invoking,
        "openai/toolInvocation/invoked": widget.invoked,
    }


@mcp._mcp_server.list_tools()
async def _list_tools() -> List[types.Tool]:
    logger.info("=" * 60)
    logger.info("REQUEST: list_tools")
    tools = [
        types.Tool(
            name=widget.identifier,
            title=widget.title,
            description=widget.title,
            inputSchema=deepcopy(TOOL_INPUT_SCHEMA),
            _meta=_tool_meta(widget),
            annotations={
                "destructiveHint": False,
                "openWorldHint": False,
                "readOnlyHint": True,
            },
        )
        for widget in widgets
    ]
    logger.info(f"RESPONSE: Returning {len(tools)} tools: {[t.name for t in tools]}")
    logger.info("=" * 60)
    return tools


@mcp._mcp_server.list_resources()
async def _list_resources() -> List[types.Resource]:
    logger.info("=" * 60)
    logger.info("REQUEST: list_resources")
    resources = [
        types.Resource(
            name=widget.title,
            title=widget.title,
            uri=widget.template_uri,
            description=_resource_description(widget),
            mimeType=MIME_TYPE,
            _meta=_tool_meta(widget),
        )
        for widget in widgets
    ]
    logger.info(f"RESPONSE: Returning {len(resources)} resources: {[r.uri for r in resources]}")
    logger.info("=" * 60)
    return resources


@mcp._mcp_server.list_resource_templates()
async def _list_resource_templates() -> List[types.ResourceTemplate]:
    logger.info("=" * 60)
    logger.info("REQUEST: list_resource_templates")
    templates = [
        types.ResourceTemplate(
            name=widget.title,
            title=widget.title,
            uriTemplate=widget.template_uri,
            description=_resource_description(widget),
            mimeType=MIME_TYPE,
            _meta=_tool_meta(widget),
        )
        for widget in widgets
    ]
    logger.info(f"RESPONSE: Returning {len(templates)} templates: {[t.uriTemplate for t in templates]}")
    logger.info("=" * 60)
    return templates


async def _handle_read_resource(req: types.ReadResourceRequest) -> types.ServerResult:
    logger.info("=" * 60)
    logger.info("REQUEST: read_resource")
    logger.info(f"  URI: {req.params.uri}")

    widget = WIDGETS_BY_URI.get(str(req.params.uri))
    if widget is None:
        logger.warning(f"  Unknown resource URI: {req.params.uri}")
        logger.info("=" * 60)
        return types.ServerResult(
            types.ReadResourceResult(
                contents=[],
                _meta={"error": f"Unknown resource: {req.params.uri}"},
            )
        )

    logger.info(f"  Found widget: {widget.identifier} ({widget.title})")
    logger.info(f"  HTML size: {len(widget.html)} bytes")

    contents = [
        types.TextResourceContents(
            uri=widget.template_uri,
            mimeType=MIME_TYPE,
            text=widget.html,
            _meta=_tool_meta(widget),
        )
    ]

    logger.info(f"RESPONSE: Returning resource content for {widget.identifier}")
    logger.info("=" * 60)
    return types.ServerResult(types.ReadResourceResult(contents=contents))


async def _call_tool_request(req: types.CallToolRequest) -> types.ServerResult:
    logger.info("=" * 60)
    logger.info("REQUEST: call_tool")
    logger.info(f"  Tool name: {req.params.name}")
    logger.info(f"  Arguments: {req.params.arguments}")

    widget = WIDGETS_BY_ID.get(req.params.name)
    if widget is None:
        logger.error(f"  Unknown tool: {req.params.name}")
        logger.info("=" * 60)
        return types.ServerResult(
            types.CallToolResult(
                content=[
                    types.TextContent(
                        type="text",
                        text=f"Unknown tool: {req.params.name}",
                    )
                ],
                isError=True,
            )
        )

    logger.info(f"  Found widget: {widget.identifier} ({widget.title})")

    arguments = req.params.arguments or {}
    try:
        payload = SalesDashboardInput.model_validate(arguments)
        logger.info(f"  Validated payload: query={payload.query}")
    except ValidationError as exc:
        logger.error(f"  Validation error: {exc.errors()}")
        logger.info("=" * 60)
        return types.ServerResult(
            types.CallToolResult(
                content=[
                    types.TextContent(
                        type="text",
                        text=f"Input validation error: {exc.errors()}",
                    )
                ],
                isError=True,
            )
        )

    query = payload.query
    meta = _tool_invocation_meta(widget)

    logger.info(f"RESPONSE: Tool call successful")
    logger.info(f"  Response text: {widget.response_text}")
    logger.info(f"  Structured content: {{'query': '{query}'}}")
    logger.info(f"  Meta: {meta}")
    logger.info("=" * 60)

    return types.ServerResult(
        types.CallToolResult(
            content=[
                types.TextContent(
                    type="text",
                    text=widget.response_text,
                )
            ],
            structuredContent={"query": query},
            _meta=meta,
        )
    )


mcp._mcp_server.request_handlers[types.CallToolRequest] = _call_tool_request
mcp._mcp_server.request_handlers[types.ReadResourceRequest] = _handle_read_resource


app = mcp.streamable_http_app()

try:
    from starlette.middleware.cors import CORSMiddleware

    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_methods=["*"],
        allow_headers=["*"],
        allow_credentials=False,
    )
except Exception:
    pass


if __name__ == "__main__":
    import uvicorn

    logger.info("=" * 60)
    logger.info("Starting DuPage County CRE Leads Dashboard MCP Server")
    logger.info(f"  Assets directory: {ASSETS_DIR}")
    logger.info(f"  Available widgets: {[w.identifier for w in widgets]}")
    logger.info("=" * 60)
    uvicorn.run("main:app", host="0.0.0.0", port=8000)
