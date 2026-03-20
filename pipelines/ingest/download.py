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

MAX_RETRIES = 3
RETRY_WAIT = 2


def fetch_opinions(
    court: str,
    api_key: str,
    limit: int,
    output_dir: Path,
) -> int:
    """Fetch opinions for one court, saving each page as JSON.

    Returns the number of records saved, or -1 if the court should be skipped
    due to repeated failures.
    """
    output_dir.mkdir(parents=True, exist_ok=True)

    headers = {"Authorization": f"Token {api_key}"}
    url: str | None = f"{BASE_URL}opinions/?cluster__docket__court={court}&page_size=100"
    page = 1
    total_saved = 0

    with tqdm(desc=f"{court}", unit="page") as pbar:
        while url:
            response = None
            for attempt in range(1, MAX_RETRIES + 1):
                try:
                    response = httpx.get(url, headers=headers, timeout=30)
                    if response.status_code >= 500:
                        raise httpx.HTTPStatusError(
                            f"{response.status_code} Server Error",
                            request=response.request,
                            response=response,
                        )
                    response.raise_for_status()
                    break
                except httpx.ReadTimeout:
                    logger.warning(
                        f"{court} page {page}: ReadTimeout (attempt {attempt}/{MAX_RETRIES})"
                    )
                    if attempt < MAX_RETRIES:
                        time.sleep(RETRY_WAIT)
                    else:
                        logger.warning(f"{court}: all retries exhausted, skipping court.")
                        return total_saved
                except httpx.HTTPStatusError as exc:
                    if exc.response.status_code >= 500:
                        logger.warning(
                            f"{court} page {page}: {exc.response.status_code} (attempt {attempt}/{MAX_RETRIES})"
                        )
                        if attempt < MAX_RETRIES:
                            time.sleep(RETRY_WAIT)
                        else:
                            logger.warning(f"{court}: all retries exhausted, skipping court.")
                            return total_saved
                    else:
                        raise

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
                logger.info(f"{court}: reached per-court cap ({limit}), stopping.")
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
        default=100,
        help="Max total records across all courts (0 = full corpus).",
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
        if args.sample and total >= args.sample:
            logger.info(f"Total limit ({args.sample}) reached, stopping early.")
            break

        remaining = (args.sample - total) if args.sample else 0
        logger.info(f"Starting download: {court} (remaining budget: {remaining if args.sample else 'unlimited'})")
        saved = fetch_opinions(
            court=court,
            api_key=api_key,
            limit=remaining,
            output_dir=RAW_DIR,
        )
        logger.info(f"{court}: {saved} records saved.")
        total += saved

    logger.info(f"Download complete. Total records saved: {total}")


if __name__ == "__main__":
    main()
