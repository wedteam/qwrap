(function() {
	var ObjectH = QW.ObjectH;
	describe('ObjectH', {
		'ObjectH Members': function() {
			value_of('测试FunctionH拥有的属性').log();
		},
		'Object': function() {
			var a = {
				x: 1,
				y: 2,
				z: 3
			};

			value_of(ObjectH.keys(a)).log("keys");
			value_of(ObjectH.values(a)).log("values");

			var b = ObjectH.create(a);
			value_of(b).log("copied");

			function Foo() {}
			var c = new Foo();
			var d = ObjectH.create(c);
			value_of(d instanceof Foo).should_be(true);
		},
		'isString/isFunction/isArray/isObject': function() {

			value_of(ObjectH.isString('hello')).should_be(true);
			value_of(ObjectH.isString(new String(true))).should_be(true);
			value_of(ObjectH.isString(1)).should_be(false);

			value_of(ObjectH.isFunction(function() {})).should_be(true);
			value_of(ObjectH.isFunction(new Function(';'))).should_be(true);
			value_of(ObjectH.isFunction('hello')).should_be(false);

			value_of(ObjectH.isArray([])).should_be(true);
			value_of(ObjectH.isArray(null)).should_be(false);
			value_of(ObjectH.isArray({})).should_be(false);

			value_of(ObjectH.isObject(null)).should_be(false);
			value_of(ObjectH.isObject({})).should_be(true);
			value_of(ObjectH.isObject([])).should_be(true);
			value_of(ObjectH.isObject('hello')).should_be(false);
		},
		'isArrayLike/isPlainObject/isWrap/isElement': function() {

			value_of(ObjectH.isArrayLike([])).should_be(true);
			value_of(ObjectH.isArrayLike(document.body.childNodes)).should_be(true);
			value_of(ObjectH.isArrayLike({})).should_be(false);

			value_of(ObjectH.isPlainObject({})).should_be(true);
			value_of(ObjectH.isPlainObject(new Object())).should_be(true);
			value_of(ObjectH.isPlainObject('hello')).should_be(false);

			value_of(ObjectH.isWrap({
				core: 1
			})).should_be(true);
			value_of(ObjectH.isWrap({
				myCore: 1
			}, 'myCore')).should_be(true);
			value_of(ObjectH.isWrap({})).should_be(false);

			value_of(ObjectH.isElement(document.body)).should_be(true);
			value_of(ObjectH.isElement({})).should_be(false);
			value_of(ObjectH.isElement(null)).should_be(false);
		},
		'mix': function() {
			var el = {};
			ObjectH.mix(el, {
				name: 'JK'
			});
			value_of(el.name).should_be('JK');
			ObjectH.mix(el, {
				name: 'Tom'
			});
			value_of(el.name).should_be('JK');
			ObjectH.mix(el, {
				name: 'Tom'
			}, true);
			value_of(el.name).should_be('Tom');
		},
		'deep mix': function(){
			var des = {
				a : {x:1},
				b : {y:2}
			}, src =  {
				a : {y:1},
				b : {y:-2},
				c : {z:0}
			}; 
			
			ObjectH.mix(des, src, function(d, s){
				if(d && typeof d == 'object'){
					return ObjectH.mix(d, s, arguments.callee);
				}else{
					return s;
				}
			});
			value_of(des.a.y).should_be(1);
			value_of(des.b.y).should_be(-2);
			value_of(des.c.z).should_be(0);
		},
		'dump': function() {
			var a = ObjectH.dump({
				x: 1,
				y: 2,
				z: 3
			}, ["x", "y"]);
			value_of(a.x).should_be(1);
			value_of(a.z).should_be(undefined);
			var el = {
				name: 'JK',
				age: 100
			};
			var el2 = {
				name: 'Tom'
			};
			var el3 = ObjectH.dump(el, ['name']);
			value_of(el3.name).should_be('JK');
			value_of(el3.age).should_be(undefined);

			ObjectH.dump(el, ['name'], el2);
			value_of(el2.name).should_be('Tom');
			ObjectH.dump(el, ['name'], el2, true);
			value_of(el3.name).should_be('JK');
		},
		'keys': function() {
			var el = {
				name: 'JK',
				age: 100
			};
			value_of(ObjectH.keys(el)).property_should_be('length', 2);
		},
		'set': function() {
			var el = {
				name: 'JK',
				age: 100,
				friend: {}
			};
			ObjectH.set(el, 'friend.name', 'Tom');
			value_of(el.friend.name).should_be('Tom');
			ObjectH.set(el, {
				'friend.age': 10,
				teacher: {
					name: 'Zhou'
				}
			});
			value_of(el.friend.age + el.teacher.name).should_be('10Zhou');
			ObjectH.set(el, function(el) {
				el.hometown = 'HB';
			});
			value_of(el.hometown).should_be('HB');

		},
		'get': function() {
			var el = {
				name: 'JK',
				age: 100,
				friend: {
					name: 'Tom'
				}
			};
			value_of(ObjectH.get(el, 'name')).should_be('JK');
			value_of(ObjectH.get(el, 'friend.name')).should_be('Tom');
			value_of(ObjectH.get(el, 'friendd.name')).should_be(undefined);
			value_of(ObjectH.get(el, function(el) {
				return el.friend.name;
			})).should_be('Tom');
		},
		'stringify': function() {
			var json = {
				"cardNo": "bbbb1234",
				"history": [1, 2]
			};
			value_of(ObjectH.stringify(json)).should_be('{"cardNo":"bbbb1234","history":[1,2]}');
		},
		'encodeURIJson': function() {
			var json = {
				"a": "1",
				"b": [1, 2]
			};
			value_of(ObjectH.encodeURIJson(json)).should_be('a=1&b=1&b=2');
		}
	});

}());