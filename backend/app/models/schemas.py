from pydantic import BaseModel, EmailStr, Field
from typing import List, Optional, Literal
from datetime import datetime
import uuid


ToolName = Literal[
    "ChatGPT", "Claude", "Cursor", "Gemini",
    "GitHub Copilot", "OpenAI API", "Anthropic API", "Windsurf"
]

UseCase = Literal["Coding", "Writing", "Research", "Data Analysis", "Mixed"]

PriorityLevel = Literal["high", "medium", "low"]

RecType = Literal["downgrade", "upgrade", "consolidate", "cancel", "ok"]


class AuditToolInput(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    tool: ToolName
    plan: str
    monthly_spend: float = Field(ge=0)
    seats: int = Field(ge=1, default=1)
    use_case: Optional[UseCase] = None


class AuditRequest(BaseModel):
    tools: List[AuditToolInput] = Field(min_length=1)
    team_size: int = Field(ge=1, default=1)
    use_case: UseCase = "Mixed"
    company_name: Optional[str] = None


class RecommendationOut(BaseModel):
    tool_id: str
    tool_name: ToolName
    current_plan: str
    recommended_plan: str
    current_spend: float
    recommended_spend: float
    monthly_savings: float
    annual_savings: float
    reason: str
    priority: PriorityLevel
    type: RecType


class AuditResponse(BaseModel):
    id: str
    total_current_spend: float
    total_optimal_spend: float
    total_monthly_savings: float
    total_annual_savings: float
    savings_score: int
    savings_rate: float
    recommendations: List[RecommendationOut]
    ai_summary: Optional[str] = None
    created_at: datetime


class LeadRequest(BaseModel):
    email: EmailStr
    company: Optional[str] = None
    role: Optional[str] = None
    audit_id: Optional[str] = None
    monthly_savings: Optional[float] = None


class LeadResponse(BaseModel):
    success: bool
    message: str


class ReportToolOut(BaseModel):
    tool_name: str
    plan: str
    monthly_spend: float
    seats: int


class ReportResponse(BaseModel):
    id: str
    total_monthly_savings: float
    total_annual_savings: float
    savings_score: int
    savings_rate: float
    recommendations: List[RecommendationOut]
    tools: List[ReportToolOut]
    created_at: datetime
