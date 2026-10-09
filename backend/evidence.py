import re
import datetime
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field


class FactClaim(BaseModel):
    fact_id: str
    claim: str
    source_url: str
    source_type: str = "webpage"  # webpage, news_release, career_page, sec_filing, benchmark_record
    retrieval_timestamp: str
    evidence_excerpt: str
    event_date: Optional[str] = None
    verification_status: str = "verified"  # verified, unverified, contradicted, stale
    confidence_score: float = 0.9
    uncertainty_notes: Optional[str] = None


class EvidenceGroundingAudit(BaseModel):
    total_claims: int = 0
    verified_claims: int = 0
    unsupported_claims: int = 0
    contradicted_claims: int = 0
    stale_claims: int = 0
    grounding_score: float = 1.0
    detected_inconsistencies: List[str] = Field(default_factory=list)


# Prompt Injection Defenses
SUSPICIOUS_INJECTION_PATTERNS = [
    re.compile(r"ignore\s+(all\s+)?(previous|prior)\s+instructions?", re.IGNORECASE),
    re.compile(r"you\s+are\s+now\s+(a|an)?\s*(new|different)?\s*ai", re.IGNORECASE),
    re.compile(r"system\s*prompt\s*:", re.IGNORECASE),
    re.compile(r"disregard\s+(the\s+)?above", re.IGNORECASE),
    re.compile(r"override\s+(all\s+)?guidelines?", re.IGNORECASE),
    re.compile(r"send\s+(an\s+)?email\s+to\b", re.IGNORECASE),
    re.compile(r"execute\s+command\b", re.IGNORECASE),
    re.compile(r"<\s*script[^>]*>", re.IGNORECASE),
]


def sanitize_external_text(text: str) -> str:
    """
    Sanitizes retrieved untrusted external web text to defend against prompt injection
    and system override attempts before feeding into LLM prompts.
    """
    if not text:
        return ""
    
    sanitized = text
    for pattern in SUSPICIOUS_INJECTION_PATTERNS:
        sanitized = pattern.sub("[REDACTED_SECURITY_RISK]", sanitized)
    
    # Strip dangerous HTML and script tags
    sanitized = re.sub(r"<\s*/?\s*(script|style|iframe|embed|object)[^>]*>", "", sanitized, flags=re.IGNORECASE)
    
    # Normalize excessive control characters
    sanitized = re.sub(r"[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]", "", sanitized)
    
    return sanitized.strip()


def check_evidence_consistency(claims: List[FactClaim]) -> EvidenceGroundingAudit:
    """
    Evaluates a collection of fact claims for contradictions, staleness,
    and missing evidence.
    """
    audit = EvidenceGroundingAudit(total_claims=len(claims))
    if not claims:
        audit.grounding_score = 0.0
        audit.detected_inconsistencies.append("No factual evidence extracted.")
        return audit

    verified = 0
    unsupported = 0
    contradicted = 0
    stale = 0

    current_year = datetime.datetime.now(datetime.timezone.utc).year

    # Check for contradictions across claims (e.g., headcount numbers, conflicting funding dates)
    headcount_claims = []
    
    for c in claims:
        # Check staleness if event date exists
        if c.event_date:
            try:
                date_year = int(c.event_date[:4])
                if current_year - date_year >= 3:
                    c.verification_status = "stale"
                    c.uncertainty_notes = f"Event occurred in {date_year} (potential staleness)."
                    stale += 1
            except Exception:
                pass

        if c.verification_status == "verified":
            verified += 1
        elif c.verification_status == "unsupported":
            unsupported += 1
        elif c.verification_status == "contradicted":
            contradicted += 1
        elif c.verification_status == "stale":
            stale += 1

        # Check for headcount patterns
        hc_match = re.search(r"(\d+)\s*(?:employees|people|staff|headcount)", c.claim, re.IGNORECASE)
        if hc_match:
            headcount_claims.append((int(hc_match.group(1)), c))

    # Detect major headcount divergence
    if len(headcount_claims) >= 2:
        counts = [hc[0] for hc in headcount_claims]
        if max(counts) > min(counts) * 2.5:
            audit.detected_inconsistencies.append(
                f"Conflicting company size signals detected: {min(counts)} vs {max(counts)} employees across sources."
            )
            # Mark the divergent claim
            for count, claim in headcount_claims:
                claim.verification_status = "contradicted"
                claim.uncertainty_notes = "Conflicting employee counts found across different web sources."
            contradicted += 1

    audit.verified_claims = verified
    audit.unsupported_claims = unsupported
    audit.contradicted_claims = contradicted
    audit.stale_claims = stale

    # Calculate grounding score
    if audit.total_claims > 0:
        score = (verified * 1.0 + stale * 0.5) / audit.total_claims
        score = max(0.0, score - (contradicted * 0.2 + unsupported * 0.2))
        audit.grounding_score = round(min(1.0, score), 2)

    return audit
