ts_files = $(wildcard **/*.ts)
.PHONY: all format
all: format

format: $(ts_files)
	npx eslint $(ts_files)
	npx prettier $(ts_files) --write
	npx tsc
