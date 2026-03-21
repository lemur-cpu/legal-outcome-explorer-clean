import json
from collections import defaultdict
from pathlib import Path

from fastapi import APIRouter, HTTPException

router = APIRouter(tags=["analytics"])


@router.get("/analytics/outcomes")
def get_analytics():
    path = Path("data/processed/labeled_cases.jsonl")
    if not path.exists():
        raise HTTPException(404, "No labeled data found")

    cases = [json.loads(l) for l in path.read_text().splitlines()]

    total = len(cases)
    outcome_counts: dict = defaultdict(int)
    court_data: dict = defaultdict(lambda: {"affirmed": 0, "reversed": 0, "total": 0})
    year_data: dict = defaultdict(lambda: {"affirmed": 0, "reversed": 0, "remanded": 0})

    for c in cases:
        outcome = c.get("outcome", "unknown")
        court = c.get("court", "unknown")
        year = c.get("year", 0)
        outcome_counts[outcome] += 1
        court_data[court]["total"] += 1
        court_data[court][outcome] = court_data[court].get(outcome, 0) + 1
        if 1990 <= year <= 2026:
            year_data[year][outcome] = year_data[year].get(outcome, 0) + 1

    affirmed = outcome_counts.get("affirmed", 0)
    reversed_ = outcome_counts.get("reversed", 0)
    remanded = outcome_counts.get("remanded", 0)

    by_court = sorted(
        [
            {
                "court": court,
                "count": data["total"],
                "affirmed": data.get("affirmed", 0),
                "reversed": data.get("reversed", 0),
                "affirm_rate": round(data.get("affirmed", 0) / data["total"], 3)
                if data["total"] > 0
                else 0,
            }
            for court, data in court_data.items()
        ],
        key=lambda x: x["count"],
        reverse=True,
    )

    by_year = sorted(
        [
            {
                "year": year,
                "affirmed": data.get("affirmed", 0),
                "reversed": data.get("reversed", 0),
                "remanded": data.get("remanded", 0),
            }
            for year, data in year_data.items()
        ],
        key=lambda x: x["year"],
    )

    return {
        "total_cases": total,
        "affirmed": affirmed,
        "reversed": reversed_,
        "remanded": remanded,
        "affirm_rate": round(affirmed / total, 3) if total > 0 else 0,
        "by_court": by_court,
        "by_year": by_year,
    }
