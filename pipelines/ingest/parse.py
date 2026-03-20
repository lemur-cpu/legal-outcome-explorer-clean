"""Parse raw CourtListener JSON files into structured JSONL records."""

import json
import re
from pathlib import Path

from loguru import logger

RAW_DIR = Path("data/raw")
PROCESSED_DIR = Path("data/processed")
OUTPUT_FILE = PROCESSED_DIR / "parsed_cases.jsonl"

_TAG_RE = re.compile(r"<[^>]+>")


def strip_html(text: str) -> str:
    return _TAG_RE.sub(" ", text).strip()


def parse_year(date_str: str | None) -> int | None:
    if not date_str or len(date_str) < 4:
        return None
    try:
        return int(date_str[:4])
    except ValueError:
        return None


def parse_record(record: dict, source_court: str = "") -> dict | None:
    """Extract fields from a raw CourtListener opinion record.

    Returns None if the record should be filtered out.
    """
    case_id = str(record.get("id", ""))

    docket = record.get("docket") or {}
    docket_number = docket.get("docket_number", "") if isinstance(docket, dict) else ""

    court = record.get("court") or {}
    if isinstance(court, dict):
        court_name = court.get("name_abbreviation") or court.get("name_short", "")
    else:
        court_name = str(record.get("court_id", "")) or source_court

    # date_filed lives on the cluster in v4; fall back to date_created on the opinion
    year = parse_year(record.get("date_filed")) or parse_year(record.get("date_created"))

    plain = record.get("plain_text", "") or ""
    html = record.get("html_with_citations", "") or ""
    if plain:
        full_text = plain.strip()
    elif html:
        full_text = strip_html(html)
    else:
        full_text = ""

    token_count = len(full_text.split())

    return {
        "case_id": case_id,
        "docket_number": docket_number,
        "court": court_name,
        "year": year,
        "full_text": full_text,
        "token_count": token_count,
    }


def parse() -> None:
    PROCESSED_DIR.mkdir(parents=True, exist_ok=True)

    raw_files = sorted(RAW_DIR.glob("*.json"))
    if not raw_files:
        logger.warning(f"No JSON files found in {RAW_DIR}. Nothing to parse.")
        return

    logger.info(f"Found {len(raw_files)} raw file(s) in {RAW_DIR}.")

    total_parsed = 0
    filtered_empty = 0
    filtered_short = 0
    filtered_no_year = 0

    with OUTPUT_FILE.open("w") as out:
        for path in raw_files:
            try:
                records = json.loads(path.read_text())
            except json.JSONDecodeError as exc:
                logger.error(f"Failed to decode {path}: {exc}")
                continue

            # Derive court slug from filename (e.g. ca1_page_1.json → ca1)
            source_court = path.stem.split("_page_")[0] if "_page_" in path.stem else ""

            for raw in records:
                parsed = parse_record(raw, source_court=source_court)
                if parsed is None:
                    continue

                if not parsed["full_text"]:
                    filtered_empty += 1
                    continue

                if parsed["token_count"] < 100:
                    filtered_short += 1
                    continue

                if parsed["year"] is None:
                    filtered_no_year += 1
                    continue

                out.write(json.dumps(parsed) + "\n")
                total_parsed += 1

    total_filtered = filtered_empty + filtered_short + filtered_no_year
    logger.info(
        f"Parsing complete. "
        f"Saved: {total_parsed} | "
        f"Filtered: {total_filtered} "
        f"(empty text: {filtered_empty}, "
        f"<100 tokens: {filtered_short}, "
        f"no year: {filtered_no_year})"
    )
    logger.info(f"Output → {OUTPUT_FILE}")


if __name__ == "__main__":
    parse()
