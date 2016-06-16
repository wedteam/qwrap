/*
	Copyright (c) Baidu Youa Wed QWrap
	version: $version$ $release$ released
	author: 月影、JK
*/

/*
 * @class ObjectH 核心对象Array的扩展
 * @singleton 
 * @namespace QW
 * @helper
 */
(function() {
	var ObjectH = {
		/**
		 * 将一个扁平化的对象展“折叠”一个深层次对象，其中包含"."的属性成为深层属性
		 * @method fold
		 * @static
		 * @param obj {Object} 要折叠的对象
		 * @return {Object} 折叠后的对象
		 */
		fold: function(obj) {
			var ret = {};
			for (var prop in obj) {
				var keys = prop.split(".");

				for (var i = 0, o = ret, len = keys.length - 1; i < len; i++) {
					if (!(keys[i] in o)) {o[keys[i]] = {}; }
					o = o[keys[i]];
				}
				o[keys[i]] = obj[prop];
			}
			return ret;
		},
		/**
		 * 将一个对象扁平化，是fold的反向操作
		 * @method expand
		 * @static
		 * @param obj {Object} 要扁平化的对象
		 * @return {Object} 扁平化后的对象
		 */
		expand: function(obj) {
			var ret = {};
			var f = function(obj, profix) {
				for (var each in obj) {
					var o = obj[each];
					var p = profix.concat([each]);
					if (ObjectH.isPlainObject(o)) {
						f(o, p);
					} else {
						ret[p.join(".")] = o;
					}
				}
			};
			f(obj, []);
			return ret;
		},
		/**
		 * 将gsetter格式的json串转为相应的gsetter过的helper
		 * 把gsetter形式规范成一种特殊的数据类型
		 * 即形如 {name: {get:..., set:...},...}的结构
		 * gsetter就是转换这种结构为function的
		 * gsetter格式的json串为：
		 *    var gsetterConf = { 
		 *			"attr" :{ //这一种是有key的
		 *				key : true,
		 *				get : function(self, key){
		 *					//getter	
		 *				},
		 *				set : function(self, key, value){
		 *					//setter
		 *				}
		 *			},
		 *			"val" :{ //这一种是没有key的
		 *				get : function(self){
		 *					//getter	
		 *				},
		 *				set : function(self, value){
		 *					//setter
		 *				}
		 *			}
		 *		}
		 *
		 *    ObjectH.gsetter(gsetterConf); //返回 {attr:function(){...}, val:function(){...}}
		 *
		 * 通常getter比setter的参数个数多 1
		 *
		 * @param obj {json} 要转换的对象
		 * @param withSeperate {boolean} 是否保留getXxx setXxx 
		 */
		gsetter: function(obj, withSeperate){
			var ret = {};

			for(var attr in obj){
				var prop = obj[attr], setter, getter;
				
				if(prop && (getter = prop['get']) && (setter = prop['set']))
				{
					/*
						通用的ObjectH.gsetter
						推荐用这个版本代替Helper的gsetter
						但这个版本必须在pluginHelper之前mix进去
						因为这个依赖于函数定义时的形参数量
						所以对retouch过的函数无效
						例子：（这样设置更语义化）
							//init gsetters
							mix(NodeH,
								gsetter({
									css: {
										key: true,
										get: NodeH.getCurrentStyle,
										set: NodeH.setStyle
									},
									size: {
										get: NodeH.getSize,
										set: NodeH.setInnerSize
									}	
								})
							);
							这样在node.c中要设置css、size的类型为gsetter
					*/				
					ret[attr] = function(){
						var hasKey = !!prop.key, key, len = arguments.length;
						//console.log(hasKey);
						if( len == getter.length && 
							(!hasKey || (key = arguments[len - 1])
							&& !ObjectH.isPlainObject(key))){
							//如果有key，key不能是JSON，如果key是JSON，认为是批量setter
							//如果不需要让key作为JSON的时候批量操作，可以不设key这个参数
							return getter.apply(this, arguments);
						}else{
							//gsetter当作为setter时不return
							//特意的，为了支持config里的"gsetter"，那个通过mul的getFirstDefined实现
							//也就是说gsetter必然抛弃setter中的返回值
							setter.apply(this, arguments); 
						}
					};
				}
				else{
					throw new Error('object is not a valid gsetter!');
				}

				if(withSeperate){
					var _attr = capitalize(attr);
					ret["get" + _attr] = getter;
					ret["set" + _attr] = setter;
				}
			}
			return ret;
		},
		/**
		 * 以keys/values数组的方式添加属性到一个对象<br/>
		 * <strong>如果values的长度大于keys的长度，多余的元素将被忽略</strong>
		 * @method fromArray
		 * @static
		 * @param {Object} obj 被操作的对象
		 * @param {Array} keys 存放key的数组
		 * @param {Array} values 存放value的数组
		 * @return {Object} 返回添加了属性的对象
		 */
		fromArray: function(obj, keys, values) {
			values = values || [];
			for (var i = 0, len = keys.length; i < len; i++) {
				obj[keys[i]] = values[i];
			}
			return obj;
		}
	};

	QW.ObjectH.mix(QW.ObjectH, ObjectH);

}());