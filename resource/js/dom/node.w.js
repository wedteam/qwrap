/*
	Copyright (c) Baidu Youa Wed QWrap
	author: JK
	author: wangchen
*/
/** 
 * @class NodeW HTMLElement对象包装器
 * @namespace QW
 */
(function() {
	var ObjectH = QW.ObjectH,
		mix = ObjectH.mix,
		isString = ObjectH.isString,
		isArray = ObjectH.isArray,
		push = Array.prototype.push,
		NodeH = QW.NodeH,
		g = NodeH.g,
		query = NodeH.query,
		one = NodeH.one,
		create = QW.DomU.create;


	var NodeW = function(core) {
		if (!core) {//用法：var w=NodeW(null);	返回null
			if(this instanceof NodeW){	//new NodeW(null) -> 空数组的 NodeW, 否则会产生问题（产生一个没有core的NodeW）
				return new NodeW([]);
			}
			return null;
		}
		if(core instanceof NodeW){	//core是W的话要直接返回，不然的话W(W(el))会变成只有一个元素
			return core;
		}
		var arg1 = arguments[1];
		if (isString(core)) {
			core = core.replace(/^\s+/,'');
			if (/^</.test(core)) { //用法：var w=NodeW(html); 
				var list = create(core, true, arg1).childNodes,
					els = [];
				for (var i = 0, elI; elI = list[i]; i++) {
					els[i] = elI;
				}
				return new NodeW(els);
			} else { //用法：var w=NodeW(sSelector);
				return new NodeW(query(arg1, core));
			}
		} else {
			core = g(core, arg1);
			if (this instanceof NodeW) {
				this.core = core;
				if (isArray(core)) { //用法：var w=NodeW(elementsArray); 
					this.length = 0;
					push.apply(this, core);
				} else { //用法：var w=new NodeW(element)//不推荐; 
					this.length = 1;
					this[0] = core;
				}
			} else {//用法：var w=NodeW(element); var w2=NodeW(elementsArray); 
				return new NodeW(core); 
			}
		}
	};

	NodeW.one = function(core) {
		if (!core) {//用法：var w=NodeW.one(null);	返回null
			return null;
		}
		var arg1 = arguments[1];
		if (isString(core)) { //用法：var w=NodeW.one(sSelector); 
			core = core.replace(/^\s+/,'');
			if (/^</.test(core)) { //用法：var w=NodeW.one(html); 
				return new NodeW(create(core, false, arg1));
			} else { //用法：var w=NodeW(sSelector);
				return new NodeW(one(arg1, core));
			}
		} else {
			core = g(core, arg1);
			if (isArray(core)) { //用法：var w=NodeW.one(array); 
				return new NodeW(core[0]);
			} else {//用法：var w=NodeW.one(element); 
				return new NodeW(core); 
			}
		}
	};

	/** 
	 * 在NodeW中植入一个针对Node的Helper
	 * @method	pluginHelper
	 * @static
	 * @param	{helper} helper 必须是一个针对Node（元素）的Helper	
	 * @param	{string|json} wrapConfig	wrap参数
	 * @param	{json} gsetterConfig	(Optional) gsetter 参数
	 * @param	{boolean} override 强制覆盖，写adapter的时候可能会用到，将NodeW原有的函数覆盖掉
	 * @return	{NodeW}	
	 */

	NodeW.pluginHelper = function(helper, wrapConfig, gsetterConfig, override) {
		var HelperH = QW.HelperH;

		helper = HelperH.mul(helper, wrapConfig); //支持第一个参数为array

		var st = HelperH.rwrap(helper, NodeW, wrapConfig); //对返回值进行包装处理
		if (gsetterConfig) {//如果有gsetter，需要对表态方法gsetter化
			st = HelperH.gsetter(st, gsetterConfig);
		}

		mix(NodeW, st, override); //应用于NodeW的静态方法

		var pro = HelperH.methodize(helper, 'core');
		pro = HelperH.rwrap(pro, NodeW, wrapConfig);
		if (gsetterConfig) {
			pro = HelperH.gsetter(pro, gsetterConfig);
		}
		mix(NodeW.prototype, pro, override);
	};

	mix(NodeW.prototype, {
		/** 
		 * 返回NodeW的第0个元素的包装
		 * @method	first
		 * @return	{NodeW}	
		 */
		first: function() {
			return NodeW(this[0]);
		},
		/** 
		 * 返回NodeW的最后一个元素的包装
		 * @method	last
		 * @return	{NodeW}	
		 */
		last: function() {
			return NodeW(this[this.length - 1]);
		},
		/** 
		 * 返回NodeW的第i个元素的包装
		 * @method	last
		 * @param {int}	i 第i个元素
		 * @return	{NodeW}	
		 */
		item: function(i) {
			return NodeW(this[i]);
		},
		/** 
		 * 在NodeW的每个项上运行一个函数，并将函数返回真值的项组成数组，包装成NodeW返回。
		 * @method filter
		 * @param {Function|String} callback 需要执行的函数，也可以是css selector字符串，也可以是boolean
		 * @param {Object} pThis (Optional) 指定callback的this对象.
		 * @return {NodeW}
		 */
		filter: function(callback, pThis) {
			if (callback === true) {
				return NodeW(this.core);
			}
			if (callback === false) {
				return NodeW([]);
			}
			if (typeof callback == 'string') {
				callback = QW.Selector.selector2Filter(callback);
			}
			return NodeW(ArrayH.filter(this, callback, pThis));
		}
	});

	QW.NodeW = NodeW;
}());