var SmokingTest = (function() {
	var SmokingTest = {};
	var TestU = (function() {
		var TestU = {};
		TestU.analyseStr = function(sKeys) {
/*
	把一个字符串当作js来运行，并解析其结果：
	@param {String} sKeys 变量名 
	@param {boolean} asObj 如果为true，则将sKeys当作一个变量来处理 
	@returns {Json} 返回分析结果，分析结果包括：
		{String} sKeys 即sKeys
		{String} sNameSpace sKeys的左边部分
		{String} lastKey sKeys的最后一个key 
		{Object} value 返回其值
		{boolean} hasChildren 是否有children
		{String} type 数据类型，包括：null/undefined/number/string/boolean/object/function，另外多一个error
		{String} sConstructor 构造函数：null/undefined/number/string/boolean
				/Object/Array/String/Number...
				/Element/Event
		{String} summary 主要信息 
				对于Array，返回前三个对象的sConstructor,以及总长度
				对于Object，返回前三个对象的key,sConstructor,以及总长度
				对于Element，返回tagName#id.className,
				对于其它，返回toString的前50个字符(里面没有回车)
	*/
			try {
				var sNameSpace = "",
					lastKey = "";
				/(([.\[])?[^.\[]+[\]]*$)/.test(sKeys);
				lastKey = RegExp.$1;
				sNameSpace = sKeys.substr(0, sKeys.length - lastKey.length);
				lastKey = lastKey.replace(/^['".\[]+|['"\]]+$/g, "");
				var value = (new Function("return " + sKeys))();
				var info = TestU.analyse(value);
				info.sKeys = sKeys;
				info.sNameSpace = sNameSpace;
				info.lastKey = lastKey;
				return info;
			} catch (ex) {
				return {
					sKeys: sKeys,
					sNameSpace: sNameSpace,
					lastKey: lastKey,
					value: "AnalyseError " + ex,
					hasChildren: false,
					type: "error",
					sConstructor: "AnalyseError",
					summary: ("AnalyseError " + ex).substr(0, 50)
				};
			}
		};

		TestU.analyse = function(value) {
/*
	解析一个变量
	@param {String} value 变量名 
	@returns {Json} 返回分析结果，分析结果包括：
		{Object} value 返回其值
		{boolean} hasChildren 是否有children
		{String} type 数据类型，包括：null/undefined/number/string/boolean/object/function，另外多一个error
		{String} sConstructor 构造函数：null/undefined/number/string/boolean
				/Object/Array/String/Number...
				/Element/Event
		{String} summary 主要信息 
				对于Array，返回前三个对象的sConstructor,以及总长度
				对于Object，返回前三个对象的key,sConstructor,以及总长度
				对于Element，返回tagName#id.className,
				对于其它，返回toString的前50个字符(里面没有回车)
	*/
			try {
				var hasChildren = false,
					type,
					sConstructor = "缩主内部对象",
					summary;
				if (value === null) type = "null"; //ECMS里，typeof null返回object。
				else type = typeof value;
				switch (type) {
				case "null":
				case "undefined":
				case "number":
				case "string":
				case "boolean":
					sConstructor = type;
					summary = (value + "").substr(0, 50).replace(/\s+/g, " ");
					break;
				case "function":
				case "object":
					//得到sConstructor
					var constructor = value.constructor;
					var nodeType = value.nodeType + "";
					if (!constructor) { //例如，window.external，它没有counstructor属性
						if (!sConstructor) sConstructor = 'Unknown Constructor';
					} else {
						sConstructor = trim((constructor + "").split("(")[0].replace("function", ""));
					}

					//得到summary
					if (nodeType == "1") { //HTML Element
						summary = value.tagName + (value.id ? "#" + value.id : "") + (value.className ? "." + value.className : "");
					} else if (trim("" + value.item).substr(0, 8) == "function" && value.length !== undefined) { //typeof(document.all.item)在IE下的结果为object，而不是function  //Collection
						summary = "[]" + (value.length || 0);
						sConstructor = "Collection";
					} else if (sConstructor == "Array") { //Array
						summary = "[]" + value.length;
					} else if (constructor == Object) { //Json对象
						var count = 0;
						for (var i in value) count++;
						summary = "{}" + count;
					} else if (type == "function") { //函数
						var reg = /\/\*\*[\s\*]*([^\n]*)/g;
						if (reg.test(value + "")) summary = RegExp.$1;
						else summary = trim((value + "").split("{")[0]);
					} else {
						summary = (value + "").substr(0, 50).replace(/\s+/g, " ");
					}
					break;
				}
				if ("object".indexOf(type) > -1) {
					for (var i in value) {
						hasChildren = true;
						break;
					}
				}
				if ("function" == type) {
					var pro = value.prototype;
					for (var i in pro) {
						if (pro.hasOwnProperty(i)) {
							hasChildren = true;
							break;
						}
					}
					for (var i in value) {
						if (i != "prototype") {
							hasChildren = true;
							break;
						}
					}
				}
				return {
					value: value,
					hasChildren: hasChildren,
					type: type,
					sConstructor: sConstructor,
					summary: summary
				};
			} catch (ex) {
				return {
					value: "AnalyseError " + ex,
					hasChildren: false,
					type: "error",
					sConstructor: "AnalyseError",
					summary: ("AnalyseError " + ex).substr(0, 50)
				};

			}
		};

		TestU.stringify = function(val) {
/*
	* 返回对val的描述。
	* @param {any} val 分析对象 
	* @returns {string} 返回分析结果
	*/
			var info = TestU.analyse(val);
			switch (info.type) {
			case "null":
			case "undefined":
			case "number":
			case "boolean":
				return val + "";
			case "string":
				return encode4Html('"' + val + '"');
			}
			var s = [];
			s.push('<div class="ST_M_sumary">' + (info.sConstructor || info.type) + ': ' + encode4Html(info.summary) + '</div>');
			s.push('<div class="ST_M_value">' + encode4Html(info.value) + '</div>');
			if (info.hasChildren) {
				s.push('<div class="ST_M_list"><ul>');
				var value = info.value;
				var num = 0;
				for (var i in value) {
					if (num++ > 300) {
						s.push('<li class="ST_M_more">...</li>');
						break;
					}
					try {
						var infoI = TestU.analyse(value[i]); //有时value[i]会抛错，例如firefox下的window.sessionStorage，所以要try一下。
						s.push('<li class="ST_M_subnode-ctn ST_M_subt-' + infoI.type + '"><a href="#" class="ST_M_lastkey">' + i + '</a><span class="ST_M_sConstructor">' + (infoI.sConsturctor || infoI.type) + '</span><span class="ST_M_summary">' + encode4Html(infoI.summary) + '</span></li>');
					} catch (ex) {
						s.push('<li class="ST_M_subnode-ctn ST_M_subt-exception"><a href="#" class="ST_M_lastkey">' + i + '</a><span class="ST_M_sConstructor">无法解析</span><span class="ST_M_summary">' + encode4Html(ex + '') + '</span></li>');
					}
				}
				s.push('</ul></div>');
			}
			return s.join("");
		};
		return TestU;
	}());
	var analyseStr = TestU.analyseStr,
		analyse = TestU.analyse,
		stringify = TestU.stringify;

	var varEl, jscodeEl, msgEl, tree, inited = false; //分别是：当前变量元素／js代码框／MSG框／观测树，


	SmokingTest.init = function(ctn, varsArr, codeStr) {
		/**
		 * 初始化
		 * @namespace SmokingTest
		 * @method init 初始化SmokingTest
		 * @param {Element} ctn 将SmokingTest模块的外部容器
		 * @param {Array} 需要观察的对象
		 */
		if (!inited) {
			//生成HTML结构
			var html = ['<table class="ST_outer_tbl"%><tr><td id="ST_tree-ctn-outer"><div></div></td><td>', '<ul><li>', '当前察看的对象:<input id="ST_var" ><button>察看</button><button>加入观测树</button><br/>', '<div id="ST_msg"></div>', '</li><li>', '运行代码:<button>运行以下textarea里的代码</button><br/>', '<textarea id="ST_jscode" wrap=off></textarea>', '</li></ul>', '</td></tr></table>'].join('');
			ctn.innerHTML = html;

			//为几个元素添加事件
			varEl = g("ST_var");
			jscodeEl = g("ST_jscode");
			msgEl = g("ST_msg");
			var btns = ctn.getElementsByTagName("button");
			btns[0].onclick = function() {
				var s = trim(varEl.value);
				s && SmokingTest.dump(s);
			};
			btns[1].onclick = function() {
				var s = trim(varEl.value);
				s && SmokingTest.addTreeItem(s);
			};
			btns[2].onclick = function() {
				var s = trim(jscodeEl.value);
				s && new Function(s)();
			};

			//生成tree
			tree = new Tree({
				treeCtn: ctn.getElementsByTagName("div")[0]
			});
			inited = true;
		}
		varsArr = varsArr || [];
		for (var i = 0; i < varsArr.length; i++) {
			this.addTreeItem(varsArr[i]);
		}
		jscodeEl.value = codeStr || 'SmokingTest.dump([0,1,2,3])';
	};

	SmokingTest.dump = function(o) {
		/**
		 * print某个对象
		 * @namespace SmokingTest
		 * @method dump 
		 * @param {Object} o 待解析对象
		 */
		if (typeof o == "string") {
			var info = analyseStr(o);
			varEl.defaultValue = varEl.value = o;
		} else {
			info = analyse(o);
			varEl.value = "";
		}

		msgEl.innerHTML = stringify(info.value);
	};

	SmokingTest.addTreeItem = function(sKeys) {
		/**
		 * 将某个变量加到观测树里
		 * @namespace SmokingTest
		 * @method addTreeItem 
		 * @param {String} sKeys 变量名
		 */
		tree.addItem(sKeys);
	};

	//一些内部函数

	function trim(s) {
		return s.replace(/^[\s\xa0\u3000]+|[\u3000\xa0\s]+$/g, "");
	}

	function encode4Html(s) {
		s = s + '';
		var rplsors = [
			[/&/g, "&amp;"],
			[/ /g, "&nbsp;"],
			[/\t/g, "&nbsp;&nbsp;&nbsp;&nbsp;"],
			[/</g, "&lt;"],
			[/>/g, "&rt;"],
			[/"/g, "&quot;"],
			[/'/g, "&#039;"],
			[/\n/g, "<br/>"]
		];
		for (var i = 0, rplsor; rplsor = rplsors[i++];) {
			s = s.replace(rplsor[0], rplsor[1]);
		}
		return s;
	}

	function g(id) {
		return document.getElementById(id);
	}

	function target(e) {
		e = e || window.event;
		return e.target || e.srcElement;
	}

	function ancestorNode(el, tagName) {
		while (el && (el = el.parentNode)) {
			if (el.tagName == tagName) return el;
		}
		return null;
	}

	function hasClass(el, cn) {
		return new RegExp("(?:^|\\s)" + cn + "(?:\\s|$)", 'i').test(el.className);
	}

	function addClass(el, cn) {
		if (!hasClass(el, cn)) {
			el.className = trim(el.className + ' ' + cn);
		}
	}

	function removeClass(el, cn) {
		if (hasClass(el, cn)) {
			el.className = trim(el.className.replace(new RegExp("(?:\\s|^)" + cn + "(?:\\s|$)", 'i'), ' '));
		}
	}

	function replaceClass(el, cn1, cn2) {
		removeClass(el, cn1);
		addClass(el, cn2);
	}




	//树代码

	function Tree(opts) {
		for (var i in opts) this[i] = opts[i];
		this.render();
	}

	Tree.prototype = {
		renderItem: function(info, onRoot) {
			var el = document.createElement("li");
			var s = '<div class="ST_node-ctn"><span class="ST_node-ctn-inner ST_t-' + info.type + '"><a href="#" class="ST_lastkey">' + (onRoot ? info.sKeys : info.lastKey) + '</a><span class="ST_sConstructor">' + info.sConstructor + '</span><span class="ST_summary">' + encode4Html(info.summary) + '</span></span></div>';
			if (info.hasChildren) {
				el.className = 'folder-closed ST-f-' + info.type;
				el.innerHTML = '<span class="ST_img-closed">&nbsp;</span>' + s + '<ul></ul>';
			} else {
				el.innerHTML = s;
			}
			el.setAttribute("ST_sKeys", info.sKeys);
			return el;

		},
		addItem: function(sKeys, pEl) {
			var info = analyseStr(sKeys);
			pEl = pEl || this.treeWrap;
			var el = this.renderItem(info, pEl == this.treeWrap);
			pEl.appendChild(el);
		},
		/**
		 * openFolder(el): 展开一个folder
		 * @param {Element} el: 
		 * @returns {void}
		 */
		openFolder: function(el) {
			var sKeys = el.getAttribute("ST_sKeys");
			var info = analyseStr(sKeys);
			var newEl = this.renderItem(info);
			el.parentNode.insertBefore(newEl, el);
			el.parentNode.removeChild(el);
			el = newEl;
			replaceClass(el, "ST_folder-closed", "ST_folder-open");
			if (info.hasChildren) {
				var itemsCtn = el.childNodes[2];
				itemsCtn.style.display = "";
				var value = info.value;
				if ("Collection,Array".indexOf(info.sConstructor) > -1) { //数组或Collection，不需对属性排序
					var num = 0;
					for (var i in value) {
						if (num++ > 100) break;
						this.addItem(info.sKeys + '["' + i + '"]', itemsCtn);
					}
				} else { //Json或其它对象，对属性排下序，方便查找
					var subKeys = [];
					if (typeof value == "function") { //FF下,prototype会被for in出来，而ie下不会.
						var pro = value.prototype;
						for (var i in pro) {
							subKeys.push("prototype");
							break;
						}
					}
					for (var i in value) {
						if (i == "prototype" && typeof value == "function") continue;
						subKeys.push(i);
					}
					subKeys.sort();
					for (var i = 0; i < 300 && i < subKeys.length; i++) {
						this.addItem(info.sKeys + '["' + subKeys[i] + '"]', itemsCtn);
					}
				}
				replaceClass(el.firstChild, "ST_img-closed", "ST_img-open");
			}
		},
		/**
		 * closeFolder(el): 关闭一个folder
		 * @param {Element} el: 
		 * @returns {void}
		 */
		closeFolder: function(el) {
			replaceClass(el, "ST_folder-open", "ST_folder-closed");
			replaceClass(el.firstChild, "ST_img-open", "ST_img-closed");
			el.childNodes[2].innerHTML = "";
			el.childNodes[2].style.display = "none";
		},
		//鼠标移进
		//对tree进行初始化
		render: function() {
			var me = this;
			me.treeCtn.innerHTML = '<ul id="ST_tree-wrap"></ul>';
			var treeWrap = me.treeWrap = this.treeCtn.firstChild;
			treeWrap.onclick = function(e) {
				var el = target(e);

				//开启关闭folder
				if (hasClass(el, "ST_img-closed")) tree.openFolder(el.parentNode);
				else if (hasClass(el, "ST_img-open")) tree.closeFolder(el.parentNode);

				//ST.showJson该行对应的变量
				if (el.tagName == "A") {
					var liEl = ancestorNode(el, "LI");
					var sKeys;
					if (liEl && (sKeys = liEl.getAttribute("ST_sKeys"))) {
						SmokingTest.dump(sKeys);
						return false;
					}
				}

				//删除该行
				if (hasClass(el, "ST_sConstructor")) {
					liEl = ancestorNode(el, "LI");
					if (liEl && confirm("删除本行吗？")) {
						liEl.parentNode.removeChild(liEl);
					}
				}
			};

			msgEl.onclick = msgEl.oncontextmenu = function(e) {
				var el = target(e);
				//ST.showJson该行对应的变量
				if (el.tagName == "A") {
					SmokingTest.dump(varEl.defaultValue + '.' + el.innerHTML);
					return false;
				}
			};

		}
	};

	return SmokingTest;
}());