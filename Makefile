network:
	docker network create qapline

postgres:
	docker run --name adminer --network qapline --link some_database:qapline -p 8080:8080 adminer > /dev/null 2>&1 & 
	docker run --name pg --network qapline -p 5432:5432 -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=postgres -d postgres:14-alpine

createdb:
	while ! docker exec -it pg createdb --username=postgres --owner=postgres qapline 2>/dev/null 1>/dev/null; do sleep 0.5; done

dropdb:
	docker exec pg psql -U postgres -c 'drop database qapline'

createdotenv:
	echo "DATABASE_URL='postgresql://postgres:postgres@localhost:5432/qapline?schema=public'" > .env

clean: 
	docker stop pg && docker rm pg
	docker stop adminer && docker rm adminer
	rm -f .env
	docker network rm qapline

pull: 
	npx prisma db pull
	npx prisma generate

push:
	npx prisma db push
	# npx prisma generate

buildTrigger:
	gcloud config set project qapline
	gcloud builds submit --substitutions=BRANCH_NAME=dev --config=./cloudbuild.yaml .

all: network postgres createdb createdotenv