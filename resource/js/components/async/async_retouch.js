(function() {
	var NodeW = QW.NodeW,
		AsyncH = QW.AsyncH,
		methodize = QW.HelperH.methodize;

	//异步方法
	NodeW.pluginHelper(AsyncH, 'operator');

	//提供全局的Async对象
	var Async = methodize(AsyncH);

	QW.provide("Async", Async);
}());