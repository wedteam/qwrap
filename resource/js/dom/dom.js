(function() {
	var els = document.getElementsByTagName('script');
	var srcPath = els[els.length - 1].src.split(/dom[\\\/]/g)[0];
	document.write('<script type="text/javascript" src="' + srcPath + 'dom/selector.js"><\/script>');
	document.write('<script type="text/javascript" src="' + srcPath + 'dom/dom.u.js"><\/script>');
	document.write('<script type="text/javascript" src="' + srcPath + 'dom/node.h.js"><\/script>');
	document.write('<script type="text/javascript" src="' + srcPath + 'dom/node.w.js"><\/script>');
	document.write('<script type="text/javascript" src="' + srcPath + 'dom/event.h.js"><\/script>');
	document.write('<script type="text/javascript" src="' + srcPath + 'dom/eventtarget.h.js"><\/script>');
	document.write('<script type="text/javascript" src="' + srcPath + 'dom/jss.js"><\/script>');
}());