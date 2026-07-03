"""Pydantic schemas cho module KG-LPV (chỉ Status ở Task 1; Finding/Report/Job ở task sau)."""

from pydantic import BaseModel


class GraphStatus(BaseModel):
    connected: bool
    node_count: int | None = None


class KgLpvStatusResponse(BaseModel):
    enabled: bool
    availability: str  # "ok" | "degraded" | "disabled"
    graph: GraphStatus
    version: str
