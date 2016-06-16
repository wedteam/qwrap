/*
	Copyright (c) Baidu Youa Wed QWrap
	author: 好奇、魔力鸟
*/

/** 
 * Dom Utils，是Dom模块核心类
 * @class DomU
 * @singleton
 * @namespace QW
 */
(function() {
	var Selector = QW.Selector;
	var Browser = QW.Browser;
	var DomU = {

		/** 
		 * 按cssselector获取元素集 
		 * @method	query
		 * @param {String} sSelector cssselector字符串
		 * @param {Element} refEl (Optional) 参考元素，默认为document.documentElement
		 * @return {Array}
		 */
		query: function(sSelector, refEl) {
			return Selector.query(refEl || document.documentElement, sSelector);
		},
		/** 
		 * 获取doc的一些坐标信息 
		 * 参考与YUI3.1.1
		 * @refer  https://github.com/yui/yui3/blob/master/build/dom/dom.js
		 * @method	getDocRect
		 * @param	{object} doc (Optional) document对象/默认为当前宿主的document
		 * @return	{object} 包含doc的scrollX,scrollY,width,height,scrollHeight,scrollWidth值的json
		 */
		getDocRect: function(doc) {
			doc = doc || document;

			var win = doc.defaultView || doc.parentWindow,
				mode = doc.compatMode,
				root = doc.documentElement,
				h = win.innerHeight || 0,
				w = win.innerWidth || 0,
				scrollX = win.pageXOffset || 0,
				scrollY = win.pageYOffset || 0,
				scrollW = root.scrollWidth,
				scrollH = root.scrollHeight;

			if (mode != 'CSS1Compat') { // Quirks
				root = doc.body;
				scrollW = root.scrollWidth;
				scrollH = root.scrollHeight;
			}

			if (mode && !Browser.opera) { // IE, Gecko
				w = root.clientWidth;
				h = root.clientHeight;
			}

			scrollW = Math.max(scrollW, w);
			scrollH = Math.max(scrollH, h);

			scrollX = Math.max(scrollX, doc.documentElement.scrollLeft, doc.body.scrollLeft);
			scrollY = Math.max(scrollY, doc.documentElement.scrollTop, doc.body.scrollTop);

			return {
				width: w,
				height: h,
				scrollWidth: scrollW,
				scrollHeight: scrollH,
				scrollX: scrollX,
				scrollY: scrollY
			};
		},

		/** 
		 * 通过html字符串创建Dom对象 
		 * @method	create
		 * @param	{string}	html html字符串
		 * @param	{boolean}	rfrag (Optional) 是否返回documentFragment对象
		 * @param	{object}	doc	(Optional)	document 默认为 当前document
		 * @return	{element}	返回html字符的element对象或documentFragment对象
		 */
		create: (function() {
			var temp = document.createElement('div'),
				wrap = {
					option: [1, '<select multiple="multiple">', '</select>'],
					optgroup: [1, '<select multiple="multiple">', '</select>'],
					legend: [1, '<fieldset>', '</fieldset>'],
					thead: [1, '<table>', '</table>'],
					tbody: [1, '<table>', '</table>'],
					tfoot : [1, '<table>', '</table>'],
					tr: [2, '<table><tbody>', '</tbody></table>'],
					td: [3, '<table><tbody><tr>', '</tr></tbody></table>'],
					th: [3, '<table><tbody><tr>', '</tr></tbody></table>'],
					col: [2, '<table><tbody></tbody><colgroup>', '</colgroup></table>'],
					_default: [0, '', '']
				},
				tagName = /<(\w+)/i;
			return function(html, rfrag, doc) {
				var dtemp = (doc && doc.createElement('div')) || temp,
					root = dtemp,
					tag = (tagName.exec(html) || ['', ''])[1],
					wr = wrap[tag] || wrap._default,
					dep = wr[0];
				dtemp.innerHTML = wr[1] + html + wr[2];
				while (dep--) {
					dtemp = dtemp.firstChild;
				}
				var el = dtemp.firstChild;
				if (!el || !rfrag) {
					while (root.firstChild) {
						root.removeChild(root.firstChild);
					}
					//root.innerHTML = '';
					return el;
				} else {
					doc = doc || document;
					var frag = doc.createDocumentFragment();
					while (el = dtemp.firstChild) {
						frag.appendChild(el);
					}
					return frag;
				}
			};
		}()),

		/** 
		 * 把NodeCollection转为ElementCollection
		 * @method	pluckWhiteNode
		 * @param	{NodeCollection|array} list Node的集合
		 * @return	{array}						Element的集合
		 */
		pluckWhiteNode: function(list) {
			var result = [],
				i = 0,
				l = list.length;
			for (; i < l; i++) {
				if (DomU.isElement(list[i])) {
					result.push(list[i]);
				}
			}
			return result;
		},

		/** 
		 * 判断Node实例是否继承了Element接口
		 * @method	isElement
		 * @param	{object} element Node的实例
		 * @return	{boolean}		 判断结果
		 */
		isElement: function(el) {
			return !!(el && el.nodeType == 1);
		},

		/** 
		 * 监听Dom树结构初始化完毕事件
		 * @method	ready
		 * @param	{function} handler 事件处理程序
		 * @param	{object}	doc	(Optional)	document 默认为 当前document
		 * @return	{void}
		 */
		ready: function(handler, doc) {
			doc = doc || document;
			var win = doc.defaultView || doc.parentWindow,
				cbs = doc.__QWDomReadyCbs = doc.__QWDomReadyCbs || [];
			cbs.push(handler);

			function execCbs(){//JK：这里需要保证：每一个回调都执行，并且按顺序，并且每一个回调的异常都被抛出以方便工程师发现错误
				clearTimeout(doc.__QWDomReadyTimer);
				if(cbs.length){
					var cb = cbs.shift();
					if(cbs.length) {
						doc.__QWDomReadyTimer = setTimeout(execCbs,0);
					}
					cb();
				}
			}

			setTimeout(function(){ //延迟执行，而不是立即执行，以保证ready方法的键壮
				if ('complete' == doc.readyState) {
					execCbs();
				} else {
					if (doc.addEventListener) {
						doc.addEventListener('DOMContentLoaded', execCbs, false);
						win.addEventListener( "load", execCbs, false ); //添加load来避免DOMContentLoaded没有执行的情况，例如interactive状态
					} else {
						(function() {
							try {
								doc.body.doScroll('left');
							} catch (exp) {
								return setTimeout(arguments.callee, 1);
							}
							execCbs();
						}());
						doc.attachEvent('onreadystatechange', function() {
							if ('complete' == doc.readyState) {
								execCbs();
							}
						});
					}
				}
			},1);
		},


		/** 
		 * 判断一个矩形是否包含另一个矩形
		 * @method	rectContains
		 * @param	{object} rect1	矩形
		 * @param	{object} rect2	矩形
		 * @return	{boolean}		比较结果
		 */
		rectContains: function(rect1, rect2) {
			return rect1.left <= rect2.left && rect1.right >= rect2.right && rect1.top <= rect2.top && rect1.bottom >= rect2.bottom;
		},

		/** 
		 * 判断一个矩形是否和另一个矩形有交集
		 * @method	rectIntersect
		 * @param	{object} rect1	矩形
		 * @param	{object} rect2	矩形
		 * @return	{rect}			交集矩形或null
		 */
		rectIntersect: function(rect1, rect2) {
			//修正变量名
			var t = Math.max(rect1.top, rect2.top),
				r = Math.min(rect1.right, rect2.right),
				b = Math.min(rect1.bottom, rect2.bottom),
				l = Math.max(rect1.left, rect2.left);

			if (b >= t && r >= l) {
				return {
					top: t,
					right: r,
					bottom: b,
					left: l
				};
			} else {
				return null;
			}
		},

		/** 
		 * 创建一个element
		 * @method	createElement
		 * @param	{string}	tagName		元素类型
		 * @param	{json}		property	属性
		 * @param	{document}	doc	(Optional)		document
		 * @return	{element}	创建的元素
		 */
		createElement: function(tagName, property, doc) {
			doc = doc || document;
			var el = doc.createElement(tagName);
			if (property) {
				QW.NodeH.setAttr(el, property);
			}
			return el;
		},

		/** 
		 * 让一段cssText生效
		 * @method	insertCssText
		 * @param	{string}	cssText		css 字符串，例如:"a{color:red} h5{font-size:50px}"
		 * @return	{Element} 新创建的style元素
		 */
		insertCssText: function(cssText) {
			var oStyle = document.createElement("style");
			oStyle.type = "text/css";
			if (oStyle.styleSheet) {
				oStyle.styleSheet.cssText = cssText;
			} else {
				oStyle.appendChild(document.createTextNode(cssText));
			}
			return (document.getElementsByTagName("head")[0] || document.documentElement).appendChild(oStyle);
		}

	};

	QW.DomU = DomU;
}());