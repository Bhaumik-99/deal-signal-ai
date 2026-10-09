import json
import logging
from typing import Dict, Any, List, Optional
import httpx
from backend.config import settings
from backend.schemas import LeadScore, OutreachDraft, BuyingSignal, EvidenceItem

logger = logging.getLogger(__name__)


class LLMService:
    """Service to interact with an LLM API or provide deterministic fallback analysis."""

    def __init__(self):
        self.api_key = settings.OPENAI_API_KEY
        self.base_url = settings.OPENAI_BASE_URL.rstrip("/")
        self.model = settings.LLM_MODEL
        self.is_configured = settings.is_llm_configured

    async def _call_llm_chat(self, messages: List[Dict[str, str]], json_mode: bool = True) -> str:
        """Call OpenAI-compatible chat completion endpoint."""
        if not self.is_configured:
            raise ValueError("LLM API key is not configured.")

        url = f"{self.base_url}/chat/completions"
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
        payload = {
            "model": self.model,
            "messages": messages,
            "temperature": 0.2,
        }
        if json_mode:
            payload["response_format"] = {"type": "json_object"}

        async with httpx.AsyncClient(timeout=settings.REQUEST_TIMEOUT_SECONDS * 2) as client:
            resp = await client.post(url, headers=headers, json=payload)
            if resp.status_code != 200:
                raise IOError(f"LLM API returned status {resp.status_code}: {resp.text}")
            data = resp.json()
            return data["choices"][0]["message"]["content"]

    def compute_deterministic_score(
        self,
        company_name: str,
        icp: str,
        target_industry: Optional[str],
        desired_size: Optional[str],
        company_industry: Optional[str],
        company_size: Optional[str],
        evidence_items: List[EvidenceItem],
        signals: List[BuyingSignal]
    ) -> LeadScore:
        """
        Deterministic, transparent scoring engine adhering to explicit criteria:
        - ICP fit (max 40)
        - Industry & size fit (max 20)
        - Signal relevance & recency (max 25)
        - Evidence verifiability & quality (max 15)
        - Uncertainty deduction (0 to 30)
        """
        missing_info = []

        # 1. ICP Fit (0-40)
        icp_score = 25  # Baseline
        icp_lower = icp.lower()
        if "b2b" in icp_lower or "saas" in icp_lower or "sales" in icp_lower or "operations" in icp_lower:
            icp_score += 10
        if signals:
            icp_score += 5
        icp_score = min(40, max(0, icp_score))

        # 2. Size & Industry Fit (0-20)
        size_industry_score = 10
        if company_industry:
            if target_industry and target_industry.lower() in company_industry.lower():
                size_industry_score += 6
            else:
                size_industry_score += 3
        else:
            missing_info.append("Specific company industry verification is pending.")

        if company_size:
            size_industry_score += 4
        else:
            missing_info.append("Precise headcount range was not confirmed via public sources.")
        size_industry_score = min(20, max(0, size_industry_score))

        # 3. Signal Relevance (0-25)
        signal_score = 0
        if signals:
            high_conf = [s for s in signals if s.confidence_level == "high"]
            signal_score = 20 if high_conf else 14
            if len(signals) >= 2:
                signal_score = min(25, signal_score + 5)
        else:
            missing_info.append("No active public buying signals detected in the inspected pages.")

        # 4. Evidence Quality (0-15)
        evidence_score = 0
        if evidence_items:
            avg_conf = sum(e.confidence for e in evidence_items) / len(evidence_items)
            evidence_score = int(avg_conf * 15)
        else:
            evidence_score = 2
            missing_info.append("Direct primary source quotes could not be verified.")
        evidence_score = min(15, max(0, evidence_score))

        # 5. Uncertainty deduction (0-30)
        uncertainty = 0
        if not evidence_items:
            uncertainty += 15
        if not signals:
            uncertainty += 10
        if len(missing_info) >= 2:
            uncertainty += 5
        uncertainty = min(30, max(0, uncertainty))

        overall = max(0, min(100, (icp_score + size_industry_score + signal_score + evidence_score) - uncertainty))

        if overall >= 80:
            recommended_action = "Reach out immediately: Strong evidence-led alignment with verifiable timing."
            rationale = (
                f"{company_name} demonstrates high alignment with your target ICP. "
                f"Detected {len(signals)} verifiable signal(s) with confirmed public citations."
            )
        elif overall >= 60:
            recommended_action = "Review & qualify: Potential opportunity, verify buying committee before message dispatch."
            rationale = (
                f"{company_name} exhibits moderate alignment. While general profile matches, "
                f"additional source validation is recommended to mitigate uncertainty."
            )
        else:
            recommended_action = "Deprioritize / Monitor: Insufficient signal strength or evidence coverage."
            rationale = (
                f"Limited verifiable indicators available for {company_name}. "
                f"High uncertainty penalty ({uncertainty} pts) applied due to information gaps."
            )

        return LeadScore(
            overall_score=overall,
            icp_fit_score=icp_score,
            size_industry_fit_score=size_industry_score,
            signal_relevance_score=signal_score,
            evidence_quality_score=evidence_score,
            uncertainty_deduction=uncertainty,
            rationale=rationale,
            missing_information=missing_info,
            recommended_action=recommended_action
        )

    def generate_deterministic_outreach(
        self,
        company_name: str,
        product_offer: str,
        signals: List[BuyingSignal],
        evidence_items: List[EvidenceItem]
    ) -> OutreachDraft:
        """
        Generates a professional B2B outreach draft grounded solely in verified facts.
        """
        primary_signal = signals[0] if signals else None
        signal_text = primary_signal.signal_type.lower() if primary_signal else "recent growth activity"
        evidence_quote = primary_signal.supporting_evidence if primary_signal else (
            evidence_items[0].quote if evidence_items else "your ongoing market initiatives"
        )
        source_ref = primary_signal.source_url if primary_signal else (
            evidence_items[0].source_url if evidence_items else "public company updates"
        )

        subject = f"Thought on {company_name}'s {signal_text}"

        body = (
            f"Hi {company_name} team,\n\n"
            f"I noticed a timely update regarding {signal_text} "
            f"(\"{evidence_quote.strip()}\").\n\n"
            f"When teams expand and scale operations, identifying high-signal prospects without manual tab-juggling "
            f"becomes a major lever. {product_offer} helps revenue teams spot verified buying triggers "
            f"and prepare personalized conversations with human oversight before anything is sent.\n\n"
            f"Would 15 minutes next Tuesday be helpful to explore whether this aligns with your outbound roadmap?\n\n"
            f"Best regards,\n"
            f"Alex Smith\n"
            f"DealSignal AI"
        )

        return OutreachDraft(
            subject=subject,
            body=body,
            business_context=f"Contacting {company_name} following detected {signal_text}.",
            supporting_evidence_refs=[source_ref],
            personalization_rationale=(
                f"Tied opening hook directly to verified evidence (\"{evidence_quote[:80]}...\") "
                f"rather than generic promotional claims."
            )
        )

    async def analyze_and_score(
        self,
        company_name: str,
        icp: str,
        target_industry: Optional[str],
        desired_size: Optional[str],
        company_industry: Optional[str],
        company_size: Optional[str],
        evidence_items: List[EvidenceItem],
        signals: List[BuyingSignal]
    ) -> LeadScore:
        """
        Scores lead via explicit criteria, augmented by LLM reasoning if configured.
        """
        # Always compute baseline deterministic scores to ensure boundaries and avoid hallucinations
        baseline_score = self.compute_deterministic_score(
            company_name=company_name,
            icp=icp,
            target_industry=target_industry,
            desired_size=desired_size,
            company_industry=company_industry,
            company_size=company_size,
            evidence_items=evidence_items,
            signals=signals
        )

        if not self.is_configured:
            return baseline_score

        # LLM augmentation for nuanced rationale when API key is active
        try:
            prompt = (
                f"You are a rigorous B2B qualification analyst for DealSignal AI.\n"
                f"Company: {company_name}\n"
                f"ICP: {icp}\n"
                f"Evidence: {[e.model_dump() for e in evidence_items]}\n"
                f"Signals: {[s.model_dump() for s in signals]}\n"
                f"Baseline score breakdown: {baseline_score.model_dump()}\n\n"
                f"Return JSON adhering to LeadScore schema with overall_score ({baseline_score.overall_score}), "
                f"icp_fit_score, size_industry_fit_score, signal_relevance_score, evidence_quality_score, "
                f"uncertainty_deduction, rationale, missing_information, recommended_action. "
                f"Do not invent new facts not in evidence."
            )
            raw = await self._call_llm_chat([
                {"role": "system", "content": "You output valid JSON conforming strictly to verified B2B facts."},
                {"role": "user", "content": prompt}
            ])
            data = json.loads(raw)
            # Enforce verified scores from baseline
            data["overall_score"] = baseline_score.overall_score
            return LeadScore(**data)
        except Exception as e:
            logger.warning(f"LLM score augmentation failed, using baseline: {e}")
            return baseline_score

    async def generate_outreach(
        self,
        company_name: str,
        product_offer: str,
        signals: List[BuyingSignal],
        evidence_items: List[EvidenceItem]
    ) -> OutreachDraft:
        """
        Generates outreach email grounded in verified evidence.
        """
        baseline_draft = self.generate_deterministic_outreach(
            company_name=company_name,
            product_offer=product_offer,
            signals=signals,
            evidence_items=evidence_items
        )

        if not self.is_configured:
            return baseline_draft

        try:
            prompt = (
                f"You are an evidence-led B2B outbound specialist.\n"
                f"Company: {company_name}\n"
                f"Product: {product_offer}\n"
                f"Verified Signals: {[s.model_dump() for s in signals]}\n"
                f"Evidence: {[e.model_dump() for e in evidence_items]}\n\n"
                f"Draft a concise, thoughtful, high-conversion email. "
                f"Ground the hook ONLY in the verified signals. Never fabricate news or details. "
                f"Return JSON conforming to OutreachDraft schema."
            )
            raw = await self._call_llm_chat([
                {"role": "system", "content": "You output valid JSON with strictly factual B2B outreach."},
                {"role": "user", "content": prompt}
            ])
            data = json.loads(raw)
            return OutreachDraft(**data)
        except Exception as e:
            logger.warning(f"LLM outreach generation failed, using baseline: {e}")
            return baseline_draft
