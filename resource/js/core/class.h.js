/*
	Copyright (c) Baidu Youa Wed QWrap
	version: $version$ $release$ released
	author: 月影
*/

/**
 * @class ClassH 为function提供强化的原型继承能力
 * @singleton 
 * @namespace QW
 * @helper
 */
(function() {
	var mix = QW.ObjectH.mix,
		create = QW.ObjectH.create;

	var ClassH = {
		/**
		 * <p>为类型动态创建一个实例，它和直接new的区别在于instanceof的值</p>
		 * <p><strong>第二范式：new T <=> T.apply(T.getPrototypeObject())</strong></p>
		 * @method createInstance
		 * @static
		 * @prarm {function} cls 要构造对象的类型（构造器）
		 * @return {object} 这个类型的一个实例
		 */
		createInstance: function(cls) {
			var p = create(cls.prototype);
			cls.apply(p, [].slice.call(arguments, 1));
			return p;
		},

		/**
		 * 函数包装器 extend
		 * <p>改进的对象原型继承，延迟执行参数构造，并在子类的实例中添加了$super引用</p>
		 * @method extend
		 * @static
		 * @param {function} cls 产生子类的原始类型
		 * @param {function} p 父类型
		 * @return {function} 返回以自身为构造器继承了p的类型
		 * @throw {Error} 不能对继承返回的类型再使用extend
		 */
		extend: function(cls, p /*,p1,p2... 多继承父类型*/) {

			function comboParents(parents){
				var T = function(){};
				T.prototype = parents[0].prototype;

				for(var i = 1; i < parents.length; i++){
					var P = parents[i]; 	
					mix(T.prototype, P.prototype);
				}
				return new T();
			}

			var cp = cls.prototype;

			cls.prototype = comboParents([].slice.call(arguments, 1));

			//$super指向第一个父类，在构造器内可以通过arguments.callee.$super执行父类构造
			//多继承时，instance和$super只对第一个父类有效
			cls.$super = p; 

			//如果原始类型的prototype上有方法，先copy
			mix(cls.prototype, cp, true);

			return cls;
		}
	};

	QW.ClassH = ClassH;

}());