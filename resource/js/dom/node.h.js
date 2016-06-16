/*
	Copyright (c) Baidu Youa Wed QWrap
	author: 好奇
*/
/** 
 * @class NodeH Node Helper，针对element兼容处理和功能扩展
 * @singleton
 * @namespace QW
 */
(function() {

	var ObjectH = QW.ObjectH,
		StringH = QW.StringH,
		DomU = QW.DomU,
		Browser = QW.Browser,
		Selector = QW.Selector,
		selector2Filter = Selector.selector2Filter;
		

	/** 
	 * 获得element对象
	 * @method	g
	 * @param	{element|string|wrap}	el	id,Element实例或wrap
	 * @param	{object}				doc		(Optional)document 默认为 当前document
	 * @return	{element}				得到的对象或null
	 */
	function g(el, doc) {
		if ('string' == typeof el) {
			el = el.replace(/^\s+/,'');
			if (el.indexOf('<') == 0) {return DomU.create(el, false, doc); }
			var retEl = (doc || document).getElementById(el),els;
			if (retEl && retEl.id != el) {
				els = (doc || document).getElementsByName(el);
				for(var i = 0; i < els.length; i++){
					if (els[i].id == el) {
						return els[i];
					}
				}
				return null;
			}
			return retEl;
		} else {
			return (ObjectH.isWrap(el)) ? arguments.callee(el[0]) : el; //如果NodeW是数组的话，返回第一个元素(modified by akira)
		}
	}

	function regEscape(str) {
		return String(str).replace(/([.*+?^=!:${}()|[\]\/\\])/g, '\\$1');
	}

	function getPixel(el, value) {
		if (/px$/.test(value) || !value) {return parseInt(value, 10) || 0; }
		var right = el.style.right,
			runtimeRight = el.runtimeStyle.right;
		var result;

		el.runtimeStyle.right = el.currentStyle.right;
		el.style.right = value;
		result = el.style.pixelRight || 0;

		el.style.right = right;
		el.runtimeStyle.right = runtimeRight;
		return result;
	}

	function getCommonCurrentStyle(el, attribute, pseudo) {
		var displayAttribute = StringH.camelize(attribute);
		if (Browser.ie) {
			return el.currentStyle[displayAttribute];
		} else {
			var style = el.ownerDocument.defaultView.getComputedStyle(el, pseudo || null);
			return style ? style.getPropertyValue(StringH.decamelize(attribute)) : null;
		}
	}

	var cssNumber = {
            'fillOpacity': 1,
            'fontWeight': 1,
            'lineHeight': 1,
            'opacity': 1,
            'orphans': 1,
            'widows': 1,
            'zIndex': 1,
            'zoom': 1
        };

	var NodeH = {

		/** 
		 * 获得element对象的outerHTML属性
		 * @method	outerHTML
		 * @param	{element|string|wrap}	el	id,Element实例或wrap
		 * @param	{object}				doc		(Optional)document 默认为 当前document
		 * @return	{string}				outerHTML属性值
		 */
		outerHTML: (function() {
			var temp = document.createElement('div');
			return function(el, doc) {
				el = g(el);
				if ('outerHTML' in el) {
					return el.outerHTML;
				} else {
					temp.innerHTML = '';
					var dtemp = (doc && doc.createElement('div')) || temp;
					dtemp.appendChild(el.cloneNode(true));
					return dtemp.innerHTML;
				}
			};
		}()),

		/** 
		 * 判断element是否包含某个className
		 * @method	hasClass
		 * @param	{element|string|wrap}	el		id,Element实例或wrap
		 * @param	{string}				className	样式名
		 * @return	{void}
		 */
		hasClass: function(el, className) {
			el = g(el);
			//return new RegExp('(?:^|\\s)' + regEscape(className) + '(?:\\s|$)').test(el.className);
			return (' ' + el.className + ' ').indexOf(' ' + className + ' ') > -1 ;
		},

		/** 
		 * 给element添加className
		 * @method	addClass
		 * @param	{element|string|wrap}	el		id,Element实例或wrap
		 * @param	{string}				className	样式名
		 * @return	{void}
		 */
		addClass: function(el, className) {
			el = g(el);
			if (!NodeH.hasClass(el, className)) {
				el.className = el.className ? el.className + ' ' + className : className;
			}
		},

		/** 
		 * 移除element某个className
		 * @method	removeClass
		 * @param	{element|string|wrap}	el		id,Element实例或wrap
		 * @param	{string}				className	样式名
		 * @return	{void}
		 */
		removeClass: function(el, className) {
			el = g(el);
			if (NodeH.hasClass(el, className)) {
				el.className = el.className.replace(new RegExp('(?:^|\\s)' + regEscape(className) + '(?=\\s|$)', 'ig'), '');
			}
		},

		/** 
		 * 替换element的className
		 * @method	replaceClass
		 * @param	{element|string|wrap}	el		id,Element实例或wrap
		 * @param	{string}				oldClassName	目标样式名
		 * @param	{string}				newClassName	新样式名
		 * @return	{void}
		 */
		replaceClass: function(el, oldClassName, newClassName) {
			el = g(el);
			if (NodeH.hasClass(el, oldClassName)) {
				el.className = el.className.replace(new RegExp('(^|\\s)' + regEscape(oldClassName) + '(?=\\s|$)', 'ig'), '$1' + newClassName);
			} else {
				NodeH.addClass(el, newClassName);
			}
		},

		/** 
		 * element的className1和className2切换
		 * @method	toggleClass
		 * @param	{element|string|wrap}	el			id,Element实例或wrap
		 * @param	{string}				className1		样式名1
		 * @param	{string}				className2		(Optional)样式名2
		 * @return	{void}
		 */
		toggleClass: function(el, className1, className2) {
			className2 = className2 || '';
			if (NodeH.hasClass(el, className1)) {
				NodeH.replaceClass(el, className1, className2);
			} else {
				NodeH.replaceClass(el, className2, className1);
			}
		},

		/** 
		 * 显示element对象
		 * @method	show
		 * @param	{element|string|wrap}	el		id,Element实例或wrap
		 * @param	{string}				value		(Optional)display的值 默认为空
		 * @return	{void}
		 */
		show: (function() {
			var store = {};
			function restore(tagName) {
				if (!store[tagName]) {
					var elem = document.createElement(tagName),
						body = document.body;
					NodeH.insertSiblingBefore(body.firstChild, elem);
					display = NodeH.getCurrentStyle(elem, "display");
					NodeH.removeChild(body, elem);
					body = elem = null;
					if (display === "none" || display === "") {
						display = "block";
					}
					store[tagName] = display;
				}
				return store[tagName];
			}
			return function(el, value) {
				el = g(el);
				if (!value) {
					var display = el.style.display;
					if (display === "none") {
						display = el.style.display = "";
					}
					if (display === "" && NodeH.getCurrentStyle(el, "display") === "none") {
						display = restore(el.nodeName);
					}
				}
				el.style.display = value || display;
			};
		}()),

		/** 
		 * 隐藏element对象
		 * @method	hide
		 * @param	{element|string|wrap}	el		id,Element实例或wrap
		 * @return	{void}
		 */
		hide: function(el) {
			el = g(el);
			el.style.display = 'none';
		},
	    /** 
		 * 在元素的外面套一层节点
		 * @method	hide
		 * @param	{element|string|wrap}	el		id,Element实例或wrap
		 * @return	{void}
		 */
		wrap: function(el,pEl) {
			el = g(el);
			pEl = g(pEl, el.ownerDocument);
			if (el.parentNode){//如果元素还不在dom树上，则只wrap不append
				el.parentNode.insertBefore(pEl,el);
			}
			pEl.appendChild(el);
		},
	    /** 
		 * 删除element对象的所有子节点
		 * @method	hide
		 * @param	{element|string|wrap}	el		id,Element实例或wrap
		 * @return	{void}
		 */
		unwrap: function(el) {
			el = g(el);
			var pEl = el.parentNode;
			if(pEl && pEl.tagName != 'BODY'){
				var ppEl = pEl.parentNode;
				while (pEl.firstChild) {
					ppEl.insertBefore(pEl.firstChild, pEl);
				}
				ppEl.removeChild(pEl);
			}
		},
	    /** 
		 * 删除element对象的所有子节点
		 * @method	hide
		 * @param	{element|string|wrap}	el		id,Element实例或wrap
		 * @return	{void}
		 */
		empty: function(el) {
			el = g(el);
			while (el.firstChild) {
				el.removeChild(el.firstChild);
			}
		},
		/** 
		 * 隐藏/显示element对象
		 * @method	toggle
		 * @param	{element|string|wrap}	el		id,Element实例或wrap
		 * @param	{string}				value		(Optional)显示时display的值 默认为空
		 * @return	{void}
		 */
		toggle: function(el, value) {
			if (NodeH.isVisible(el)) {
				NodeH.hide(el);
			} else {
				NodeH.show(el, value);
			}
		},

		/** 
		 * 判断element对象是否可见
		 * @method	isVisible
		 * @param	{element|string|wrap}	el		id,Element实例或wrap
		 * @return	{boolean}				判断结果
		 */
		isVisible: function(el) {
			el = g(el);
			//return this.getStyle(el, 'visibility') != 'hidden' && this.getStyle(el, 'display') != 'none';
			//return !!(el.offsetHeight || el.offestWidth);
			return !!((el.offsetHeight + el.offsetWidth) && NodeH.getStyle(el, 'display') != 'none');
		},


		/** 
		 * 获取element对象距离doc的xy坐标
		 * 参考YUI3.1.1
		 * @refer  https://github.com/yui/yui3/blob/master/build/dom/dom.js
		 * @method	getXY
		 * @param	{element|string|wrap}	el		id,Element实例或wrap
		 * @return	{array}					x, y
		 */
		getXY: (function() {

			var calcBorders = function(node, xy) {
				var t = parseInt(NodeH.getCurrentStyle(node, 'borderTopWidth'), 10) || 0,
					l = parseInt(NodeH.getCurrentStyle(node, 'borderLeftWidth'), 10) || 0;

				if (Browser.gecko) {
					if (/^t(?:able|d|h)$/i.test(node.tagName)) {
						t = l = 0;
					}
				}
				xy[0] += l;
				xy[1] += t;
				return xy;
			};
			// the trick: body's offsetWidth was in CSS pixels, while
			// getBoundingClientRect() was in system pixels in IE7.
			// Thanks to http://help.dottoro.com/ljgshbne.php
			return (!Browser.ie6 && !Browser.ie7 && document.documentElement.getBoundingClientRect) ?
				function(node) {
					var doc = node.ownerDocument,
						docRect = DomU.getDocRect(doc),
						scrollLeft = docRect.scrollX,
						scrollTop = docRect.scrollY,
						box = node.getBoundingClientRect(),
						xy = [box.left, box.top],
						mode,
						off1,
						off2;
					if (Browser.ie) {
						off1 = doc.documentElement.clientLeft;
						off2 = doc.documentElement.clientTop;
						mode = doc.compatMode;

						if (mode == 'BackCompat') {
							off1 = doc.body.clientLeft;
							off2 = doc.body.clientTop;
						}

						xy[0] -= off1;
						xy[1] -= off2;

					}

					if (scrollTop || scrollLeft) {
						xy[0] += scrollLeft;
						xy[1] += scrollTop;
					}

					return xy;

				} : function(node) {
					var xy = [node.offsetLeft, node.offsetTop],
						parentNode = node,
						doc = node.ownerDocument,
						docRect = DomU.getDocRect(doc),
						bCheck = !!(Browser.gecko || parseFloat(Browser.webkit) > 519),
						scrollTop = 0,
						scrollLeft = 0;

					while ((parentNode = parentNode.offsetParent)) {
						xy[0] += parentNode.offsetLeft;
						xy[1] += parentNode.offsetTop;
						if (bCheck) {
							xy = calcBorders(parentNode, xy);
						}
					}

					if (NodeH.getCurrentStyle(node, 'position') != 'fixed') {
						parentNode = node;

						while (parentNode = parentNode.parentNode) {
							scrollTop = parentNode.scrollTop;
							scrollLeft = parentNode.scrollLeft;

							if (Browser.gecko && (NodeH.getCurrentStyle(parentNode, 'overflow') !== 'visible')) {
								xy = calcBorders(parentNode, xy);
							}

							if (scrollTop || scrollLeft) {
								xy[0] -= scrollLeft;
								xy[1] -= scrollTop;
							}
						}

					}

					xy[0] += docRect.scrollX;
					xy[1] += docRect.scrollY;

					return xy;

				};

		}()),

		/** 
		 * 设置element对象的xy坐标
		 * @method	setXY
		 * @param	{element|string|wrap}	el		id,Element实例或wrap
		 * @param	{int}					x			(Optional)x坐标 默认不设置
		 * @param	{int}					y			(Optional)y坐标 默认不设置
		 * @return	{void}
		 */
		setXY: function(el, x, y) {
			el = g(el);
			x = parseInt(x, 10);
			y = parseInt(y, 10);
			if (!isNaN(x)) {NodeH.setStyle(el, 'left', x); }
			if (!isNaN(y)) {NodeH.setStyle(el, 'top', y); }
		},

		/** 
		 * 设置element对象的offset宽高
		 * @method	setSize
		 * @param	{element|string|wrap}	el		id,Element实例或wrap
		 * @param	{int}					w			(Optional)宽 默认不设置
		 * @param	{int}					h			(Optional)高 默认不设置
		 * @return	{void}
		 */
		setSize: function(el, w, h) {
			el = g(el);
			w = parseFloat(w, 10);
			h = parseFloat(h, 10);

			if (isNaN(w) && isNaN(h)) {return; }

			var borders = NodeH.borderWidth(el);
			var paddings = NodeH.paddingWidth(el);

			if (!isNaN(w)) {NodeH.setStyle(el, 'width', Math.max(+w - borders[1] - borders[3] - paddings[1] - paddings[3], 0)); }
			if (!isNaN(h)) {NodeH.setStyle(el, 'height', Math.max(+h - borders[0] - borders[2] - paddings[0] - paddings[2], 0)); }
		},

		/** 
		 * 设置element对象的宽高
		 * @method	setInnerSize
		 * @param	{element|string|wrap}	el		id,Element实例或wrap
		 * @param	{int}					w			(Optional)宽 默认不设置
		 * @param	{int}					h			(Optional)高 默认不设置
		 * @return	{void}
		 */
		setInnerSize: function(el, w, h) {
			el = g(el);
			w = parseFloat(w, 10);
			h = parseFloat(h, 10);

			if (!isNaN(w)) {NodeH.setStyle(el, 'width', w); }
			if (!isNaN(h)) {NodeH.setStyle(el, 'height', h); }
		},

		/** 
		 * 设置element对象的offset宽高和xy坐标
		 * @method	setRect
		 * @param	{element|string|wrap}	el		id,Element实例或wrap
		 * @param	{int}					x			(Optional)x坐标 默认不设置
		 * @param	{int}					y			(Optional)y坐标 默认不设置
		 * @param	{int}					w			(Optional)宽 默认不设置
		 * @param	{int}					h			(Optional)高 默认不设置
		 * @return	{void}
		 */
		setRect: function(el, x, y, w, h) {
			NodeH.setXY(el, x, y);
			NodeH.setSize(el, w, h);
		},

		/** 
		 * 设置element对象的宽高和xy坐标
		 * @method	setRect
		 * @param	{element|string|wrap}	el		id,Element实例或wrap
		 * @param	{int}					x			(Optional)x坐标 默认不设置
		 * @param	{int}					y			(Optional)y坐标 默认不设置
		 * @param	{int}					w			(Optional)宽 默认不设置
		 * @param	{int}					h			(Optional)高 默认不设置
		 * @return	{void}
		 */
		setInnerRect: function(el, x, y, w, h) {
			NodeH.setXY(el, x, y);
			NodeH.setInnerSize(el, w, h);
		},

		/** 
		 * 获取element对象的宽高
		 * @method	getSize
		 * @param	{element|string|wrap}	el		id,Element实例或wrap
		 * @return	{object}				width,height
		 */
		getSize: function(el) {
			el = g(el);
			return {
				width: el.offsetWidth,
				height: el.offsetHeight
			};
		},

		/** 
		 * 获取element对象的宽高和xy坐标
		 * @method	setRect
		 * @param	{element|string|wrap}	el		id,Element实例或wrap
		 * @return	{object}				width,height,left,top,bottom,right
		 */
		getRect: function(el) {
			el = g(el);
			var p = NodeH.getXY(el);
			var x = p[0];
			var y = p[1];
			var w = el.offsetWidth;
			var h = el.offsetHeight;
			return {
				'width': w,
				'height': h,
				'left': x,
				'top': y,
				'bottom': y + h,
				'right': x + w
			};
		},

		/** 
		 * 向后获取element对象符合条件的兄弟节点
		 * @method	nextSibling
		 * @param	{element|string|wrap}	el		id,Element实例或wrap
		 * @param	{string}				selector	(Optional)简单选择器 默认为空即最近的兄弟节点
		 * @return	{node}					找到的node或null
		 */
		nextSibling: function(el, selector) {
			var fcheck = selector2Filter(selector || '');
			el = g(el);
			do {
				el = el.nextSibling;
			} while (el && !fcheck(el));
			return el;
		},

		/** 
		 * 向前获取element对象符合条件的兄弟节点
		 * @method	previousSibling
		 * @param	{element|string|wrap}	el		id,Element实例或wrap
		 * @param	{string}				selector	(Optional)简单选择器 默认为空即最近的兄弟节点
		 * @return	{node}					找到的node或null
		 */
		previousSibling: function(el, selector) {
			var fcheck = selector2Filter(selector || '');
			el = g(el);
			do {
				el = el.previousSibling;
			} while (el && !fcheck(el));
			return el;
		},

		/** 
		 * 获取element对象符合条件的兄长节点
		 * @method	previousSiblings
		 * @param	{element|string|wrap}	el		id,Element实例或wrap
		 * @param	{string}				selector	(Optional)简单选择器 默认为空即所有的兄弟节点
		 * @return	{array}					element元素数组
		 */
		previousSiblings: function(el, selector) {
			var fcheck = selector2Filter(selector || ''),
				ret =[];
			el = g(el);
			while(el = el.previousSibling){
				if(fcheck(el)) {
					ret.push(el);
				}
			}
			return ret.reverse();
		},
		/** 
		 * 获取element对象符合条件的弟弟节点
		 * @method	nextSiblings
		 * @param	{element|string|wrap}	el		id,Element实例或wrap
		 * @param	{string}				selector	(Optional)简单选择器 默认为空即所有的兄弟节点
		 * @return	{array}					element元素数组
		 */
		nextSiblings: function(el, selector) {
			var fcheck = selector2Filter(selector || ''),
				ret =[];
			el = g(el);
			while(el = el.nextSibling){
				if(fcheck(el)) {
					ret.push(el);
				}
			}
			return ret;
		},

		/** 
		 * 获取element对象符合条件的兄弟节点，不包括自己
		 * @method	siblings
		 * @param	{element|string|wrap}	el		id,Element实例或wrap
		 * @param	{string}				selector	(Optional)简单选择器 默认为空即所有的兄弟节点
		 * @return	{array}					element元素数组
		 */
		siblings: function(el, selector) {
			var fcheck = selector2Filter(selector || ''),
				tempEl = el.parentNode.firstChild,
				ret =[];
			while(tempEl){
				if(el != tempEl && fcheck(tempEl)) {
					ret.push(tempEl);
				}
				tempEl = tempEl.nextSibling;
			}
			return ret;
		},

		/** 
		 * 向上获取element对象符合条件的兄弟节点
		 * @method	previousSibling
		 * @param	{element|string|wrap}	el		id,Element实例或wrap
		 * @param	{string}				selector	(Optional)简单选择器 默认为空即最近的兄弟节点
		 * @return	{element}					找到的node或null
		 */
		ancestorNode: function(el, selector) {
			var fcheck = selector2Filter(selector || '');
			el = g(el);
			do {
				el = el.parentNode;
			} while (el && !fcheck(el));
			return el;
		},

		/** 
		 * 向上获取element对象符合条件的兄弟节点
		 * @method	parentNode
		 * @param	{element|string|wrap}	el		id,Element实例或wrap
		 * @param	{string}				selector	(Optional)简单选择器 默认为空即最近的兄弟节点
		 * @return	{element}					找到的node或null
		 */
		parentNode: function(el, selector) {
			return NodeH.ancestorNode(el, selector);
		},

		/** 
		 * 获取element对象符合条件的所有祖先节点
		 * @method	ancestorNodes
		 * @param	{element|string|wrap}	el		id,Element实例或wrap
		 * @param	{string}				selector	(Optional)简单选择器 默认为空即所有的兄弟节点
		 * @return	{array}					element元素数组
		 */
		ancestorNodes: function(el, selector) {
			var fcheck = selector2Filter(selector || ''),
				ret =[];
			el = g(el);
			while(el = el.parentNode){
				if(fcheck(el)) {
					ret.push(el);
				}
			}
			return ret.reverse();
		},

		/** 
		 * 从element对象内起始位置获取符合条件的节点
		 * @method	firstChild
		 * @param	{element|string|wrap}	el		id,Element实例或wrap
		 * @param	{string}				selector	(Optional)简单选择器 默认为空即最近的兄弟节点
		 * @return	{node}					找到的node或null
		 */
		firstChild: function(el, selector) {
			var fcheck = selector2Filter(selector || '');
			el = g(el).firstChild;
			while (el && !fcheck(el)) {el = el.nextSibling; }
			return el;
		},

		/** 
		 * 从element对象内结束位置获取符合条件的节点
		 * @method	lastChild
		 * @param	{element|string|wrap}	el		id,Element实例或wrap
		 * @param	{string}				selector	(Optional)简单选择器 默认为空即最近的兄弟节点
		 * @return	{node}					找到的node或null
		 */
		lastChild: function(el, selector) {
			var fcheck = selector2Filter(selector || '');
			el = g(el).lastChild;
			while (el && !fcheck(el)) {el = el.previousSibling; }
			return el;
		},

		/** 
		 * 判断目标对象是否是element对象的子孙节点
		 * @method	contains
		 * @param	{element|string|wrap}	el		id,Element实例或wrap
		 * @param	{element|string|wrap}	target		Element对象
		 * @return	{boolean}				判断结果
		 */
		contains: function(el, target) {
			el = g(el);
			target = g(target);
			return el.contains ? el != target && el.contains(target) : !!(el.compareDocumentPosition(target) & 16);
		},

		/** 
		 * 向element对象前/后，内起始，内结尾插入html
		 * @method	insertAdjacentHTML
		 * @param	{element|string|wrap}	el		id,Element实例或wrap
		 * @param	{string}				sWhere		位置类型，可能值有：beforebegin、afterbegin、beforeend、afterend
		 * @param	{element|string|wrap}	html		插入的html
		 * @return	{void}
		 */
		insertAdjacentHTML: function(el, sWhere, html) {
			el = g(el);
			if (el.insertAdjacentHTML) {
				el.insertAdjacentHTML(sWhere, html);
			} else {
				var r = el.ownerDocument.createRange(), df;

				r.setStartBefore(el);
				df = r.createContextualFragment(html);
				NodeH.insertAdjacentElement(el, sWhere, df);
			}
		},

		/** 
		 * 向element对象前/后，内起始，内结尾插入element对象
		 * @method	insertAdjacentElement
		 * @param	{element|string|wrap}	el		id,Element实例或wrap
		 * @param	{string}				sWhere		位置类型，可能值有：beforebegin、afterbegin、beforeend、afterend
		 * @param	{element|string|html|wrap}	newEl		新对象。
		 * @return	{element}				newEl，新对象
		 */
		insertAdjacentElement: function(el, sWhere, newEl) {
			el = g(el);
			newEl = g(newEl);
			if (el.insertAdjacentElement) {
				el.insertAdjacentElement(sWhere, newEl);
			} else {
				switch (String(sWhere).toLowerCase()) {
				case "beforebegin":
					el.parentNode.insertBefore(newEl, el);
					break;
				case "afterbegin":
					el.insertBefore(newEl, el.firstChild);
					break;
				case "beforeend":
					el.appendChild(newEl);
					break;
				case "afterend":
					el.parentNode.insertBefore(newEl, el.nextSibling || null);
					break;
				}
			}
			return newEl;
		},

		/** 
		 * 向element对象前/后，内起始，内结尾插入element对象
		 * @method	insert
		 * @param	{element|string|wrap}	el		id,Element实例或wrap
		 * @param	{string}				sWhere		位置类型，可能值有：beforebegin、afterbegin、beforeend、afterend
		 * @param	{element|string|wrap}	newEl		新对象
		 * @return	{void}	
		 */
		insert: function(el, sWhere, newEl) {
			NodeH.insertAdjacentElement(el, sWhere, newEl);
		},

		/** 
		 * 把一个对象插到另一个对象邻近。
		 * @method	insertTo
		 * @param	{element|string|wrap}	el		id,Element实例或wrap
		 * @param	{string}				sWhere		位置类型，可能值有：beforebegin、afterbegin、beforeend、afterend
		 * @param	{element|string|wrap}	refEl		位置参考对象
		 * @return	{void}				
		 */
		insertTo: function(el, sWhere, refEl) {
			NodeH.insertAdjacentElement(refEl, sWhere, el);
		},

		/** 
		 * 向element对象内追加新element对象
		 * @method	appendChild
		 * @param	{element|string|wrap}	el		id,Element实例或wrap
		 * @param	{element|string|wrap}	newEl		新对象
		 * @return	{element}				新对象newEl
		 */
		appendChild: function(el, newEl) {
			return g(el).appendChild(g(newEl));
		},

		/** 
		 * 把一个element添加到一个父元素的最后面
		 * @method	appendTo
		 * @param	{element|string|wrap}	el		id,Element实例或wrap
		 * @param	{element|string|wrap}	pEl		父元素
		 * @return	{element}				el	被添加的元素
		 */
		appendTo: function(el, pEl) {
			return g(pEl).appendChild(g(el));
		},

		/** 
		 * 向element对象内第一个子节点前插入新element对象
		 * @method	appendChild
		 * @param	{element|string|wrap}	el		id,Element实例或wrap
		 * @param	{element|string|wrap}	newEl		新对象
		 * @return	{element}				新对象newEl
		 */
		prepend: function(el, newEl) {
			el = g(el);
			return el.insertBefore(g(newEl), el.firstChild);
		},


		/** 
		 * 把一个element添加到一个父元素的最前面
		 * @method	appendChild
		 * @param	{element|string|wrap}	el		id,Element实例或wrap
		 * @param	{element|string|wrap}	pEl		父元素
		 * @return	{element}				被添加的元素
		 */
		prependTo: function(el, pEl) {
			return NodeH.prepend(pEl,el);
		},
		
		/** 
		 * 向element对象前插入element对象
		 * @method	insertSiblingBefore
		 * @param	{element|string|wrap}	el		id,Element实例或wrap
		 * @param	{element|string|html|wrap}	newEl	新对象
		 * @return	{element}				新对象newEl
		 */
		insertSiblingBefore: function(el, newEl) {
			el = g(el);
			return el.parentNode.insertBefore(g(newEl), el);
		},

		/** 
		 * 向element对象后插入element对象
		 * @method	insertSiblingAfter
		 * @param	{element|string|wrap}	el		id,Element实例或wrap
		 * @param	{element|string|wrap}	newEl	新对象id,Element实例或wrap
		 * @return	{element}				新对象newEl
		 */
		insertSiblingAfter: function(el, newEl) {
			el = g(el);
			el.parentNode.insertBefore(g(newEl), el.nextSibling || null);
		},

		/** 
		 * 向element对象内部的某元素前插入element对象
		 * @method	insertBefore
		 * @param	{element|string|wrap}	el		id,Element实例或wrap
		 * @param	{element|string|wrap}	newEl	新对象id,Element实例或wrap
		 * @param	{element|string|wrap}	refEl	位置参考对象
		 * @return	{element}				新对象newEl
		 */
		insertBefore: function(el, newEl, refEl) {
			return g(el).insertBefore(g(newEl), (refEl && g(refEl)) || null);
		},

		/** 
		 * 向element对象内部的某元素后插入element对象
		 * @method	insertAfter
		 * @param	{element|string|wrap}	el		id,Element实例或wrap
		 * @param	{element|string|wrap}	newEl	新对象
		 * @param	{element|string|wrap}	refEl	位置参考对象
		 * @return	{element}				新对象newEl
		 */
		insertAfter: function(el, newEl, refEl) {
			return g(el).insertBefore(g(newEl), (refEl && g(refEl).nextSibling) || null);
		},

		/**
		 * 为element插入一个外框容器元素
		 * @method insertParent
		 * @param	{element|string|wrap}	el		id,Element实例或wrap
		 * @param	{element|string|wrap}	newEl	新对象
		 * @return  {element}				新对象newEl
		 */
		insertParent: function(el, newEl){
			NodeH.insertSiblingBefore(el, newEl);
			return NodeH.appendChild(newEl, el);
		},

		/** 
		 * 用一个元素替换自己
		 * @method	replaceNode
		 * @param	{element|string|wrap}	el		id,Element实例或wrap
		 * @param	{element|string|wrap}	newEl		新节点id,Element实例或wrap
		 * @return	{element}				返回被替换的节点
		 */
		replaceNode: function(el, newEl) {
			el = g(el);
			return el.parentNode.replaceChild(g(newEl), el);
		},

		/** 
		 * 从element里把relement替换成nelement
		 * @method	replaceChild
		 * @param	{element|string|wrap}	el		id,Element实例或wrap
		 * @param	{element|string|wrap}	newEl	新节点id,Element实例或wrap
		 * @param	{element|string|wrap}	childEl	被替换的id,Element实例或wrap后
		 * @return	{element}				返回被替换的节点
		 */
		replaceChild: function(el, newEl, childEl) {
			return g(el).replaceChild(g(newEl), g(childEl));
		},

		/** 
		 * 把element移除掉
		 * @method	removeNode
		 * @param	{element|string|wrap}	el		id,Element实例或wrap
		 * @return	{element}				返回被删除的节点。
		 */
		removeNode: function(el) {
			el = g(el);
			return el.parentNode && el.parentNode.removeChild(el);
		},

		/** 
		 * 从element里把childEl移除掉
		 * @method	removeChild
		 * @param	{element|string|wrap}	el		id,Element实例或wrap
		 * @param	{element|string|wrap}	childEl		需要移除的子对象
		 * @return	{element}				返回被删除的节点。
		 */
		removeChild: function(el, childEl) {
			var childEl = g(childEl);
			return childEl && g(el).removeChild(g(childEl));
		},

		/** 
		 * 对元素调用ObjectH.get
		 * @method	get
		 * @param	{element|string|wrap}	el		id,Element实例或wrap
		 * @param	{string}				prop	成员名称
		 * @return	{object}				成员引用
		 * @see ObjectH.get
		 */
		get: function(el, prop) {
			//var args = [g(el)].concat([].slice.call(arguments, 1));
			el = g(el);
			return ObjectH.get.apply(null, arguments);
		},

		/** 
		 * 对元素调用ObjectH.set
		 * @method	set
		 * @param	{element|string|wrap}	el		id,Element实例或wrap
		 * @param	{string}				prop	成员名称
		 * @param	{object}				value		成员引用/内容
		 * @return	{void}
		 * @see ObjectH.set
		 */
		set: function(el, prop, value) {
			el = g(el);
			ObjectH.set.apply(null, arguments);
		},

		/** 
		 * 获取element对象的属性
		 * @method	getAttr
		 * @param	{element|string|wrap}	el		id,Element实例或wrap
		 * @param	{string}				attribute	属性名称
		 * @param	{int}					iFlags		(Optional)ieonly 获取属性值的返回类型 可设值0,1,2,4 
		 * @return	{string}				属性值 ie里有可能不是object
		 */
		getAttr: function(el, attribute, iFlags) {
			el = g(el);
			attribute = NodeH.attrMap[attribute] || attribute;
			if ((attribute in el) && 'href' != attribute) {
				return el[attribute];
			} else {
				return el.getAttribute(attribute, iFlags || (el.nodeName == 'A' && attribute.toLowerCase() == 'href' && 2) || null);
			}
		},

		/** 
		 * 设置element对象的属性
		 * @method	setAttr
		 * @param	{element|string|wrap}	el		id,Element实例或wrap
		 * @param	{string}				attribute	属性名称
		 * @param	{string}				value		属性的值
		 * @param	{int}					iCaseSensitive	(Optional)
		 * @return	{void}
		 */
		setAttr: function(el, attribute, value, iCaseSensitive) {
			el = g(el);
			if ('object' != typeof attribute) {
				attribute = NodeH.attrMap[attribute] || attribute;
				if (attribute in el) {
					el[attribute] = value;
				} else {
					el.setAttribute(attribute, value, iCaseSensitive || null);
				}
			} else {
				for (var prop in attribute) {
					NodeH.setAttr(el, prop, attribute[prop]);
				}
			}
		},

		/** 
		 * 删除element对象的属性
		 * @method	removeAttr
		 * @param	{element|string|wrap}	el		id,Element实例或wrap
		 * @param	{string}				attribute	属性名称
		 * @param	{int}					iCaseSensitive	(Optional)
		 * @return	{void}
		 */
		removeAttr: function(el, attribute, iCaseSensitive) {
			el = g(el);
			return el.removeAttribute(attribute, iCaseSensitive || 0);
		},

		/** 
		 * 根据条件查找element内元素组
		 * @method	query
		 * @param	{element|string|wrap}	el		id,Element实例或wrap
		 * @param	{string}				selector	条件
		 * @return	{array}					element元素数组
		 */
		query: function(el, selector) {
			el = g(el);
			return Selector.query(el, selector || '');
		},

		/** 
		 * 根据条件查找element内元素
		 * @method	one
		 * @param	{element|string|wrap}	el		id,Element实例或wrap
		 * @param	{string}				selector	条件
		 * @return	{HTMLElement}			element元素
		 */
		one: function(el, selector) {
			el = g(el);
			return Selector.one(el, selector || '');
		},

		/** 
		 * 查找element内所有包含className的集合
		 * @method	getElementsByClass
		 * @param	{element|string|wrap}	el		id,Element实例或wrap
		 * @param	{string}				className	样式名
		 * @return	{array}					element元素数组
		 */
		getElementsByClass: function(el, className) {
			el = g(el);
			return Selector.query(el, '.' + className);
		},

		/** 
		 * 获取element的value
		 * @method	getValue
		 * @param	{element|string|wrap}	el		id,Element实例或wrap
		 * @return	{string}				元素value
		 */
		getValue: function(el) {
			el = g(el);
			//if(el.value==el.getAttribute('data-placeholder')) return '';
			return el.value;
		},

		/** 
		 * 设置element的value
		 * @method	setValue
		 * @param	{element|string|wrap}	el		id,Element实例或wrap
		 * @param	{string}				value		内容
		 * @return	{void}					
		 */
		setValue: function(el, value) {
			g(el).value = value;
		},

		/** 
		 * 获取element的innerHTML
		 * @method	getHTML
		 * @param	{element|string|wrap}	el		id,Element实例或wrap
		 * @return	{string}					
		 */
		getHtml: function(el) {
			el = g(el);
			return el.innerHTML;
		},

		/** 
		 * 设置element的innerHTML
		 * @method	setHtml
		 * @param	{element|string|wrap}	el		id,Element实例或wrap
		 * @param	{string}				value		内容
		 * @return	{void}					
		 */
		setHtml: (function() {
			var mustAppend = /<(?:object|embed|option|style)/i,
				append = function(el, value) {
					NodeH.empty(el);
					NodeH.appendChild(el, DomU.create(value, true));
				};
			return function(el, value) {
				el = g(el);
				if (!mustAppend.test(value)) {
					try {
						el.innerHTML = value;
					} catch (ex) {
						append(el, value);	
					}
				} else {
					append(el, value);
				}
			};
		}()),

		/** 
		 * 获得form的所有elements并把value转换成由'&'连接的键值字符串
		 * @method	encodeURIForm
		 * @param	{element}	el			form对象
		 * @param	{string}	filter	(Optional)	过滤函数,会被循环调用传递给item作参数要求返回布尔值判断是否过滤
		 * @return	{string}					由'&'连接的键值字符串
		 */
		encodeURIForm: function(el, filter) {
			el = g(el);
			filter = filter || function(el) {return false; };
			var result = [],
				els = el.elements,
				l = els.length,
				i = 0,
				push = function(name, value) {
					result.push(encodeURIComponent(name) + '=' + encodeURIComponent(value));
				};
			for (; i < l; ++i) {
				el = els[i];
				var name = el.name;
				if (el.disabled || !name || filter(el)) {continue; }
				switch (el.type) {
				case "text":
				case "hidden":
				case "password":
				case "textarea":
					push(name, el.value);
					break;
				case "radio":
				case "checkbox":
					if (el.checked) {push(name, el.value); }
					break;
				case "select-one":
					if (el.selectedIndex > -1) {push(name, el.value); }
					break;
				case "select-multiple":
					var opts = el.options;
					for (var j = 0; j < opts.length; ++j) {
						if (opts[j].selected) {push(name, opts[j].value); }
					}
					break;
				}
			}
			return result.join("&");
		},

		/** 
		 * 判断form的内容是否有改变
		 * @method	isFormChanged
		 * @param	{element}	el			form对象
		 * @param	{string}	filter	(Optional)	过滤函数,会被循环调用传递给item作参数要求返回布尔值判断是否过滤
		 * @return	{bool}					是否改变
		 */
		isFormChanged: function(el, filter) {
			el = g(el);
			filter = filter ||
				function(el) {
					return false;
				};
			var els = el.elements,
				l = els.length,
				i = 0,
				j = 0,
				opts;
			for (; i < l; ++i, j = 0) {
				el = els[i];
				if (filter(el)) {continue; }
				switch (el.type) {
				case "text":
				case "hidden":
				case "password":
				case "textarea":
					if (el.defaultValue != el.value) {return true; }
					break;
				case "radio":
				case "checkbox":
					if (el.defaultChecked != el.checked) {return true; }
					break;
				case "select-one":
					j = 1;
				case "select-multiple":
					opts = el.options;
					for (; j < opts.length; ++j) {
						if (opts[j].defaultSelected != opts[j].selected) {return true; }
					}
					break;
				}
			}
			return false;
		},

		/** 
		 * 克隆元素
		 * @method	cloneNode
		 * @param	{element}	el			form对象
		 * @param	{bool}		bCloneChildren	(Optional) 是否深度克隆 默认值false
		 * @return	{element}					克隆后的元素
		 */
		cloneNode: function(el, bCloneChildren) {
			return g(el).cloneNode(bCloneChildren || false);
		},

		/** 
		 * 删除element对象的样式
		 * @method	removeStyle
		 * @param	{element|string|wrap}	el		id,Element实例或wrap
		 * @param	{string}				attribute	样式名
		 * @return	{void}				
		 */
		removeStyle : function (el, attribute) {
			el = g(el);

			var displayAttribute = StringH.camelize(attribute),
				hook = NodeH.cssHooks[displayAttribute];

			if (hook && hook.remove) {
				hook.remove(el);
			} else if (el.style.removeProperty) {
				el.style.removeProperty(StringH.decamelize(attribute));
			} else {
				el.style.removeAttribute(displayAttribute);
			}
		},

		/** 
		 * 获得element对象的样式
		 * @method	getStyle
		 * @param	{element|string|wrap}	el		id,Element实例或wrap
		 * @param	{string}				attribute	样式名
		 * @return	{string}				
		 */
		getStyle: function(el, attribute) {
			el = g(el);

			attribute = StringH.camelize(attribute);

			var hook = NodeH.cssHooks[attribute],
				result;

			if (hook && hook.get) {
				result = hook.get(el);
			} else {
				result = el.style[attribute];
			}

			return result;
		},

		/** 
		 * 获得element对象当前的样式
		 * @method	getCurrentStyle
		 * @param	{element|string|wrap}	el		id,Element实例或wrap
		 * @param	{string}				attribute	样式名
		 * @return	{string}				
		 */
		getCurrentStyle: function(el, attribute, pseudo) {
			el = g(el);

			var displayAttribute = StringH.camelize(attribute),
				hook = NodeH.cssHooks[displayAttribute];

			if (hook && hook.get) {
				return hook.get(el, true, pseudo);
			} else {
				return getCommonCurrentStyle(el, attribute, pseudo);
			} 
		},

		/** 
		 * 设置element对象的样式
		 * @method	setStyle
		 * @param	{element|string|wrap}	el		id,Element实例或wrap
		 * @param	{string}				attribute	样式名
		 * @param	{string}				value		值
		 * @return	{void}
		 */
		setStyle: function(el, attribute, value) {
			el = g(el);
			if ('object' != typeof attribute) {
				var displayAttribute = StringH.camelize(attribute),
					hook = NodeH.cssHooks[displayAttribute];

				if (hook && hook.set) {
					hook.set(el, value);
				} else {
					if(typeof value == 'number' && !cssNumber[displayAttribute]) {
						value += 'px';
					}

					el.style[displayAttribute] = value;
				}

			} else {
				for (var prop in attribute) {
					NodeH.setStyle(el, prop, attribute[prop]);
				}
			}
		},

		/** 
		 * 获取element对象的border宽度
		 * @method	borderWidth
		 * @param	{element|string|wrap}	el		id,Element实例或wrap
		 * @return	{array}					topWidth, rightWidth, bottomWidth, leftWidth
		 */
		borderWidth: (function() {
			var map = {
				thin: 2,
				medium: 4,
				thick: 6
			};

			var getWidth = function(el, val) {
				var result = NodeH.getCurrentStyle(el, val);
				result = map[result] || parseFloat(result);
				return result || 0;
			};

			return function(el) {
				el = g(el);

				return [
					getWidth(el, 'borderTopWidth'),
					getWidth(el, 'borderRightWidth'),
					getWidth(el, 'borderBottomWidth'),
					getWidth(el, 'borderLeftWidth')
				];
			};
		}()),

		/** 
		 * 获取element对象的padding宽度
		 * @method	paddingWidth
		 * @param	{element|string|wrap}	el		id,Element实例或wrap
		 * @return	{array}					topWidth, rightWidth, bottomWidth, leftWidth
		 */
		paddingWidth: function(el) {
			el = g(el);
			return [
				getPixel(el, NodeH.getCurrentStyle(el, 'paddingTop')),
				getPixel(el, NodeH.getCurrentStyle(el, 'paddingRight')),
				getPixel(el, NodeH.getCurrentStyle(el, 'paddingBottom')),
				getPixel(el, NodeH.getCurrentStyle(el, 'paddingLeft'))
			];
		},

		/** 
		 * 获取element对象的margin宽度
		 * @method	marginWidth
		 * @param	{element|string|wrap}	el		id,Element实例或wrap
		 * @return	{array}					topWidth, rightWidth, bottomWidth, leftWidth
		 */
		marginWidth: function(el) {
			el = g(el);
			return [
				getPixel(el, NodeH.getCurrentStyle(el, 'marginTop')),
				getPixel(el, NodeH.getCurrentStyle(el, 'marginRight')),
				getPixel(el, NodeH.getCurrentStyle(el, 'marginBottom')),
				getPixel(el, NodeH.getCurrentStyle(el, 'marginLeft'))
			];
		},

		/** 
		 * 以元素的innerHTML当作字符串模板
		 * @method	tmpl
		 * @param	{element|string|wrap}	el		id,Element实例或wrap
		 * @return	{any}	data	模板参数
		 * @return	{string}	
		 * @see StringH.tmpl
		 */
		tmpl: function(el, data){
			el = g(el);
			return StringH.tmpl(el.innerHTML, data); 
		},

		attrMap: {
			"class": "className",
			"for": "htmlFor",
			tabindex: "tabIndex",
			readonly: "readOnly",
			maxlength: "maxLength",
			cellspacing: "cellSpacing",
			cellpadding: "cellPadding",
			rowspan: "rowSpan",
			colspan: "colSpan",
			usemap: "useMap",
			frameborder: "frameBorder",
			contenteditable: "contentEditable"
		},

		cssHooks: (function() {

			var hooks = {
				'float': {
					get: function(el, current, pseudo) {
						if (current) {
							var style = el.ownerDocument.defaultView.getComputedStyle(el, pseudo || null);
								return style ? style.getPropertyValue('float') : null;
						} else {
							return el.style.cssFloat;
						}
					},
					set: function(el, value) {
						el.style.cssFloat = value;
					},
					remove : function (el) {
						el.style.removeProperty('float');
					}
				},
				'width' : {
					get: function(el, current, pseudo) {
						if (!current) {
							return el.style.width;
						}
						var result = getCommonCurrentStyle(el, 'width', pseudo);
						if (result && (/^\d*(px)*$/).test(result)) {
								return result;
						}
						return NodeH.getSize(el)['width'] + 'px';
					}
				},
				'height' : {
					get: function(el, current, pseudo) {
						if (!current) {
							return el.style.height;
						}
						var result = getCommonCurrentStyle(el, 'height', pseudo);
						if (result && (/^\d*(px)*$/).test(result)) {
								return result;
						}
						return NodeH.getSize(el)['height'] + 'px';
					}
				}
			};


			if (Browser.ie) {
				hooks['float'] = {
					get: function(el, current) {
						return el[current ? 'currentStyle' : 'style'].styleFloat;
					},
					set: function(el, value) {
						el.style.styleFloat = value;
					},
					remove : function (el) {
						el.style.removeAttribute('styleFloat');
					}
				};

				//对于IE9+，支持了标准的opacity，如果还走这个分支会有问题.（by Jerry Qu, code from JQuery.）
				var div = document.createElement('div'), link;
				div.innerHTML = "<a href='#' style='opacity:.55;'>a</a>";
				link = div.getElementsByTagName('a')[0];

				if(link && ! /^0.55$/.test( link.style.opacity )) {
					var ralpha = /alpha\([^)]*\)/i,
						ropacity = /opacity=([^)]*)/;

					hooks.opacity = {
						get: function(el, current) {
							return ropacity.test( (current && el.currentStyle ? el.currentStyle.filter : el.style.filter) || "" ) ?
								( parseFloat( RegExp.$1 ) / 100 ) + "" :
								current ? "1" : "";
						},

						set: function(el, value) {
							var style = el.style,
								currentStyle = el.currentStyle;

							// IE has trouble with opacity if it does not have layout
							// Force it by setting the zoom level
							style.zoom = 1;

							var opacity = "alpha(opacity=" + value * 100 + ")",
								filter = currentStyle && currentStyle.filter || style.filter || "";

							style.filter = ralpha.test( filter ) ?
								filter.replace( ralpha, opacity ) :
								filter + " " + opacity;
						},

						remove : function (el) {
							var style = el.style,
								currentStyle = el.currentStyle,
								filter = currentStyle && currentStyle.filter || style.filter || "";

							if(ralpha.test( filter )) {
								style.filter = filter.replace(ralpha, '');
							}

							style.removeAttribute('opacity');
						}
					};
				}
			}
			return hooks;
		}())
	};

	NodeH.g = g;

	QW.NodeH = NodeH;
}());