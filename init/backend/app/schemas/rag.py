"""
Pydantic schemas for RAG API
"""

from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional
from enum import Enum


class RerankStrategyEnum(str, Enum):
    """Re-ranking strategies"""
    RRF = "rrf"
    WEIGHTED = "weighted"
    MAX = "max"
    AVG = "avg"


class SearchRequest(BaseModel):
    """Request for hybrid search"""
    query: str = Field(..., description="Search query", min_length=1)
    collection_name: str = Field(..., description="Collection to search in")
    n_results: int = Field(10, description="Number of results", ge=1, le=50)
    strategy: RerankStrategyEnum = Field(
        RerankStrategyEnum.RRF,
        description="Re-ranking strategy"
    )
    semantic_weight: float = Field(0.5, description="Weight for semantic search", ge=0, le=1)
    keyword_weight: float = Field(0.5, description="Weight for keyword search", ge=0, le=1)
    filters: Optional[Dict[str, str]] = Field(None, description="Metadata filters")
    enable_semantic: bool = Field(True, description="Enable semantic search")
    enable_keyword: bool = Field(True, description="Enable keyword search")


class SearchResultItem(BaseModel):
    """Single search result"""
    id: str
    content: str
    metadata: Dict[str, Any]
    score: float
    rank: int
    source: str  # "semantic", "keyword", or "both"


class SearchResponse(BaseModel):
    """Response from search"""
    results: List[SearchResultItem]
    total: int
    query: str
    collection: str
    strategy: str


class LessonSearchRequest(BaseModel):
    """Request for lesson search"""
    query: str = Field(..., description="Search query", min_length=1)
    grade: Optional[str] = Field(None, description="Grade filter (e.g., '10')")
    book: Optional[str] = Field(None, description="Book filter (e.g., 'cánh diều')")
    topic: Optional[str] = Field(None, description="Topic filter")
    n_results: int = Field(10, description="Number of results", ge=1, le=50)


class ContextRequest(BaseModel):
    """Request for RAG context"""
    query: str = Field(..., description="Query for context retrieval", min_length=1)
    collection_name: str = Field("cd_10", description="Collection to search")
    n_results: int = Field(5, description="Number of results", ge=1, le=20)
    filters: Optional[Dict[str, str]] = Field(None, description="Metadata filters")


class ContextResponse(BaseModel):
    """Response with formatted context"""
    query: str
    context: str
    documents: List[SearchResultItem]
    total: int
    collection: str


class CollectionInfo(BaseModel):
    """Information about a collection"""
    name: str
    count: int
    metadata: Optional[Dict[str, Any]] = None


class CollectionListResponse(BaseModel):
    """Response listing collections"""
    collections: List[str]
    total: int
