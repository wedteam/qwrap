/*
 * 防重复点击
*/
(function() {
	var F = function(el, e) {
		var ban = (el.getAttribute && el.getAttribute('data--ban')) | 0;
		if (ban) {
			if (!el.__BAN_preTime || (new Date() - el.__BAN_preTime) > ban) {
				setTimeout(function(){//月影：setTimeout来避免“在el上注册多个事件时只能执行第一个”。
					el.__BAN_preTime = new Date() * 1;
				});
				return true;
			}
			QW.EventH.preventDefault(e);
			return;
		}
		return true;
	};
	QW.EventTargetH._DelegateHooks.click = QW.EventTargetH._EventHooks.click = {
		'click': F
	};
	QW.EventTargetH._EventHooks.submit = {
		'submit': F
	};
}());

/*
 * 增加别名
*/
window.g = QW.g = QW.NodeH.g;
window.W = QW.W = QW.NodeW;

/*
 * 将直属于QW的方法与命名空间上提一层到window
*/
QW.ObjectH.mix(window, QW);

/*
 * 增加provide的产出
*/
QW.ModuleH.provideDomains.push(window);