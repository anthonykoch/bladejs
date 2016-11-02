'use strict';

const test = require('tape');

const { reserved } = require('../../lib/constants/reserved');
const { parse } = require('../../lib/parser');;
const { parserSetup: setup } = require('../utils');

test('Parser.parse - directives with no argument throws error', (assert) => {
	[
		'@yield',
		'@section',
		'@extends',
		'@unless',
		'@while',
		'@include',
		'@each',
		'@push',
		'@stack',
	].forEach(function (directive) {
		assert.throws(() => parse(directive),
			new RegExp(`Found ${directive} with no arguments`),
			`${directive} throws with no argument`);

		assert.throws(() => parse(`${directive}()`),
			new RegExp(`Found ${directive} with no argument`),
			`${directive} throws with no argument`);
	});

	assert.throws(() => parse('@if@endif'),
		/Found @if with no arguments/, '@if throws with no argument');

	assert.throws(() => parse('@if(false)@elseif@endif'),
		/Found @elseif with no arguments/, '@elseif throws with no argument');

	assert.throws(() => parse('@foreach'),
		/Invalid @foreach statement/, '@foreach throws with no argument');

	assert.throws(() => parse('@forelse'),
		/Invalid @forelse statement/, '@forelse throws with no argument');

	assert.doesNotThrow(() => parse('@if(false)@else@endif'))

	assert.end();
});

test('Parser.parse - SectionStatement semantics', (assert) => {
	assert.throws(() => parse('@section("content")'),
		/Unclosed @section/, 'unclosed');

	assert.throws(() => parse('@section()@endsection'),
		/Found @section with no arguments/, 'no arguments');

	assert.throws(() => parse('@section("content")@endif@endsection'),
		/Expected @section closing directive/, 'wrong end tag before @endsection');

	assert.throws(() => parse('@section("content")@endif@show'),
		/Expected @section closing directive/, 'wrong end tag before @show');

	assert.doesNotThrow(() => parse('@section("content")@endsection'), 'is expression');

	assert.end();
});

test('Parser.parse - VerbatimStatement semantics', (assert) => {
	assert.throws(() => parse('@verbatim'), /Unclosed @verbatim/, 'unclosed');
	assert.end();
});

test('Parser.parse - UnlessStatement semantics', (assert) => {
	assert.throws(() => parse('@unless(false)'), /Unclosed @unless/, 'unclosed');

	assert.throws(() => parse('@unless(false)@endif@endunless'),
		/Expected @endunless got @endif/, 'wrong closing tag');

	assert.doesNotThrow(() => parse('@unless(false)@endunless'), 'is expression');

	assert.end();
});

test('Parser.parse - ForEachStatement semantics', (assert) => {
	assert.throws(() => parse('@foreach($users as $user)'),
		/Unclosed @foreach/, 'unclosed');

	assert.throws(() => parse('@foreach(as $user)@endforeach'),
		/Invalid @foreach statement/, 'invalid arguments');

	assert.throws(() => parse('@foreach($us as $u)@endif@endforeach'),
		/Expected @endforeach got @endif/, 'wrong closing tag');

	Object.keys(reserved).forEach((word) => {
		const test = () => parse(`@foreach(${word} as $user)@endforeach`);
		assert.throws(test, /Invalid expression/, `iterable can't be reserved word "${word}"`);
	});

	Object.keys(reserved).forEach((word) => {
		const test = () => parse(`@foreach($users as ${word})@endforeach`);
		assert.throws(test, /Invalid expression/, `as can't be reserved word "${word}"`);
	});

	assert.end();
});

test('Parser.parse - ForElseStatement semantics', (assert) => {
	assert.throws(() => parse('@forelse($users as $user)'),
		/Unclosed @forelse/, 'unclosed');

	assert.throws(() => parse('@forelse($users as $user)@endforelse'),
		/Expected @empty got @endforelse /, '@forelse without @empty tag');

	assert.throws(() => parse('@forelse($users as $user)@endif@endforelse'),
		/Expected @empty got @endif/, '@forelse with wrong closing tag');

	Object.keys(reserved).forEach((word) => {
		const test = () => parse(`@foreach(${word} as $user)@endforeach`);
		assert.throws(test, /Invalid expression/, `iterable can't be reserved word "${word}"`);
	});

	Object.keys(reserved).forEach((word) => {
		const test = () => parse(`@foreach($users as ${word})@endforeach`);
		assert.throws(test, /Invalid expression/, `as can't be reserved word "${word}"`);
	});

	assert.end();
});

