/*
	Copyright (c) Baidu Youa Wed QWrap
	version: $version$ $release$ released
	author: CC
*/


/**
 * @singleton 
 * @class QW QW是QWrap的默认域，所有的核心Class都应定义在QW的域下
 */
(function() {
	var QW = {

		/**
		 * 加载css样式表，对firefox以style的方式hack来支持onComplete
		 * @method loadCss
		 * @static
		 * @param { String } url Css文件路径
		 * @param { Function } onComplete 样式表文件加载完成的回调函数
		 */
		loadCss: function(url, onComplete) {
			var css, head = document.getElementsByTagName('head')[0] || document.documentElement,
				called = false,
				onCompleteW = function(){
					if (!called && typeof onComplete === 'function') {
						called = true;
						onComplete();
					}
				};

			if (window.navigator.userAgent.toLowerCase().indexOf('msie') !== -1) {
				css = document.createElement('link');
				css.rel = 'stylesheet';
				css.type = 'text/css';
				css.onload = onCompleteW;
				css.href = url;
			} else {
				css = document.createElement('style');
				css.textContent = '@import url("' + url + '");';
				var tryTime = 0;
				var timer = window.setInterval(function() {
					try {
						tryTime += 13;
						if (tryTime > 3e4) { //timeout
							clearInterval(timer);
						}
						css.sheet.cssRules;
						onCompleteW();
						clearInterval(timer);
					} catch (e) {}
				}, 13);
			}

			head.insertBefore(css, head.firstChild);
		}
	};

	window.QW.loadCss = QW.loadCss;

}());