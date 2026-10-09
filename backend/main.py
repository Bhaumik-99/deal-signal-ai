import datetime
from contextlib import asynccontextmanager
from typing import List, Optional
import sqlalchemy
from fastapi import FastAPI, Depends, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from backend.config import settings
from backend.database import engine, Base, get_db
from backend.models import Company, ResearchRun, Lead
from backend.schemas import (
    CompanyInput,
    AgentRunResponse,
    LeadScore,
    OutreachDraft,
    LeadItemResponse,
    LeadApprovalRequest,
    LeadDraftUpdateRequest,
    HealthResponse,
    BuyingSignal,
    EvidenceItem,
    TraceStep
)
from backend.security import validate_and_resolve_url
from backend.agent import BoundedResearchAgent
from backend.agent_engine import BoundedAgentStateMachine
from backend.research_tools import ResearchTools, EVALUATION_COMPANIES_KNOWLEDGE
from backend.llm_service import LLMService
from backend.eval.runner import eval_runner, RESULTS_DIR
from backend.eval.dataset import get_evaluation_dataset
from backend.services.global_prospector import (
    GlobalSearchCriteria,
    GlobalSearchResponse,
    GlobalProspectorService,
)

# Initialize database schema
Base.metadata.create_all(bind=engine)


@asynccontextmanager
async def lifespan(app: FastAPI):
    with next(get_db()) as db:
        seed_initial_leads(db)
    yield


