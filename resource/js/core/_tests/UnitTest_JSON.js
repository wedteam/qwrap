(function() {
	var type_of = function(v) {
		return value_of(typeof v);
	};
	var JSON = QW.JSON;

	describe('JSON', {
		'对象-空内容对象': function() {
			var objString = '{}';
			var obj = JSON.parse(objString);
			type_of(obj).should_be('object');
		},
		'对象-数字属性': function() {
			var objString = '{"key1":1}';
			var obj = JSON.parse(objString);
			value_of(obj.key1).should_be(1);
		},
		'对象-布尔值属性': function() {
			var objString = '{"key1":true}';
			var obj = JSON.parse(objString);
			value_of(obj.key1).should_be(true);
		},
		'对象-字符串属性': function() {
			var objString = '{"key1":"hello world"}';
			var obj = JSON.parse(objString);
			value_of(obj.key1).should_be('hello world');
		},
		'对象-数组属性': function() {
			var objString = '{"key1":[1,2,3,4,5]}';
			var obj = JSON.parse(objString);
			value_of(obj.key1[0]).should_be(1);
		},
		'对象-多层嵌套-1': function() {
			var objString = '{"key1":{"key11":"hello world"}}';
			var obj = JSON.parse(objString);
			value_of(obj.key1.key11).should_be('hello world');
		},
		'对象-多层嵌套-2': function() {
			var objString = '{"key1":{"key11":[1,2,3,4]}}';
			var obj = JSON.parse(objString);
			value_of(obj.key1.key11[3]).should_be(4);
		},
		'对象-多层嵌套-3': function() {
			var objString = '{"key1":{"key11":[1,2,3,4,{"key111":"hello world"}]}}';
			var obj = JSON.parse(objString);
			value_of(obj.key1.key11[4].key111).should_be('hello world');
		},
		'数组-简单数组': function() {
			var objString = '[1,true,"hello world"]';
			var obj = JSON.parse(objString);
			value_of(obj[2]).should_be('hello world');
		},
		'布尔值-true': function() {
			var objString = 'true';
			var obj = JSON.parse(objString);
			value_of(obj).should_be(true);
		},
		'布尔值-false': function() {
			var objString = 'false';
			var obj = JSON.parse(objString);
			value_of(obj).should_be(false);
		},
		'数字': function() {
			var objString = '20090901';
			var obj = JSON.parse(objString);
			value_of(obj).should_be(20090901);
		},
		'空对象': function() {
			var objString = 'null';
			var obj = JSON.parse(objString);
			value_of(obj).should_be(null);
		},
		'大整数': function() {
			var objString = '{"key1":1231321312321321313213213213213213132132131232132132112313213123213213132132132132132131321321312321321321123132131232132131321321321321321313213213123213213211231321312321321313213213213213213132132131232132132112313213123213213132132132132132131321321312321321321123132131232132131321321321321321313213213123213213211231321312321321313213213213213213132132131232132132112313213123213213132132132132132131321321312321321321123132131232132131321321321321321313213213123213213211231321312321321313213213213213213132132131232132132112313213123213213132132132132132131321321312321321321}';
			var obj = JSON.parse(objString);
			value_of(obj.key1).should_be(Infinity);
		},
		'非法JSON字符串1': function() {
			var objString = '{';
			var ex = false;
			try {
				var obj = JSON.parse(objString);
			} catch (e) {
				ex = true;
			} /*如果未抛出异常则测试用例未通过*/
			if (!ex) {
				value_of(this).should_fail('对于非法的JSON格式未抛出异常，测试用例未通过。');
			} else {
				value_of('非法的JSON格式').log('对于非法的JSON字符串解析时抛出了异常，测试用例通过。');
			}
		},
		'非法JSON字符串2': function() {
			var objString = '';
			var ex = false;
			try {
				var obj = JSON.parse(objString);
			} catch (e) {
				ex = true;
			} /*如果未抛出异常则测试用例未通过*/
			if (!ex) {
				value_of(obj).log();
				value_of(this).should_fail('对于非法的JSON格式未抛出异常，测试用例未通过。');
			} else {
				value_of('非法的JSON格式').log('对于非法的JSON字符串解析时抛出了异常，测试用例通过。');
			}
		},
		'非法JSON字符串3': function() {
			var objString = 'aaaaa';
			var ex = false;
			try {
				var obj = JSON.parse(objString);
			} catch (e) {
				ex = true;
			} /*如果未抛出异常则测试用例未通过*/
			if (!ex) {
				value_of(this).should_fail('对于非法的JSON格式未抛出异常，测试用例未通过。');
			} else {
				value_of('非法的JSON格式').log('对于非法的JSON字符串解析时抛出了异常，测试用例通过。');
			}
		},
		'非法JSON字符串4': function() {
			var objString = 'undefined';
			var ex = false;
			try {
				var obj = JSON.parse(objString);
			} catch (e) {
				ex = true;
			} /*如果未抛出异常则测试用例未通过*/
			if (!ex) {
				value_of(this).should_fail('对于非法的JSON格式未抛出异常，测试用例未通过。');
			} else {
				value_of('非法的JSON格式').log('对于非法的JSON字符串解析时抛出了异常，测试用例通过。');
			}
		},
		'非法JSON字符串5': function() {
			var objString = 'NaN';
			var ex = false;
			try {
				var obj = JSON.parse(objString);
			} catch (e) {
				ex = true;
			} /*如果未抛出异常则测试用例未通过*/
			if (!ex) {
				value_of(this).should_fail('对于非法的JSON格式未抛出异常，测试用例未通过。');
			} else {
				value_of('非法的JSON格式').log('对于非法的JSON字符串解析时抛出了异常，测试用例通过。');
			}
		},
		'非法JSON字符串6': function() {
			var objString = '{"key1":undefined}';
			var ex = false;
			try {
				var obj = JSON.parse(objString);
			} catch (e) {
				ex = true;
			} /*如果未抛出异常则测试用例未通过*/
			if (!ex) {
				value_of(this).should_fail('对于非法的JSON格式未抛出异常，测试用例未通过。');
			} else {
				value_of('非法的JSON格式').log('对于非法的JSON字符串解析时抛出了异常，测试用例通过。');
			}
		},
		'非法JSON字符串7': function() {
			var objString = '{"key1":NaN}';
			var ex = false;
			try {
				var obj = JSON.parse(objString);
			} catch (e) {
				ex = true;
			} /*如果未抛出异常则测试用例未通过*/
			if (!ex) {
				value_of(this).should_fail('对于非法的JSON格式未抛出异常，测试用例未通过。');
			} else {
				value_of('非法的JSON格式').log('对于非法的JSON字符串解析时抛出了异常，测试用例通过。');
			}
		},
		'表达式': function() { /*该用例在Firefox3.5与IE8下抛异常，在Chrome下按照表达式进行计算*/
			var objString = '(59+1)*2 / 2 - 1';
			var ex = false;
			try {
				var obj = JSON.parse(objString);
			} catch (e) {
				ex = true;
			} /*如果抛出异常则测试用例未通过*/
			if (!ex) {
				value_of(this).should_fail('由于JSON格式错误，导致抛出异常。');
			} else {
				value_of(objString).log('非法的JSON格式');
			}
		}
	});
	describe('JSON.stringify', {
		'before': function() {

		},
		'对象-空内容': function() {
			var obj = {};
			var objString = JSON.stringify(obj);
			value_of(objString).should_be('{}');
		},
		'对象-数字属性': function() {
			var obj = {
				key1: 2009
			};
			var objString = JSON.stringify(obj);
			value_of(objString).should_be('{"key1":2009}');
		},
		'对象-布尔值属性1': function() {
			var obj = {
				key1: true
			};
			var objString = JSON.stringify(obj);
			value_of(objString).should_be('{"key1":true}');
		},
		'对象-布尔值属性2': function() {
			var obj = {
				key1: false
			};
			var objString = JSON.stringify(obj);
			value_of(objString).should_be('{"key1":false}');
		},
		'对象-字符串属性': function() {
			var obj = {
				key1: 'hello world'
			};
			var objString = JSON.stringify(obj);
			value_of(objString).should_be('{"key1":"hello world"}');
		},
		'对象-NULL属性': function() {
			var obj = {
				key1: null
			};
			var objString = JSON.stringify(obj);
			value_of(objString).should_be('{"key1":null}');
		},
		'对象-UNDEFINED属性': function() {//JK undefined 也是json不认识类型，所以也转成null。与浏览器的处理不一致
			var obj = {
				key1: undefined
			};
			var objString = JSON.stringify(obj);
			value_of(objString).should_be('{"key1":null}');
		},
		'对象-NaN属性': function() {
			var obj = {
				key1: NaN
			};
			var objString = JSON.stringify(obj);
			value_of(objString).should_be('{"key1":null}');
		},
		'对象-数组属性': function() {
			var obj = {
				key1: [1, 2, 3, 4]
			};
			var objString = JSON.stringify(obj);
			value_of(objString).should_be('{"key1":[1,2,3,4]}');
		},
		'对象-数组嵌套对象属性': function() {
			var obj = {
				key1: [1, 2, 3,	{
					key11: [1, 2, 3, {
						key111: 'hello world'
					}]
				}]
			};
			var objString = JSON.stringify(obj);
			value_of(objString).should_be('{"key1":[1,2,3,{"key11":[1,2,3,{"key111":"hello world"}]}]}');
		},
		'对象-对象属性': function() {
			var obj = {
				key1: {
					key11: 'hello world'
				}
			};
			var objString = JSON.stringify(obj);
			value_of(objString).should_be('{"key1":{"key11":"hello world"}}');
		},
		'对象-对象嵌套数组属性': function() {
			var obj = {
				key1: {
					key11: [1, 2, 3, 4]
				}
			};
			var objString = JSON.stringify(obj);
			value_of(objString).should_be('{"key1":{"key11":[1,2,3,4]}}');
		},
		'对象-空对象': function() {
			var obj = null;
			var objString = JSON.stringify(obj);
			value_of(objString).should_be('null');
		},
		'数组': function() {
			var obj = [1, true, false, 'hello world', null, undefined, NaN, {
					key: 'hello world'
				}];
			var objString = JSON.stringify(obj);
			value_of(objString).should_be('[1,true,false,"hello world",null,null,null,{"key":"hello world"}]');
		},
		'转义字符': function() {
			var obj = ['	"'];
			var objString = JSON.stringify(obj);
			value_of(objString).should_be('["\\t\\""]');
		},
		'日期': function() { /*该用例在Firefox3.5中会计算毫秒值，结果为"2009-12-31T15:59:59000Z"，在IE8与Chrome下为"2009-12-31T15:59:59Z"*/
			var obj = new Date("2009/12/31 23:59:59");
			var objString = JSON.stringify(obj);
			value_of(objString).log('Date 不是标准的Json。"2009-12-31T15:59:59Z"');//JK Date暂未标准化。
		},
		'字符串': function() {
			var obj = 'hello world';
			var objString = JSON.stringify(obj);
			value_of(objString).should_be('"hello world"');
		},
		'NULL': function() {
			var obj = null;
			var objString = JSON.stringify(obj);
			value_of(objString).should_be('null');
		},
		'UNDEFINED': function() { /*该用例在IE中返回的是字符串"undefined"，在Firefox与Chrome中返回的是undefined*/
			var obj = undefined;
			var objString = JSON.stringify(obj);
			value_of(objString).should_be('null');
		},
		'循环引用': function() {
			var obj = {};
			obj.key1 = obj;
			var ex = false;
			try {
				var objString = JSON.stringify(obj);
			} catch (e) {
				ex = true;
			}
			if (!ex) {
				value_of(this).should_fail('产生循环引用却未抛出异常，测试用例未通过。');
			} else {
				value_of('').log('循环引用导致堆栈溢出');
			}
		},
		'自定义toJSON方法1': function() {
			var _d_toJSON = Date.prototype.toJSON;
			var _n_toJSON = Number.prototype.toJSON;
			var _b_toJSON = Boolean.prototype.toJSON;
			var _s_toJSON = String.prototype.toJSON;

			Date.prototype.toJSON = function() {
				return 'test date';
			};

			var d = new Date();
			var obj = {
				date: d
			};
			var objString = JSON.stringify(obj);
			value_of(objString).should_be('{"date":"test date"}');

			Date.prototype.toJSON = _d_toJSON;
			Number.prototype.toJSON = _n_toJSON;
			Boolean.prototype.toJSON = _b_toJSON;
			String.prototype.toJSON = _s_toJSON;
		},
		'自定义toJSON方法2': function() {
			var _d_toJSON = Date.prototype.toJSON;
			var _n_toJSON = Number.prototype.toJSON;
			var _b_toJSON = Boolean.prototype.toJSON;
			var _s_toJSON = String.prototype.toJSON;

			Date.prototype.toJSON = function() {
				return {
					key: 'test'
				};
			};

			var d = new Date();
			var obj = {
				date: d
			};
			var objString = JSON.stringify(obj);
			value_of(objString).should_be('{"date":{"key":"test"}}');

			Date.prototype.toJSON = _d_toJSON;
			Number.prototype.toJSON = _n_toJSON;
			Boolean.prototype.toJSON = _b_toJSON;
			String.prototype.toJSON = _s_toJSON;
		}

	});

}());