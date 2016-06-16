/*
 * @fileoverview Anim
 * @author:Jerry Qu、JK、Akira_cn
 */

(function() {
	var NodeH = QW.NodeH,
		mix = QW.ObjectH.mix,
		isObject = QW.ObjectH.isObject,
		mixMentor = mix, //顾问模式
		g = NodeH.g,
		getCurrentStyle = NodeH.getCurrentStyle,
		setStyle = NodeH.setStyle,
		isElement = QW.DomU.isElement,
		forEach = QW.ArrayH.forEach,
		map = QW.ArrayH.map,
		Anim = QW.Anim,
		show = NodeH.show,
		hide = NodeH.hide,
		isVisible = NodeH.isVisible;

	var ElAnimAgent = function(el, opts, attr) {
		this.el = el;
		this.attr = attr;

		if(!isObject(opts)) {
			opts = { to : opts };
		}

		mix(this, opts);
	};

	mix(ElAnimAgent.prototype, {
		getValue : function(){
			return getCurrentStyle(this.el, this.attr);
		},
		setValue : function(value){
			if(this.unit) {
				setStyle(this.el, this.attr, value + this.unit);
			} else {
				setStyle(this.el, this.attr, value);
			}
		},
		getUnit : function() {
			if(this.unit) return this.unit;
			
			var value = this.getValue();

			if(value) {
				var unit = value.toString().replace(/^[+-]?[\d\.]+/g, '');
				if(unit && unit != value) {
					return unit;
				}
			}

			return '';
		},
		init : function() {
			var from, to, by;
			if(null != this.from){
				from = parseFloat(this.from);			
			}else{
				from = parseFloat(this.getValue()) || 0;
			}

			to = parseFloat(this.to);
			by = this.by != null ? parseFloat(this.by) : (to - from);	

			this.from = from;
			this.by = by;
			this.unit = this.getUnit();
		},
		action : function(per){
			var value;
			if (typeof this.end != "undefined" && per >= 1) {
				value = this.end;
			} else {
				value = this.from + this.by * this.easing(per);
				value = parseFloat(value.toFixed(6));
			}
			
			this.setValue(value);
		}
	});

	var ScrollAnimAgent = function(el, opts, attr) {
		var agent = new ElAnimAgent(el, opts, attr);
		mixMentor(this, agent);
	};
	ScrollAnimAgent.MENTOR_CLASS = ElAnimAgent;

	mix(ScrollAnimAgent.prototype, {
		getValue : function() {
			return this.el[this.attr] | 0;
		},
		setValue : function(value) {
			this.el[this.attr] = Math.round(value);
		}
	}, true);

	var ColorAnimAgent = function(el, opts, attr) {
		var agent = new ElAnimAgent(el, opts, attr);
		mixMentor(this, agent);
	};
	ColorAnimAgent.MENTOR_CLASS = ElAnimAgent;

	mix(ColorAnimAgent.prototype, {
		parseColor : function(s){
			var patterns = {
				rgb         : /^rgb\(([0-9]+)\s*,\s*([0-9]+)\s*,\s*([0-9]+)\)$/i,
				hex         : /^#?([0-9A-F]{2})([0-9A-F]{2})([0-9A-F]{2})$/i,
				hex3        : /^#?([0-9A-F]{1})([0-9A-F]{1})([0-9A-F]{1})$/i
			};

			if (s.length == 3) { return s; }
			
			var c = patterns.hex.exec(s);
			
			if (c && c.length == 4) {
				return [ parseInt(c[1], 16), parseInt(c[2], 16), parseInt(c[3], 16) ];
			}
		
			c = patterns.rgb.exec(s);
			if (c && c.length == 4) {
				return [ parseInt(c[1], 10), parseInt(c[2], 10), parseInt(c[3], 10) ];
			}
		
			c = patterns.hex3.exec(s);
			if (c && c.length == 4) {
				return [ parseInt(c[1] + c[1], 16), parseInt(c[2] + c[2], 16), parseInt(c[3] + c[3], 16) ];
			}
			
			return [0, 0, 0];
		},
		init : function(){
			var from, to, by;
			var parseColor = this.parseColor;

			if(null != this.from){
				from = this.from;			
			}else{
				from = this.getValue();
			}

			from = parseColor(from);

			to = this.to || [0,0,0];
			to = parseColor(to);

			by = this.by ? parseColor(this.by) : 
				map(to, function(d,i){
					return d - from[i];
				});

			this.from = from;
			this.to = to;
			this.by = by;
			this.unit = '';
		},
		getValue : function() {
			var color = getCurrentStyle(this.el, this.attr);
			return this.parseColor(color);
		},
		setValue : function(value) {
			if(typeof value == "string") {
				setStyle(this.el, this.attr, value);
			} else {
				setStyle(this.el, this.attr, "rgb("+value.join(",")+")");
			}
		},
		action : function(per){
			var me = this, value;
			if (typeof this.end != "undefined" && per >= 1) {
				value = this.end;
			} else {
				value = this.from.map(function(s, i){
					return Math.max(Math.floor(s + me.by[i] * me.easing(per)),0);
				});
			}
			this.setValue(value);
		}
	}, true);

	var _agentPattern = { 
		"color$" : ColorAnimAgent, 
		"^scroll" : ScrollAnimAgent,
		".*" : ElAnimAgent
	};

	function _patternFilter(patternTable, key){
		for(var i in patternTable){
			var pattern = new RegExp(i, "i");
			if(pattern.test(key)){
				return patternTable[i];
			}
		}	
		return null;
	};

	var ElAnim = function(el, attrs, dur, easing) {
		el = g(el);
		if(!isElement(el)) {
			throw new Error(['Animation','Initialize Error','Element Not Found!']);
		}
		dur = dur || ElAnim.DefaultEasing;
		easing = typeof easing === 'function' ? easing : ElAnim.DefaultEasing;

		var agents = [], callbacks = [];
		for(var attr in attrs){
			//如果有agent属性预处理器
			if(typeof attrs[attr] == "string" && ElAnim.agentHooks[attrs[attr]]){
				var _attr = ElAnim.agentHooks[attrs[attr]](attr, el);
				if(_attr.callback){
					callbacks.push(_attr.callback);
					delete _attr.callback;
				}
				attrs[attr] = _attr;
			}

			var Agent = _patternFilter(_agentPattern, attr),
				agent = new Agent(el, attrs[attr], attr);
			
			if(!agent) continue;
			agent.init();
			agent.easing = agent.easing || easing;
			agents.push(agent);
		}

		var anim = new Anim(function(per) {
			forEach(agents, function(agent) {
				agent.action(per);
			});
		}, dur);

		forEach(callbacks, function(callback) {
			anim.on("end", callback);
		});

		mixMentor(this, anim); 
	};

	ElAnim.MENTOR_CLASS = Anim;
	ElAnim.DefaultEasing = function(p) { return p;};
	ElAnim.DefaultDur = 500;
	ElAnim.Sequence = false; //异步阻塞顺序动画，需要Async组件支持
	
	/**
	 * 用来预处理agent属性的hooker
	 */
	ElAnim.agentHooks = (function() {
		return {
			//如果是show动画，那么show之后属性从0变到当前值
			show: function(attr, el){
				var from = 0, 
					to = el['__anim' + attr];

				//如果元素不可见，显示出来，获取真实属性值，再设置为0。
				if(!isVisible(el)) {
					show(el);
					to = (typeof to == 'undefined') ? getCurrentStyle(el, attr) : to;
					setStyle(el, attr, 0);
				} else {
					from = getCurrentStyle(el, attr);
					to = (typeof to == 'undefined') ? getCurrentStyle(el, attr) : to;
				}


				return {from: from, to: to};
			},
			//如果是hide动画，那么属性从当前值变到0之后，还原成当前值并将元素hide
			hide: function(attr, el){
				
				var from = getCurrentStyle(el, attr),
					oriAttr = '__anim' + attr,
					oriValue = el[oriAttr];

				//hide前把原始属性值存起来
				if(typeof oriValue == 'undefined') {
					if(!isVisible(el)) {
						show(el);
						oriValue = getCurrentStyle(el, attr);
						hide(el);
					} else {
						oriValue = from;
					}

					el[oriAttr] = oriValue;
				}

				var callback = function(){
					hide(el);
					setStyle(el, attr, el[oriAttr]);
				};

				return {from: from, to: 0, callback: callback};
			},
			//如果是toggle动画，那么根据el是否可见判断执行show还是hide
			toggle: function(attr, el){
				if(!isVisible(el)){
					return ElAnim.agentHooks.show.apply(this, arguments);
				}else{
					return ElAnim.agentHooks.hide.apply(this, arguments);
				}	
			}
		};
	})();

	QW.provide({
		ElAnim: ElAnim,
		ScrollAnim: ElAnim,
		ColorAnim: ElAnim
	});
}());