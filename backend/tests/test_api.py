import pytest


def test_health_check(client):
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert "environment" in data
    assert "database_ok" in data
    assert data["database_ok"] is True


def test_validation_empty_company_name(client):
    response = client.post("/api/research", json={"name": "   "})
    assert response.status_code == 422  # Pydantic validation error


def test_research_endpoint(client):
    payload = {
        "name": "Northstar Health",
        "website": "https://example.com/company-news",
        "icp": "Mid-market B2B SaaS companies"
    }
    response = client.post("/api/research", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["company_name"] == "Northstar Health"
    assert "signals" in data
    assert "evidence" in data


def test_score_endpoint_boundaries(client):
    payload = {
        "name": "Fieldnote",
        "icp": "Growing enterprise teams with Series A funding",
        "signals_to_investigate": "Funding announcement"
    }
    response = client.post("/api/score", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert 0 <= data["overall_score"] <= 100
    assert 0 <= data["icp_fit_score"] <= 40
    assert 0 <= data["size_industry_fit_score"] <= 20
    assert 0 <= data["signal_relevance_score"] <= 25
    assert 0 <= data["evidence_quality_score"] <= 15
    assert 0 <= data["uncertainty_deduction"] <= 30
    assert len(data["rationale"]) > 10


def test_outreach_endpoint(client):
    payload = {
        "name": "Vertex Labs",
        "product_offer": "Sales intelligence automation"
    }
    response = client.post("/api/outreach", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "subject" in data
    assert "body" in data
    assert "Vertex Labs" in data["body"]
    assert "Alex Smith" in data["body"]


def test_agent_run_workflow(client):
    payload = {
        "name": "Northstar Health",
        "website": "https://example.com/northstar/careers",
        "icp": "Healthcare networks expanding clinical operations and hiring revenue teams",
        "signals_to_investigate": "Hiring / team growth",
        "product_offer": "AI sales intelligence platform"
    }
    response = client.post("/api/agent/run", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "run_id" in data
    assert data["company_name"] == "Northstar Health"
    assert 0 <= data["fit_score"] <= 100
    assert len(data["execution_trace"]) >= 4

    # Verify transparent trace format
    trace = data["execution_trace"]
    for step in trace:
        assert "step_name" in step
        assert "tool_used" in step
        assert "decision_summary" in step
        assert "status" in step

    # Verify run retrieval via GET /api/runs/{run_id}
    run_id = data["run_id"]
    get_run_res = client.get(f"/api/runs/{run_id}")
    assert get_run_res.status_code == 200
    assert get_run_res.json()["run_id"] == run_id


def test_lead_approval_and_draft_update(client):
    # Fetch leads
    leads_res = client.get("/api/leads")
    assert leads_res.status_code == 200
    leads = leads_res.json()
    assert len(leads) > 0
    target_id = leads[0]["id"]

    # Approve draft
    appr_res = client.post(f"/api/leads/{target_id}/approve", json={"approved": True})
    assert appr_res.status_code == 200
    assert appr_res.json()["is_approved"] is True
    assert appr_res.json()["status"] == "Approved draft"

    # Edit draft
    new_text = "Customized B2B outreach draft edited by sales rep."
    draft_res = client.patch(f"/api/leads/{target_id}/draft", json={"draft": new_text})
    assert draft_res.status_code == 200
    assert draft_res.json()["updated"] is True


def test_global_prospect_search_validation(client):
    # Missing mandatory fields should fail validation with 422
    invalid_res = client.post("/api/prospects/search", json={"sector": "b2b_saas"})
    assert invalid_res.status_code == 422


def test_global_prospect_search_success(client):
    payload = {
        "sector": "fintech",
        "company_size": "500-2000",
        "approx_revenue": "200M+",
        "region": "North America (US & Canada)",
        "buying_signal": "all_signals",
        "target_role": "VP / Head of Sales & Revenue Operations"
    }
    res = client.post("/api/prospects/search", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert data["total_found"] > 0
    assert len(data["results"]) > 0
    assert "Crawler" in data["scraping_engine"] or "Stealth" in data["scraping_engine"]
    first = data["results"][0]
    assert "company_name" in first
    assert "domain" in first
    assert "fit_score" in first
    assert "evidence_excerpt" in first
    assert 0 <= first["fit_score"] <= 100

