/*
	Copyright (c) Baidu Youa Wed QWrap
	version: $version$ $release$ released
	author: 月影
*/


/**
 * @class HashsetH HashsetH是对不含有重复元素的数组进行操作的Helper
 * @singleton 
 * @namespace QW
 * @helper 
 */

(function() {
	var contains = QW.ArrayH.contains;

	var HashsetH = {
		/** 
		 * 合并两个已经uniquelize过的数组，相当于两个数组concat起来，再uniquelize，不过效率更高
		 * @method union
		 * @static
		 * @param {Array} arr 待处理的数组.
		 * @param {Array} arr2 待处理的数组.
		 * @return {Array} 返回一个新数组
		 * @example 
		 var arr=["a","b"];
		 var arr2=["b","c"];
		 alert(union(arr,arr2));
		 */
		union: function(arr, arr2) {
			var ra = [];
			for (var i = 0, len = arr2.length; i < len; i++) {
				if (!contains(arr, arr2[i])) {
					ra.push(arr2[i]);
				}
			}
			return arr.concat(ra);
		},
		/** 
		 * 求两个已经uniquelize过的数组的交集
		 * @method intersect
		 * @static
		 * @param {Array} arr 待处理的数组.
		 * @param {Array} arr2 待处理的数组.
		 * @return {Array} 返回一个新数组
		 * @example 
		 var arr=["a","b"];
		 var arr2=["b","c"];
		 alert(intersect(arr,arr2));
		 */
		intersect: function(arr, arr2) {
			var ra = [];
			for (var i = 0, len = arr2.length; i < len; i++) {
				if (contains(arr, arr2[i])) {
					ra.push(arr2[i]);
				}
			}
			return ra;
		},
		/** 
		 * 求两个已经uniquelize过的数组的差集
		 * @method minus
		 * @static
		 * @param {Array} arr 待处理的数组.
		 * @param {Array} arr2 待处理的数组.
		 * @return {Array} 返回一个新数组
		 * @example 
		 var arr=["a","b"];
		 var arr2=["b","c"];
		 alert(minus(arr,arr2));
		 */
		minus: function(arr, arr2) {
			var ra = [];
			for (var i = 0, len = arr.length; i < len; i++) {
				if (!contains(arr, arr2[i])) {
					ra.push(arr[i]);
				}
			}
			return ra;
		},
		/** 
		 * 求两个已经uniquelize过的数组的补集
		 * @method complement
		 * @static
		 * @param {Array} arr 待处理的数组.
		 * @param {Array} arr2 待处理的数组.
		 * @return {Array} 返回一个新数组
		 * @example 
		 var arr=["a","b"];
		 var arr2=["b","c"];
		 alert(complement(arr,arr2));
		 */
		complement: function(arr, arr2) {
			return HashsetH.minus(arr, arr2).concat(HashsetH.minus(arr2, arr));
		}
	};

	QW.HashsetH = HashsetH;

}());