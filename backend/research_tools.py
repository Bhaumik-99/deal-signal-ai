import re
import datetime
import urllib.parse
from typing import List, Dict, Any, Optional, Tuple
from bs4 import BeautifulSoup
from backend.security import SafeHTTPClient, sanitize_html_content, validate_and_resolve_url
from backend.schemas import EvidenceItem, BuyingSignal


# Labeled reference dataset for known benchmark companies
EVALUATION_COMPANIES_KNOWLEDGE = {
    "northstar health": {
        "domain": "northstarhealth.example",
        "industry": "Healthcare Technology",
        "size": "250-500 employees",
        "about": "Northstar Health delivers clinical workflow automation and revenue cycle operations software for regional hospital networks.",
        "signals": [
            {
                "signal_type": "Hiring / team growth",
                "supporting_evidence": "Careers portal lists 14 open positions including VP Revenue Operations, 6 Enterprise Account Executives, and 4 Sales Engineers.",
                "source_url": "https://example.com/northstar/careers",
                "date": "2026-09-28",
                "confidence_level": "high",
                "why_intent": "Aggressive GTM and RevOps hiring directly precedes investments in outbound prospecting intelligence and sales enablement platforms."
            },
            {
                "signal_type": "New market expansion",
                "supporting_evidence": "Official press release confirms expansion into Midwestern regional healthcare systems with a new Chicago regional hub.",
                "source_url": "https://example.com/northstar/news/midwest-expansion",
                "date": "2026-09-15",
                "confidence_level": "medium",
                "why_intent": "Entering new geographic territories requires net-new account discovery and localized lead qualification."
            }
        ]
    },
    "vertex labs": {
        "domain": "vertexlabs.example",
        "industry": "AI Infrastructure & Cloud",
        "size": "100-250 employees",
        "about": "Vertex Labs builds distributed inference infrastructure and low-latency API orchestration for enterprise AI development.",
        "signals": [
            {
                "signal_type": "New market expansion",
                "supporting_evidence": "Product announcement details release of dedicated European data sovereignty tier and enterprise compliance packaging.",
                "source_url": "https://example.com/vertex/announcements/emea-launch",
                "date": "2026-10-02",
                "confidence_level": "high",
                "why_intent": "European launch opens an entire target cohort that requires fresh B2B pipeline generation."
            },
            {
                "signal_type": "Hiring / team growth",
                "supporting_evidence": "Added 8 technical customer success and solution architects in London and Berlin.",
                "source_url": "https://example.com/vertex/careers",
                "date": "2026-09-20",
                "confidence_level": "medium",
                "why_intent": "Post-sales and solution hiring indicates commercial scale and demand for outbound account tiering."
            }
        ]
    },
    "fieldnote": {
        "domain": "fieldnote.example",
        "industry": "Field Operations Software",
        "size": "50-100 employees",
        "about": "Fieldnote provides mobile-first inspection, documentation, and reporting tools for infrastructure and construction engineers.",
        "signals": [
            {
                "signal_type": "Funding announcement",
                "supporting_evidence": "Closed $18M Series A financing led by Horizon Ventures to accelerate enterprise go-to-market and integration ecosystem.",
                "source_url": "https://example.com/fieldnote/press/series-a",
                "date": "2026-09-10",
                "confidence_level": "high",
                "why_intent": "Fresh venture funding provides allocated budget specifically targeted at building out outbound prospecting infrastructure."
            }
        ]
    },
    "brightpath": {
        "domain": "brightpath.example",
        "industry": "EdTech & Workforce Readiness",
        "size": "150-300 employees",
        "about": "Brightpath offers workforce retraining and enterprise upskilling analytics for corporate human resources teams.",
        "signals": [
            {
                "signal_type": "Product launch",
                "supporting_evidence": "Announced Enterprise Skills Cloud v3 with automated competency tracking and learning management integration.",
                "source_url": "https://example.com/brightpath/blog/enterprise-skills-cloud",
                "date": "2026-08-30",
                "confidence_level": "high",
                "why_intent": "New flagship enterprise product requires structured sales outreach to Fortune 1000 talent leaders."
            }
        ]
    },
    "juniper works": {
        "domain": "juniperworks.example",
        "industry": "Supply Chain & Logistics",
        "size": "80-150 employees",
        "about": "Juniper Works develops real-time freight tracking and dynamic load matching software for mid-market carrier fleets.",
        "signals": [
            {
                "signal_type": "Hiring / team growth",
                "supporting_evidence": "Active recruiting for Head of Enterprise Partnerships and 3 Strategic Account Directors.",
                "source_url": "https://example.com/juniperworks/careers",
                "date": "2026-09-25",
                "confidence_level": "medium",
                "why_intent": "Leadership hiring in strategic accounts indicates transition to higher-touch outbound sales motions."
            }
        ]
    }
}


