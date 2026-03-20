install:
	pip install -r requirements.txt

docker-up:
	docker compose up -d

docker-down:
	docker compose down

ingest-sample:
	python -m pipelines.ingest.download --sample 1000
	python -m pipelines.ingest.parse
	python -m pipelines.ingest.label

embed-sample:
	python -m pipelines.embed.batch_embed --limit 1000

train:
	python -m pipelines.train.build_features
	python -m pipelines.train.train_classifier
	python -m pipelines.train.evaluate

serve:
	uvicorn backend.api.main:app --reload --port 8000
