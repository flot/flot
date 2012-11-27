## Contributing to Flot ##

We welcome all contributions, but following these guidelines results in less
work for Flot's maintainers, and ensures a faster and better response.

### Issues ###

Issues are not a way to ask general questions about Flot. If you see unexpected
behavior but are not 100% certain that it is a bug, please try posting to the
[forum](http://groups.google.com/group/flot-graphs) first, and confirm that
what you see is really a Flot problem before creating a new issue for it.

When reporting a bug, please include a working demonstration of the problem, if
possible, or at least a clear description of the options you're using and the
environment (browser and version, jQuery version, other libraries) that you're
running under.

If you have suggestions for new features, or changes to existing ones, we'd
love to hear them! Please submit each suggestion as a separate new issue.

### Pull Requests ###

To make merging as easy as possible, please keep these rules in mind:

 1. Divide larger changes into a series of small, logical commits with
	descriptive messages.

 2. Format your code according to the style guidelines below.

 3. Rebase against master, if necessary, before submitting your pull request.

### Flot Style Guidelines ###

Flot follows the [jQuery Core Style Guidelines](http://docs.jquery.com/JQuery_Core_Style_Guidelines),
with the following minor changes:

#### Comments ####

Use // for all comments except the header at the top of a file or inline
include.

All // comment blocks should have an empty line above *and* below them. For
example:

```js
	var a = 5;

	// We're going to loop here
	// TODO: Make this loop faster, better, stronger!

	for ( var x = 0; x < 10; x++ ) {}
```

#### Wrapping ####

Block comments should be wrapped at 80 characters.

Code should attempt to wrap at 80 characters, but may run longer if wrapping
would hurt readability more than having to scroll horizontally.  This is a
judgement call made on a situational basis.

Statements containing complex logic should not be wrapped arbitrarily if they
do not exceed 80 characters. For example:

```js
	WRONG
	if (a == 1 &&
		b == 2 &&
		c == 3) {}

	CORRECT
	if ( a == 1 && b == 2 && c == 3 ) {}
```