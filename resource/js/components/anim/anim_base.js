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