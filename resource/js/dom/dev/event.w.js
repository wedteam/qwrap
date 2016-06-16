/*
	Copyright (c) Baidu Youa Wed QWrap
	author: 好奇
*/
/** 
 * @class EventW Event Wrap，event对象包装器
 * @namespace QW
 */
(function() {
	var mix = QW.ObjectH.mix,
		methodize = QW.HelperH.methodize;

	QW.EventW = function() {
		this.chromeHack; //chrome bug hack

		/** 
		 * @property core 原生Event实例
		 * @type {Event}
		 */
		this.core = QW.EventH.getEvent.apply(null, arguments);

		/** 
		 * @property target 事件触发的元素
		 * @type {HTMLElement}
		 */
		this.target = this.getTarget();

		/** 
		 * @property relatedTarget mouseover/mouseout 事件时有效 over时为来源元素,out时为移动到的元素.
		 * @type {HTMLElement}
		 */
		this.relatedTarget = this.getRelatedTarget();

		/** 
		 * @property pageX 鼠标位于完整页面的X坐标
		 * @type {int}
		 */
		this.pageX = this.getPageX();

		/** 
		 * @property pageX 鼠标位于完整页面的Y坐标
		 * @type {int}
		 */
		this.pageY = this.getPageY();
		//this.layerX = this.layerX();
		//this.layerY = this.layerY();

		/** 
		 * @property detail 鼠标滚轮方向 大于0向下,小于0向上.
		 * @type {int}
		 */
		this.detail = this.getDetail();

		/** 
		 * @property keyCode 事件触发的按键对应的ascii码
		 * @type {int}
		 */
		this.keyCode = this.getKeyCode();

		/** 
		 * @property ctrlKey 事件触发时是否持续按住ctrl键
		 * @type {boolean}
		 */
		this.ctrlKey = this.getCtrlKey();

		/** 
		 * @property shiftKey 事件触发时是否持续按住shift键
		 * @type {boolean}
		 */
		this.shiftKey = this.getShiftKey();

		/** 
		 * @property altKey 事件触发时是否持续按住alt键
		 * @type {boolean}
		 */
		this.altKey = this.getAltKey();

		/** 
		 * @property button 事件触发的鼠标键位(左中右) 由于ie和其它浏览器策略很不相同，所以没有作兼容处理。这里返回的是原生结果
		 * @type {boolean}
		 */
		this.button = this.core.button;

		this.clientX = this.core.clientX;
		this.clientY = this.core.clientY;
		this.type = this.core.type;
	};

	mix(QW.EventW.prototype, methodize(QW.EventH, 'core'));
}());