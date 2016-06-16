/*
	Copyright (c) Baidu Youa Wed QWrap
	version: $version$ $release$ released
	author: WC(好奇)、JK(加宽)
*/

/** 
 * @class EventTargetH EventTarget Helper，处理和事件触发目标有关的兼容问题
 * @singleton
 * @helper
 * @namespace QW
 */

(function() {

	var g = QW.NodeH.g,
		mix = QW.ObjectH.mix,
		standardize = QW.EventH.standardize;


	/*
	 *Cache的格式：
		{
			"el.__QWETH_id":{
				'eventType+handler.__QWETH_id': realHandler,
				'eventType+handler.__QWETH_id+selector': realHandler
			}
		}
	 */
	var Cache = function() {
		var cacheSeq = 1,
			seqProp = '__QWETH_id';
		return {
			get: function(el, eventName, handler, selector) {
				var data = el[seqProp] && this[el[seqProp]];
				if (data && handler[seqProp]) {
					return data[eventName + handler[seqProp] + (selector || '')];
				}
			},
			add: function(realHandler, el, eventName, handler, selector) {
				if (!el[seqProp]) el[seqProp] = cacheSeq++;
				if (!handler[seqProp]) handler[seqProp] = cacheSeq++;
				var data = this[el[seqProp]] || (this[el[seqProp]] = {});
				data[eventName + handler[seqProp] + (selector || '')] = realHandler;
			},
			remove: function(el, eventName, handler, selector) {
				var data = el[seqProp] && this[el[seqProp]];
				if (data && handler[seqProp]) {
					delete data[eventName + handler[seqProp] + (selector || '')];
				}
			},
			removeEvents: function(el, eventName) {
				var data = el[seqProp] && this[el[seqProp]];
				if (data) {
					var reg = new RegExp('^[a-zA-Z.]*' + (eventName || '') + '\\d+$');
					for (var i in data) {
						if (reg.test(i)) {
							EventTargetH.removeEventListener(el, i.split(/[^a-zA-Z]/)[0], data[i]);
							delete data[i];
						}
					}
				}
			},
			removeDelegates: function(el, eventName, selector) {
				var data = el[seqProp] && this[el[seqProp]];
				if (data) {
					var reg = new RegExp('^([a-zA-Z]+\\.)?' + (eventName || '\\w+') + '\\d+.+');
					for (var i in data) {
						if (reg.test(i) && (!selector || i.substr(i.length - selector.length) == selector)) {
							var name = i.split(/\d+/)[0].split('.'),
								needCapture = EventTargetH._DelegateCpatureEvents.indexOf(name[1]||name[0]) > -1;
							EventTargetH.removeEventListener(el, i.split(/[^a-zA-Z]/)[0], data[i], needCapture);
							delete data[i];
						}
					}
				}
			}
		};
	}();


	/* 
	 * 监听方法
	 * @method	listener
	 * @private
	 * @param	{Element}	el		元素
	 * @param	{string}	sEvent	事件名称
	 * @param	{function}	handler	委托函数
	 * @param	{string}	userEventName	原事件名称（被hook的事件）
	 * @return	{object}	委托方法执行结果
	 */

	function listener(el, sEvent, handler, userEventName) {
		return Cache.get(el, sEvent + (userEventName ? '.' + userEventName : ''), handler) || function(e) {
			//如果有hook并且hook没有返回false的话
			if (!userEventName || userEventName && EventTargetH._EventHooks[userEventName][sEvent](el, e, handler)) {
				return fireHandler(el, e, handler, sEvent); //继续fire
			}
		};
	}

	/* 
	 * delegate监听方法
	 * @method	delegateListener
	 * @private
	 * @param	{Element}	el		监听目标
	 * @param	{string}	selector	选择器
	 * @param	{string}	sEvent		事件名称
	 * @param	{function}	handler		委托函数
	 * @param	{string}	userEventName	原事件名称（被hook的事件）
	 * @return	{object}	委托方法执行结果
	 */

	function delegateListener(el, selector, sEvent, handler, userEventName) {
		return Cache.get(el, sEvent + (userEventName ? '.' + userEventName : ''), handler, selector) || function(e) {
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
				if (!userEventName || userEventName && EventTargetH._DelegateHooks[userEventName][sEvent](elements[i], e || window.event, handler)) {
					fireHandler(elements[i], e, handler, sEvent);
				}
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
	}

	/* 
	 * 事件执行入口
	 * @method	fireHandler
	 * @private
	 * @param	{Element}	el			触发事件对象
	 * @param	{event}		event		事件对象
	 * @param	{function}	handler		事件委托
	 * @param	{string}	sEvent		处理前事件名称
	 * @return	{object}	事件委托执行结果
	 */

	function fireHandler(el, e, handler, sEvent) {
		return EventTargetH.fireHandler.apply(null, arguments);
	}


	var EventTargetH = {
		_EventHooks: {},
		_DelegateHooks: {},
		_DelegateCpatureEvents:'change,focus,blur',
		/** 
		 * 事件执行入口
		 * @method	fireHandler
		 * @private
		 * @param	{Element}	el			触发事件对象
		 * @param	{event}		event		事件对象
		 * @param	{function}	handler		事件委托
		 * @param	{string}	sEvent		处理前事件名称
		 * @return	{object}	事件委托执行结果
		 */
		fireHandler: function(el, e, handler, sEvent) {
			e = standardize(e);
			e.userType = sEvent;
			return handler.call(el, e);
		},

		/**
		 * 添加事件监听
		 * @method	addEventListener
		 * @param	{Element}	el	监听目标
		 * @param	{string}	sEvent	事件名称
		 * @param	{function}	handler	事件处理程序
		 * @param	{bool}		capture	(Optional)是否捕获非ie才有效
		 * @return	{void}
		 */
		addEventListener: (function() {
			if (document.addEventListener) {
				return function(el, sEvent, handler, capture) {
					el.addEventListener(sEvent, handler, capture || false);
				};
			} else {
				return function(el, sEvent, handler) {//注意：添加重复的handler时，IE的attachEvent也会执行成功。这点与addEventListener不一样。
					el.attachEvent('on' + sEvent, handler);
				};
			}
		}()),

		/**
		 * 移除事件监听
		 * @method	removeEventListener
		 * @private
		 * @param	{Element}	el	监听目标
		 * @param	{string}	sEvent	事件名称
		 * @param	{function}	handler	事件处理程序
		 * @param	{bool}		capture	(Optional)是否捕获非ie才有效
		 * @return	{void}
		 */
		removeEventListener: (function() {
			if (document.removeEventListener) {
				return function(el, sEvent, handler, capture) {
					el.removeEventListener(sEvent, handler, capture || false);
				};
			} else {
				return function(el, sEvent, handler) {
					el.detachEvent('on' + sEvent, handler);
				};
			}
		}()),

		/** 
		 * 添加对指定事件的监听
		 * @method	on
		 * @param	{Element}	el	监听目标
		 * @param	{string}	sEvent	事件名称
		 * @param	{function}	handler	事件处理程序
		 * @return	{void}	
		 */
		on: function(el, sEvent, handler) {
			if (sEvent && sEvent.indexOf(',')>-1) {//支持同时传多个事件名称，用逗号分隔
				var sEventArr = sEvent.split(/\s*,\s*/);
				for(var i = 0; i < sEventArr.length; i++) {
					EventTargetH.on(el,sEventArr[i],handler);
				}
				return;
			}
			el = g(el);
			var hooks = EventTargetH._EventHooks[sEvent];
			if (hooks) {
				for (var i in hooks) {
					var _listener = listener(el, i, handler, sEvent);
					Cache.add(_listener, el, i+'.'+sEvent, handler);
					if(i == sEvent){
						//避免死循环
						EventTargetH.addEventListener(el, i, _listener);
					}else{
						EventTargetH.on(el, i, _listener);
					}
				}
			} else {
				_listener = listener(el, sEvent, handler);
				EventTargetH.addEventListener(el, sEvent, _listener);
				Cache.add(_listener, el, sEvent, handler);
			}
		},

		/** 
		 * 移除对指定事件的监听
		 * @method	un
		 * @param	{Element}	el	移除目标
		 * @param	{string}	sEvent	(Optional)事件名称
		 * @param	{function}	handler	(Optional)事件处理程序
		 * @return	{boolean}	
		 */
		un: function(el, sEvent, handler) {
			if (sEvent && sEvent.indexOf(',')>-1) {//支持同时传多个事件名称，用逗号分隔
				var sEventArr = sEvent.split(/\s*,\s*/);
				for(var i = 0; i < sEventArr.length; i++) {
					EventTargetH.un(el,sEventArr[i],handler);
				}
				return;
			}
			el = g(el);
			if (!handler) { //移除多个临控
				return Cache.removeEvents(el, sEvent);
			}
			var hooks = EventTargetH._EventHooks[sEvent];
			if (hooks) {
				for (var i in hooks) {
					var _listener = listener(el, i, handler, sEvent);
					if(i == sEvent){
						//避免死循环
						EventTargetH.removeEventListener(el, i, _listener);
					}else{
						EventTargetH.un(el, i, _listener);
					}
					Cache.remove(el, i+'.'+sEvent, handler);
				}
			} else {
				_listener = listener(el, sEvent, handler);
				EventTargetH.removeEventListener(el, sEvent, _listener);
				Cache.remove(el, sEvent, handler);
			}
		},

		/** 
		 * 添加对指定事件的一次性监听，即事件执行后就移除该监听。
		 * @method	on
		 * @param	{Element}	el	监听目标
		 * @param	{string}	sEvent	事件名称
		 * @param	{function}	handler	事件处理程序
		 * @return	{void}	
		 */
		once: function(el, sEvent, handler) {
			el = g(el);
			var handler2 = function(){
				handler.apply(this,arguments);
				EventTargetH.un(el, sEvent, handler2);
			}
			EventTargetH.on(el, sEvent, handler2);
		},

		/** 
		 * 添加事件委托
		 * @method	delegate
		 * @param	{Element}	el		被委托的目标
		 * @param	{string}	selector	委托的目标
		 * @param	{string}	sEvent		事件名称
		 * @param	{function}	handler		事件处理程序
		 * @return	{boolean}	事件监听是否移除成功
		 */
		delegate: function(el, selector, sEvent, handler) {
			if (sEvent && sEvent.indexOf(',')>-1) {//支持同时传多个事件名称，用逗号分隔
				var sEventArr = sEvent.split(/\s*,\s*/);
				for(var i = 0; i < sEventArr.length; i++) {
					EventTargetH.delegate(el,selector,sEventArr[i],handler);
				}
				return;
			}
			el = g(el);
			var hooks = EventTargetH._DelegateHooks[sEvent],
				needCapture = EventTargetH._DelegateCpatureEvents.indexOf(sEvent) > -1;
			if (hooks) {
				for (var i in hooks) {
					var _listener = delegateListener(el, selector, i, handler, sEvent);
					Cache.add(_listener, el, i+'.'+sEvent, handler, selector);
					if(i == sEvent){
						//避免死循环
						EventTargetH.addEventListener(el, i, _listener, needCapture);
					}else{
						EventTargetH.delegate(el, selector, i, _listener);
					}
				}
			} else {
				_listener = delegateListener(el, selector, sEvent, handler);
				EventTargetH.addEventListener(el, sEvent, _listener, needCapture);
				Cache.add(_listener, el, sEvent, handler, selector);
			}
		},

		/** 
		 * 移除事件委托
		 * @method	undelegate
		 * @param	{Element}	el		被委托的目标
		 * @param	{string}	selector	(Optional)委托的目标
		 * @param	{string}	sEvent		(Optional)事件名称
		 * @param	{function}	handler		(Optional)事件处理程序
		 * @return	{boolean}	事件监听是否移除成功
		 */
		undelegate: function(el, selector, sEvent, handler) {
			if (sEvent && sEvent.indexOf(',')>-1) {//支持同时传多个事件名称，用逗号分隔
				var sEventArr = sEvent.split(/\s*,\s*/);
				for(var i = 0; i < sEventArr.length; i++) {
					EventTargetH.undelegate(el,selector,sEventArr[i],handler);
				}
				return;
			}
			el = g(el);
			if (!handler) { //移除多个临控
				return Cache.removeDelegates(el, sEvent, selector);
			}
			var hooks = EventTargetH._DelegateHooks[sEvent],
				needCapture = EventTargetH._DelegateCpatureEvents.indexOf(sEvent) > -1;
			if (hooks) {
				for (var i in hooks) {
					var _listener = delegateListener(el, selector, i, handler, sEvent);
					if(i == sEvent){
						//避免死循环
						EventTargetH.removeEventListener(el, i, _listener, needCapture);
					}else{
						EventTargetH.undelegate(el, selector, i, _listener);
					}
					Cache.remove(el, i+'.'+sEvent, handler, selector);
				}
			} else {
				_listener = delegateListener(el, selector, sEvent, handler);
				EventTargetH.removeEventListener(el, sEvent, _listener, needCapture);
				Cache.remove(el, sEvent, handler, selector);
			}
		},

		/** 
		 * 触发对象的指定事件
		 * @method	fire
		 * @param	{Element}	el	要触发事件的对象
		 * @param	{string}	sEvent	事件名称
		 * @return	{void}
		 */
		fire: (function() {
			if (document.dispatchEvent) {
				return function(el, sEvent) {
					var evt = null,
						doc = el.ownerDocument || el;
					if (/mouse|click/i.test(sEvent)) {
						evt = doc.createEvent('MouseEvents');
						evt.initMouseEvent(sEvent, true, true, doc.defaultView, 1, 0, 0, 0, 0, false, false, false, false, 0, null);
					} else {
						evt = doc.createEvent('Events');
						evt.initEvent(sEvent, true, true, doc.defaultView);
					}
					return el.dispatchEvent(evt);
				};
			} else {
				return function(el, sEvent) {
					return el.fireEvent('on' + sEvent);
				};
			}
		}())
	};

	EventTargetH._defaultExtend = function() {
		var extend = function(types) {
			function extendType(type) {
				EventTargetH[type] = function(el, handler) {
					if (handler) {
						EventTargetH.on(el, type, handler);
					} else if (el[type]){
						//ie低版本中，focus不可见元素会抛异常，容错下
						try {
						el[type]();
						} catch (e) {}
					} else {
						EventTargetH.fire(el, type);
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
		 * @param	{Element}	el	要触发事件的对象
		 * @param	{function}	handler	(Optional)事件委托
		 * @return	{void}
		 */


		/** 
		 * 绑定对象的submit事件或者执行submit方法
		 * @method	submit
		 * @param	{Element}	el	要触发事件的对象
		 * @param	{function}	handler	(Optional)事件委托
		 * @return	{void}
		 */

		/** 
		 * 绑定对象的focus事件或者执行focus方法
		 * @method	focus
		 * @param	{Element}	el	要触发事件的对象
		 * @param	{function}	handler	(Optional)事件委托
		 * @return	{void}
		 */

		/** 
		 * 绑定对象的blur事件或者执行blur方法
		 * @method	blur
		 * @param	{Element}	el	要触发事件的对象
		 * @param	{function}	handler	(Optional)事件委托
		 * @return	{void}
		 */

		extend('submit,reset,click,focus,blur,change,select'.split(','));
		EventTargetH.hover = function(el, enter, leave) {
			el = g(el);
			EventTargetH.on(el, 'mouseenter', enter);
			EventTargetH.on(el, 'mouseleave', leave || enter);
		};


		var UA = navigator.userAgent;
		if (/firefox/i.test(UA)) {
			EventTargetH._EventHooks.mousewheel = EventTargetH._DelegateHooks.mousewheel = {
				'DOMMouseScroll': function(el, e) {
					return true;
				}
			};
		}

		mix(EventTargetH._EventHooks, {
			'mouseenter': {
				'mouseover': function(el, e) {
					var relatedTarget = e.relatedTarget || e.fromElement;
					if (!relatedTarget || !(el.contains ? el.contains(relatedTarget) : (el == relatedTarget || el.compareDocumentPosition(relatedTarget) & 16))) {
						//relatedTarget为空或不被自己包含
						return true;
					}
				}
			},
			'mouseleave': {
				'mouseout': function(el, e) {
					var relatedTarget = e.relatedTarget || e.toElement;
					if (!relatedTarget || !(el.contains ? el.contains(relatedTarget) : (el == relatedTarget || el.compareDocumentPosition(relatedTarget) & 16))) {
						//relatedTarget为空或不被自己包含
						return true;
					}
				}
			}
		});
		mix(EventTargetH._DelegateHooks, EventTargetH._EventHooks);
		if (!document.addEventListener) {
			function getElementVal(el) {
				switch (el.type) {
				case 'checkbox':
				case 'radio':
					return el.checked;
				case "select-multiple":
					var vals = [],
						opts = el.options;
					for (var j = 0; j < opts.length; ++j) {
						if (opts[j].selected) {vals.push(opts[j].value); }
					}
					return vals.join(',');
				default:
					return el.value;
				}
			}
			function specialChange(el, e) {
				var target = e.target || e.srcElement;
				//if(target.tagName == 'OPTION') target = target.parentNode;
				if (getElementVal(target) != target.__QWETH_pre_val) {
					setPreVal(el,e);
					return true;
				}
			}
			function setPreVal(el,e){
				var target = e.target || e.srcElement;
				target.__QWETH_pre_val = getElementVal(target);
			}
			mix(EventTargetH._DelegateHooks, {
				'change': {
					'beforeactivete': setPreVal,
					'deactivate': specialChange,
					'focusout': specialChange,
					'click': specialChange,
					'keyup': function(el,e){
						if(e.srcElement && e.srcElement.tagName =='SELECT') return specialChange(el,e);
					}
				},
				'focus': {
					'focusin': function(el, e) {
						return true;
					}
				},
				'blur': {
					'focusout': function(el, e) {
						return true;
					}
				}
			});
		}
	};

	EventTargetH._defaultExtend(); //JK: 执行默认的渲染。另：solo时如果觉得内容太多，可以去掉本行进行二次solo
	QW.EventTargetH = EventTargetH;

}());