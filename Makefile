
.PHONY: default release lint fix parcel tags

default: parcel

lint:
	npx eslint sample.js;

release: lint parcel tags

fix:
	npx eslint sample.js --fix;

parcel:
	npx parcel build 'sample.js' --public-url ./

tags:
	ctags -R sample.js;

