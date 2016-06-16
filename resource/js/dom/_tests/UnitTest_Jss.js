QW.Wrap = function(core) {
	this.core = core;
};


(function() {
	var DomU = QW.DomU,
		Jss = QW.Jss,
		JssTargetH = QW.JssTargetH;
	var div = DomU.create('<div id="switchable" class="switchable" data-jss="switchLazyTime:500" >aa</div>');
	var div2 = DomU.create('<div >aa</div>');
	describe('Jss', {
		'Jss': function() {
			value_of(Jss).log('members');
			Jss.addRule('.switchable', {
				isSwitchable: true,
				switchLazyTime: 1000
			});
		},
		'addRule/getRuleData/getRuleAttribute': function() {
			//Jss.addRule('.switchable',{isSwitchable:true,switchLazyTime:1000});
			value_of(Jss.getRuleData('.switchable')).log();
			value_of(Jss.getRuleData('.switchable').isSwitchable).should_be(true);
			value_of(Jss.getRuleAttribute('.switchable', 'switchLazyTime')).should_be(1000);
		}
	});
	describe('JssTargetH', {
		'JssTargetH': function() {
			value_of(JssTargetH).log('members');
		},
		'setJss,getJss': function() {
			//Jss.addRule('.switchable',{isSwitchable:true,switchLazyTime:1000});
			value_of(JssTargetH.getJss(div, 'isSwitchable')).should_be(true);
			value_of(JssTargetH.getJss(div, 'switchLazyTime')).should_be(500);
			JssTargetH.setJss(div2,'testAttr2',10);
			value_of(JssTargetH.getJss(div2, 'testAttr2')).should_be(10);
		}
	});

}());