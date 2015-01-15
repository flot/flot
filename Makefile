# Makefile for generating minified files
PROG ?= yui-compressor

#Set flags for various programs
ifeq ($(PROG), uglifyjs)
	FLAGS = -m -c -o $@ --source-map $@.map
else ifeq ($(PROG), yui-compressor)
	FLAGS = -o $@
endif
.PHONY: all

# we cheat and process all .js files instead of an exhaustive list
all: $(patsubst %.js,%.min.js,$(filter-out %.min.js,$(wildcard *.js)))

%.min.js: %.js
	$(PROG) $< $(FLAGS)

test:
	./node_modules/.bin/jshint *jquery.flot.js
