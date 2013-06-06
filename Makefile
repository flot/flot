# Flot Makefile

.PHONY: all

# The default behavior is to minify all our JavaScript files

all: $(patsubst %.js,%.min.js,$(filter-out %.min.js,$(wildcard *.js)))

%.min.js: %.js
	yui-compressor $< -o $@

# Flot's Travis test suite runs JSHint with the options in .jshintrc

test:
	./node_modules/.bin/jshint jquery.flot*.js
