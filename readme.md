
# BladeJS

An implementation of Laravel's templating engine in JavaScript.

Note: This was written purely for fun, and although it seemingly works okay, _please do not actually use it_. There are many good, well tested templating engines already in existence. The below docs are only a reminder for me of how the thing works.


# Usage

*Note: `Blade.code`, `Blade.template`, and `Blade.render` all take the same options object.*

## Rendering a string

You can render a string through `Blade.render`. Note that the process of compiling a template may be quite slow. It is much more performant to precompile a template.

```js
const Blade = require('bladejs');

const data = '@foreach(users as user){{ user.name }}@endforeach';
const locals = { users: [] };
const options = {
	debug: true
};

const html = Blade.render(data, locals, options);
```

## Creating a template function

You may create a template function through the `Blade.template` function. This requires loading in the entire Blade compiler, just as the previous does.

```js
const customDirectives = {
	markdown: function (contents) {
		return marked(contents);
	}
};

const data     = `@if(user)Hello {{ user.name }}@endif`;
const options  = { customDirectives };
const template = Blade.template(data, options);

const locals   = { user: 'You' };
const html     = template(locals);

console.log(html); // Hello You
```

## Precompiling templates

You may precompile a template using `Blade.code` and the `standalone` option. Setting the `standalone` option to `true` will inline the two functions needed by the template function which would otherwise be passed in for you when using `Blade.render`.

*Note: `Blade.code` will throw an error if the compiled code somehow generates a syntax error.*

```js
const fs = require('fs');
const marked = require('marked');

const options = { standalone: true };
const code = 'module.exports = ' + Blade.code(data, options);

const customDirectives = {
	markdown: function (contents) {
		return marked(contents);
	}
};

fs.writeFileSync('./outputpath', code);

const template = require('./outputpath');

// You need to pass in the custom directives manually!
const html = template(locals, customDirectives);
```

*Note: The customDirectives need to passed to the template function as a second argument.*


## Creating custom directives

You may create custom directives by passing them in with the options. Note that if you precompile the template, you need to pass it in as the second argument to the template function.

```js
const customDirectives = {
	markdown: function (expression, contents) {
		if (contents !== undefined) {
			return marked(contents);
		} else if (expression !== undefined) {
			return marked(expression);
		}
	}
};

const options = {
	customDirectives: customDirectives
};

Blade.render(data, locals, options);
// or
const template = Blade.template(data, options);
// or with a precompiled template
const template = require('./precompiled-template');
const html     = template({ user: 'You' }, customDirectives);
```

### Three parts to a custom directive

A custom directive has three parts, two of which are optional. The first is the directive itself e.g. `@markdown`. The second is the argument to the directive. For example, `'Hello'` is the argument to the markdown directive in `@markdown('hello')`.

*Note: Although the argument is optional, you can not have an empty argument, e.g. `@markdown()` will give an error.*

The second part is the closing directive, which would be `@endmarkdown`. You can use arguments with or without the closing block. All of the following are valid, and will cause the callback for the directive to be called.

```html
@markdown

<!-- with argument -->
@markdown('content')

<!-- close directive without argument -->
@markdown
@endmarkdown

<!-- closing directive with argument -->
@markdown('Hello')
@endmarkdown
```

The first parameter to the callback (named `expression`) is the argument passed to the directive, just as it would be in Laravel. The second parameter (named `contents`) is the rendered contents of the directive's block. If either one was omitted from use in the directive, they will be passed as undefined.

```js
const customDirectives = {
	markdown: function (expression, contents) {
        if (contents !== undefined) {
            return marked(contents);
        } else if (expression !== undefined) {
            return marked(expression);
        }
	}
};

const options = { customDirectives };

// expression will be '### Title'
Blade.render(`@markdown('### Title')`, options);

// expression will be 123 and contents will be '### Title'
Blade.render(`@markdown(123)### Title@endmarkdown`, options);

// expression and contents are both undefined
Blade.render(`@markdown`, options);
```

# Benchmarks

```
Hogan.js
  Escaped   : 3508ms
  Unescaped : 251ms
  Total     : 3759ms

EJS
  Escaped   : 3981ms
  Unescaped : 2275ms
  Total     : 6256ms

Handlebars.js
  Escaped   : 1630ms
  Unescaped : 438ms
  Total     : 2068ms

Pug without `with`
  Escaped   : 1688ms
  Unescaped : 361ms
  Total     : 2049ms

Pug
  Escaped   : 3062ms
  Unescaped : 94ms
  Total     : 3156ms

Blade
  Escaped   : 3087ms
  Unescaped : 125ms
  Total     : 3212ms
```


# Dependencies

- Native node module `path`.

- `blade-expression`, which is a JavaScript expression parser that I wrote, which has only three dependencies `object-assign`, `repeat-string`, and `pad-start`

- `object-assign`

- `pad-start`

- `escape-string-regexp`

Altogether, blade.min.js comes in at `66.75 KB`.


### Todo

- Figure out why the minified version is throwing errors.

- Change tests to compare by files.

- Add tests for relative inlcude paths

- Add tests for dependecy resolving

- Change escape to be an identifier instead of a member expression on helpers.

- Add second argument to @include

- Add second argument to @section

- Add second argument to @yield

- Add support for escaped directives and interpolation

- Add `@foreach(users as key => value)`

- Add caching support

- Add streaming support

- Maybe use functions for includes?

- Change `TextNode` type to just `Text`

- Add caching in the compiler for expression ASTs

- Should the output of custom directives be escaped?

- The debug mode check of identifiers everytime an identifier is used could probably just be swapped for a check at the beginning of the function. The check would validate that all identifiers found are in `locals`. The current way probably doesn't work anyway with different conditional branches.