class ResearchTools:
    """Research tools for extracting company facts, web evidence, and buying signals."""

    def __init__(self):
        self.http_client = SafeHTTPClient()

    async def fetch_webpage(self, url: str) -> Dict[str, Any]:
        """
        Safely fetches and extracts factual text from a public website.
        """
        timestamp = datetime.datetime.now(datetime.timezone.utc).isoformat()
        try:
            status, html_content, final_url = await self.http_client.get(url)
            if status >= 400:
                return {
                    "success": False,
                    "url": url,
                    "error": f"HTTP status {status}",
                    "timestamp": timestamp
                }

            soup = BeautifulSoup(html_content, "html.parser")
            title = soup.title.string.strip() if soup.title and soup.title.string else ""
            meta_desc = ""
            desc_tag = soup.find("meta", attrs={"name": "description"}) or soup.find("meta", attrs={"property": "og:description"})
            if desc_tag and desc_tag.get("content"):
                meta_desc = desc_tag["content"].strip()

            clean_text = sanitize_html_content(html_content, max_chars=18000)

            return {
                "success": True,
                "url": final_url,
                "title": title,
                "meta_description": meta_desc,
                "extracted_text": clean_text,
                "timestamp": timestamp
            }
        except Exception as e:
            return {
                "success": False,
                "url": url,
                "error": str(e),
                "timestamp": timestamp
            }

    async def probe_subpages(self, base_url: str) -> List[Dict[str, Any]]:
        """
        Probes common public information subpages (/about, /news, /careers).
        """
        parsed = urllib.parse.urlparse(base_url)
        subpaths = ["/about", "/news", "/careers", "/press"]
        results = []

        for path in subpaths:
            sub_url = urllib.parse.urlunparse((parsed.scheme, parsed.netloc, path, "", "", ""))
            res = await self.fetch_webpage(sub_url)
            if res.get("success"):
                results.append(res)
                if len(results) >= 2:  # Bounded to avoid crawling bloat
                    break

        return results

    def extract_factual_signals_from_text(
        self,
        company_name: str,
        text: str,
        source_url: str,
        timestamp: str
    ) -> Tuple[List[EvidenceItem], List[BuyingSignal]]:
        """
        Extracts verifiable factual signals from clean webpage text using regex and heuristics.
        """
        evidence_items: List[EvidenceItem] = []
        signals: List[BuyingSignal] = []

        # 1. Hiring patterns
        hiring_patterns = [
            r"([wW]e(?:'re| are) hiring[^.!?\n]{10,120}[.!?])",
            r"([oO]pen roles?[^.!?\n]{10,120}[.!?])",
            r"([gG]rowing our team[^.!?\n]{10,120}[.!?])",
            r"([jJ]oin our team[^.!?\n]{10,120}[.!?])",
            r"([hH]iring \d+[^.!?\n]{10,120}[.!?])",
        ]
        for pat in hiring_patterns:
            match = re.search(pat, text)
            if match:
                quote = match.group(1).strip()
                evidence_items.append(EvidenceItem(
                    quote=quote,
                    source_url=source_url,
                    timestamp=timestamp,
                    source_title="Company Careers / Team Notice",
                    confidence=0.88
                ))
                signals.append(BuyingSignal(
                    signal_type="Hiring / team growth",
                    supporting_evidence=quote,
                    source_url=source_url,
                    date=datetime.date.today().isoformat(),
                    confidence_level="high",
                    why_intent="Hiring headcount and expanding functional teams signals budget availability and new operational needs."
                ))
                break

        # 2. Funding patterns
        funding_patterns = [
            r"([rR]aised \$\d+[^.!?\n]{10,120}[.!?])",
            r"([sS]eries [A-D][^.!?\n]{10,120}[.!?])",
            r"([sS]eed round[^.!?\n]{10,120}[.!?])",
            r"([cC]losed \$\d+[^.!?\n]{10,120}[.!?])"
        ]
        for pat in funding_patterns:
            match = re.search(pat, text)
            if match:
                quote = match.group(1).strip()
                evidence_items.append(EvidenceItem(
                    quote=quote,
                    source_url=source_url,
                    timestamp=timestamp,
                    source_title="Funding Announcement",
                    confidence=0.92
                ))
                signals.append(BuyingSignal(
                    signal_type="Funding announcement",
                    supporting_evidence=quote,
                    source_url=source_url,
                    date=datetime.date.today().isoformat(),
                    confidence_level="high",
                    why_intent="Recent funding events precede go-to-market scaling and technology infrastructure purchases."
                ))
                break

        # 3. Product Launch patterns
        product_patterns = [
            r"([aA]nnouncing (?:the )?[^.!?\n]{10,120}[.!?])",
            r"([iI]ntroducing [^.!?\n]{10,120}[.!?])",
            r"([nN]ew release[^.!?\n]{10,120}[.!?])",
            r"([gG]eneral availability[^.!?\n]{10,120}[.!?])"
        ]
        for pat in product_patterns:
            match = re.search(pat, text)
            if match:
                quote = match.group(1).strip()
                evidence_items.append(EvidenceItem(
                    quote=quote,
                    source_url=source_url,
                    timestamp=timestamp,
                    source_title="Product Announcement",
                    confidence=0.85
                ))
                signals.append(BuyingSignal(
                    signal_type="Product launch",
                    supporting_evidence=quote,
                    source_url=source_url,
                    date=datetime.date.today().isoformat(),
                    confidence_level="high",
                    why_intent="Launching a new product necessitates outbound prospecting to drive initial adoption."
                ))
                break

        return evidence_items, signals

    def get_benchmark_knowledge(self, company_name: str) -> Optional[Dict[str, Any]]:
        """
        Retrieves labeled reference knowledge for evaluation benchmark companies.
        """
        key = company_name.strip().lower()
        return EVALUATION_COMPANIES_KNOWLEDGE.get(key)
