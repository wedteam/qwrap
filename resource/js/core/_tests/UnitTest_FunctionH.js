(function() {
	var FunctionH = QW.FunctionH,
		ObjectH = QW.ObjectH;
	//JK begin-----
	describe('FunctionH', {
		'FunctionH Members': function() {
			value_of('测试FunctionH拥有的属性').log();
		},

		'bind': function() {
			var bind = FunctionH.bind;

			var test = function() {
				return this.length;
			};
			var testHello = bind(test, 'hello');
			value_of(testHello()).should_be(5);

			x = 9;//window.x
			module = {
				getX: function() {
					return this.x;
				},
				x: 81
			};

			value_of(module.getX()).should_be(81);
			var getX = module.getX;
			value_of(getX()).should_be(9);

			var boundGetX = bind(getX, module);
			value_of(boundGetX()).should_be(81);

			function List() {
				var a = [];

				for (var i = 0; i < arguments.length; i++) {
					a.push(arguments[i]);
				}

				return a;
			}

			var listOne = List(1, 2, 3);

			value_of(listOne).log();

			var leadingZeroList = bind(List, null, 0);

			value_of(leadingZeroList()).log();
			value_of(leadingZeroList(1)).log();
			value_of(leadingZeroList(1, 2)).log();

			value_of(leadingZeroList(1, 2)).should_have_property(0);

			function Point(x, y) {
				this.x = x;
				this.y = y;
			}

			Point.prototype.toString = function() {
				return this.x + "," + this.y;
			};

			var p = new Point(1, 2);

			value_of(p.toString()).should_be("1,2");

			var YAxisPoint = bind(Point, null, 0);

			var axisPoint = new YAxisPoint(5);

			value_of(axisPoint.toString()).should_be("0,5");

			value_of(axisPoint instanceof Point).should_be(true);
			value_of(axisPoint instanceof YAxisPoint).should_be(true);
			value_of(p instanceof YAxisPoint).should_be(false);
		},
		'methodize': function() {
			var setName = function(el, name) {
				el.name = name;
			};
			var el = {};
			el.setName = FunctionH.methodize(setName);
			el.setName('JK');
			value_of(el.name).should_be('JK');
		},
		'mul': function() {
			var getFirst = 1,
				joinLists = 2,
				getFirstValued = 3;

			var setName = function(el, name) {
				el.name = name;
			};
			var setElsName = FunctionH.mul(setName);
			var els = [{}, {}];
			setElsName(els, 'JK');
			value_of(els[0].name).should_be('JK');
			value_of(els[1].name).should_be('JK');

			var numbers = [1, 2, 3, 4];
			var pair = function(x) {
				return [x, -x];
			};
			var pairAll = FunctionH.mul(pair); //非扁平化
			numbers = pairAll(numbers);
			value_of(numbers[1][0]).should_be(2);
			value_of(numbers[1][1]).should_be(-2);

			numbers = [1, 2, 3, 4];
			var pairAllFlat = FunctionH.mul(pair, joinLists); //扁平化
			numbers = pairAllFlat(numbers);
			value_of(numbers[1]).should_be(-1);
			value_of(numbers[2]).should_be(2);

			var objs = [{x:1}, {x:2}, {x:3}];
			var getX = function(obj){
				return obj.x;
			}
			var getFirstX = FunctionH.mul(getX, getFirst);
			var x = getFirstX(objs);
			value_of(x).should_be(1);

			var values = [,,,3,,1];
			var getV = function(v){
				return v;
			}
			var getFirstValuedV = FunctionH.mul(getV, getFirstValued);
			var v = getFirstValuedV(values);
			value_of(v).should_be(3);
		},
		'rwrap' : function(){
			function Wrap(core){
				this.core = core;
			}
			
			function getV(x, y){
				return x+y;
			}
			
			var getW = FunctionH.rwrap(getV, Wrap, "returnValue");
			value_of(getW(2,3).core).should_be(5);	

			var getXW = FunctionH.rwrap(getV, Wrap, 0);
			value_of(getXW(2,3).core).should_be(2);

			var getYW = FunctionH.rwrap(getV, Wrap, 1);
			value_of(getYW(2,3).core).should_be(3);

			var obj = { 
				addObjX: function(){
					this.z = this.x + this.y;
					return this.z;
				},
				x: 1,
				y: 2
			};

			value_of(obj.addObjX()).should_be(3);

			obj.addObjX = FunctionH.rwrap(obj.addObjX, Wrap, "this");

			value_of(obj.addObjX().core.z).should_be(3);
		},
		'hook' : function(){
			function join(x, y){
				return [x,y].join('-');
			}
			var joinCamelize = FunctionH.hook(join, "after", function(returnValue){
				return QW.StringH.camelize(returnValue);
			});

			value_of(join("a","b")).should_be("a-b");
			value_of(joinCamelize("c","d")).should_be("cD");

			var joinUpperCase = FunctionH.hook(join, "before", function(args){
				args[0] = args[0].toUpperCase();
				args[1] = args[1].toUpperCase();
			});

			value_of(joinUpperCase("e","f")).should_be("E-F");
		},
		'lazyApply' : function(){
			var v;
			function f(){
				if(v !== 1)
					throw new Error;
				//console.log(v);
			}
			FunctionH.lazyApply(f, null, [], 500, function(){
				return (v = 1);
			});
		}
	});

}());