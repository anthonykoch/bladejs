'use strict';

const test = require('tape');

const { assertRenderedEquals } = require('../../utils');

function setup(data, locals, options) {
	return Blade.render(data, locals, options);
}

test('Renderer - compiled interpolation simple', (assert) => {
	const options = {};

	const locals  = {
		age: 42,
		name: 'Randall'
	};

	const expected = `42 Randall\n42 Randall`;

	const data =
`{{ age }} {{ name }}
{{ age }} {{ name }}`;

	assertRenderedEquals(assert, expected, data, locals, options);

	assert.end();
});

test('Renderer - compiled interpolation scope variables', (assert) => {
	const options = {};

	const locals = {
		greeting: 'Hello',
		script: '<script></script>',
		nothing: null,
		age: 42,
		users: ['Sally', 'Bob', 'Randall'],
		user: { name: 'Randall' }
	};

	const data =
`START
{{ greeting }}
{{ script }}
{{ nothing }}
{{ age }}
{{ users }}
{{ user }}
{{ user.name }}
END`;

	const expected =
`START
Hello
&lt;script&gt;&lt;/script&gt;

42
Sally,Bob,Randall
[object Object]
Randall
END`;

	assertRenderedEquals(assert, expected, data, locals, options);

	assert.end();
});

test('Renderer - rendered interpolation expression', (assert) => {
	const options = {};

	const locals = {
		one: 'Hello',
		two: '<script></script>',
		three: null,
		users: ['Sally', 'Bob', 'Randall']
	};

	const data =
`START
{{ '' }}
{{ 'Hello' }}
{{ 2 + 2 }}
{{ [,null, undefined, 'Sally', 123] }}
{{ {} }}
{{ { name: 'Sally' }.name }}
END`;

	const expected =
`START

Hello
4
,,,Sally,123
[object Object]
Sally
END`;

	assertRenderedEquals(assert, expected, data, locals, options);

	assert.end();
});

test('Compiled interpolation - escapes output', (assert) => {
	const options  = {};
	const locals   = {};
	const data     = `{{ '&<>"' }}`;
	const expected = `&amp;&lt;&gt;&quot;`;

	assertRenderedEquals(assert, expected, data, locals, options);

	assert.end();
});

test('Renderer - rendered interpolation builtin identifiers', (assert) => {
	const options = {};
	const locals  = {};
	const data =
`START
{{ Infinity }}
{{ NaN }}
{{ undefined }}
{{ null }}
{{ false }}
{{ true }}
END`;

	const expected =
`START
Infinity
NaN


false
true
END`;

	assertRenderedEquals(assert, expected, data, locals, options);

	assert.end();
});

test('Renderer - rendered interpolation builtin functions', (assert) => {
	const options = {};
	const locals  = {};
	const data =
`START
isFinite:   {{ isFinite(Infinity) }}
NaN:        {{ isNaN(NaN) }}
parseFloat: {{ parseFloat('0.123') }}
parseInt:   {{ parseInt(1.5, 10) }}
Object:     {{ Object() }}
Boolean:    {{ Boolean('') }}
Symbol:     {{ Symbol('Identifier').toString() }}
Error:      {{ (new Error('Error message')).message }}
Number:     {{ Number([123]) }}
Math:       {{ Math.pow(2,2) }}
Date:       {{ (new Date()).getDay() }} {{ (new Date()).getMonth() }}
String:     {{ String(['Sally', 'Bob', 'Randall']) }}
Intl:       {{ typeof Intl === 'object' }}
JSON:       {{ JSON.stringify({ name: 'Randall' }) }}
END`;

	const day = (new Date()).getDay();
	const month = (new Date()).getMonth();

	const expected =
`START
isFinite:   false
NaN:        true
parseFloat: 0.123
parseInt:   1
Object:     [object Object]
Boolean:    false
Symbol:     Symbol(Identifier)
Error:      Error message
Number:     123
Math:       4
Date:       ${day} ${month}
String:     Sally,Bob,Randall
Intl:       true
JSON:       {&quot;name&quot;:&quot;Randall&quot;}
END`;

	assertRenderedEquals(assert, expected, data, locals, options);

	assert.end();
});
