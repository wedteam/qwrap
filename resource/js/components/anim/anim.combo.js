
/*import from qwrap/resource/js/components/anim/../../components/anim/anim_base.js,(by build.py)*/

/*
	Copyright QWrap
	version: $version$ $release$ released
	author: JK
*/

(function() {
	var CustEvent = QW.CustEvent,
		mix = QW.ObjectH.mix;

	/**
	 * @class Anim 动画
	 * @namespace QW
	 * @constructor
	 * @param {function} animFun - 管理动画效果的闭包
	 * @param {int} dur - 动画效果持续的时间 
	 * @param {json} opts - 其它参数， 
		---目前只支持以下参数：
		{boolean} byStep (Optional) 是否按帧动画（即"不跳帧"）。如果为true，表示每一帧都走到，帧数为dur/frameTime
		{boolean} frameTime (Optional) 帧间隔时间。默认为28
		{boolean} per (Optional) 初始播放进度
		{function} onbeforeplay (Optional) onbeforeplay事件
		{function} onplay (Optional) onplay事件
		{function} onstep (Optional) onstep事件
		{function} onpause (Optional) onpause事件
		{function} onresume (Optional) onresume事件
		{function} onend (Optional) onend事件
		{function} onreset (Optional) onreset事件
	 * @returns {Anim} anim - 动画对象
	 */
	var Anim = function(animFun, dur, opts) {
		mix(this, opts);
		mix(this, {
			animFun: animFun,	//animFun，动画函数，
			dur: dur,	//动画时长
			byStep: false,	//是否按帧动画
			per: 0,	//播放进度
			frameTime: 28, //帧间隔时间
			_status: 0 //0－未播放，1－播放中，2－播放结束，4－被暂停，8－被终止
		});
		changePer(this, this.per);
		CustEvent.createEvents(this, Anim.EVENTS);
	};

	Anim.EVENTS = 'beforeplay,play,step,pause,resume,end,reset'.split(',');
	/*
	 * turnOn 打开动画定时器
	 * @param {Anim} anim Anim实例
	 * @returns {void}
	 */

	function turnOn(anim) {
		anim.step();
		if (anim.isPlaying()) {
			anim._interval = window.setInterval(function() {
				anim.step();
			}, anim.frameTime);
		}
	}
	/*
	 * turnOff 关闭动画定时器
	 * @param {Anim} anim Anim实例
	 * @returns {void}
	 */

	function turnOff(anim) {
		window.clearInterval(anim._interval);
	}
	/*
	 * changePer 调整播放进度，进度值
	 * @param {Anim} anim Anim实例
	 * @param {number} per 进度值，为[0,1]区间内的数值
	 * @returns {void}
	 */

	function changePer(anim, per) {
		anim.per = per;
		anim._startDate = new Date() * 1 - per * anim.dur;
		if (anim.byStep) {
			anim._totalStep = anim.dur / anim.frameTime;
			anim._currentStep = per * anim._totalStep;
		}
	}

	mix(Anim.prototype, {
		/**
		 * 判断是否正在播放
		 * @method isPlaying
		 * @returns {boolean}  
		 */
		isPlaying: function() {
			return this._status == 1;
		},
		/**
		 * 从0开始播放
		 * @method play
		 * @returns {boolean} 是否开始顺利开始。（因为onbeforeplay有可能阻止了play） 
		 */
		play: function() {
			var me = this;
			if (me.isPlaying()) me.pause();
			changePer(me, 0);
			if (!me.fire('beforeplay')) return false;
			me._status = 1;
			me.fire('play');
			turnOn(me);
			return true;
		},
		/**
		 * 播放一帧
		 * @method step
		 * @param {number} per (Optional) 进度值，为[0,1]区间内的数值
		 * @returns {void} 
		 */
		step: function(per) {
			var me = this;
			if (per != null) {
				changePer(me, per);
			} else {
				if (me.byStep) {
					per = me._currentStep++ / me._totalStep;
				} else {
					per = (new Date() - me._startDate) / me.dur;
				}
				this.per = per;
			}
			if (this.per > 1) {
				this.per = 1;
			}
			me.animFun(this.per);
			me.fire('step');
			if (this.per >= 1) {
				this.end();
				return;
			}
		},
		/**
		 * 播放到最后
		 * @method end
		 * @returns {void} 
		 */
		end: function() {
			changePer(this, 1);
			this.animFun(1);
			this._status = 2;
			turnOff(this);
			this.fire('end');
		},
		/**
		 * 暂停播放
		 * @method pause
		 * @returns {void} 
		 */
		pause: function() {
			this._status = 4;
			turnOff(this);
			this.fire('pause');
		},
		/**
		 * 继续播放
		 * @method resume
		 * @returns {void} 
		 */
		resume: function() {
			changePer(this, this.per);
			this._status = 1;
			this.fire('resume');
			turnOn(this);
		},
		/**
		 * 播放到最开始
		 * @method reset
		 * @returns {void} 
		 */
		reset: function() {
			changePer(this, 0);
			this.animFun(0);
			this.fire('reset');
		}
	});
	QW.provide('Anim', Anim);
}());
/*import from qwrap/resource/js/components/anim/../../components/anim/elanim.js,(by build.py)*/

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
/*import from qwrap/resource/js/components/anim/../../components/anim/easing.js,(by build.py)*/

