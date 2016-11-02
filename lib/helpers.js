'use strict';

module.exports = {

	referr,

	escape

};

/**
 * Throws a reference error for the variable name passed
 *
 * @param {String} name - The variable name
 */

function referr(name) {
	const err = new Error(name + ' is not in locals');
	err.name = 'ScopeError';
	throw err;
}

/**
 * Copyright (c) 2014 Forbes Lindesay
 *
 * https://github.com/pugjs/pug-runtime
 */

function escape(_html){
  var html = '' + _html;
  var regexResult = /["&<>]/.exec(html);
  if (!regexResult) return _html;

  var result = '';
  var i, lastIndex, escape;
  for (i = regexResult.index, lastIndex = 0; i < html.length; i++) {
    switch (html.charCodeAt(i)) {
      case 34: escape = '&quot;'; break;
      case 38: escape = '&amp;'; break;
      case 60: escape = '&lt;'; break;
      case 62: escape = '&gt;'; break;
      default: continue;
    }
    if (lastIndex !== i) result += html.substring(lastIndex, i);
    lastIndex = i + 1;
    result += escape;
  }
  if (lastIndex !== i) return result + html.substring(lastIndex, i);
  else return result;
};
