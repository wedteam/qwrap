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
	window.JSON = {
		/**
		 * 将JSON字符串解析成对象或者数组，如果字符串不是合法的JSON格式则会抛出异常。
		 * @static
		 * @method parse
		 * @param {String} text 需要进行反序列化的字符串
		 * @param {Function} reviver (Optional) 解析时使用的过滤器
		 * @return {Object} 返回反序列化后的对象或数组
		 * @throw {SyntaxError} 如果text参数不是有效的JSON字符串则会抛异常
		 * @example 
		 var str = '{"key1":1,"key2":{"key21":2}}';
		 var obj = JSON.parse(str,function(k,v){
		 if( k == 'key21' ) return 'hello world';
		 return v;
		 });
		 alert(obj.key2.key21) //hello world
		 */
		parse: (function() {
			/*
			 * 匹配特殊字符的正则表达式，如果在text中出现这些字符均会被替换成Unicode编码的字符串
			 */
			var cx = /[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g;

			var rev;

			/*
			 * 在text被序列化成对象后可以通过该方法来进行遍历，并调用reviver进行过滤和调整
			 * 返回的是当前key下的内容调用reviver后的结果
			 */

			function traver(key, obj) {
				var value = obj[key];
				if (value && typeof value === 'object') {
					for (var k in value) {
						var v = traver(k, value);
						if (v !== undefined) {
							value[k] = v;
						} else {
							delete value[k];
						}
					}
				}
				return rev.call(obj, key, value);
			}
			return function(text, reviver) { /*替换特殊字符为相应的Unicode字符串*/
				cx.lastIndex = 0;
				if (cx.test(text)) {
					text = text.replace(cx, function(a) {
						return '\\u' + ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
					});
				} /*检查JSON字符串的有效性*/
				if (text && /^[\],:{}\s]*$/.test(text.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g, '@').replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, ']').replace(/(?:^|:|,)(?:\s*\[)+/g, ''))) { /*这里使用了JK提供的类似eval的方法，因为直接使用eval会影响压缩*/
					var obj = new Function('return ' + text)();
					rev = reviver;
					return typeof reviver === 'function' ? traver('', {
						'': obj
					}) : obj;
				}

				/*无效的JSON格式*/
				throw new SyntaxError('Invalid JSON format in executing JSON.parse');
			};
		}()),
		/**
		 * 将对象或者数组序列化成JSON格式的字符串。
		 * @static
		 * @method stringify
		 * @param {Object} value 需要进行序列化的对象或者数组
		 * @param {Function} replace (Optional) 序列化过程中使用的过滤器，如果是数组则数组的每个成员都必须是字符串，表示value中哪些属性是需要序列化的
		 * @param {String} spacer (Optional) 用于格式化输出结果，如果是数字则表示缩进的空格个数，如果是字符串则表示用于缩进填充的字符串
		 * @return {String} 返回序列化后的数组
		 * @throw {Error} 如果replacer非空并且既不是数组也不是函数时会抛出异常
		 * @example 
		 //1.简单用法
		 var obj = {key1:{key11:[1,2,3,4]}};
		 var objString = JSON.stringify(obj);//'{"key1":{"key11":[1,2,3,4]}}'
		 //2.自定义toJSON（支持Date、String、Number、Boolean类型）
		 Date.prototype.toJSON = function(){
		 return 'test date';
		 };
		 var d = new Date();
		 var obj = {date:d};
		 var objString = JSON.stringify(obj);//'{"date":"test date"}'
		 //3.Function Replacer
		 var obj = {key1:[1,2,3,{key11:[1,2,3,{key111:'hello world'}]}]};
		 var objString = JSON.stringify(obj,function(k,v){
		 if( k == 'key111' )
		 return 'new value';
		 return v;
		 });//'{"key1":[1,2,3,{"key11":[1,2,3,{"key111":"new value"}]}]}'
		 //4.Array Replacer
		 var obj = {key1:[1,2,3,{key11:[1,2,3,{key111:'hello world'}]}],key2:1,key3:1};
		 var objString = JSON.stringify(obj,['key2','key3']);//'{"key2":1,"key3":1}'
		 */
		stringify: (function() { /*补足2位*/

			function fill_zero(n) {
				return n < 10 ? '0' + n : n;
			} /*定义Date、String、Number和Boolean的toJSON方法*/
			Date.prototype.toJSON = function(key) {
				return isFinite(this.valueOf()) ? this.getUTCFullYear() + '-' + fill_zero(this.getUTCMonth() + 1) + '-' + fill_zero(this.getUTCDate()) + 'T' + fill_zero(this.getUTCHours()) + ':' + fill_zero(this.getUTCMinutes()) + ':' + fill_zero(this.getUTCSeconds()) + 'Z' : null;
			};
			String.prototype.toJSON = Number.prototype.toJSON = Boolean.prototype.toJSON = function(key) {
				return this.valueOf();
			};

			/*用于格式化输出的缩进字符串*/
			var indent; /*遍历到每一层时实际输出的格式化字符串*/
			var gap; /*过滤器*/
			var rep; /*需要进行转义的字符正则匹配表达式*/
			var escapable = /[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g; /*需要转移的可见字符对照表*/
			var escapeMap = {
				'\b': '\\b',
				'\t': '\\t',
				'\n': '\\n',
				'\f': '\\f',
				'\r': '\\r',
				'"': '\\"',
				'\\': '\\\\'
			};

			/*如果字符串中不包含引号、转义字符、反斜杠则可以直接添加引号，否则需要进行替换处理后才可以添加引号。*/

			function addQuote(str) {
				escapable.lastIndex = 0;
				return escapable.test(str) ? '"' + str.replace(escapable, function(a) {
					var c = escapeMap[a]; /*如果不是escapeMap中的字符则转换成Unicode字符串*/
					return typeof c === 'string' ? c : '\\u' + ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
				}) + '"' : '"' + str + '"';
			} /*获取对象中指定属性的json字符串*/

			function getString(key, obj) { /*上一层的格式化字符串*/
				var lastGap = gap,
					v = obj[key],
					res = [];
				if (v && typeof v.toJSON == 'function') {
					v = v.toJSON(key);
				}
				if (typeof rep == 'function') {
					v = rep.call(obj, key, v);
				}
				if (v === null) {
					return String(v);
				} else if (typeof v == 'undefined') {
					return v;
				}
				switch (v.constructor) {
				case String:
					return addQuote(v);
				case Number:
					return isFinite(v) ? String(v) : 'null';
				case Boolean:
					return String(v);
				case Array:
					/*对数组进行序列化时会忽略replacer*/
					gap += indent;
					for (var i = 0, len = v.length; i < len; i++) {
						res[i] = getString(i, v) || 'null';
					}

					var r = res.length == 0 ? '[]' : gap ? '[\n' + gap + res.join(',\n' + gap) + '\n' + lastGap + ']' : '[' + res.join(',') + ']';
					gap = lastGap;
					return r;
				case Object:
					gap += indent;
					if (rep && rep.constructor == Array) {
						for (var i = 0, len = rep.length; i < len; i++) {
							var k = rep[i];
							if (typeof k == 'string') {
								var nv = getString(k, v);
								if (nv) {
									res.push(addQuote(k) + (gap ? ': ' : ':') + nv);
								}
							}
						}
					} else {
						for (var k in v) {
							var nv = getString(k, v);
							if (nv) {
								res.push(addQuote(k) + (gap ? ': ' : ':') + nv);
							}
						}
					}
					var r = res.length == 0 ? '{}' : gap ? '{\n' + gap + res.join(',\n' + gap) + '\n' + lastGap + '}' : '{' + res.join(',') + '}';
					gap = lastGap;
					return r;
				}
			}
			return function(value, replacer, spacer) { /*判断replacer的有效性，只允许是空或者是函数和数组*/
				if (replacer != null && replacer.constructor != Array && replacer.constructor != Function) {
					throw new Error('Invalid type of 2nd argument in JSON.stringify, only Array and Function allowed');
				}

				gap = indent = '';

				if (spacer && spacer.constructor == Number) {
					indent = new Array(spacer + 1).join(' ');
				} else if (spacer && spacer.constructor == String) {
					indent = spacer;
				}

				rep = replacer;

				return getString('', {
					'': value
				});
			};
		}())
	};
}());