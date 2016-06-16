/*
	Copyright (c) Baidu Youa Wed QWrap
	version: $version$ $release$ released
	author: 好奇(WC)
	remark: 本版本由好奇同学编写，备用。
*/

/** 
 * @class EventTargetH EventTarget Helper，处理和事件触发目标有关的兼容问题
 * @singleton
 * @helper
 * @namespace QW
 */

(function() {

	var g = QW.NodeH.g,
		O = QW.ObjectH;

	var Cache = function () {
		this.cache = {};
		this.separator = '\x01';
		this.propertyName = '__EventTargetH_ID';

		this._index = 0;
	};

	O.mix(Cache.prototype, {
		
		makeKey : function () {
			var i = 0,
				l = arguments.length,
				result = [],
				temp,
				key;

			for (; i < l ; ++i) {
				temp = arguments[i];

				if (temp == null) break;

				if ('function' == typeof temp || 'object' == typeof temp) {
					if (!temp[this.propertyName]) {
						key = temp[this.propertyName] = ++ this._index;
					} else {
						key = temp[this.propertyName];
					}
				} else {
					key = temp;
				}
				result.push(key);
			}

			return result.join(this.separator);

		},

		add : function (key, value) {
			var result = null;
			if (!this.cache[key]) {
				result = this.cache[key] = { key : key, value : value };
			}
			return result;
		},

		remove : function (key) {
			var result = this.cache[key] || null;
			if (result) {
				delete this.cache[key];
			}
			return result;
		},

		get : function (key) {
			return this.cache[key] ? this.cache[key] : null;
		},

		hasKey : function (key) {
			return !!this.cache[key];
		},

		like : function (key) {
			var cache = this.cache,
				result = [],
				temp,
				i;

			for (i in cache) {
				temp = cache[i];

				result.push({
					key : temp.key,
					value : temp.value
				});
			}

			return result;
		}


	}, true);


	var Defines = {},

		/**
		 * 装饰委托
		 * 用define的handler去装饰handler
		 * @method	defineClosure
		 * @private
		 * @return	{function}
		 */
		defineClosure = function (hookHandler, handler) {
			return hookHandler ? function (e) {
				hookHandler.call(this, e, handler);
			} : handler;
		},

		/**
		 * 监听事件
		 * @method	attach
		 * @private
		 * @param	{EventTargetH.TYPE}	type		事件类型
		 * @param	{cache}				cache		缓存对象
		 * @param	{function}			listener	装饰函数
		 * @param	{element}			el			元素
		 * @param	{string}			name		事件名称
		 * @param	{function}			handler		委托函数
		 * @param	{array}				args		装饰函数参数，也用于做缓存的key
		 * @return	{bool}				是否成功
		 */
		attach = function (type, cache, listener, el, name, handler, args) {

			var entity = Defines[name],
				result = true;

			if (entity && (entity.type & type)) {
				for (var i in entity.events) {
					result &= attach(type, cache, listener, el, i, defineClosure(entity.events[i], handler), args);
				}

				return result;
			}

			var key = cache.makeKey.apply(cache, args);
			
			if (cache.hasKey(key)) {
				return false;
			} else {
				var _listener = listener.apply(null, [handler].concat(args));

				cache.add(key, { name : name, handler : _listener });
				EventTargetH.addEventListener(el, name, _listener);
				return true;
			}
		},

		/**
		 * 删除监听事件
		 * @method	detach
		 * @private
		 * @param	{EventTargetH.TYPE}	type		事件类型
		 * @param	{cache}				cache		缓存对象
		 * @param	{element}			el			元素
		 * @param	{string}			name		事件名称
		 * @param	{function}			handler		委托函数
		 * @param	{array}				args		装饰函数参数，也用于做缓存的key
		 * @return	{bool}				是否成功
		 */
		detach = function (type, cache, el, name, handler, args) {

			var entity = Defines[name],
				result = true;

			if (entity && (entity.type & type)) {

				for (var i in entity.events) {
					result &= detach(type, cache, el, i, handler, args);
				}

				return result;
			}

			var key = cache.makeKey.apply(cache, args),
				_listener;

			if (handler) {

				_listener = cache.get(key);

				if (_listener) {
					EventTargetH.removeEventListener(el, name, _listener.value.handler);
					cache.remove(key);
					return true;
				} else {
					return false;
				}

			} else {
				
				var list = cache.like(key),
					i = 0,
					l = list.length;

				if (l) {
					for (; i < l ; ++i) {
						
						name = list[i].value.name;
						_listener = list[i].value.handler;

						EventTargetH.removeEventListener(el, name, _listener);
						cache.remove(list[i].key);
					}
					return true;
				} else {
					return false;
				}

			}
		},

		/** 
		 * 监听方法
		 * @method	normalListener
		 * @private
		 * @param	{function}	handler	委托函数
		 * @param	{element}	el		元素
		 * @param	{string}	name	事件名称
		 * @return	{object}	委托方法执行结果
		 */
		normalListener = function (handler, el, name) {
			return function(e) {
				return fireHandler(el, e, handler, name);
			};
		},
		
		/** 
		 * 监听方法
		 * @method	delegateListener
		 * @private
		 * @param	{function}	handler		委托函数
		 * @param	{element}	element		监听目标
		 * @param	{string}	selector	选择器
		 * @param	{string}	name		事件名称
		 * @return	{object}	委托方法执行结果
		 */
		delegateListener = function (handler, el, selector, name) {
			return function(e) {
				var elements = [],
					node = e.srcElement || e.target;
				if (!node) {
					return;
				}
				if (node.nodeType == 3) {
					node = node.parentNode;
				}
				while (node && node != el) {
					elements.push(node);
					node = node.parentNode;
				}
				elements = QW.Selector.filter(elements, selector, el);
				for (var i = 0, l = elements.length; i < l; ++i) {
					fireHandler(elements[i], e, handler, name);
					if (elements[i].parentNode && elements[i].parentNode.nodeType == 11) { //fix remove elements[i] bubble bug
						if (e.stopPropagation) {
							e.stopPropagation();
						} else {
							e.cancelBubble = true;
						}
						break;
					}
				}
			};
		},

		/** 
		 * 事件执行入口
		 * @method	fireHandler
		 * @private
		 * @param	{element}	el			触发事件对象
		 * @param	{event}		event		事件对象
		 * @param	{function}	handler		事件委托
		 * @param	{string}	name		处理前事件名称
		 * @return	{object}	事件委托执行结果
		 */
		fireHandler = function(el, e, handler, name) {
			return EventTargetH.fireHandler.apply(null, arguments);
		},
		
		nCache = new Cache,

		dCache = new Cache,

		EventTargetH = {

			/** 
			 * 事件执行入口
			 * @method	fireHandler
			 * @private
			 * @param	{element}	el			触发事件对象
			 * @param	{event}		event		事件对象
			 * @param	{function}	handler		事件委托
			 * @param	{string}	name		处理前事件名称
			 * @return	{object}	事件委托执行结果
			 */
			fireHandler : function(element, e, handler, name) {
				var we = new QW.EventW(e);
				return handler.call(element, we);
			},

			/**
			 * 添加事件监听
			 * @method	addEventListener
			 * @param	{element}	element	监听目标
			 * @param	{string}	name	事件名称
			 * @param	{function}	handler	事件处理程序
			 * @param	{bool}		capture	(Optional)是否捕获非ie才有效
			 * @return	{void}
			 */
			addEventListener : (function() {
				if (document.addEventListener) {
					return function(element, name, handler, capture) {
						element.addEventListener(name, handler, capture || false);
					};
				} else {
					return function(element, name, handler) {
						element.attachEvent('on' + name, handler);
					};
				}
			}()),

			/**
			 * 移除事件监听
			 * @method	removeEventListener
			 * @private
			 * @param	{element}	element	监听目标
			 * @param	{string}	name	事件名称
			 * @param	{function}	handler	事件处理程序
			 * @param	{bool}		capture	(Optional)是否捕获非ie才有效
			 * @return	{void}
			 */
			removeEventListener : (function() {
				if (document.removeEventListener) {
					return function(element, name, handler, capture) {
						element.removeEventListener(name, handler, capture || false);
					};
				} else {
					return function(element, name, handler) {
						element.detachEvent('on' + name, handler);
					};
				}
			}()),

			/** 
			 * 添加对指定事件的监听
			 * @method	on
			 * @param	{element}	element	监听目标
			 * @param	{string}	sEvent	事件名称
			 * @param	{function}	handler	事件处理程序
			 * @return	{boolean}	事件是否监听成功
			 */
			on : function(el, name, handler) {

				el = g(el);

				return attach(EventTargetH.TYPE.NORMAL, nCache, normalListener, el, name, handler, [el, name, handler]);
			},

			/** 
			 * 移除对指定事件的监听
			 * @method	un
			 * @param	{element}	element	移除目标
			 * @param	{string}	sEvent	(Optional)事件名称
			 * @param	{function}	handler	(Optional)事件处理程序
			 * @return	{boolean}	事件监听是否移除成功
			 */
			un : function(el, name, handler) {

				el = g(el);

				return detach(EventTargetH.TYPE.NORMAL, nCache, el, name, handler, [el, name, handler]);
			},

			/** 
			 * 添加事件委托
			 * @method	delegate
			 * @param	{element}	element		被委托的目标
			 * @param	{string}	selector	委托的目标
			 * @param	{string}	sEvent		事件名称
			 * @param	{function}	handler		事件处理程序
			 * @return	{boolean}	事件监听是否移除成功
			 */
			delegate : function(el, selector, name, handler) {

				el = g(el);

				return attach(EventTargetH.TYPE.DELEGATE, dCache, delegateListener, el, name, handler, [el, selector, name, handler]);
			},

			/** 
			 * 移除事件委托
			 * @method	undelegate
			 * @param	{element}	element		被委托的目标
			 * @param	{string}	selector	(Optional)委托的目标
			 * @param	{string}	sEvent		(Optional)事件名称
			 * @param	{function}	handler		(Optional)事件处理程序
			 * @return	{boolean}	事件监听是否移除成功
			 */
			undelegate : function(el, selector, name, handler) {

				el = g(el);

				return detach(EventTargetH.TYPE.DELEGATE, dCache, el, name, handler, [el, selector, name, handler]);
			},

			/** 
			 * 触发对象的指定事件
			 * @method	fire
			 * @param	{element}	element	要触发事件的对象
			 * @param	{string}	sEvent	事件名称
			 * @return	{void}
			 */
			fire : function(el, name) {
				el = g(el);

				if (el.fireEvent) {
					return el.fireEvent('on' + name);
				} else {
					var evt = null,
						doc = el.ownerDocument || el;
					if (/mouse|click/i.test(sEvent)) {
						evt = doc.createEvent('MouseEvents');
						evt.initMouseEvent(name, true, true, doc.defaultView, 1, 0, 0, 0, 0, false, false, false, false, 0, null);
					} else {
						evt = doc.createEvent('Events');
						evt.initEvent(name, true, true, doc.defaultView);
					}
					return el.dispatchEvent(evt);
				}
			},

			/**
			 * 定义新事件
			 * 支持json如typedef({ mousedown : F, mouseup : F }, newtype)，和字符串组如type('mousedown,mouseup', newtype, F)等
			 * @method	typedef
			 * @param	{string}			name	代理的类型
			 * @param	{string}			newname	新定义的类型
			 * @param	{function}			handler	(Optional)事件处理程序 处理程序接受两个参数e和handler. 其中e为event对象,handler为使用者多投的委托.
			 * @param	{EventTargetH.TYPE}	type	(Optional)事件类型目前支持普通on和代理和all三种
			 * @return	{void}
			 */
			typedef : function (proxy, name, handler, type) {

				if (Defines[name]) {
					return false;
				}

				var proxys,
					entity,
					i = 0;

				if ('string' == typeof proxy) {
					
					proxys = proxy.split(',');
					entity = {};

					for (; i < proxys.length ; ++i) {
						entity[proxys[i]] = handler;
					}
				} else {
					entity = proxy;
				}

				Defines[name] = {
					type : type || EventTargetH.TYPE.ALL,
					events : entity
				}

				return true;
			},

			TYPE : {
				NORMAL : 1,
				DELEGATE : 2,
				ALL : 3
			}

		};

	EventTargetH._defaultExtend = function() {
		var extend = function(types) {
			function extendType(type) {
				EventTargetH[type] = function(element, handler) {
					if (handler) {
						EventTargetH.on(element, type, handler);
					} else {
						(element[type] && element[type]()) || EventTargetH.fire(element, type);
					}
				};
			}
			for (var i = 0, l = types.length; i < l; ++i) {
				extendType(types[i]);
			}
		};

		/** 
		 * 绑定对象的click事件或者执行click方法
		 * @method	click
		 * @param	{element}	element	要触发事件的对象
		 * @param	{function}	handler	(Optional)事件委托
		 * @return	{void}
		 */


		/** 
		 * 绑定对象的submit事件或者执行submit方法
		 * @method	submit
		 * @param	{element}	element	要触发事件的对象
		 * @param	{function}	handler	(Optional)事件委托
		 * @return	{void}
		 */

		/** 
		 * 绑定对象的focus事件或者执行focus方法
		 * @method	focus
		 * @param	{element}	element	要触发事件的对象
		 * @param	{function}	handler	(Optional)事件委托
		 * @return	{void}
		 */

		/** 
		 * 绑定对象的blur事件或者执行blur方法
		 * @method	blur
		 * @param	{element}	element	要触发事件的对象
		 * @param	{function}	handler	(Optional)事件委托
		 * @return	{void}
		 */

		extend('submit,click,focus,blur'.split(','));

		EventTargetH.typedef('mouseover', 'mouseenter', function(e, handler) {
			var element = this,
				target = e.relatedTarget || e.fromElement || null;
			if (!target || target == element || (element.contains ? element.contains(target) : !!(element.compareDocumentPosition(target) & 16))) {
				return;
			}
			handler.call(element, e);
		});

		EventTargetH.typedef('mouseout', 'mouseleave', function(e, handler) {
			var element = this,
				target = e.relatedTarget || e.toElement || null;
			if (!target || target == element || (element.contains ? element.contains(target) : !!(element.compareDocumentPosition(target) & 16))) {
				return;
			}
			handler.call(element, e);
		});

		EventTargetH.hover = function (el, enter, leave) {
			el = g(el);

			EventTargetH.on(el, 'mouseenter', enter);
			EventTargetH.on(el, 'mouseleave', leave || enter);
		};

		var UA = navigator.userAgent;
		if (/firefox/i.test(UA)) {
			EventTargetH.typedef('DOMMouseScroll', 'mousewheel');
		}
	}

	EventTargetH._defaultExtend();//JK: 执行默认的渲染。另：solo时如果觉得内容太多，可以去掉本行进行二次solo

	QW.EventTargetH = EventTargetH;

}());