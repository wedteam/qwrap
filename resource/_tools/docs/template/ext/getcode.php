<?php
if(!isset($_GET['url'])) die();
$url = $_GET['url'];
$content = htmlspecialchars(file_get_contents($url));
?>
<html>
<head>
	<meta http-equiv="Content-Type"  content="text/html; charset=gb2312" />
	<style>
	html, body{margin:0;padding:0}
	</style>
</head>
<body style="font-size:80%;">
	<textarea class="brush: javascript;"><?php echo($content);?></textarea>
	<script type="text/javascript" src="resources/syntax/scripts/shCore.js"></script>
	<script type="text/javascript" src="resources/syntax/scripts/shCore.js"></script>
	<script type="text/javascript" src="resources/syntax/scripts/shBrushCpp.js"></script>
	<script type="text/javascript" src="resources/syntax/scripts/shBrushCss.js"></script>
	<script type="text/javascript" src="resources/syntax/scripts/shBrushJScript.js"></script>
	<script type="text/javascript" src="resources/syntax/scripts/shBrushPhp.js"></script>
	<script type="text/javascript" src="resources/syntax/scripts/shBrushPlain.js"></script>
	<script type="text/javascript" src="resources/syntax/scripts/shBrushXml.js"></script>
	<link type="text/css" rel="stylesheet" href="resources/syntax/styles/shCore.css"/>
	<link type="text/css" rel="stylesheet" href="resources/syntax/styles/shThemeDefault.css"/>
	<script>
		SyntaxHighlighter.config.clipboardSwf = 'resources/syntax/scripts/clipboard.swf';
		SyntaxHighlighter.config.tagName="textarea";
		SyntaxHighlighter.all();
		function getOffset(element){
			var valueT = 0, valueL = 0;
			do {
			  valueT += element.offsetTop  || 0;
			  valueL += element.offsetLeft || 0;
			  element = element.offsetParent;
			} while (element);
			return [valueT, valueL];
		}
		function focusLine(line){
			var his = SyntaxHighlighter.vars.highlighters;
			var p = null;
			for (var o in his) {
				if (his.hasOwnProperty(o)) 
					p = his[o];
			}
			p = getOffset(p.lines.children[line-1]);
			window.scrollTo(p[1], p[0]);
		};
		function errorLine(arg){
			var his = SyntaxHighlighter.vars.highlighters;
			var p = null;
			for (var o in his) {
				if (his.hasOwnProperty(o)) 
					p = his[o];
			}
			p = p.lines.children;
			for (var i = 0; i < arg.length; i++) {
//				p[arg[i]-1].style['backgroundColor'] = "#f99 !important";
				p[arg[i]-1].setAttribute('style', "background-color: #f82 !important");
				p[arg[i]-1].getElementsByTagName('td')[1].setAttribute('style', "border-color: #f82 !important");
			}
		};
		function warningLine(arg){
			var his = SyntaxHighlighter.vars.highlighters;
			var p = null;
			for (var o in his) {
				if (his.hasOwnProperty(o)) 
					p = his[o];
			}
			p = p.lines.children;
			for (var i = 0; i < arg.length; i++) {
//				p[arg[i]-1].style['backgroundColor'] = "#fa6 !important";
				p[arg[i]-1].setAttribute('style', "background-color: #fd6 !important");
				p[arg[i]-1].getElementsByTagName('td')[1].setAttribute('style', "border-color: #fd6 !important");
			}
		};
	</script>
	<style>
	.syntaxhighlighter {margin:0 !important;border:0 !important}
	</style>
</body>
</html>