/*
	Copyright (c) Baidu Youa Wed QWrap
	version: $version$ $release$ released
	author: JK
*/


/**
 * @class Selector Css Selector相关的几个方法
 * @singleton
 * @namespace QW
 */
(function() {
	var Selector = {
		/** 
		 * 把一个selector字符串转化成一个过滤函数.
		 * @method selector2Filter
		 * @static
		 * @param {string} sSelector 过滤selector
		 * @returns {function} : 返回过滤函数。
		 * @example: 
		 var fun=selector2Filter("input.aaa");alert(fun);
		 */
		selector2Filter: function(sSelector) {
			return s2f(sSelector);
		},
		/** 
		 * 判断一个元素是否符合某selector.
		 * @method test 
		 * @static
		 * @param {HTMLElement} el: 被考察参数
		 * @param {string} sSelector: 过滤selector
		 * @returns {function} : 返回过滤函数。
		 */
		test: function(el, sSelector) {
			return s2f(sSelector)(el);
		},
		/** 
		 * 用一个css selector来过滤一个数组.
		 * @method filter 
		 * @static
		 * @param {Array|Collection} els: 元素数组
		 * @param {string} sSelector: 过滤selector。
		 * @param {Element} pEl: 父节点。默认是document
		 * @returns {Array} : 返回满足过滤条件的元素组成的数组。
		 */
		filter: function(els, sSelector, pEl) {
			var allEls = (pEl || document).querySelectorAll(sSelector);
			return Array.filter(els, function(el){
				return Array.indexOf(allEls,el) > -1;
			});
		},
		/** 
		 * 以refEl为参考，得到符合过滤条件的HTML Elements. refEl可以是element或者是document
		 * @method query
		 * @static
		 * @param {HTMLElement} refEl: 参考对象
		 * @param {string} sSelector: 过滤selector,
		 * @returns {array} : 返回elements数组。
		 * @example: 
		 var els=query(document,"li input.aaa");
		 for(var i=0;i<els.length;i++ )els[i].style.backgroundColor='red';
		 */
		query: function(refEl, sSelector) {
			return toArray((refEl || document).querySelectorAll(sSelector));
		},
		/** 
		 * 以refEl为参考，得到符合过滤条件的一个元素. refEl可以是element或者是document
		 * @method one
		 * @static
		 * @param {HTMLElement} refEl: 参考对象
		 * @param {string} sSelector: 过滤selector,
		 * @returns {HTMLElement} : 返回element，如果获取不到，则反回null。
		 * @example: 
		 var els=query(document,"li input.aaa");
		 for(var i=0;i<els.length;i++ )els[i].style.backgroundColor='red';
		 */
		one: function(refEl, sSelector) {
			return (refEl || document).querySelector(sSelector);
		}
	};

	
	/*
	 * s2f(sSelector): 由一个selector得到一个过滤函数filter
	 */
	var filterCache = {};
	filterCache[''] = function(){
		return true;
	};
	filterCache['*'] = function(el){
		return !!el.tagName;
	};
	function s2f(sSelector) {
		if (!filterCache[sSelector]) {
			filterCache[sSelector] = function (el) {
				return el.parentNode && Array.indexOf(el.parentNode.querySelectorAll(sSelector), el) > -1;
			}
			
		}
		return filterCache[sSelector];
	}
	function toArray(arr){
		for (var i=arr.length-1, ret = []; i>-1; i--) {
			ret[i] = arr[i];
		}
		return ret;
	}
	QW.Selector = Selector;
}());