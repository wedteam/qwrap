/*
	Copyright (c) Baidu Youa Wed QWrap
	version: $version$ $release$ released
	author: JK
*/

/**
 * @class Selector CssSelector相关的几个方法
 * @singleton
 * @namespace QW
 */
(function() {
	var QW = window.QW;
	var Selector = {
	/*
	 * CSS selector属性运算符
	 */
		_operators: { //以下表达式，aa表示attr值，vv表示比较的值
			'': 'aa',
			//isTrue|hasValue
			'=': 'aa=="vv"',
			//equal
			'!=': 'aa!="vv"',
			//unequal
			'~=': 'aa&&(" "+aa+" ").indexOf(" vv ")>-1',
			//onePart
			'|=': 'aa&&(aa+"-").indexOf("vv-")==0',
			//firstPart
			'^=': 'aa&&aa.indexOf("vv")==0',
			// beginWith
			'$=': 'aa&&aa.lastIndexOf("vv")==aa.length-"vv".length',
			// endWith
			'*=': 'aa&&aa.indexOf(v)>-1' //contains
		},
		/*
		 * CSS 伪类逻辑。简版selector，不支持
		 */
		//_pseudos:{},
		/*
		 * CSS selector关系运算符。简版selector，不支持
		 */
		//_relations:{},简版selector，不支持
		/*
		 * 常用的Element属性
		 */
		_attrGetters: (function() {
			var o = {
				'class': 'el.className',
				'for': 'el.htmlFor',
				'href': 'el.getAttribute("href",2)'
			};
			var attrs = 'name,id,className,value,selected,checked,disabled,type,tagName,readOnly'.split(',');
			for (var i = 0, a; a = attrs[i]; i++) o[a] = "el." + a;
			return o;
		}()),
		/* 
		 * 把一个selector字符串转化成一个过滤函数.
		 * @method selector2Filter
		 * @param {string} sSelector: 过滤selector，这个selector里没有关系运算符（", >+~"）
		 * @returns {function} : 返回过滤函数。
		 * @example: 
			var fun=selector2Filter("input.aaa");alert(fun);
		 */
		selector2Filter: function(sSelector) {
			return s2f(sSelector);
		},
		/*
		 * 判断一个元素是否符合某selector.
		 * @method test 
		 * @param {HTMLElement} el: 被考察参数
		 * @param {string} sSelector: 过滤selector，这个selector里没有关系运算符（", >+~"）
		 * @returns {function} : 返回过滤函数。
		 */
		test: function(el, sSelector) {
			return s2f(sSelector)(el);
		},
		/* 
		 * 用一个css selector来过滤一个数组.
		 * @method filter 
		 * @static
		 * @param {Array|Collection} els: 元素数组
		 * @param {string} sSelector: 过滤selector，这个selector里没有关系运算符（", >+~"）
		 * @param {Element} pEl: 父节点。默认是document
		 * @returns {Array} : 返回满足过滤条件的元素组成的数组。
		 */
		filter: function(els, sSelector, pEl) {
			var els2 = [],
				fun = s2f(sSelector);
			for (var i = 0, el; el = els[i++];) {
				if (fun(el)) els2.push(el);
			}
			return els2;
		},
		/*
		 * 以refEl为参考，得到符合过滤条件的HTML Elements. refEl可以是element或者是document
		 * @method query
		 * @param {HTMLElement} refEl: 参考对象
		 * @param {string} sSelector: 过滤selector,
		 * @returns {array} : 返回elements数组。
		 * @example: 
			var els=query(document,"input.aaa");
			for(var i=0;i<els.length;i++ )els[i].style.backgroundColor='red';
		 */
		query: function(refEl, sSelector) {
			return querySimple(refEl || document, sSelector);
		},
		/** 
		 * 以refEl为参考，得到符合过滤条件的一个元素. refEl可以是element或者是document
		 * @method one
		 * @static
		 * @param {HTMLElement} refEl: 参考对象
		 * @param {string} sSelector: 过滤selector,
		 * @returns {HTMLElement} : 返回element，如果获取不到，则反回null。
		 * @example: 
		 var els=query(document,"li input.aaa");
		 for(var i=0;i<els.length;i++ )els[i].style.backgroundColor='red';
		 */
		one: function(refEl, sSelector) {
			var els = Selector.query(refEl, sSelector);
			return els[0];
		}

	};

	/*
	 * s2f(sSelector): 由一个selector得到一个过滤函数filter，这个selector里没有关系运算符（", >+~"）
	 */

	function s2f(sSelector) {
		var s = sSelector,
			reg = /\[\s*((?:[\w\u00c0-\uFFFF-]|\\.)+)\s*(?:(\S?=)\s*(['"]*)(.*?)\3|)\s*\]/g,
			//属性选择表达式解析,thanks JQuery
			sFun = [];
		s = s.replace(/\:([\w\-]+)(\(([^)]+)\))?/g, //伪类
			function(a, b, c, d, e) {
				pseudos.push([b, d]);
				return "";
			}).replace(/^\*/g, //任意tagName缩略写法
			function(a) { 
				sFun.push('el.nodeType==1');
				return '';
			}).replace(/^([\w\-]+)/g, //tagName缩略写法
			function(a) { 
				sFun.push('(el.tagName||"").toUpperCase()=="' + a.toUpperCase() + '"');
				return '';
			}).replace(/([\[(].*)|#([\w\-]+)|\.([\w\-]+)/g,  //id缩略写法//className缩略写法
			function(a, b, c, d) {
				return b || c && '[id="' + c + '"]' || d && '[className~="' + d + '"]';
			}).replace(reg, //普通写法[foo][foo=""][foo~=""]等
			function(a, b, c, d, e) {
				var attrGetter = Selector._attrGetters[b] || 'el.getAttribute("' + b + '")';
				sFun.push(Selector._operators[c || ''].replace(/aa/g, attrGetter).replace(/vv/g, e || ''));
				return '';
			});
		if (s.length) {
			throw "Unsupported Selector:\n" + sSelector + "\n" + s;
		}
		if (sFun.length) {
			sFun = 'return (' + sFun.join(")&&(") + ');';
			return new Function("el", sFun);
		}
		return function(el) {
			return true;
		};
	}
	/*
	备用代码，更简版s2f
	function s2f(sSelector){
		var attrs=[];//属性数组，每一个元素都是数组，依次为：属性名／属性比较符／比较值
		var s=sSelector;
		var shorthands=[
			[/\#([\w\-]+)/g,function(a,b){attrs.push('el.id=="'+b+'"');return '';}],//id过滤
			[/^\*+/g,function(a,b){attrs.push('el.tagName');return '';}],//Element过滤
			[/^([\w\-]+)/g,function(a,b){attrs.push('(el.tagName||"").toUpperCase()=="'+b.toUpperCase()+'"');return '';}],//tagName过滤
			[/\.([\w\-]+)/g,function(a,b){attrs.push('el.className && (" "+el.className+" ").indexOf(" '+b+' ")>-1');return '';}]//className过滤
		];
		for(var i=0,sh;sh=shorthands[i];i++){
			s=s.replace(sh[0],sh[1]);
		}
		if(s) throw ("Unsupported Selector:\n"+sSelector+"\n"+s);
		if(attrs.length){
			return new Function('el','return '+attrs.join('&&'));
		}
		return function(el){return true;};
	};
	*/

	/* 
	* querySimple(pEl,sSelector): 得到pEl下的符合过滤条件的HTML Elements. 
	* sSelector里没有","运算符
	* pEl是默认是document.body 
	* @see: query。
	*/

	function querySimple(pEl, sSelector) {
		//if(pEl.querySelectorAll) return pEl.querySelectorAll(sSelector);//JK：如果加上本句，可能会让习惯于ff调试bug的同学，把ie里的问题漏掉了。
		var tagName = "*";
		sSelector = sSelector.replace(/^[\w\-]+/, function(a) {
			tagName = a;
			return "";
		});
		var filter = s2f(sSelector);
		var els = pEl.getElementsByTagName(tagName),
			els2 = [];
		for (var i = 0, el; el = els[i]; i++) {
			if (filter(el)) els2.push(el);
		}
		return els2;
	}

	QW.Selector = Selector;

}());