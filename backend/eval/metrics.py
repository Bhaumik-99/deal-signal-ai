import math
from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field


class EvaluationMetricsSummary(BaseModel):
    # Research Quality
    fact_extraction_accuracy: float = 0.0
    evidence_support_rate: float = 0.0
    source_url_validity_rate: float = 0.0
    buying_signal_precision: float = 0.0

    # Lead Qualification
    precision_at_5: float = 0.0
    ndcg_at_5: float = 0.0
    prospect_agreement_rate: float = 0.0

    # Outreach Quality
    factual_claim_support_rate: float = 0.0
    unsupported_claim_rate: float = 0.0
    relevance_rubric_score: float = 0.0

    # Operational Reliability
    task_success_rate: float = 0.0
    tool_call_success_rate: float = 0.0
    average_retries: float = 0.0
    average_latency_ms: float = 0.0
    total_token_usage: int = 0
    total_cost_usd: float = 0.0

    # Sample counts
    total_cases_evaluated: int = 0


def calculate_dcg_at_k(relevance_scores: List[int], k: int = 5) -> float:
    """
    Computes Discounted Cumulative Gain at rank K.
    DCG@K = sum_{i=1}^K (2^{rel_i} - 1) / log2(i + 1)
    """
    dcg = 0.0
    for i, rel in enumerate(relevance_scores[:k]):
        dcg += (2.0 ** rel - 1.0) / math.log2(i + 2.0)
    return dcg


def calculate_ndcg_at_k(relevance_scores: List[int], k: int = 5) -> float:
    """
    Computes Normalized Discounted Cumulative Gain at rank K.
    NDCG@K = DCG@K / IDCG@K
    """
    if not relevance_scores:
        return 0.0

    actual_dcg = calculate_dcg_at_k(relevance_scores, k)
    ideal_scores = sorted(relevance_scores, reverse=True)
    ideal_dcg = calculate_dcg_at_k(ideal_scores, k)

    if ideal_dcg <= 0.0:
        return 0.0

    return round(actual_dcg / ideal_dcg, 4)


def calculate_precision_at_k(binary_relevances: List[bool], k: int = 5) -> float:
    """
    Computes Precision@K: fraction of top K items that are relevant.
    """
    if not binary_relevances:
        return 0.0
    top_k = binary_relevances[:k]
    if not top_k:
        return 0.0
    return round(sum(1 for x in top_k if x) / len(top_k), 4)


def compute_aggregate_metrics(case_results: List[Dict[str, Any]]) -> EvaluationMetricsSummary:
    """
    Aggregates individual case evaluation records into standard evaluation metrics.
    """
    if not case_results:
        return EvaluationMetricsSummary()

    n = len(case_results)

    # 1. Research Quality
    fact_accuracies = [c.get("fact_extraction_accuracy", 0.0) for c in case_results]
    evidence_support_rates = [c.get("evidence_support_rate", 0.0) for c in case_results]
    url_validity_rates = [c.get("source_url_validity_rate", 0.0) for c in case_results]
    signal_precisions = [c.get("buying_signal_precision", 0.0) for c in case_results]

    avg_fact_acc = sum(fact_accuracies) / n
    avg_ev_support = sum(evidence_support_rates) / n
    avg_url_val = sum(url_validity_rates) / n
    avg_sig_prec = sum(signal_precisions) / n

    # 2. Ranking & Qualification
    # Sort results by agent predicted fit_score descending to calculate P@5 and NDCG@5
    sorted_by_score = sorted(case_results, key=lambda x: x.get("predicted_fit_score", 0), reverse=True)
    binary_qualified = [c.get("ground_truth_qualified", False) for c in sorted_by_score]
    graded_relevance = [c.get("ground_truth_relevance_grade", 0) for c in sorted_by_score]

    p_at_5 = calculate_precision_at_k(binary_qualified, k=5)
    ndcg_at_5 = calculate_ndcg_at_k(graded_relevance, k=5)

    agreements = [
        1.0 if (c.get("predicted_fit_score", 0) >= 60) == c.get("ground_truth_qualified", False) else 0.0
        for c in case_results
    ]
    avg_agreement = sum(agreements) / n

    # 3. Outreach Quality
    outreach_support_rates = [c.get("outreach_claim_support_rate", 0.0) for c in case_results]
    unsupported_rates = [c.get("unsupported_claim_rate", 0.0) for c in case_results]
    relevance_scores = [c.get("outreach_relevance_score", 0.0) for c in case_results]

    avg_outreach_supp = sum(outreach_support_rates) / n
    avg_unsupp = sum(unsupported_rates) / n
    avg_rel_score = sum(relevance_scores) / n

    # 4. Operational Reliability
    task_successes = [1.0 if c.get("task_success", True) else 0.0 for c in case_results]
    tool_success_rates = [c.get("tool_call_success_rate", 1.0) for c in case_results]
    retries = [c.get("retry_count", 0) for c in case_results]
    latencies = [c.get("latency_ms", 0) for c in case_results]
    tokens = sum(c.get("tokens_used", 0) for c in case_results)
    costs = sum(c.get("cost_usd", 0.0) for c in case_results)

    return EvaluationMetricsSummary(
        fact_extraction_accuracy=round(avg_fact_acc, 3),
        evidence_support_rate=round(avg_ev_support, 3),
        source_url_validity_rate=round(avg_url_val, 3),
        buying_signal_precision=round(avg_sig_prec, 3),
        precision_at_5=p_at_5,
        ndcg_at_5=ndcg_at_5,
        prospect_agreement_rate=round(avg_agreement, 3),
        factual_claim_support_rate=round(avg_outreach_supp, 3),
        unsupported_claim_rate=round(avg_unsupp, 3),
        relevance_rubric_score=round(avg_rel_score, 2),
        task_success_rate=round(sum(task_successes) / n, 3),
        tool_call_success_rate=round(sum(tool_success_rates) / n, 3),
        average_retries=round(sum(retries) / n, 2),
        average_latency_ms=round(sum(latencies) / n, 1),
        total_token_usage=tokens,
        total_cost_usd=round(costs, 4),
        total_cases_evaluated=n
    )
