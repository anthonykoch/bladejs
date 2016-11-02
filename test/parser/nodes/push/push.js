module.exports = {
	type: 'PushStatement',
	argument: `'scripts'`,
	line: 1,
	start: 0,
	end: 60,
	consequent: {
		type: 'BlockStatement',
		body: [
			{
				type: 'TextNode',
				value: '\t<script src="script.js"></script>\n',
				line: 1,
				start: 16,
				end: 52,
 			}
		]
	},
};