test('Parser.parse - WhileStatement semantics', (assert) => {
	assert.throws(() => parse('@while(false)@endif@endwhile'),
		/Expected @endwhile got @endif/, '@while with wrong closing tag');

	assert.throws(() => parse('@while(false)'), /Unclosed @while/, 'unclosed');

	assert.doesNotThrow(() => parse('@while(false)@endwhile'), 'is expression');

	assert.end();
});

test('Parser.parse - ContinueStatement semantics', (assert) => {
	assert.throws(() => parse('@foreach($us as $u)@continue()@endforeach'),
		/Found @continue with no arguments/,
		'@continue with parens but no expression throws');

	assert.doesNotThrow(() => parse('@foreach($us as $u)@continue@endforeach'),
		'@continue without argument does not throw');

	assert.doesNotThrow(() => parse('@foreach($us as $u)@continue(false)@endforeach'),
		'is expression');

	assert.end();
});

test('Parser.parse - BreakStatement semantics', (assert) => {
	assert.throws(() => parse('@foreach($us as $u)@break()@endforeach'),
		/Found @break with no arguments/,
		'@break with parens but no expression throws');

	assert.doesNotThrow(() => parse('@foreach($us as $u)@break@endforeach'),
		'@break without argument does not throw');

	assert.doesNotThrow(() => parse('@foreach($us as $u)@break(false)@endforeach'),
		'is expression');

	assert.end();
});

test('Parser.parse - PushStatement semantics', (assert) => {
	assert.throws(() => parse('@push("scripts")'), /Unclosed @push/, 'unclosed @push');

	assert.throws(() => parse('@push("scripts")@endif@endpush'),
		/Expected @endpush got @endif/, 'wrong closing tag');

	assert.doesNotThrow(() => parse('@push("scripts")@endpush'), 'is expression');

	assert.end();
});

test('Parser.parse - StackStatement semantics', (assert) => {
	assert.doesNotThrow(() => parse('@stack("scripts")'), 'is expression');
	assert.end();
});

test('Parser.parse - IncludeStatement semantics', (assert) => {
	assert.doesNotThrow(() => parse('@include("views.home")', { baseDir: '/' }),
		'is expression');

	assert.end();
});

test('Parser.parse - YieldStatement semantics', (assert) => {
	assert.doesNotThrow(() => parse('@yield("content")'), 'is expression');
	assert.end();
});

test('Parser.parse - ExtendsStatement semantics', (assert) => {
	assert.doesNotThrow(() => parse('@extends("content")', { baseDir: '/' }),
		'is expression');

	assert.end();
});

test('Parser.parse - EachStatement semantics', (assert) => {
	const options = { baseDir: '/' };

	assert.throws(() => parse(`@each('view.name', $jobs 'job')`, options),
		/Invalid arguments in @each/, 'invalid expression');

	assert.throws(() => parse(`@each(123, $jobs, 'job')`, options),
		/Invalid arguments in @each/, 'invalid include');

	assert.throws(() => parse(`@each('view.empty', $jobs, 123)`, options),
		/Invalid arguments in @each/, 'invalid as');

	assert.throws(() => parse(`@each('view.empty', $jobs, 'job', 123)`, options),
		/Invalid arguments in @each/, 'invalid empty');

	assert.throws(() => parse(`@each('view.name', $jobs)`, options),
		/Missing arguments to @each/, 'missing as');

	assert.doesNotThrow(() => parse(`@each('view.name', $jobs, 'job')`, options),
		'is expression');

	assert.doesNotThrow(() => parse(`@each('view.name', $jobs, 'job', 'view.empty')`, options),
		'is expression');

	assert.end();
});

test('Parser.parse - IfStatement semantics', (assert) => {
	assert.throws(() => parse('@if(false)'), /Unclosed @if/, 'no closing tag');

	assert.throws(() => parse('@if()@endif'),
		/Found @if with no arguments/, 'no arguments');

	assert.throws(() => parse(`@if(false)@elseif()@endif`),
		/Found @elseif with no arguments/i,
		'elseif without arguments throws');

	assert.throws(() => parse('@if(false)@endunless@endif'),
		/Expected @endif got @endunless/, 'wrong closing tag');

	assert.doesNotThrow(() => parse('@if(false)@endif'),
		'is expression');

	assert.doesNotThrow(() => parse(`@if(false)@else@endif`),
		'if with else');

	assert.doesNotThrow(() => parse(`@if(false)@elseif(false)@endif`),
		'if with elseif and else');

	assert.doesNotThrow(() => parse(`@if(0)${'@elseif(0)'.repeat(5)}@endif`),
		'if with repeated elseifs and else');

	assert.end();
});