app = FastAPI(
    title="DealSignal AI API",
    description="Evidence-led B2B Sales Intelligence and Bounded Research Agent Backend",
    version="1.0.0",
    lifespan=lifespan
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

agent = BoundedAgentStateMachine(max_iterations=3)
tools = ResearchTools()
llm_service = LLMService()


def seed_initial_leads(db: Session):
    """Seed benchmark evaluation leads if database table is empty."""
    if db.query(Lead).count() == 0:
        seed_data = [
            {
                "company_name": "Northstar Health",
                "domain": "northstarhealth.example",
                "initial": "N",
                "fit_score": 92,
                "status": "Draft ready",
                "signal_summary": "Hiring 12 engineers & VP RevOps",
                "detail": "Careers portal confirms 14 open roles across GTM and engineering.",
                "signal_type": "Hiring / team growth",
                "source_url": "https://example.com/northstar/careers",
                "outreach_subject": "Thought on Northstar Health's hiring expansion",
                "outreach_draft": "Hi Northstar Health team,\n\nI noticed your recent expansion in RevOps and engineering. As you scale commercial systems, keeping prospect intelligence accurate without manual friction is essential.\n\nDealSignal AI helps growth teams research target accounts with verified proof before outreach. Would a short conversation next week be helpful?\n\nBest,\nAlex",
                "is_approved": False
            },
            {
                "company_name": "Vertex Labs",
                "domain": "vertexlabs.example",
                "initial": "V",
                "fit_score": 87,
                "status": "Qualified",
                "signal_summary": "New market expansion (EMEA sovereign tier)",
                "detail": "Product launch announcement confirms European expansion and dedicated compliance tier.",
                "signal_type": "New market expansion",
                "source_url": "https://example.com/vertex/announcements/emea-launch",
                "outreach_subject": "European enterprise launch and account research",
                "outreach_draft": "Hi Vertex Labs team,\n\nCongratulations on launching your European sovereign tier. Expanding into new territories usually demands fresh account discovery and verification.\n\nWorth a brief chat to see how evidence-led prospecting can support this rollout?\n\nBest,\nAlex",
                "is_approved": False
            },
            {
                "company_name": "Fieldnote",
                "domain": "fieldnote.example",
                "initial": "F",
                "fit_score": 81,
                "status": "Review needed",
                "signal_summary": "Series A announcement ($18M closed)",
                "detail": "Closed $18M Series A to scale infrastructure enterprise sales.",
                "signal_type": "Funding announcement",
                "source_url": "https://example.com/fieldnote/press/series-a",
                "outreach_subject": "Series A milestone & sales operations",
                "outreach_draft": "Hi Fieldnote team,\n\nCongratulations on the $18M Series A round. As you accelerate outbound and build out enterprise pipeline, DealSignal provides verified context for each prospective conversation.\n\nWould 15 minutes next week be useful?\n\nBest,\nAlex",
                "is_approved": False
            },
            {
                "company_name": "Brightpath",
                "domain": "brightpath.example",
                "initial": "B",
                "fit_score": 78,
                "status": "Qualified",
                "signal_summary": "Enterprise Skills Cloud v3 launch",
                "detail": "Announced flagship Enterprise Skills Cloud with corporate HR analytics.",
                "signal_type": "Product launch",
                "source_url": "https://example.com/brightpath/blog/enterprise-skills-cloud",
                "outreach_subject": "Enterprise Skills Cloud v3 rollout",
                "outreach_draft": "Hi Brightpath team,\n\nSaw the release of Enterprise Skills Cloud v3. Launching a new enterprise offering often requires focused account identification.\n\nWould you be open to a brief conversation?\n\nBest,\nAlex",
                "is_approved": False
            },
            {
                "company_name": "Juniper Works",
                "domain": "juniperworks.example",
                "initial": "J",
                "fit_score": 72,
                "status": "Review needed",
                "signal_summary": "Head of Strategic Accounts recruiting",
                "detail": "Active recruiting for leadership role in strategic partnerships.",
                "signal_type": "Hiring / team growth",
                "source_url": "https://example.com/juniperworks/careers",
                "outreach_subject": "Strategic accounts expansion",
                "outreach_draft": "Hi Juniper Works team,\n\nNoticed your focus on strategic account growth. We help teams prioritize high-fit logistics accounts using verified triggers.\n\nWorth a brief discussion?\n\nBest,\nAlex",
                "is_approved": False
            }
        ]
        for item in seed_data:
            lead = Lead(**item)
            db.add(lead)
        db.commit()


@app.get("/api/health", response_model=HealthResponse)
def get_health(db: Session = Depends(get_db)):
    """Health check endpoint exposing system status, LLM configuration, and test mode status."""
    db_ok = True
    try:
        db.execute(sqlalchemy.text("SELECT 1"))
    except Exception:
        db_ok = False

    return HealthResponse(
        status="ok",
        environment=settings.ENVIRONMENT,
        llm_configured=settings.is_llm_configured,
        test_mode=settings.TEST_MODE or not settings.is_llm_configured,
        database_ok=db_ok,
        timestamp=datetime.datetime.now(datetime.timezone.utc).isoformat()
    )


@app.post("/api/research")
async def perform_research(payload: CompanyInput):
    """Targeted research endpoint to fetch company evidence and detect signals."""
    valid_url = None
    if payload.website:
        try:
            valid_url, _ = validate_and_resolve_url(payload.website)
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Invalid or restricted URL: {str(e)}")

    if valid_url:
        res = await tools.fetch_webpage(valid_url)
        if res.get("success"):
            ev, sig = tools.extract_factual_signals_from_text(
                payload.name, res.get("extracted_text", ""), valid_url, res.get("timestamp")
            )
            return {
                "company_name": payload.name,
                "website": valid_url,
                "evidence": [e.model_dump() for e in ev],
                "signals": [s.model_dump() for s in sig],
                "raw_title": res.get("title")
            }

    # Fallback to benchmark knowledge
    bench = tools.get_benchmark_knowledge(payload.name)
    if bench:
        return {
            "company_name": payload.name,
            "website": bench.get("domain"),
            "evidence": [{"quote": s["supporting_evidence"], "source_url": s["source_url"]} for s in bench.get("signals", [])],
            "signals": bench.get("signals", []),
            "raw_title": f"{payload.name} (Benchmark)"
        }

    return {
        "company_name": payload.name,
        "website": payload.website,
        "evidence": [],
        "signals": [],
        "raw_title": payload.name
    }


@app.post("/api/score", response_model=LeadScore)
async def score_lead(payload: CompanyInput):
    """Scores a lead against ICP using explicit multi-factor scoring rubric."""
    bench = tools.get_benchmark_knowledge(payload.name)
    signals = []
    evidence = []
    if bench:
        from backend.schemas import BuyingSignal, EvidenceItem
        for s in bench.get("signals", []):
            signals.append(BuyingSignal(**s))
            evidence.append(EvidenceItem(
                quote=s["supporting_evidence"],
                source_url=s["source_url"],
                timestamp=datetime.datetime.now(datetime.timezone.utc).isoformat(),
                source_title=s["signal_type"],
                confidence=0.9
            ))

    score = await llm_service.analyze_and_score(
        company_name=payload.name,
        icp=payload.icp,
        target_industry=payload.target_industry,
        desired_size=payload.desired_company_size,
        company_industry=bench.get("industry") if bench else payload.target_industry,
        company_size=bench.get("size") if bench else payload.desired_company_size,
        evidence_items=evidence,
        signals=signals
    )
    return score


@app.post("/api/outreach", response_model=OutreachDraft)
async def generate_outreach(payload: CompanyInput):
    """Generates an evidence-grounded outreach email draft."""
    bench = tools.get_benchmark_knowledge(payload.name)
    signals = []
    evidence = []
    if bench:
        from backend.schemas import BuyingSignal, EvidenceItem
        for s in bench.get("signals", []):
            signals.append(BuyingSignal(**s))
            evidence.append(EvidenceItem(
                quote=s["supporting_evidence"],
                source_url=s["source_url"],
                timestamp=datetime.datetime.now(datetime.timezone.utc).isoformat(),
                source_title=s["signal_type"],
                confidence=0.9
            ))

    draft = await llm_service.generate_outreach(
        company_name=payload.name,
        product_offer=payload.product_offer or "AI sales intelligence",
        signals=signals,
        evidence_items=evidence
    )
    return draft


@app.post("/api/agent/run", response_model=AgentRunResponse)
async def run_agent(payload: CompanyInput, db: Session = Depends(get_db)):
    """
    Executes the full bounded agentic research workflow:
    Input -> Bounded Research Loop -> Evidence Verification -> Lead Scoring -> Outreach Draft -> Execution Trace.
    """
    try:
        run_result = await agent.run(payload)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Agent execution encountered an unhandled error: {str(e)}")

    # Persist the run
    run_record = ResearchRun(
        id=run_result.run_id,
        company_name=run_result.company_name,
        domain=run_result.domain,
        input_brief=payload.model_dump(),
        status="completed",
        fit_score=run_result.fit_score,
        score_details=run_result.lead_score_details.model_dump(),
        buying_signals=[s.model_dump() for s in run_result.buying_signals],
        evidence_items=[e.model_dump() for e in run_result.evidence_items],
        outreach_draft=run_result.outreach_draft.model_dump(),
        execution_trace=[t.model_dump() for t in run_result.execution_trace],
        is_simulated=run_result.is_simulated,
        mode=run_result.mode
    )
    db.add(run_record)

    # Automatically save / update as a lead in workspace
    primary_sig = run_result.buying_signals[0] if run_result.buying_signals else None
    existing_lead = db.query(Lead).filter(Lead.company_name.ilike(run_result.company_name)).first()
    if existing_lead:
        existing_lead.fit_score = run_result.fit_score
        existing_lead.signal_summary = primary_sig.signal_type if primary_sig else "Researched prospect"
        existing_lead.detail = primary_sig.supporting_evidence if primary_sig else "Direct research completed."
        existing_lead.signal_type = primary_sig.signal_type if primary_sig else payload.signals_to_investigate
        existing_lead.source_url = primary_sig.source_url if primary_sig else payload.website
        existing_lead.outreach_subject = run_result.outreach_draft.subject
        existing_lead.outreach_draft = run_result.outreach_draft.body
        existing_lead.status = "Draft ready"
    else:
        new_lead = Lead(
            run_id=run_result.run_id,
            company_name=run_result.company_name,
            domain=run_result.domain,
            initial=run_result.company_name[0].upper() if run_result.company_name else "C",
            fit_score=run_result.fit_score,
            status="Draft ready",
            signal_summary=primary_sig.signal_type if primary_sig else "Researched prospect",
            detail=primary_sig.supporting_evidence if primary_sig else "Direct research completed.",
            signal_type=primary_sig.signal_type if primary_sig else payload.signals_to_investigate,
            source_url=primary_sig.source_url if primary_sig else payload.website,
            outreach_subject=run_result.outreach_draft.subject,
            outreach_draft=run_result.outreach_draft.body,
            is_approved=False
        )
        db.add(new_lead)

    # Also update or insert Company entity
    existing_company = db.query(Company).filter(Company.name.ilike(run_result.company_name)).first()
    if not existing_company:
        new_company = Company(
            name=run_result.company_name,
            domain=run_result.domain,
            website=payload.website,
            industry=payload.target_industry,
            size=payload.desired_company_size
        )
        db.add(new_company)

    db.commit()
    return run_result


@app.get("/api/companies")
def list_companies(db: Session = Depends(get_db)):
    """List researched companies and historical leads."""
    leads = db.query(Lead).order_by(Lead.id.desc()).all()
    return [
        {
            "id": l.id,
            "name": l.company_name,
            "domain": l.domain,
            "initial": l.initial,
            "signal": l.signal_summary,
            "detail": l.detail,
            "score": l.fit_score,
            "status": l.status,
            "type": l.signal_type,
            "source": l.source_url,
            "is_approved": l.is_approved
        }
        for l in leads
    ]


@app.get("/api/leads", response_model=List[LeadItemResponse])
def get_leads(
    search: Optional[str] = Query(None, description="Search term"),
    filter_score: Optional[str] = Query("all", description="all, high (>=80), medium (60-79)"),
    db: Session = Depends(get_db)
):
    """Retrieve filtered leads for workspace."""
    query = db.query(Lead)
    if search:
        s = f"%{search.strip().lower()}%"
        query = query.filter((Lead.company_name.ilike(s)) | (Lead.signal_summary.ilike(s)))
    if filter_score == "high":
        query = query.filter(Lead.fit_score >= 80)
    elif filter_score == "medium":
        query = query.filter(Lead.fit_score >= 60, Lead.fit_score < 80)

    leads = query.order_by(Lead.id.desc()).all()
    return [
        LeadItemResponse(
            id=l.id,
            run_id=l.run_id,
            name=l.company_name,
            domain=l.domain,
            initial=l.initial or l.company_name[0].upper(),
            signal=l.signal_summary or "Active prospect",
            detail=l.detail,
            score=l.fit_score,
            status=l.status,
            type=l.signal_type,
            source=l.source_url,
            outreach_subject=l.outreach_subject,
            outreach_draft=l.outreach_draft,
            is_approved=l.is_approved
        )
        for l in leads
    ]


@app.get("/api/runs/{run_id}", response_model=AgentRunResponse)
def get_run(run_id: str, db: Session = Depends(get_db)):
    """Fetch stored research run and full execution trace."""
    run = db.query(ResearchRun).filter(ResearchRun.id == run_id).first()
    if not run:
        raise HTTPException(status_code=404, detail=f"Run '{run_id}' not found.")

    return AgentRunResponse(
        run_id=run.id,
        company_name=run.company_name,
        domain=run.domain,
        fit_score=run.fit_score or 70,
        lead_score_details=LeadScore(**run.score_details),
        buying_signals=[BuyingSignal(**s) for s in (run.buying_signals or [])],
        evidence_items=[EvidenceItem(**e) for e in (run.evidence_items or [])],
        outreach_draft=OutreachDraft(**run.outreach_draft),
        execution_trace=[TraceStep(**t) for t in (run.execution_trace or [])],
        is_simulated=run.is_simulated,
        mode=run.mode,
        created_at=run.created_at.isoformat() + "Z"
    )


@app.post("/api/leads/{lead_id}/approve")
def approve_lead_outreach(lead_id: int, payload: LeadApprovalRequest, db: Session = Depends(get_db)):
    """Mark outreach draft as human-approved."""
    lead = db.query(Lead).filter(Lead.id == lead_id).first()
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")
    lead.is_approved = payload.approved
    lead.status = "Approved draft" if payload.approved else "Review needed"
    db.commit()
    return {"success": True, "lead_id": lead.id, "status": lead.status, "is_approved": lead.is_approved}


@app.patch("/api/leads/{lead_id}/draft")
def update_lead_draft(lead_id: int, payload: LeadDraftUpdateRequest, db: Session = Depends(get_db)):
    """Update outreach draft following human editing."""
    lead = db.query(Lead).filter(Lead.id == lead_id).first()
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")
    lead.outreach_draft = payload.draft
    db.commit()
    return {"success": True, "lead_id": lead.id, "updated": True}


# ================== AI EVALUATION LAB ENDPOINTS ==================

@app.get("/api/eval/latest")
def get_latest_evaluation():
    """Returns the most recent baseline vs improved agent benchmark evaluation comparison."""
    import os
    import json
    latest_path = os.path.join(RESULTS_DIR, "eval_latest.json")
    if os.path.exists(latest_path):
        try:
            with open(latest_path, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Failed to read evaluation artifacts: {str(e)}")

    return {
        "status": "not_executed",
        "message": "No evaluation run recorded yet. Trigger POST /api/eval/run to benchmark."
    }


@app.get("/api/eval/dataset")
def get_eval_dataset():
    """Returns the 30-company evaluation dataset with ground truth labels."""
    cases = get_evaluation_dataset()
    return {
        "dataset_size": len(cases),
        "cases": [c.model_dump() for c in cases]
    }


@app.post("/api/eval/run")
async def run_evaluation_benchmark():
    """Executes the full 30-case evaluation benchmark comparing Baseline vs Improved Agent."""
    try:
        results = await eval_runner.run_full_evaluation()
        return results
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Evaluation execution failed: {str(e)}")


# ================== GLOBAL REAL-TIME INTERNET PROSPECTOR ==================

@app.post("/api/prospects/search", response_model=GlobalSearchResponse)
async def search_global_prospects(criteria: GlobalSearchCriteria):
    """
    Search prospective B2B companies across the internet in real time
    strictly guided by mandatory search criteria with zero pre-loaded data.
    """
    try:
        return GlobalProspectorService.search_internet(criteria)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Global prospect search failed: {str(e)}")


