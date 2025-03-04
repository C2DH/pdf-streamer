BUILD_TAG ?= latest

build:
	docker buildx build --platform linux/amd64,linux/arm64 --no-cache --progress=plain -t c2dhunilu/pdf-streamer:${BUILD_TAG} \
	--build-arg COMMIT_HASH=$(shell git rev-parse --short HEAD) \
	--build-arg VERSION=${BUILD_TAG} \
	--build-arg BUILD_DATE=$(shell date -u +'%Y-%m-%dT%H:%M:%SZ') \
	--build-arg BASE_URL=http://localhost:3000 \
	.