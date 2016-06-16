/*
	Copyright (c) Baidu Youa Wed QWrap
	author: 好奇
*/

/** 
 * @class EventH Event Helper，处理一些Event对象兼容问题
 * @singleton
 * @helper
 * @namespace QW
 */
(function() {
	function getDoc(e) {
		var target = EventH.getTarget(e),
			doc = document;
		if (target) { //ie unload target is null
			doc = target.ownerDocument || target.document || ((target.defaultView || target.window) && target) || document;
		}
		return doc;
	}

	var EventH = {

		/** 
		 * 获取鼠标位于完整页面的X坐标
		 * @method	getPageX
		 * @param	{event}		event	(Optional)event对象 默认为调用位置所在宿主的event
		 * @param	{element}	element (Optional)任意element对象 element对象所在宿主的event
		 * @return	{int}		X坐标
		 */
		getPageX: function(e) {
			e = e || EventH.getEvent.apply(EventH, arguments);
			var doc = getDoc(e);
			return ('pageX' in e) ? e.pageX : (e.clientX + (doc.documentElement.scrollLeft || doc.body.scrollLeft) - 2);
		},

		/** 
		 * 获取鼠标位于完整页面的Y坐标
		 * @method	getPageY
		 * @param	{event}		event	(Optional)event对象 默认为调用位置所在宿主的event
		 * @param	{element}	element (Optional)任意element对象 element对象所在宿主的event
		 * @return	{int}		Y坐标
		 */
		getPageY: function(e) {
			e = e || EventH.getEvent.apply(EventH, arguments);
			var doc = getDoc(e);
			return ('pageY' in e) ? e.pageY : (e.clientY + (doc.documentElement.scrollTop || doc.body.scrollTop) - 2);
		},


		/** 
		 * 获取鼠标滚轮方向
		 * @method	getDetail
		 * @param	{event}		event	(Optional)event对象 默认为调用位置所在宿主的event
		 * @param	{element}	element (Optional)任意element对象 element对象所在宿主的event
		 * @return	{int}		大于0向下,小于0向上.
		 */
		getDetail: function(e) {
			e = e || EventH.getEvent.apply(EventH, arguments);
			return e.detail || -(e.wheelDelta || 0);
		},

		/** 
		 * 获取触发事件的按键对应的ascii码
		 * @method	getKeyCode
		 * @param	{event}		event	(Optional)event对象 默认为调用位置所在宿主的event
		 * @param	{element}	element (Optional)任意element对象 element对象所在宿主的event
		 * @return	{int}		键盘ascii
		 */
		getKeyCode: function(e) {
			e = e || EventH.getEvent.apply(EventH, arguments);
			return ('keyCode' in e) ? e.keyCode : (e.charCode || e.which || 0);
		},

		/** 
		 * 阻止事件冒泡
		 * @method	stopPropagation
		 * @param	{event}		event	(Optional)event对象 默认为调用位置所在宿主的event
		 * @param	{element}	element (Optional)任意element对象 element对象所在宿主的event
		 * @return	{void}
		 */
		stopPropagation: function(e) {
			e = e || EventH.getEvent.apply(EventH, arguments);
			if (e.stopPropagation) {
				e.stopPropagation();
			} else {
				e.cancelBubble = true;
			}
		},

		/** 
		 * 阻止事件默认行为
		 * @method	preventDefault
		 * @param	{event}		event	(Optional)event对象 默认为调用位置所在宿主的event
		 * @param	{element}	element (Optional)任意element对象 element对象所在宿主的event
		 * @return	{void}
		 */
		preventDefault: function(e) {
			e = e || EventH.getEvent.apply(EventH, arguments);
			if (e.preventDefault) {
				e.preventDefault();
			} else {
				e.returnValue = false;
			}
		},

		/** 
		 * 获取事件触发时是否持续按住ctrl键
		 * @method	getCtrlKey
		 * @param	{event}		event	(Optional)event对象 默认为调用位置所在宿主的event
		 * @param	{element}	element (Optional)任意element对象 element对象所在宿主的event
		 * @return	{boolean}	判断结果
		 */
		getCtrlKey: function(e) {
			e = e || EventH.getEvent.apply(EventH, arguments);
			return e.ctrlKey;
		},

		/** 
		 * 事件触发时是否持续按住shift键
		 * @method	getShiftKey
		 * @param	{event}		event	(Optional)event对象 默认为调用位置所在宿主的event
		 * @param	{element}	element (Optional)任意element对象 element对象所在宿主的event
		 * @return	{boolean}	判断结果
		 */
		getShiftKey: function(e) {
			e = e || EventH.getEvent.apply(EventH, arguments);
			return e.shiftKey;
		},

		/** 
		 * 事件触发时是否持续按住alt键
		 * @method	getAltKey
		 * @param	{event}		event	(Optional)event对象 默认为调用位置所在宿主的event
		 * @param	{element}	element (Optional)任意element对象 element对象所在宿主的event
		 * @return	{boolean}	判断结果
		 */
		getAltKey: function(e) {
			e = e || EventH.getEvent.apply(EventH, arguments);
			return e.altKey;
		},

		/** 
		 * 触发事件的元素
		 * @method	getTarget
		 * @param	{event}		event	(Optional)event对象 默认为调用位置所在宿主的event
		 * @param	{element}	element (Optional)任意element对象 element对象所在宿主的event
		 * @return	{element}	node 对象
		 */
		getTarget: function(e) {
			e = e || EventH.getEvent.apply(EventH, arguments);
			var node = e.srcElement || e.target;
			if (node && node.nodeType == 3) {
				node = node.parentNode;
			}
			return node;
		},

		/** 
		 * 获取元素
		 * @method	getRelatedTarget
		 * @param	{event}		event	(Optional)event对象 默认为调用位置所在宿主的event
		 * @param	{element}	element (Optional)任意element对象 element对象所在宿主的event
		 * @return	{element}	mouseover/mouseout 事件时有效 over时为来源元素,out时为移动到的元素.
		 */
		getRelatedTarget: function(e) {
			e = e || EventH.getEvent.apply(EventH, arguments);
			if ('relatedTarget' in e) {return e.relatedTarget; }
			if (e.type == 'mouseover') {return e.fromElement; }
			if (e.type == 'mouseout') {return e.toElement; }
		},

		/** 
		 * 获得event对象
		 * @method	getEvent
		 * @param	{event}		event	(Optional)event对象 默认为调用位置所在宿主的event
		 * @param	{element}	element (Optional)任意element对象 element对象所在宿主的event
		 * @return	{event}		event对象
		 */
		getEvent: function(event, element) {
			if (event) {
				return event;
			} else if (element) {
				if (element.document) {return element.document.parentWindow.event; }
				if (element.parentWindow) {return element.parentWindow.event; }
			}

			if (window.event) {
				return window.event;
			} else {
				var f = arguments.callee;
				do {
					if (/Event/.test(f.arguments[0])) {return f.arguments[0]; }
				} while (f = f.caller);
			}
		},
		_EventPro: {
			stopPropagation: function() {
				this.cancelBubble = true;
			},
			preventDefault: function() {
				this.returnValue = false;
			}
		},
		/** 
		 * 为event补齐标准方法
		 * @method	standardize
		 * @param	{event}		event	event对象
		 * @return	{event}		event对象
		 */
		standardize: function(e){
			e = e || EventH.getEvent.apply(EventH, arguments);

			if(!('target' in e)) {
				e.target = EventH.getTarget(e);
			}
			if(!('relatedTarget' in e)) {
				e.relatedTarget = EventH.getRelatedTarget(e);
			}
			if (!('pageX' in e)) {
				e.pageX = EventH.getPageX(e);
				e.pageY = EventH.getPageY(e);
			}
			if (!('detail' in e)) {
				e.detail = EventH.getDetail(e);
			}
			if (!('keyCode' in e)) {
				e.keyCode = EventH.getKeyCode(e);
			}
			for(var i in EventH._EventPro){
				if (e[i] == null) {
					e[i] = EventH._EventPro[i];
				}
			}
			return e;
		}
	};


	QW.EventH = EventH;
}());