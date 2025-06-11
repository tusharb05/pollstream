up:
	docker-compose -f infra/docker-compose.yml up --build

poll-makemigrations:
	docker-compose -f infra/docker-compose.yml exec poll_service python manage.py makemigrations

poll-migrate:
	docker-compose -f infra/docker-compose.yml exec poll_service python manage.py migrate
