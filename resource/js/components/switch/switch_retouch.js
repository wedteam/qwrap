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