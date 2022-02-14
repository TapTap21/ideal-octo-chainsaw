all: build push

build:
	docker build -f client/Dockerfile . -t taptap21/superbapp-client:0.9

push:
	docker push taptap21/superbapp-client:0.9
