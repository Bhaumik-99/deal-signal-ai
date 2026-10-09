from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field, HttpUrl, field_validator


class CompanyInput(BaseModel):
    name: str = Field(..., min_length=1, max_length=255, description="Company name")
    website: Optional[str] = Field(default=None, description="Company website or URL")
    icp: str = Field(
        default="Mid-market B2B company growing its sales team and investing in revenue operations.",
        description="Ideal customer profile criteria"
    )
    target_industry: Optional[str] = Field(default=None, description="Target industry")
    desired_company_size: Optional[str] = Field(default=None, description="Target company size range")
    signals_to_investigate: Optional[str] = Field(
        default="Hiring / team growth",
        description="Buying signal category to investigate"
    )
    product_offer: Optional[str] = Field(
        default="AI sales intelligence and outbound automation",
        description="What product/service you are offering"
    )

    @field_validator("name")
    @classmethod
    def validate_name(cls, v: str) -> str:
        cleaned = v.strip()
        if not cleaned:
            raise ValueError("Company name cannot be blank")
        return cleaned


class EvidenceItem(BaseModel):
    quote: str = Field(..., description="Factual extracted evidence quote or statement")
    source_url: str = Field(..., description="URL where evidence was retrieved")
    timestamp: str = Field(..., description="ISO timestamp of retrieval")
    source_title: Optional[str] = Field(default=None, description="Title of the source page or document")
    confidence: float = Field(default=0.9, ge=0.0, le=1.0, description="Verification confidence level")


class BuyingSignal(BaseModel):
    signal_type: str = Field(..., description="Signal category e.g. Hiring growth, Funding, Expansion")
    supporting_evidence: str = Field(..., description="Direct factual quote or reference supporting the signal")
    source_url: str = Field(..., description="Verifiable public source URL")
    date: Optional[str] = Field(default=None, description="Date of the signal if identifiable")
    confidence_level: str = Field(default="high", description="high, medium, or low")
    why_intent: str = Field(..., description="Why this signal indicates potential buying intent or timing")


class LeadScore(BaseModel):
    overall_score: int = Field(..., ge=0, le=100, description="Final fit score from 0 to 100")
    icp_fit_score: int = Field(..., ge=0, le=40, description="Fit against ideal customer profile (max 40)")
    size_industry_fit_score: int = Field(..., ge=0, le=20, description="Industry and size alignment (max 20)")
    signal_relevance_score: int = Field(..., ge=0, le=25, description="Buying signal relevance and recency (max 25)")
    evidence_quality_score: int = Field(..., ge=0, le=15, description="Evidence verifiability & quality (max 15)")
    uncertainty_deduction: int = Field(default=0, ge=0, le=30, description="Deduction due to gaps or missing info")
    rationale: str = Field(..., description="Clear explanation of the scoring decision")
    missing_information: List[str] = Field(default_factory=list, description="List of unverified gaps or missing data")
    recommended_action: str = Field(..., description="Recommended next step e.g. Reach out, Deepen research, Disqualify")


class OutreachDraft(BaseModel):
    subject: str = Field(..., description="Concise, contextual email subject line")
    body: str = Field(..., description="Personalized email body grounded in verified context")
    business_context: str = Field(..., description="Key business reason for contacting now")
    supporting_evidence_refs: List[str] = Field(default_factory=list, description="Referenced factual signals")
    personalization_rationale: str = Field(..., description="Why this angle was chosen")


class TraceStep(BaseModel):
    step_name: str
    tool_used: str
    decision_summary: str
    status: str = "completed"  # completed, warning, error, skipped
    duration_ms: int = 0
    details: Optional[Dict[str, Any]] = None
    error: Optional[str] = None


class AgentRunResponse(BaseModel):
    run_id: str
    company_name: str
    domain: Optional[str]
    fit_score: int
    lead_score_details: LeadScore
    buying_signals: List[BuyingSignal]
    evidence_items: List[EvidenceItem]
    outreach_draft: OutreachDraft
    execution_trace: List[TraceStep]
    is_simulated: bool = False
    mode: str = "live"  # live, deterministic_test
    created_at: str


class LeadItemResponse(BaseModel):
    id: int
    run_id: Optional[str]
    name: str
    domain: Optional[str]
    initial: str
    signal: str
    detail: Optional[str]
    score: int
    status: str
    type: Optional[str]
    source: Optional[str]
    outreach_subject: Optional[str]
    outreach_draft: Optional[str]
    is_approved: bool


class LeadApprovalRequest(BaseModel):
    approved: bool = True


class LeadDraftUpdateRequest(BaseModel):
    draft: str


class HealthResponse(BaseModel):
    status: str = "ok"
    environment: str
    llm_configured: bool
    test_mode: bool
    database_ok: bool
    timestamp: str
