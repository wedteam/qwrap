
/*import from qwrap/resource/js/components/switch/../../components/switch/switch.js,(by build.py)*/

(function () {
	var indexOfArr = QW.ArrayH.indexOf,
		mix = QW.ObjectH.mix, 
		CustEvent = QW.CustEvent, 
		NodeH = QW.NodeH,
		hasClass = NodeH.hasClass,
		addClass = NodeH.addClass,
		removeClass = NodeH.removeClass,
		query = NodeH.query,
		EventTargetH = QW.EventTargetH,
		delegate = EventTargetH.delegate,
		on = EventTargetH.on;

	/**
	 * @class Switch 切换类，是一个虚拟类，没有真正的switchTo方法
	 * @param {json} options 构造参数，支持以下参数：
		{array} items switch明细
	 * @return {Switch} 
	 */
	var Switch = function (options) {
		mix(this,options||{},true);
		this.items = this.items || [];
		CustEvent.createEvents(this, Switch.EVENTS);
	};

	Switch.EVENTS = ['beforeswitch', 'afterswitch'];

	mix(Switch.prototype, {
		selectedIndex : -1,//当前被选中的index
		isSwitching : false,//是否正在切换
		/**
		 * @method switchTo 切换到
		 * @param	{int}	index	下标
		 * @return	{void}
		 */
		switchTo : function(index) {
			alert('Switch to: '+ index);
		},
		/**
		 * @method switchTo 切换到
		 * @param	{any}	itemObj itemObj
		 * @return	{void}
		 */
		switchToItem : function(itemObj) {
			var index = indexOfArr(this.items, itemObj);
			return this.switchTo(index);
		},

		next : function() {
			var index = (this.selectedIndex+1) % this.items.length;
			this.switchTo(index);
		},

		previous : function() {
			var index = this.selectedIndex-1;
			if(index <0 ) index = this.items.length - 1;
			this.switchTo(index);
		}
	});


	/**
	 * @class TabView TabView类，提供“一组tabs节点来决定一组views节点的展现方式”的功能。
	 * @param {Element} host TabView元素的容器节点：
	 * @param {json} options 构造参数，支持以下参数：
		{string}  tabSelector 用来获取tabs的selector。 默认为'.slide-nav li'
		{Array}  views (Optional) view节点数组。
		{string}  viewSelector (Optional) 用来获取views的selector。默认为'.slide-content li',
		{string}  pageUpSelector (Optional) 向前翻页按钮的selector。默认为'.slide-pageup',
		{string}  pageDownSelector (Optional) 向后翻页按钮的selector。默认为'.slide-pagedown',
		{boolean} autoPlay (Optional) 是否自动轮播
		{boolean} autoPlayPausing (Optional) 自动轮播是否处于暂停状态。可以随时修改TabView的实体的autoPlayPausing，来决定是否暂停轮播。
		{int} autoPlayTime (Optional) 自动轮播的时间间隔，默认为3000ms
		{boolean} supportMouseenter (Optional) 是否支持鼠标移上tabs的效果
		{int} mouseenterSwitchTime (Optional) mouseenter到tab后达到自动切换的等候时间。如果为undefined，则不自动切换；如果为非负整数（包括0），表示有mouseenter的切换效果；
		{Array|string} switchEvents (Optional) 触发切换tab的dom事件，默认为['click']
		{string} animType (Optional) 切换时的动画类型，支持: fade/scroll两种
		{int} animDur (Optional) 动画时长（单位是ms），默认为500
		{function} onbeforeswitch (Optional) 事件
		{function} onafterswitch (Optional) 事件
	 * @return {TabView} 
	 */


	function TabView(host,options){
		var me=this;
		//构造Switch对象
		me.host = host;
		Switch.call(me, options);
		this.items = query(host,this.tabSelector) || [];
		this.views = this.views || this.viewSelector && query(host,this.viewSelector) || []
		var selectedIndex = -1,
			items=this.items;
		for(var i =0;i<items.length;i++){
			if (hasClass(items[i], this.selectedClass)) {
				selectedIndex = i;
				break;
			}
		}
		if(selectedIndex>-1) this.switchTo(selectedIndex);

		//初始化dom事件
		if (me.autoPlay) {//自动播放效果
			var playInterval = 0;
			function mouseoutFun() {
				clearInterval(playInterval);
				playInterval = setInterval(function(){
					if(host.offsetWidth && !me.autoPlayPausing) {//如果隐藏，或设置了autoPlaysing，则忽略自动播放。
						me.next();
					}
				},me.autoPlayTime || 3000);
			}
			mouseoutFun();
			on(host,'mouseenter',function(){clearInterval(playInterval)});
			on(host,'mouseleave',mouseoutFun);
		}
		if (this.pageUpSelector) {
			delegate(host,this.pageUpSelector,'click',function(e){
				me.previous();
				e.preventDefault();
			});
		}
		if (this.pageDownSelector) {
			delegate(host,this.pageDownSelector,'click',function(e){
				me.next();
				e.preventDefault();
			});
		}

		if (this.tabSelector) {
				if (me.supportMouseenter) { //mouseenter效果
				var mouseenterTimeout = 0;
				delegate(host,me.tabSelector,'mouseenter',function(e){
					var tabEl=this;
					addClass(tabEl,me.preselectedClass);
					if(me.mouseenterSwitchTime != null){//mouseenter引发switch
						clearTimeout(mouseenterTimeout);
						mouseenterTimeout = setTimeout(function(){
							me.switchToItem(tabEl);
						}, me.mouseenterSwitchTime|0);
					}
					e.preventDefault();
				});
				delegate(host,me.tabSelector,'mouseleave',function(e){
					removeClass(this,me.preselectedClass);
					clearTimeout(mouseenterTimeout);
					e.preventDefault();
				});
			}
			var switchEvents = this.switchEvents || this.defaultSwitchEvents;
			delegate(host,me.tabSelector,String(switchEvents),function(e){
				me.switchToItem(this);
				e.preventDefault()
			});
		}

	}

	mix(TabView.prototype,[
		{
			tabSelector : '.slide-nav li',
			viewSelector : '.slide-content li',
			pageDownSelector: '.slide-pagedown',
			pageUpSelector: '.slide-pageup',
			selectedClass : 'selected',
			preselectedClass : 'preselected',
			selectedViewClass : 'selected',
			defaultSwitchEvents: ['click'],

			/**
			 * @method switchTo 切换到
			 * @param	{int}	index	下标
			 * @return	{void}
			 */
			switchTo : function (index) {
				var fromIndex = this.selectedIndex,
					eventArgs = {
						fromIndex: fromIndex,
						toIndex: index,
						fromItem:  this.items[fromIndex],
						toItem: this.items[index],
						fromView:  this.views[fromIndex],
						toView: this.views[index]
					};
				if(index == fromIndex) return;
				if (!this.fire('beforeswitch',eventArgs)) {
					return;
				}
				this.isSwitching = true;
				this.selectedIndex = index;
				this.switchAnim(eventArgs);
			},
			switchAnim : function(eventArgs){
				var me=this;
				function animCb(){
					me.switchDone(eventArgs);
				}
				if(eventArgs.fromItem) {
					removeClass(eventArgs.fromItem,this.selectedClass);
				}
				if(eventArgs.toItem) {
					addClass(eventArgs.toItem,this.selectedClass);
				}
				switch(this.animType){
					case 'fade':
						//if (eventArgs.fromIndex<0) return animCb(); // 初始没必要fade in
						if (eventArgs.fromView) QW.NodeW(eventArgs.fromView).css('opacity',1).animate({opacity:0},this.animDur || 500,function(){QW.NodeW(eventArgs.fromView).removeClass(me.selectedViewClass)},this.animEasing);
						return QW.NodeW(eventArgs.toView).addClass(me.selectedViewClass).animate({opacity:{from:0,to:1}},this.animDur || 500,animCb,this.animEasing);
					case 'scroll':
						if(eventArgs.fromView){
							for (var i=0,viewI; viewI = me.views[i++]; ){
								QW.NodeH[viewI == eventArgs.fromView || viewI == eventArgs.toView ? 'show' : 'hide'](viewI);
							}
						}
						var pEl=eventArgs.toView.parentNode,
							loopNum = 4;
						while (loopNum--) {
							if(pEl.scrollWidth>1.5*pEl.offsetWidth) {
								if(eventArgs.fromView) pEl.scrollLeft = eventArgs.fromView.offsetLeft;
								return QW.NodeW(pEl).animate({scrollLeft:eventArgs.toView.offsetLeft},this.animDur || 500,animCb,this.animEasing);
							}
							if(pEl.scrollHeight>1.5*pEl.offsetHeight) {
								if(eventArgs.fromView) pEl.scrollTop = eventArgs.fromView.offsetTop;
								return QW.NodeW(pEl).animate({scrollTop:eventArgs.toView.offsetTop},this.animDur || 500,animCb,this.animEasing);
							}
							pEl = pEl.parentNode;
						}
					default:
						if (eventArgs.fromView) removeClass(eventArgs.fromView,this.selectedViewClass);
						if (eventArgs.toView) addClass(eventArgs.toView,this.selectedViewClass);
						animCb();
				}
			},
			switchDone : function(eventArgs){
				this.isSwitching = false;
				this.selectedIndex = eventArgs.toIndex;
				this.fire('afterswitch',eventArgs);
			}

		},
		Switch.prototype
	]);

	QW.provide({
		TabView: TabView, //学术叫法。（TabView类，提供“一组tabs节点来决定一组views节点的展现方式”的功能）
		Slide: TabView //幻灯片是TabView的一种应用，这个名字更通俗易懂
	});

}());
/*import from qwrap/resource/js/components/switch/../../components/switch/switch_retouch.js,(by build.py)*/