/**
 * @fileoverview Easing
 * @author:Jerry(屈光宇)、JK（加宽）
 */

(function() {
	/**
	 * @class Easing 动画算子集合，例如easeNone、easeIn、easeOut、easeBoth等算子。
	 * @namespace QW
	 */
	var Easing = {
		easeNone: function(p) {
			return p;
		},
		easeIn: function(p) {
			return p * p;
		},
		easeOut: function(p) {
			return p * (2 - p);
		},
		easeBoth: function(p) {
			if ((p /= 0.5) < 1) return 1 / 2 * p * p;
			return -1 / 2 * ((--p) * (p - 2) - 1);
		},
		easeInStrong: function(p) {
			return p * p * p * p;
		},
		easeOutStrong: function(p) {
			return -((p -= 1) * p * p * p - 1);
		},
		easeBothStrong: function(p) {
			if ((p /= 0.5) < 1) return 1 / 2 * p * p * p * p;
			return -1 / 2 * ((p -= 2) * p * p * p - 2);
		},
		elasticIn: function(p) {
			if (p == 0) return 0;
			if (p == 1) return 1;
			var x = 0.3,
				//y = 1,
				z = x / 4;
			return -(Math.pow(2, 10 * (p -= 1)) * Math.sin((p - z) * (2 * Math.PI) / x));
		},
		elasticOut: function(p) {
			if (p == 0) return 0;
			if (p == 1) return 1;
			var x = 0.3,
				//y = 1,
				z = x / 4;
			return Math.pow(2, -10 * p) * Math.sin((p - z) * (2 * Math.PI) / x) + 1;
		},
		elasticBoth: function(p) {
			if (p == 0) return 0;
			if ((p /= 0.5) == 2) return 1;
			var x = 0.3 * 1.5,
				//y = 1,
				z = x / 4;
			if (p < 1) return -0.5 * (Math.pow(2, 10 * (p -= 1)) * Math.sin((p - z) * (2 * Math.PI) / x));
			return Math.pow(2, -10 * (p -= 1)) * Math.sin((p - z) * (2 * Math.PI) / x) * 0.5 + 1;
		},
		backIn: function(p) {
			var s = 1.70158;
			return p * p * ((s + 1) * p - s);
		},
		backOut: function(p) {
			var s = 1.70158;
			return ((p = p - 1) * p * ((s + 1) * p + s) + 1);
		},
		backBoth: function(p) {
			var s = 1.70158;
			if ((p /= 0.5) < 1) return 1 / 2 * (p * p * (((s *= (1.525)) + 1) * p - s));
			return 1 / 2 * ((p -= 2) * p * (((s *= (1.525)) + 1) * p + s) + 2);
		},
		bounceIn: function(p) {
			return 1 - Easing.bounceOut(1 - p);
		},
		bounceOut: function(p) {
			if (p < (1 / 2.75)) {
				return (7.5625 * p * p);
			} else if (p < (2 / 2.75)) {
				return (7.5625 * (p -= (1.5 / 2.75)) * p + 0.75);
			} else if (p < (2.5 / 2.75)) {
				return (7.5625 * (p -= (2.25 / 2.75)) * p + 0.9375);
			}
			return (7.5625 * (p -= (2.625 / 2.75)) * p + 0.984375);
		},
		bounceBoth: function(p) {
			if (p < 0.5) return Easing.bounceIn(p * 2) * 0.5;
			return Easing.bounceOut(p * 2 - 1) * 0.5 + 0.5;
		}
	};

	QW.provide('Easing', Easing);
}());
/*import from qwrap/resource/js/components/anim/../../components/anim/anim_retouch.js,(by build.py)*/

