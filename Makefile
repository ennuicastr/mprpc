all: dist/mprpc.min.js

dist/mprpc.min.js: src/*.ts node_modules/.bin/rollup
	npm run build

node_modules/.bin/rollup:
	npm install

clean:
	npm run clean
