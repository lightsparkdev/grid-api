.PHONY: install build build-openapi mint lint lint-openapi lint-spectral lint-markdown cli-install cli-build cli

install:
	npm install
	npm i -g mint

build:
	npm run build:openapi

build-openapi:
	npm run build:openapi

mint:
	@cd mintlify && mint dev

lint:
	npm run lint

lint-openapi:
	npm run lint:openapi

lint-spectral:
	npm run lint:spectral

lint-markdown:
	npm run lint:markdown

cli-install:
	cd cli && npm install

cli-build:
	cd cli && npm run build

cli:
	cd cli && npm run dev --
