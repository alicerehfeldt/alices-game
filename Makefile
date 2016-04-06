DIST_DIR:="./dist"
NODEMON="./node_modules/.bin/nodemon"
SOURCES = $(shell find src -type f)
.PHONY: start dist

node_modules: package.json
	npm cache clean
	npm install

start: node_modules
	node --harmony src/index.js

develop: node_modules
	$(NODEMON) --harmony src/index.js
