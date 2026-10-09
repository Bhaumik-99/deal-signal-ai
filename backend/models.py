import datetime
from sqlalchemy import Column, Integer, String, Text, DateTime, JSON, Boolean, Float
from backend.database import Base


def utcnow():
    return datetime.datetime.now(datetime.timezone.utc)


class Company(Base):
    __tablename__ = "companies"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), index=True, nullable=False)
    domain = Column(String(255), index=True, nullable=True)
    website = Column(String(512), nullable=True)
    industry = Column(String(255), nullable=True)
    size = Column(String(100), nullable=True)
    created_at = Column(DateTime, default=utcnow)
    updated_at = Column(DateTime, default=utcnow, onupdate=utcnow)


class ResearchRun(Base):
    __tablename__ = "research_runs"

    id = Column(String(64), primary_key=True, index=True)
    company_name = Column(String(255), index=True, nullable=False)
    domain = Column(String(255), nullable=True)
    input_brief = Column(JSON, nullable=False)
    status = Column(String(50), default="completed")  # completed, failed, running
    fit_score = Column(Integer, nullable=True)
    score_details = Column(JSON, nullable=True)
    buying_signals = Column(JSON, nullable=True)
    evidence_items = Column(JSON, nullable=True)
    outreach_draft = Column(JSON, nullable=True)
    execution_trace = Column(JSON, nullable=True)
    is_simulated = Column(Boolean, default=False)
    mode = Column(String(50), default="live")  # live, deterministic_test, fallback
    error_message = Column(Text, nullable=True)
    created_at = Column(DateTime, default=utcnow)


class Lead(Base):
    __tablename__ = "leads"

    id = Column(Integer, primary_key=True, index=True)
    run_id = Column(String(64), index=True, nullable=True)
    company_name = Column(String(255), index=True, nullable=False)
    domain = Column(String(255), nullable=True)
    initial = Column(String(5), default="C")
    fit_score = Column(Integer, default=70)
    status = Column(String(50), default="Draft ready")  # Draft ready, Qualified, Review needed, Approved draft
    signal_summary = Column(String(512), nullable=True)
    detail = Column(Text, nullable=True)
    signal_type = Column(String(100), nullable=True)
    source_url = Column(String(512), nullable=True)
    outreach_subject = Column(String(255), nullable=True)
    outreach_draft = Column(Text, nullable=True)
    is_approved = Column(Boolean, default=False)
    created_at = Column(DateTime, default=utcnow)
    updated_at = Column(DateTime, default=utcnow, onupdate=utcnow)
