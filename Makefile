
all: test build

build:
	./bin/build.js

test:
	./node_modules/.bin/mocha

.PHONY: test