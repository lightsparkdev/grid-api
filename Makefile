.PHONY: install build build-openapi mint lint lint-openapi lint-markdown

install:
	npm install
	npm i -g mint

build:
	npm run build:openapi

build-openapi:
	npm run build:openapi

mint:
	cd mintlify && mint dev

lint:
	npm run lint
	cd mintlify && mint openapi-check openapi.yaml

lint-openapi:
	npm run lint:openapi

lint-markdown:
	npm run lint:markdown 