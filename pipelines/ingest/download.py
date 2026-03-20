"""Download raw opinions from CourtListener API."""

import argparse
import json
import os
import time
from pathlib import Path

import httpx
from loguru import logger
from tqdm import tqdm

BASE_URL = "https://www.courtlistener.com/api/rest/v4/"
RAW_DIR = Path("data/raw")

CIRCUIT_COURTS = [
    "ca1", "ca2", "ca3", "ca4", "ca5",
    "ca6", "ca7", "ca8", "ca9", "ca10",
    "ca11", "cadc", "cafc",
]


def fetch_opinions(
    court: str,
    api_key: str,
    limit: int,
    output_dir: Path,
) -> int:
    """Fetch opinions for one court, saving each page as JSON.

    Returns the total number of records saved.
    """
    output_dir.mkdir(parents=True, exist_ok=True)

    headers = {"Authorization": f"Token {api_key}"}
    url: str | None = f"{BASE_URL}opinions/?court={court}&page_size=100"
    page = 1
    total_saved = 0

    with tqdm(desc=f"{court}", unit="page") as pbar:
        while url:
            response = httpx.get(url, headers=headers, timeout=30)
            response.raise_for_status()
            data = response.json()

            results = data.get("results", [])
            if not results:
                break

            out_path = output_dir / f"{court}_page_{page}.json"
            out_path.write_text(json.dumps(results, indent=2))

            total_saved += len(results)
            pbar.update(1)
            pbar.set_postfix(records=total_saved)
            logger.debug(f"{court} page {page}: saved {len(results)} records → {out_path}")

            if limit and total_saved >= limit:
                logger.info(f"{court}: reached sample limit ({limit}), stopping.")
                break

            url = data.get("next")
            page += 1

            time.sleep(0.5)  # respect rate limit

    return total_saved


def main() -> None:
    parser = argparse.ArgumentParser(description="Download CourtListener opinions.")
    parser.add_argument(
        "--sample",
        type=int,
        default=0,
        help="Max records per court (0 = full corpus).",
    )
    parser.add_argument(
        "--courts",
        nargs="+",
        default=CIRCUIT_COURTS,
        metavar="COURT",
        help="Court slugs to download (default: all circuit courts).",
    )
    args = parser.parse_args()

    api_key = os.environ.get("COURTLISTENER_API_KEY", "")
    if not api_key:
        logger.error("COURTLISTENER_API_KEY is not set. Aborting.")
        raise SystemExit(1)

    total = 0
    for court in args.courts:
        logger.info(f"Starting download: {court}")
        saved = fetch_opinions(
            court=court,
            api_key=api_key,
            limit=args.sample,
            output_dir=RAW_DIR,
        )
        logger.info(f"{court}: {saved} records saved.")
        total += saved

    logger.info(f"Download complete. Total records saved: {total}")


if __name__ == "__main__":
    main()
