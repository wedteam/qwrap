/*
	Copyright (c) Baidu Youa Wed QWrap
	version: $version$ $release$ released
*/

/*
 * @class ArrayH 核心对象Array的扩展
 * @singleton 
 * @namespace QW
 * @helper
 */
(function() {
	var ArrayH = {
		/*
		 * 快速除重，相对于ArrayH.unique，为了效率，牺了代码量与严谨性。如果数组里有不可添加属性的对象，则会抛错.
		 * @method quicklyUnique
		 * @static
		 * @param {array} arr 待处理数组
		 * @return {array} 返回除重后的新数组
		 */
		quicklyUnique: function(arr) {
			var strs = {},
				numAndBls = {},
				objs = [],
				hasNull,
				hasUndefined,
				ret = [];
			for (var i = 0, len = arr.length; i < len; i++) {
				var oI = arr[i];
				if (oI === null) {
					if (!hasNull) {
						hasNull = true;
						ret.push(oI);
					}
					continue;
				}
				if (oI === undefined) {
					if (!hasUndefined) {
						hasUndefined = true;
						ret.push(oI);
					}
					continue;
				}
				var type = typeof oI;
				switch (type) {
				case 'object':
				case 'function':
					if (!oI.__4QuicklyUnique) {
						oI.__4QuicklyUnique = true;
						ret.push(oI);
						objs.push(oI);
					}
					break;
				case 'string':
					if (!strs[oI]) {
						ret.push(oI);
						strs[oI] = true;
					}
				default:
					if (!numAndBls[oI]) {
						ret.push(oI);
						numAndBls[oI] = true;
					}
					break;
				}
			}
			for (i = 0; oI = objs[i++];) {
				if (oI instanceof Object) {
					delete oI.__4QuicklyUnique;
				} else {
					oI.__4QuicklyUnique = undefined;
				}
			}
			return ret;
		},
		/*
		 * 快速排序，按某个属性，或按“获取排序依据的函数”，来排序.
		 * @method soryBy
		 * @static
		 * @param {array} arr 待处理数组
		 * @param {string|function} prop 排序依据属性，获取
		 * @param {boolean} desc 降序
		 * @return {array} 返回排序后的新数组
		 */
		sortBy: function(arr, prop, desc) {
			var props = [],
				ret = [],
				i = 0,
				len = arr.length;
			if (typeof prop == 'string') {
				for (; i < len; i++) {
					var oI = arr[i];
					(props[i] = new String(oI && oI[prop] || ''))._obj = oI;
				}
			} else if (typeof prop == 'function') {
				for (; i < len; i++) {
					oI = arr[i];
					(props[i] = new String(oI && prop(oI) || ''))._obj = oI;
				}
			} else {
				throw '参数类型错误';
			}
			props.sort();
			for (i = 0; i < len; i++) {
				ret[i] = props[i]._obj;
			}
			if (desc) {ret.reverse(); }
			return ret;
		}
	};

	QW.ObjectH.mix(QW.ArrayH, ArrayH);

}());