(function() {
	var mix = QW.ObjectH.mix,
		NodeH = QW.NodeH,
		g = NodeH.g,
		Jss = QW.Jss,
		JssTargetH = QW.JssTargetH,
		getJss = JssTargetH.getJss;
	Jss.addRules({
		'.widget-slide':{
			tabSelector : '.slide-nav li',
			viewSelector : '.slide-content li',
			pageUpSelector: '.slide-pageup',
			pageDownSelector: '.slide-pagedown',
			autoPlay: true,
			supportMouseenter: true,
			mouseenterSwitchTime: 300
		}
	});
	var SwitchableElH = { 
		/* 淡入 */
		switchable: function(el, options) {
			el = g(el);
			var newOptions = {},
				props = 'tabSelector viewSelector pageUpSelector pageDownSelector selectedClass preselectedClass selectedViewClass autoPlay autoPlayPausing autoPlayTime supportMouseenter mouseenterSwitchTime switchEvents animType animDur switchEvents onbeforeswitch onafterswitch'.split(' ');
			for(var i=0;i<props.length;i++){
				var value = getJss(el,props[i]);
				if(value != null) newOptions[props[i]] = value;
			}
			mix(newOptions, options);
			el.__slide = new QW.Slide(el, newOptions);
		}
	};

	QW.NodeW.pluginHelper(SwitchableElH, 'operator');
	if (QW.Dom) {
		QW.ObjectH.mix(QW.Dom, SwitchableElH);
	}
	QW.DomU.ready(function(){
		QW.NodeW('div.widget-slide').switchable();
	});
}());