.PHONY: install build build-openapi mint lint lint-openapi lint-markdown cli-install cli-build cli

install:
	npm install
	npm i -g mint

build:
	npm run build:openapi

build-openapi:
	npm run build:openapi

STAINLESS_OPENAPI_URL := https://app.stainless.com/api/spec/documented/grid/openapi.documented.yml
LOCAL_OPENAPI_PATH := openapi.yaml

mint:
	@cd mintlify && \
	sed -i.bak 's|$(STAINLESS_OPENAPI_URL)|$(LOCAL_OPENAPI_PATH)|' docs.json && \
	trap 'mv docs.json.bak docs.json' EXIT INT TERM; \
	mint dev

lint:
	npm run lint

lint-openapi:
	npm run lint:openapi

lint-markdown:
	npm run lint:markdown

cli-install:
	cd cli && npm install

cli-build:
	cd cli && npm run build

cli:
	cd cli && npm run dev --