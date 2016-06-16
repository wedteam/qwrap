(function() {
	var HelperH = QW.HelperH,
		mix = QW.ObjectH.mix;
	describe('HelperH', {
		'helper': function() {
			value_of(QW.HelperH).log();
		},
		'applyTo': function() {
			var TestH = {
				a: function() {},
				b: function() {},
				c: function() {}
			};
			var t = {};

			mix(t, TestH);
			value_of(t).log();
		},
		'methodizeTo': function() {
			var TestH = {
				a: function(n) {
					return n.x;
				},
				b: function(n) {
					return 2 * n.x;
				},
				c: function(n) {
					return 3 * n.x;
				}
			};
			var T = function(x) {
				this.x = x;
			};

			var methodized = QW.HelperH.methodize(TestH);
			mix(T.prototype, methodized);

			value_of(T).log();
			var t = new T(10);
			value_of(t).log();
			value_of(t.a()).should_be(10);
			value_of(t.c()).should_be(30);
		},
		'methodizeToClass': function() {
			var TestH = {
				a: function(n) {
					return n.x;
				},
				b: function(n) {
					return 2 * n.x;
				},
				c: function(n) {
					return 3 * n.x;
				},
				z: 30
			};
			var T = function(x) {
				this.x = x;
			};
			mix(T, TestH);

			var methodized = QW.HelperH.methodize(TestH);
			mix(T.prototype, methodized);

			value_of(T).log();
			value_of(T.z).should_be(30);
			var t = new T(10);
			value_of(t).log();
			value_of(t.a()).should_be(10);
			value_of(t.c()).should_be(30);
		},
		'applyToWrap': function() {
			var TestH = {
				a: function(n) {
					return n.x;
				},
				b: function(n) {
					return 2 * n.x;
				},
				c: function(n) {
					return 3 * n.x;
				},
				z: 30
			};
			var core = {
				x: 10
			};

			var Wrap = function(o) {
				this.core = o;
			};

			mix(Wrap, TestH);

			var t = new Wrap(core);

			value_of(t).log();
			value_of(Wrap.a(t.core)).should_be(10);
		},
		'methodizeToWrap': function() {
			var TestH = {
				a: function(n) {
					return n.x;
				},
				b: function(n) {
					return 2 * n.x;
				},
				c: function(n) {
					return 3 * n.x;
				},
				z: 30
			};
			var core = {
				x: 10
			};

			var Wrap = function(o) {
				this.core = o;
			};

			var methodized = QW.HelperH.methodize(TestH, "core");
			mix(Wrap.prototype, methodized);

			var t = new Wrap(core);

			value_of(t).log();
			value_of(t.a()).should_be(10);
		},
		'chain': function() {
			var TestH = {
				a: function(n) {
					return n.x++;
				},
				b: function(n) {
					n.x *= 2;
					return n;
				},
				c: function(n) {}
			};

			var core = {
				x: 10
			};

			var Wrap = function(o) {
				this.core = o;
			};

			var TH = QW.HelperH.rwrap(TestH, Wrap, {
				a: 'operator',
				b: 'queryer'
			});
			TH = QW.HelperH.methodize(TH, "core");

			mix(Wrap.prototype, TH);

			var t = new Wrap(core);

			value_of(t).log();
			value_of(t.a()).log();
			value_of(t.core).log();

			value_of(t.a().a()).log();
			value_of(t.core.x).should_be(13);

			value_of(t.b().b()).log();
			value_of(t.core.x).should_be(52);
		},
		'gsetter': function() {
			var TestH = {
				getName: function(o) {
					return o.name;
				},
				setName: function(o, name) {
					o.name = name;
					return o;
				},
				getAttr: function(el, attribute) {
					return el[attribute];
				},

				setAttr: function(el, attribute, value) {
					if ('object' != typeof attribute) {
						el[attribute] = value;
					} else {
						for (var prop in attribute) {
							TestH.setAttr(el, prop, attribute[prop]);
						}
					}
				}
			};

			var config = {
				name: ['getName', 'setName'],
				attr: ['', 'getAttr', 'setAttr']
			};

			TestH = QW.HelperH.gsetter(TestH, config);

			var o = {};
			value_of(TestH.name(o)).should_be(undefined); 
			value_of(TestH.name(o, 'JK').name).should_be('JK');
			TestH.attr(o, 'age', 100);
			TestH.attr(o, {hometown: 'HB', lastname: 'Ying'});
			value_of(TestH.attr(o, 'age')).should_be(100);
			value_of(TestH.attr(o, 'hometown')).should_be('HB');
			value_of(TestH.attr(o, 'lastname')).should_be('Ying');

			TestH.attr(o, {Akira: 'Akira'});
			value_of(TestH.attr(o, 'Akira')).should_be('Akira');

			/**
			 * 提供gsetter的另一种配置方法
			 * 也可以用户自己实现gsetter（某些场合下就不必要把一个本来就属于gsetter的函数拆分开来）
			 */
			function custom_attr(el, attribute, value){
				if('object' != typeof attribute){
					return arguments.length < 3 ? 
							TestH.getAttr(el, attribute) :
							TestH.setAttr(el, attribute, value) ;
				}else{
					for (var prop in attribute){
						TestH.setAttr(el, prop, attribute[prop]);
					}
				}
			};

			var TestW = function(core){
				this.core = core;
			}
			
			TestH = QW.HelperH.rwrap(mix(TestH, {custom_attr:custom_attr}), TestW, {
				getAttr : "getter_first",
				getName : "getter_first",
				setAttr : "operator",
				setName : "operator",
				//因为这个例子中gsetter先于rwrap，所以要加这个配置
				//如果反过来，rwrap先于gsetter，则可以省略这个配置（事实上rwrap的时候也还没有attr和name）
				attr : "gsetter",  
				name : "gsetter",
				custom_attr : "gsetter"
			});

			mix(TestW.prototype, QW.HelperH.methodize(TestH, "core"));

			var oW = new TestW(o);
			oW.custom_attr({"age" : 200});
			value_of(oW.attr('age')).should_be(200);
			value_of(oW.attr('hometown')).should_be('HB');
			value_of(oW.custom_attr('lastname')).should_be('Ying');			
		},
		'mul': function() {
			var TestH = {
				a: function(n) {
					return ++n.x;
				},
				b: function(n) {
					n.x *= 2;
					return n;
				},
				c: function(n) {}
			};
			var core = [{
				x: 10
			}, {
				x: 20
			}, {
				x: 30
			}];
			var Wrap = function(o) {
				this.core = o;
			};

			TestH = QW.HelperH.mul(TestH);

			var TH = QW.HelperH.rwrap(TestH, Wrap, {
				a: 'operator',
				b: 'queryer'
			});
			TH = QW.HelperH.methodize(TH, "core");

			mix(Wrap.prototype, TH);

			var t = new Wrap(core);

			value_of(t.a().b()).log();
			value_of(t.core[1].x).should_be(42);

			TestH = {
				a: function(n) {
					return [n, -n];
				},
				b: function(n) {
					return [n, -n];
				},
				c: function(n) {
					return [n, -n];
				}
			};
			core = [1, 2, 3];
			Wrap = function(o) {
				this.core = o;
			};

			var config = {
				a: 'queryer',
				b: 'getter_first',
				c: 'getter_first_all'
			};

			var TH = QW.HelperH.mul(TestH, config);
			TH = QW.HelperH.rwrap(TH, Wrap, config);
			TH = QW.HelperH.methodize(TH, "core");

			mix(Wrap.prototype, TH);

			t = new Wrap(core);
			value_of(t.a().core).log();
			value_of(t.b()).log();
			value_of(t.c()).log();
			value_of(t.cAll()).log();
		},
		'List': function() {
			function List(items) {
				this.items = items;
			}

			var TestH = {
				a: function(n) {
					return ++n.x;
				},
				b: function(n) {
					n.x *= 2;
					return n;
				},
				c: function(n) {}
			};

			var items = [{
				x: 10
			}, {
				x: 20
			}, {
				x: 30
			}];
			var t = new List(items);

			TestH = QW.HelperH.mul(TestH);

			var TH = QW.HelperH.rwrap(TestH, List, {
				a: 'operator',
				b: 'queryer'
			});

			TH = QW.HelperH.methodize(TH, "items");

			mix(List.prototype, TH);

			value_of(t.a().b()).log();
			value_of(t.items[2].x).should_be(62);
		}
	});

}());