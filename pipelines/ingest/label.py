"""Assign outcome labels to parsed cases using pattern matching."""

import json
import re
from pathlib import Path

from loguru import logger

PROCESSED_DIR = Path("data/processed")
INPUT_FILE = PROCESSED_DIR / "parsed_cases.jsonl"
OUTPUT_FILE = PROCESSED_DIR / "labeled_cases.jsonl"

# ---------------------------------------------------------------------------
# Patterns (re.search against first 800 chars, lowercased)
# ---------------------------------------------------------------------------

AFFIRMED_PATTERNS = [
    r'\bwe affirm\b',
    r'\baffirm the judgment\b',
    r'\baffirm the district court\b',
    r'\baffirmed\b',
    r'\baffirmance\b',
    r'\bwe therefore affirm\b',
    r'\baccordingly.*affirm\b',
]

REVERSED_PATTERNS = [
    r'\bwe reverse\b',
    r'\breverse the judgment\b',
    r'\breverse the district court\b',
    r'\breversed\b',
    r'\bwe therefore reverse\b',
    r'\breversed and remanded\b',
]

REMANDED_PATTERNS = [
    r'\bwe remand\b',
    r'\bremanded\b',
    r'\bvacate and remand\b',
    r'\bvacate the judgment and remand\b',
    r'\bvacated and remanded\b',
    r'\bvacate\b',
]


def _count_matches(text: str, patterns: list[str]) -> int:
    return sum(1 for p in patterns if re.search(p, text))


def extract_label(full_text: str) -> tuple[str, float]:
    """Return (label, confidence) for a case based on its text.

    Searches the first 3000 chars plus last 1000 chars, lowercased.
    Priority: affirmed > reversed > remanded.
    Gerund non-dispositional forms (e.g. 'affirming her ineligibility')
    do not match because affirm patterns require 'we', 'judgment', or
    'district court' as anchors, or the past-tense standalone 'affirmed'.
    """
    head = (full_text[:3000] + " " + full_text[-1000:]).lower()
    head_short = full_text[:800].lower()

    affirmed_hits = _count_matches(head, AFFIRMED_PATTERNS)
    reversed_hits = _count_matches(head, REVERSED_PATTERNS)
    remanded_hits = _count_matches(head, REMANDED_PATTERNS)

    # Determine primary label
    if affirmed_hits > 0 and affirmed_hits >= reversed_hits:
        label = "affirmed"
        hits = affirmed_hits
        early = _count_matches(head_short, AFFIRMED_PATTERNS) > 0
    elif reversed_hits > 0:
        label = "reversed"
        hits = reversed_hits
        early = _count_matches(head_short, REVERSED_PATTERNS) > 0
    elif remanded_hits > 0:
        label = "remanded"
        hits = remanded_hits
        early = _count_matches(head_short, REMANDED_PATTERNS) > 0
    else:
        return "unknown", 0.0

    confidence = 1.0 if hits > 1 else 0.8
    if early:
        confidence = min(1.0, confidence + 0.1)

    return label, round(confidence, 2)


def label() -> None:
    if not INPUT_FILE.exists():
        logger.error(f"Input file not found: {INPUT_FILE}. Run parse.py first.")
        raise SystemExit(1)

    PROCESSED_DIR.mkdir(parents=True, exist_ok=True)

    counts: dict[str, int] = {"affirmed": 0, "reversed": 0, "remanded": 0, "unknown": 0}
    confidence_sum = 0.0
    labeled_total = 0
    dropped = 0

    with INPUT_FILE.open() as inp, OUTPUT_FILE.open("w") as out:
        for line in inp:
            line = line.strip()
            if not line:
                continue

            record = json.loads(line)
            outcome, confidence = extract_label(record.get("full_text", ""))

            counts[outcome] = counts.get(outcome, 0) + 1

            if outcome == "unknown":
                dropped += 1
                continue

            record["outcome"] = outcome
            record["label_confidence"] = confidence
            out.write(json.dumps(record) + "\n")

            confidence_sum += confidence
            labeled_total += 1

    mean_conf = round(confidence_sum / labeled_total, 3) if labeled_total else 0.0

    logger.info(
        f"\n{'─' * 40}\n"
        f"Labeling complete\n"
        f"  Total labeled : {labeled_total}\n"
        f"  Affirmed      : {counts['affirmed']}\n"
        f"  Reversed      : {counts['reversed']}\n"
        f"  Remanded      : {counts['remanded']}\n"
        f"  Mean confidence: {mean_conf}\n"
        f"  Dropped (unknown): {dropped}\n"
        f"{'─' * 40}"
    )
    logger.info(f"Output → {OUTPUT_FILE}")


if __name__ == "__main__":
    label()
