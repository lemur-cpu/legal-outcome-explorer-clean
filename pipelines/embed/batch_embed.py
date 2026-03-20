"""Batch-embed parsed cases and upsert vectors into Qdrant."""

import argparse


def batch_embed(limit: int) -> None:
    pass


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--limit", type=int, default=1000)
    args = parser.parse_args()
    batch_embed(args.limit)
