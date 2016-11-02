'use strict';

const path = require('path');
const fs = require('fs');
const util = require('util');

const glob = require('glob');
const test = require('tape');

const Parser = require('../../lib/parser');

glob
	.sync(path.join(__dirname, './nodes/*/*.blade'))
	.forEach(function(file) {
		const parts = path.parse(file);
		const jsonPath = path.join(parts.dir, parts.name);
		const expectedASTNode = require(jsonPath);

		if (expectedASTNode.__only__) {
			delete expectedASTNode.__only__;
			test.only(`Matching ${parts.name} to AST node `, {
				objectPrintDepth: 10
			}, assertionTest);
		} else {
			test(`Matching ${parts.name} to AST node `, {
				objectPrintDepth: 10
			}, assertionTest);
		}

		function assertionTest(assert) {
			const template = fs.readFileSync(file, 'utf8');
			const ast = Parser.parse(template, { baseDir: '/' }).body[0];

			assert.deepEquals(
				ast,
				expectedASTNode,
				`${parts.name}`
			);
			assert.end();
		}
	});