/*
 *	Copyright (c) QWrap
 *	version: $version$ $release$ released
 *	author:Jerry(屈光宇)、JK（加宽）
 *  description: Anim推荐retouch....
*/

(function() {
	var NodeH = QW.NodeH,
		g = NodeH.g,
		isVisible = NodeH.isVisible,
		mix = QW.ObjectH.mix;

	var SIGNAL_TYPE = "_animation";

	function newAnim(el, attrs, callback, dur, easing) {
		el = g(el);

		//pause掉之前的动画
		AnimElH.stop(el, false, false);

		var anim = new QW.ElAnim(el, attrs, dur || 400, easing);
		if (callback) {
			anim.on("end", function() {
				callback.call(el, null);
			});
		}

		anim.play();

		el.__preAnim = anim;
		return anim;
	}

	var AnimElH = {
		/**
		 * [animate 通用的动画函数]
		 * @param  {[Element]}   el    动画作用的元素
		 * @param  {[Object]}   attrs  动画改变的属性
		 * @param  {[Int]}   dur       动画时长，毫秒
		 * @param  {Function} callback 动画运行完回调
		 * @param  {Function}   easing 动画算子
		 * @return ElAnim
		 */
		animate: function(el, attrs, dur, callback, easing, sequence) {
			//参数如果是boolean，看作sequence
			for (var i = arguments.length - 1; i > 0; i--){
				if(arguments[i] === !!arguments[i]){
					var _sequence = arguments[i];
					arguments[i] = null;
					sequence = _sequence;
					break;
				}
			}

			if(QW.Async && (sequence || QW.ElAnim.Sequence)){
				W(el).wait(SIGNAL_TYPE, function(){
					var anim = newAnim(el, attrs, callback, dur, easing);
					anim.on("end", function(){
						W(el).signal(SIGNAL_TYPE);
					});
					return anim;
				});
			}else{
				return newAnim(el, attrs, callback, dur, easing);
			}
		},

		/**
		 * [fadeIn 淡入]
		 * @param  {[Element]}   el    动画作用的元素
		 * @param  {[Int]}   dur       动画时长，毫秒
		 * @param  {Function} callback 动画运行完回调
		 * @param  {Function}   easing 动画算子
		 * @return ElAnim
		 */
		fadeIn: function(el, dur, callback, easing, sequence) {
			var attrs = {
				"opacity": "show"
			};

			return AnimElH.animate(el, attrs, dur, callback, easing, sequence);
		},

		/**
		 * [fadeOut 淡出]
		 * @param  {[Element]}   el    动画作用的元素
		 * @param  {[Int]}   dur       动画时长，毫秒
		 * @param  {Function} callback 动画运行完回调
		 * @param  {Function}   easing 动画算子
		 * @return ElAnim
		 */
		fadeOut: function(el, dur, callback, easing, sequence) {
			var attrs = {
				"opacity": "hide"
			};

			return AnimElH.animate(el, attrs, dur, callback, easing, sequence);
		},

		/**
		 * [fadeToggle 淡入/淡出切换]
		 * @param  {[Element]}   el    动画作用的元素
		 * @param  {[Int]}   dur       动画时长，毫秒
		 * @param  {Function} callback 动画运行完回调
		 * @param  {Function}   easing 动画算子
		 * @return ElAnim
		 */
		fadeToggle: function(el, dur, callback, easing, sequence) {
			return AnimElH[isVisible(el) ? 'fadeOut' : 'fadeIn'](el, dur, callback, easing, sequence);
		},

		/**
		 * [slideUp 收起]
		 * @param  {[Element]}   el    动画作用的元素
		 * @param  {[Int]}   dur       动画时长，毫秒
		 * @param  {Function} callback 动画运行完回调
		 * @param  {Function}   easing 动画算子
		 * @return ElAnim
		 */
		slideUp: function(el, dur, callback, easing, sequence) {

			var attrs = {
				"height": "hide"
			};

			return AnimElH.animate(el, attrs, dur, callback, easing, sequence);
		},

		/**
		 * [slideDown 展开]
		 * @param  {[Element]}   el    动画作用的元素
		 * @param  {[Int]}   dur       动画时长，毫秒
		 * @param  {Function} callback 动画运行完回调
		 * @param  {Function}   easing 动画算子
		 * @return ElAnim
		 */
		slideDown: function(el, dur, callback, easing, sequence) {

			var attrs = {
				"height": "show"
			};

			return AnimElH.animate(el, attrs, dur, callback, easing, sequence); 
		},

		/**
		 * [slideToggle 收起/展开切换]
		 * @param  {[Element]}   el    动画作用的元素
		 * @param  {[Int]}   dur       动画时长，毫秒
		 * @param  {Function} callback 动画运行完回调
		 * @param  {Function}   easing 动画算子
		 * @return ElAnim
		 */
		slideToggle: function(el, dur, callback, easing, sequence) {
			return AnimElH[isVisible(el) ? 'slideUp' : 'slideDown'](el, dur, callback, easing, sequence);
		},

		/**
		 * [shine4Error 颜色渐变，用于表单提示]
		 * @param  {[Element]}   el    动画作用的元素
		 * @param  {[Int]}   dur       动画时长，毫秒
		 * @param  {Function} callback 动画运行完回调
		 * @param  {Function}   easing 动画算子
		 * @return ElAnim
		 */
		shine4Error: function(el, dur, callback, easing, sequence) {
			var attrs = {
				"backgroundColor": {
					from: "#f33",
					to: "#fff",
					end: ""
				}
			};
			return AnimElH.animate(el, attrs, dur, callback, easing, sequence); 
		},

		/**
		 * [停止动画]
		 * @param  {[Element]} el        	动画作用的元素
		 * @param  {[bool]} clearQueue 		是否清除动画队列（队列播放动画时，是否清除未播放的动画）
		 * @param  {[bool]} gotoEnd			是否停止动画（直接播放到最后一帧，触发onend事件）
		 * @return ElAnim
		 */
		stop : function(el, clearQueue, gotoEnd) {
			var preAnim = el.__preAnim;
			if(!preAnim) {
				return;
			}

			if(clearQueue && QW.Async) {
				QW.AsyncH.clearSignals(el, SIGNAL_TYPE);
			}

			if(gotoEnd) {
				preAnim.end();
			} else {
				preAnim.pause();
			}
		}
	};

	//如果支持异步，增加一个sleep动画，什么也不做，只是等待
	if(QW.Async){
		mix(AnimElH, {
			sleep: function(el, dur, callback){
				return AnimElH.animate(el, {}, dur, callback, null, true);
			}
		});
	}

	QW.NodeW.pluginHelper(AnimElH, 'operator');
	if (QW.Dom) {
		mix(QW.Dom, AnimElH);
	}
}());