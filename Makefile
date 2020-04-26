
.PHONY: default release lint fix parcel tags

default: parcel

lint:
	npx eslint sample.js;

release: lint parcel tags

fix:
	npx eslint sample.js --fix;

parcel:
	npm run build

tags:
	ctags -R sample.js;

