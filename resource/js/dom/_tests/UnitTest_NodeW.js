(function() {
	var NodeW = QW.NodeW;

	describe('NodeW', {
		'NodeW Members': function() {
			value_of(NodeW).log('members');
		},
		'NodeW()': function() {
			value_of(NodeW('body')[0] == document.body).should_be(true);
			value_of(NodeW(document.body).core == document.body).should_be(true);
			value_of(NodeW('<input/><input/>').length).should_be(2);
			value_of(NodeW(' <input/><input/>').length).should_be(2);
		}

	});


}());