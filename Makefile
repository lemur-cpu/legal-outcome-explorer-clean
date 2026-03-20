install:
	pip install -r requirements.txt

docker-up:
	docker compose up -d

docker-down:
	docker compose down

ingest-sample:
	python3 -m pipelines.ingest.download --sample 1000
	python3 -m pipelines.ingest.parse
	python3 -m pipelines.ingest.label

embed-sample:
	python3 -m pipelines.embed.batch_embed --limit 1000

train:
	python3 -m pipelines.train.build_features
	python3 -m pipelines.train.train_classifier
	python3 -m pipelines.train.evaluate

serve:
	uvicorn backend.api.main:app --reload --port 8000
