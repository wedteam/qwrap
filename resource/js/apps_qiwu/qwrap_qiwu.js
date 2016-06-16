(function() {
	var els = document.getElementsByTagName('script'),
		srcPath = '';
	for (var i = 0; i < els.length; i++) {
		var src = els[i].src.split(/apps[_\-\\\/]/g);
		if (src[1]) {
			srcPath = src[0];
			break;
		}
	}

	document.write('<script type="text/javascript" src="' + srcPath + 'core/core_base.js"><\/script>');
	document.write('<script type="text/javascript" src="' + srcPath + 'core/module.h.js"><\/script>');
	document.write('<script type="text/javascript" src="' + srcPath + 'core/browser.js"><\/script>');
	document.write('<script type="text/javascript" src="' + srcPath + 'core/string.h.js"><\/script>');
	document.write('<script type="text/javascript" src="' + srcPath + 'core/object.h.js"><\/script>');
	document.write('<script type="text/javascript" src="' + srcPath + 'core/array.h.js"><\/script>');
	document.write('<script type="text/javascript" src="' + srcPath + 'core/hashset.h.js"><\/script>');
	document.write('<script type="text/javascript" src="' + srcPath + 'core/date.h.js"><\/script>');
	document.write('<script type="text/javascript" src="' + srcPath + 'core/function.h.js"><\/script>');
	document.write('<script type="text/javascript" src="' + srcPath + 'core/class.h.js"><\/script>');
	document.write('<script type="text/javascript" src="' + srcPath + 'core/helper.h.js"><\/script>');
	document.write('<script type="text/javascript" src="' + srcPath + 'core/json.js"><\/script>');
	document.write('<script type="text/javascript" src="' + srcPath + 'core/custevent.js"><\/script>');

	document.write('<script type="text/javascript" src="' + srcPath + 'dom/selector.js"><\/script>');
	document.write('<script type="text/javascript" src="' + srcPath + 'dom/dom.u.js"><\/script>');
	document.write('<script type="text/javascript" src="' + srcPath + 'dom/node.h.js"><\/script>');
	document.write('<script type="text/javascript" src="' + srcPath + 'dom/node.w.js"><\/script>');
	document.write('<script type="text/javascript" src="' + srcPath + 'dom/event.h.js"><\/script>');
	document.write('<script type="text/javascript" src="' + srcPath + 'dom/eventtarget.h.js"><\/script>');
	document.write('<script type="text/javascript" src="' + srcPath + 'dom/jss.js"><\/script>');
	document.write('<script type="text/javascript" src="' + srcPath + 'dom/node.c.js"><\/script>');

	document.write('<script type="text/javascript" src="' + srcPath + 'core/core_retouch.js"><\/script>');
	document.write('<script type="text/javascript" src="' + srcPath + 'dom/dom_retouch.js"><\/script>');
	document.write('<script type="text/javascript" src="' + srcPath + 'apps_qiwu/qiwu_retouch.js"><\/script>');

	document.write('<script type="text/javascript" src="' + srcPath + 'components/async/async.h.js"><\/script>');
	document.write('<script type="text/javascript" src="' + srcPath + 'components/async/async_retouch.js"><\/script>');

	document.write('<script type="text/javascript" src="' + srcPath + 'components/ajax/ajax.js"><\/script>');
	document.write('<script type="text/javascript" src="' + srcPath + 'components/ajax/ajax_retouch.js"><\/script>');

	document.write('<script type="text/javascript" src="' + srcPath + 'components/anim/anim_base.js"><\/script>');
	document.write('<script type="text/javascript" src="' + srcPath + 'components/anim/elanim.js"><\/script>');
	document.write('<script type="text/javascript" src="' + srcPath + 'components/anim/easing.js"><\/script>');
	document.write('<script type="text/javascript" src="' + srcPath + 'components/anim/anim_retouch.js"><\/script>');
}());