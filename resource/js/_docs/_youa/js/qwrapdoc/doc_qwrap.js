(function(){
	var QWDoc={},
		data={
		QW:{
			_base : [
				'namespace(sSpace,root)',
				//'noConflict()',
				'loadJs(url,callback)',
				'loadJsonp(url,callback,opts)',
				'loadCss(url)',
				'use(moduleName,callback)',
				'g(id)'
			],
			Dom:{
				_static:[
					'Dom.ready(handler, doc)',
					'Dom.query(sSelector, refEl)',
					'Dom.create(html, rfrag, doc)',
					'Dom.createElement(tagName, property, doc)',
					'Dom.getDocRect(doc)',
					'Dom.isElement(el)',
					'Dom.pluckWhiteNode(list)',
					'Dom.rectContains(rect1, rect2)',
					'Dom.rectIntersect(rect1, rect2)',
					'Dom.insertCssText(cssText)'
				]
			},
			NodeW : {
				_base : [
					'W(selector)',
					'W(html)',
					'W(elsArray)',
					'W(el)'
				],
				_static :[
					//'W.g(id)',
					'W.one(selector)'
				],
				arrayLike:[
					'w.first()',
					'w.last()',
					'w.item(i)',
					'w.map(callback,pThis)',
					'w.forEach(callback,pThis)',
					'w.filter(callback,pThis)',
					'w.toArray()'
				],
				property:[
					'w.get(prop)',
					'w.getAll(prop)',
					'w.set(prop, value)',
					'w.getAttr(attribute, iFlags)',
					'w.getAttrAll(attribute, iFlags)',
					'w.setAttr(attribute, value, iCaseSensitive)',
					'w.attr(...) as getAttr || setAttr',
					'w.removeAttr(attribute, iCaseSensitive)',
					'w.getValue()',
					'w.getValueAll()',
					'w.setValue(value)',
					'w.val(...) as getValue || setValue',
					'w.getHtml()',
					'w.getHtmlAll()',
					'w.setHtml(value)',
					'w.html(...) as getHtml || setHtml'
				],
				css:[
					'w.getStyle(attribute)',
					'w.getStyleAll(attribute)',
					'w.getCurrentStyle(attribute, pseudo)',
					'w.getCurrentStyleAll(attribute, pseudo)',
					'w.setStyle(attribute, value)',
					'w.css(...) as getCurrentStyle || setStyle',
					'w.borderWidth()',
					'w.paddingWidth()',
					'w.marginWidth()'
				],
				className:[
					'w.hasClass(className)',
					'w.addClass(className)',
					'w.removeClass(className)',
					'w.replaceClass(oldClassName, newClassName)',
					'w.toggleClass(className1, className2)'

				],
				display:[
					'w.show(value)',
					'w.hide()',
					'w.toggle(value)',
					'w.isVisible()'
				],
				rect:[
					'w.getXY()',
					'w.getXYAll()',
					'w.setXY(x, y)',
					'w.xy(...) as getXY || setXY',
					'w.setSize(w, h)',
					'w.setInnerSize(w, h)',
					'w.getSize()',
					'w.getSizeAll()',
					'w.size(...) as getSize || setInnerSize',
					'w.setRect(x, y, w, h)',
					'w.setInnerRect(x, y, w, h)',
					'w.getRect()',
					'w.getRectAll()'
				],
				domOp:[
					'w.insertAdjacentHTML(sWhere, html)',
					'w.insertAdjacentElement(sWhere, newEl)',
					'w.insert(sWhere, newEl)',
					'w.insertTo(sWhere, refEl)',
					'w.appendChild(newEl)',
					'w.appendTo(pEl)',
					'w.prepend(newEl)',
					'w.prependTo(pEl)',
					'w.insertSiblingBefore(newEl)',
					'w.insertSiblingAfter(newEl)',
					'w.insertBefore(newEl, refEl)',
					'w.insertAfter(newEl, refEl)',
					'w.replaceNode(newEl)',
					'w.replaceChild(newEl, childEl)',
					'w.removeNode()',
					'w.removeChild(childEl)',
					'w.empty()',
					'w.cloneNode(bCloneChildren)',
					'w.wrap(html)',
					'w.unwrap()'
				],
				queryer:[
					'w.query(selector)',
					'w.one(selector)',
					'w.getElementsByClass(className)',
					'w.nextSibling(selector)',
					'w.nextSiblings(selector)',
					'w.previousSibling(selector)',
					'w.previousSiblings(selector)',
					'w.siblings(selector)',
					'w.ancestorNode(selector)',
					'w.ancestorNodes(selector)',
					'w.parentNode(selector)',
					'w.firstChild(selector)',
					'w.lastChild(selector)'
				],
				jss:[
					'w.getOwnJss(attributeName)',
					'w.getOwnJssAll(attributeName)',
					'w.getJss(attributeName)',
					'w.getJssAll(attributeName)',
					'w.setJss(attributeName, attributeValue)',
					'w.removeJss(attributeName)',
					'w.jss(...) as getJss || setJss'
				],
				eventtarget:[
					'w.on(sEvent, handler)',
					'w.once(sEvent, handler)',
					'w.un(sEvent, handler)',
					'w.delegate(selector, sEvent, handler)',
					'w.undelegate(selector, sEvent, handler)',
					'w.fire(sEvent)',
					'w.submit(handler)',
					'w.click(handler)',
					'w.focus(handler)',
					'w.blur(handler)',
					'w.hover(enterHandler,leaveHandler)',
					'w.addEventListener(name, handler, capture)--不推荐',
					'w.removeEventListener(name, handler, capture)--不推荐'
				],
				_eventtypes:[
					'click',
					'mousedown',
					'mouseup',
					'mouseover',
					'mouseout',
					'mouseenter',
					'mouseleave',
					'mousewheel',
					'keydown',
					'keyup',
					'keypress',
					'blur',
					'focus',
					'change',
					'submit',
					'...'
				],
				_delegateeventtypes:[
					'click',
					'mousedown',
					'mouseup',
					'mouseover',
					'mouseout',
					'mouseenter',
					'mouseleave',
					'keydown',
					'keyup',
					'keypress'
				],
				anim:[
					'w.animate(attrs, dur, callback, easing)',
					'w.fadeIn(dur, callback, easing)',
					'w.fadeOut(dur, callback, easing)',
					'w.fadeToggle(dur, callback, easing)',
					'w.slideUp(dur, callback, easing)',
					'w.slideDown(dur, callback, easing)',
					'w.slideToggle(dur, callback, easing)',
					'w.shine4Error(dur, callback, easing)',
					'w.stop(clearQueue, gotoEnd)',
					'w.sleep(dur)'
				],
				_others:[
					'w.contains(target)',
					'w.encodeURIForm(filter)',
					'w.isFormChanged(filter)',
					'w.ajaxForm(callback)'
				]
			},
			DomEvent : {
				_base:[
					'e.target',
					'e.relatedTarget',
					'e.pageX',
					'e.pageY',
					'e.detail',
					'e.keyCode',
					'e.ctrlKey',
					'e.shiftKey',
					'e.altKey',
					'e.button',
					'e.clientX',
					'e.clientY',
					'e.type'
				],
				_methods:[
					'e.stopPropagation()',
					'e.preventDefault()'
				]
			},
			Selector:{
				_Syntax:['selector语法','selector性能优化建议']
			},
			ArrayH:{
				_methods:[
					'Array.toArray(arr)',
					'arr.clear()',
					'arr.contains(obj)',
					'arr.every(callback, pThis)',
					'arr.expand()',
					'arr.filter(callback, pThis)',
					'arr.forEach(callback, pThis)',
					'arr.indexOf(obj, fromIdx)',
					'arr.lastIndexOf(obj, fromIdx)',
					'arr.map(callback, pThis)',
					'arr.reduce(callback, initial)',
					'arr.reduceRight(callback, initial)',
					'arr.remove(obj)',
					'arr.some(callback, pThis)',
					'arr.unique()',
					'arr.union(arr2)',
					'arr.intersect(arr2)'/*,
					'arr.minus(arr2)',//不推荐
					'arr.complement(arr2)'//不推荐
					*/
				]
			},
			DateH:{
				_methods:[
					'd.format(pattern)'
				]
			},
			FunctionH:{
				_methods:[
					'Function.bind(func, thisObj)',
					'Function.methodize(func, attr)',
					'Function.mul(func, opt)',
					'Function.rwrap(func, wrapper, idx)',
					'Function.createInstance(class)',
					'Function.extend(class, p)'
				]
			},
			ObjectH:{
				_methods:[
					'Object.isArray(obj)',
					'Object.isArrayLike(obj)',
					'Object.isElement(obj)',
					'Object.isFunction(obj)',
					'Object.isObject(obj)',
					'Object.isPlainObject(obj)',
					'Object.isString(obj)',
					'Object.isWrap(obj, coreName)',
					'Object.dump(obj, props)',
					'Object.encodeURIJson(json)',
					'Object.get(obj, prop, nullSensitive)',
					'Object.keys(obj)',
					'Object.map(obj, fn, thisObj)',
					'Object.mix(des, src, override)',
					'Object.set(obj, prop, value)',
					'Object.stringify(obj)',
					'Object.values()'
				]
			},
			StringH:{
				_methods:[
					's.byteLen()',
					's.camelize()',
					's.contains(subStr)',
					's.dbc2sbc()',
					's.decamelize()',
					's.decode4Html()',
					's.encode4Html()',
					's.encode4HtmlValue()',
					's.encode4Http()',
					's.encode4Js()',
					's.evalExp(opts)',
					's.evalJs(opts)',
					's.format(arg0)',
					's.mulReplace(arr)',
					's.queryUrl(key)',
					's.stripTags()',
					's.subByte(len, tail)',
					's.tmpl(opts)',
					's.trim()'
				]
			},
			JSON:{
				_methods:[
					'JSON.parse(text)',
					'JSON.stringify(value)'
				]
			},
			CustEvent : {
				_base : [
					//'new CustEvent(target, type, eventArgs)'
				],
				_static :['CustEvent.createEvents(target, types)'],
				_prot :[
					'ce.target',
					'ce.currentTarget',
					'ce.type',
					'ce.returnValue'
				],
				_methods :[
					'ce.preventDefault()'
				],
				custeventtarget:[
					'cetarget.on(sEvent, fn)',
					'cetarget.un(sEvent, fn)',
					'cetarget.fire(sEvent, eventArgs)',
					'cetarget.createEvents(types)'
				]
			},
			Ajax : {
				_static :[
					'Ajax.get(url, data, callback)',
					'Ajax.post(url, data, callback)'
					//'Ajax.request(url, data, callback, method)'
				]
			}
		}


	};

	QWDoc.data=data;
	QWDoc.writeLinks=function(folder,linksData){
		var s=[],
			parentTag=parentTag||'li';
		for (var i=0;i<linksData.length;i++){
			var fileName=linksData[i]
				.split(/[\)]/)[0]
				.replace(/^W\./,'W_static.')//有时静态方法与原型方法重名
				.replace(/[\s]/g,'')
				.replace(/[^\.\w\(]/g,'_');
			if(fileName.indexOf('(')>-1) {
				fileName=fileName.replace(/\(/g,'_.htm#');
			}
			else{
				fileName+='.htm';
			}
			s.push('<li><a href="'
				+folder
				+fileName
				+'">'+linksData[i]+'</a></li>'
			);
		}
		document.write(s.join('\n'));
	};
	window.QWDoc=QWDoc;
})();