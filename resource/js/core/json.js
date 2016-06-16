/*
	Copyright (c) Baidu Youa Wed QWrap
	version: $version$ $release$ released
	author: Miller
*/


/**
 * @class JSON 对JSON序列化与反序列化方法的封装。
 * @singleton
 * @remarks
 * <a href='$baseurl$/core/_tests/json.test.html' target="_blank">单元测试</a>
 */

(function() {
	QW.JSON = {
		/**
		 * 将JSON字符串解析成对象或者数组。
		 * @static
		 * @method parse
		 * @param {String} text 有效的 JSON 文本
		 * @return {any} 返回值对象或数组
		 * @throw {SyntaxError} 如果text参数不是有效的JSON字符串则会抛异常。（注：本实现中，判断是否有效有意放宽了。例如：字符串可以用'括起来，json的key可以不带引号）
		 */
		parse: function(text) { 
			/*检查JSON字符串的有效性*/
			if (/^[[\],:{}\s0]*$/.test(text.replace(/\\\\|\\"|\\'|\w+\s*\:|null|true|false|[+\-eE.]|new Date(\d*)/g, '0').replace(/"[^"]*"|'[^']*'|\d+/g, '0'))) {
				return new Function('return (' + text+');')();
			}
			/*无效的JSON格式*/
			throw 'Invalid JSON format in executing JSON.parse';
		},

		/**
		 * 将值对象或者数组进行字符串。
		 * @static
		 * @method stringify
		 * @param {any} value 需要进行字符串化的对象或者数组
		 * @return {String} 返回串化结果字符串
		 * @example 
		 */
		stringify: function(value) {
			return QW.ObjectH.stringify(value);
		}
	};
}());