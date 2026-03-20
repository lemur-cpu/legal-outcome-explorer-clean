"""Download raw opinions from CourtListener API."""

import argparse


def download(sample: int) -> None:
    pass


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--sample", type=int, default=1000)
    args = parser.parse_args()
    download(args.sample)
