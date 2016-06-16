
(function() {
	var DomU = QW.DomU,
		NodeH = QW.NodeH;
	DomU.ready(function() {
		window.testDiv = document.body.appendChild(DomU.create('<div id="div_4_NodeH_test" class="div_4_test" style="background-color:gray;z-index:100;width:200px;position:absolute;">div_4_NodeH_test</div>'));
	});

	describe('NodeH', {
		'NodeH Members': function() {
			value_of(NodeH).log('members');
		},
		'g': function() {
			value_of(NodeH.g('div_4_NodeH_test') == testDiv).should_be(true);
			value_of(NodeH.g(testDiv).id).should_be('div_4_NodeH_test');
			value_of(NodeH.g('div_4_NodeH_test_xxx')).should_be(null);
			value_of(NodeH.g(new QW.NodeW(testDiv)).id).should_be('div_4_NodeH_test');
		},
		'query': function() {
			value_of(NodeH.query(0, 'body').length).should_be(1);
			value_of(NodeH.query(document.body, 'body').length).should_be(0);
			value_of(NodeH.query(0, '#div_4_NodeH_test')[0] == testDiv).should_be(true);
		},
		'getElementsByClass/hasClass/addClass/removeClass/replaceClass': function() {
			var el = NodeH.getElementsByClass(0, 'div_4_test')[0];
			value_of(el == testDiv).should_be(true);
			value_of(NodeH.hasClass(el, 'div_4_test_new')).should_be(false);
			NodeH.addClass(el, 'div_4_test_new');
			value_of(NodeH.hasClass(el, 'div_4_test_new')).should_be(true);
			NodeH.removeClass(el, 'div_4_test_new');
			value_of(NodeH.hasClass(el, 'div_4_test_new')).should_be(false);
			NodeH.addClass(el, 'div_4_test_new');
			NodeH.replaceClass(el, 'div_4_test_new', 'div_4_test_new2');
			value_of(NodeH.hasClass(el, 'div_4_test_new')).should_be(false);
			value_of(NodeH.hasClass(el, 'div_4_test_new2')).should_be(true);
		},
		'nextSibling/previousSibling/ancestorNode/firstChild': function() {
			var el = DomU.create('<div><span>1</span>2<strong id="strong_4_test">3</strong><input value=4 /></div>');
			document.body.appendChild(el);
			var subStrongEl = NodeH.g('strong_4_test');
			value_of(NodeH.nextSibling(subStrongEl, "div")).should_be(null);
			value_of(NodeH.nextSibling(subStrongEl, "input").value).should_be('4');
			value_of(NodeH.previousSibling(subStrongEl).nodeType).should_be(3);
			value_of(NodeH.previousSibling(subStrongEl, "span").tagName).should_be('SPAN');
			value_of(NodeH.ancestorNode(subStrongEl, "body").tagName).should_be('BODY');
			value_of(NodeH.ancestorNode(subStrongEl, "ul")).should_be(null);
			value_of(NodeH.firstChild(el).tagName).should_be('SPAN');
			value_of(NodeH.firstChild(el, 'strong') == subStrongEl).should_be(true);
			document.body.removeChild(el);
		},
		'contains': function() {
			var el = DomU.create('<div><span>1</span>2<strong id="strong_4_test">3</strong><input value=4 /></div>');
			document.body.appendChild(el);
			var subStrongEl = NodeH.g('strong_4_test');
			value_of(NodeH.contains(el, subStrongEl)).should_be(true);
			value_of(NodeH.contains(el, el)).should_be(false);
			value_of(NodeH.contains(el, document.body)).should_be(false);
			document.body.removeChild(el);
		},
		'appendChild/removeChild/removeNode/cloneNode/setAttr/getAttr/empty': function() {
			var el = DomU.create('<div id="strong_3_test"><span>1</span>2<strong id="strong_4_test">3</strong><input value=4 /><div></div></div>');
			document.body.appendChild(el);
			NodeH.setAttr(el, 'enName', 'Tom');
			value_of(NodeH.getAttr(el, 'enName')).should_be('Tom');
			NodeH.removeChild(el, el.firstChild);
			NodeH.removeChild(el, el.firstChild);
			value_of(el.firstChild.tagName).should_be('STRONG');
			var subStrongEl1 = NodeH.g('strong_3_test');
			NodeH.empty(subStrongEl1);
			value_of(subStrongEl1.firstChild).should_be(null);
			NodeH.removeNode(el, true);
			var subStrongEl = NodeH.g('strong_4_test');
			value_of(subStrongEl).should_be(null);
		},
		'show/hide': function() {
			NodeH.hide(testDiv);
			value_of(testDiv.offsetWidth).should_be(0);
			NodeH.show(testDiv);
			value_of(testDiv.offsetWidth).should('>', 10);
		},
		'getStyle/setStyle/removeStyle/getCurrentStyle': function() {
			var el = DomU.create('<div style="color:red"><strong id="strong_4_test" style="font-size:15px;">3</strong></div>');
			document.body.appendChild(el);
			var strongEl = el.firstChild;
			NodeH.setStyle(strongEl, 'fontSize', '12px');
			value_of(NodeH.getStyle(strongEl, 'fontSize')).should_be('12px');
			value_of(!!NodeH.getStyle(strongEl, 'color')).should_be(false);
			value_of(NodeH.getCurrentStyle(strongEl, 'color')).should_not_be(null);
			NodeH.removeStyle(strongEl, 'fontSize');
			
			value_of(NodeH.getStyle(strongEl, 'fontSize')).should_not_be('15px');

			NodeH.setStyle(strongEl, 'opacity', .55);
			value_of(NodeH.getStyle(strongEl, 'opacity')).should_be("0.55");

			NodeH.setStyle(el, 'width', 200);
			value_of(NodeH.getCurrentStyle(el, 'width')).should_be('200px');

			NodeH.setStyle(el, 'width', '50%');
			value_of(NodeH.getStyle(el, 'width')).should_be('50%');
			value_of(NodeH.getCurrentStyle(el, 'width')).log('currentStyle width:');
			value_of(NodeH.getCurrentStyle(el, 'width')).should_not_be('50%');

			document.body.removeChild(el);
		},
		'insertAdjacentHTML/insertAdjacentElement': function() {
			var html = '<div id="jktest">aaa</div>';
			NodeH.insertAdjacentHTML(document.body, 'afterBegin', html);
			var el = document.body.firstChild;
			value_of(el.id).should_be('jktest');
			document.body.removeChild(el);
		},
		'insert/insertTo': function() {
			var html = '<div id="jktest">aaa</div>';
			NodeH.insert(document.body, 'afterBegin', html);
			var el = document.body.firstChild;
			value_of(el.id).should_be('jktest');
			document.body.removeChild(el);
			NodeH.insertTo(html, 'afterBegin', document.body);
			el = document.body.firstChild;
			value_of(el.id).should_be('jktest');
			document.body.removeChild(el);
		},
		'getValue/setValue/getHtml/setHtml': function() {
			var el = DomU.create('<input>');

			value_of(NodeH.getValue(el)).should_be('');
			NodeH.setValue(el, 'a');
			value_of(NodeH.getValue(el)).should_be('a');

			el = DomU.create('<div></div>');

			value_of(NodeH.getHtml(el)).should_be('');
			NodeH.setHtml(el, 'a');
			value_of(NodeH.getHtml(el)).should_be('a');
			
			el = DomU.create('<select></select>');
			document.body.appendChild(el);
			value_of(NodeH.getHtml(el)).should_be('');
			NodeH.setHtml(el, '<option id="option_test_setHtml">1</option>');
			value_of(NodeH.g('option_test_setHtml').nodeName.toLowerCase()).should_be('option');
			document.body.removeChild(el);
			
			el = DomU.create('<table></table>');
			document.body.appendChild(el);
			NodeH.setHtml(el, '<tbody><tr><td id="table_test_setHtml">123</td><tr></tbody>');
			value_of(NodeH.g('table_test_setHtml').innerHTML).should_be("123");
			document.body.removeChild(el);
		},
		'toggleClass/toggle/isVisible': function() {
			var el = DomU.create('<div></div>');

			value_of(el.className).should_be('');
			NodeH.toggleClass(el, 'a', 'b');
			value_of(el.className).should_be('a');
			NodeH.toggleClass(el, 'a', 'b');
			value_of(el.className).should_be('b');
			NodeH.toggleClass(el, 'a', 'b');
			value_of(el.className).should_be('a');

			document.body.appendChild(el);

			value_of(NodeH.isVisible(el)).should_be(true);
			NodeH.toggle(el);
			value_of(NodeH.isVisible(el)).should_be(false);
			NodeH.toggle(el);
			value_of(NodeH.isVisible(el)).should_be(true);

			document.body.removeChild(el);
		},
		'borderWidth/marginWidth/paddingWidth': function() {
			var el = DomU.create('<div style="margin:10px;padding:10px;border:10px #000 solid">1</div>');

			document.body.appendChild(el);
			value_of(NodeH.borderWidth(el).toString()).should_be('10,10,10,10');
			value_of(NodeH.marginWidth(el).toString()).should_be('10,10,10,10');
			value_of(NodeH.paddingWidth(el).toString()).should_be('10,10,10,10');
			document.body.removeChild(el);
		},
		'setSize/setInnerSize': function() {
			var el = DomU.create('<div id="test" style="font-size:0px;line-height:0px;border:5px #000 solid;padding:5px;"></div>');
			document.body.appendChild(el);

			value_of(el.offsetHeight).should_be(20);

			NodeH.setSize(el, 30, 30);
			value_of(el.offsetHeight).should_be(30);

			NodeH.setInnerSize(el, '30px', '30px');
			value_of(el.offsetHeight).should_be(50);
			document.body.removeChild(el);
		},
		'getRect getXY setXY setInnerRect setRect': function() {
			var el = DomU.create('<div id="test" style="left:10px;top:10px;position:absolute;font-size:0px;line-height:0px;border:5px #000 solid;padding:5px;"></div>');
			document.body.appendChild(el);

			value_of(NodeH.getXY(el).toString()).should_be('10,10');

			NodeH.setXY(el, 11, 11);
			value_of(NodeH.getXY(el).toString()).should_be('11,11');

			NodeH.setRect(el, 12, 12, 30, 30);
			var temp = NodeH.getRect(el);
			value_of([temp.top, temp.right, temp.bottom, temp.left, temp.width, temp.height].toString()).should_be('12,42,42,12,30,30');

			NodeH.setInnerRect(el, 13, 13, '30px', '30px');
			temp = NodeH.getRect(el);
			value_of([temp.top, temp.right, temp.bottom, temp.left, temp.width, temp.height].toString()).should_be('13,63,63,13,50,50');

			document.body.removeChild(el);
		}

	});


}());