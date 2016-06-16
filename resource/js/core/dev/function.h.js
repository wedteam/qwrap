/*
	Copyright (c) Baidu Youa Wed QWrap
	version: $version$ $release$ released
	author: 月影
*/

/*
 * @class FunctionH 核心对象Function的扩展
 * @singleton 
 * @namespace QW
 * @helper
 */
(function() {
	var FunctionH = {
		/**
		 * 函数包装器 curry
		 * <p>将一个方法的任意参数固化，传递给它一组参数，这组参数中不为undefined的值被固化，返回固化后的新方法</p>
		 * @method curry
		 * @static
		 * @param {function} func 被包装的函数
		 * @param {array} curryArgs 柯里化(固化)参数
		 * @return {function} 被curry的方法
		 */
		curry: function(func, curryArgs) {
			curryArgs = curryArgs || [];
			return function() {
				var args = [];
				var newArgs = [].slice.call(arguments);

				for (var i = 0, len = curryArgs.length; i < len; i++) {
					if (i in curryArgs) {
						args.push(curryArgs[i]);
					} else {
						if (newArgs.length) {
							args.push(newArgs.shift());
						}
					}
				}

				args = args.concat(newArgs);
				return func.apply(this, args);
			};
		},
		/**
		 * 函数参数重载方法 overload，对函数参数进行模式匹配。默认的dispatcher支持*和...以及?，"*"表示一个任意类型的参数，"..."表示多个任意类型的参数，"?"一般用在",?..."表示0个或任意多个参数
		 * @method overload
		 * @static
		 * @param {function} func如果匹配不成功，默认执行的方法
		 * @param {json} func_maps 根据匹配接受调用的函数列表
		 * @param {function} dispatcher (Optional) 用来匹配参数负责派发的函数
		 * @return {function} 已重载化的函数
		 */
		overload: function(func, func_maps, dispatcher) {
			if (!dispatcher) {
				dispatcher = function() {
					var args = [].slice.call(arguments);
					return map(args, function(o) {
						return typeof o;
					}).join();
				};
			}

			return function() {
				var key = dispatcher.apply(this, arguments);
				for (var i in func_maps) {
					var pattern = new RegExp("^" + i.replace("*", "[^,]*").replace("...", ".*") + "$");
					if (pattern.test(key)) {
						return func_maps[i].apply(this, arguments);
					}
				}
				return func.apply(this, arguments);
			};
		},
		/**
		 * 函数包装器 defer
		 * <p>让被包装方法总是被异步调用</p>
		 * <p>方法被包装后，调用时，第一个参数总是一个延时毫秒数，默认为0，后续是原方法的参数，返回值是setTimeout的id</p>
		 * @method defer
		 * @static
		 * @param {function} func 被包装的函数
		 * @return {function} 被包装defer的方法
		 */
		defer: function(func) {
			return function(ims) {
				ims = ims || 0;
				var args = [].slice.call(arguments, 1);
				var me = this;

				var tid = setTimeout(
					function() {
						func.apply(me, args);
					}, 
					ims
				);
				return tid;
			};
		},
		/**
		 * 切换一组函数，每次调用时换下一个函数
		 */
		toggle: function(){
			var i = 0,
				funlist = Array.prototype.slice.call(arguments);
			return function(){
				return funlist[i++%funlist.length].apply(this, arguments);
			}
		}
	};

	QW.ObjectH.mix(QW.FunctionH, FunctionH);

}());