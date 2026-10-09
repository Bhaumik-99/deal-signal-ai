import pytest
from backend.agent import BoundedResearchAgent
from backend.schemas import CompanyInput

# Evaluation dataset of 5 distinct B2B companies across industries and signal types
EVALUATION_DATASET = [
    {
        "name": "Northstar Health",
        "website": "https://example.com/northstar/careers",
        "icp": "Mid-market B2B healthcare technology company growing sales operations.",
        "target_industry": "Healthcare Technology",
        "desired_company_size": "250-500 employees",
        "signals_to_investigate": "Hiring / team growth",
        "expected_min_score": 75,
        "verified_evidence_keyword": "VP Revenue Operations"
    },
    {
        "name": "Vertex Labs",
        "website": "https://example.com/vertex/announcements/emea-launch",
        "icp": "High-growth enterprise cloud and AI infrastructure provider expanding into Europe.",
        "target_industry": "AI Infrastructure & Cloud",
        "desired_company_size": "100-250 employees",
        "signals_to_investigate": "New market expansion",
        "expected_min_score": 70,
        "verified_evidence_keyword": "European data sovereignty"
    },
    {
        "name": "Fieldnote",
        "website": "https://example.com/fieldnote/press/series-a",
        "icp": "Post-Series A B2B software team looking to scale outbound.",
        "target_industry": "Field Operations Software",
        "desired_company_size": "50-100 employees",
        "signals_to_investigate": "Funding announcement",
        "expected_min_score": 70,
        "verified_evidence_keyword": "Series A"
    },
    {
        "name": "Brightpath",
        "website": "https://example.com/brightpath/blog/enterprise-skills-cloud",
        "icp": "Corporate HR technology and enterprise learning company launching new platforms.",
        "target_industry": "EdTech & Workforce Readiness",
        "desired_company_size": "150-300 employees",
        "signals_to_investigate": "Product launch",
        "expected_min_score": 65,
        "verified_evidence_keyword": "Enterprise Skills Cloud"
    },
    {
        "name": "Juniper Works",
        "website": "https://example.com/juniperworks/careers",
        "icp": "Mid-market supply chain platform expanding commercial partnerships.",
        "target_industry": "Supply Chain & Logistics",
        "desired_company_size": "80-150 employees",
        "signals_to_investigate": "Hiring / team growth",
        "expected_min_score": 65,
        "verified_evidence_keyword": "Head of Enterprise Partnerships"
    }
]


@pytest.mark.asyncio
async def test_evaluation_dataset_verification():
    agent = BoundedResearchAgent()

    for item in EVALUATION_DATASET:
        company_input = CompanyInput(
            name=item["name"],
            website=item["website"],
            icp=item["icp"],
            target_industry=item["target_industry"],
            desired_company_size=item["desired_company_size"],
            signals_to_investigate=item["signals_to_investigate"]
        )

        result = await agent.run(company_input)

        # 1. Verification of Lead Score Boundaries
        assert 0 <= result.fit_score <= 100
        assert result.fit_score >= item["expected_min_score"], (
            f"Score for {item['name']} ({result.fit_score}) was below expected min {item['expected_min_score']}"
        )

        # 2. Evidence Verification (no hallucinations)
        all_evidence_text = " ".join([e.quote for e in result.evidence_items] + [s.supporting_evidence for s in result.buying_signals])
        assert item["verified_evidence_keyword"].lower() in all_evidence_text.lower(), (
            f"Expected verified keyword '{item['verified_evidence_keyword']}' not found in {item['name']} evidence."
        )

        # 3. Transparent Execution Trace
        assert len(result.execution_trace) >= 4
        assert any(t.step_name == "Human Approval Gate" for t in result.execution_trace)

        # 4. Outreach Grounding
        assert len(result.outreach_draft.body) > 50
        assert result.company_name in result.outreach_draft.body
