//Required : window.SpeedMatchConfig 


(function() {

	var SpeedMatch = {};
	SpeedMatch.init = function(ctn) {
		var html = ['<h1><span>SpeedMatch----Thanks <a href="http://mootools.net/slickspeed/" target="_blank">http://mootools.net/slickspeed</a></span></h1><div id="controls"><a class="stop" href="#">stop tests</a><a class="start" href="#">start tests</a></div>'],
			titles = [];
		for (var i = 0; i < SpeedMatchConfig.players.length; i++) {
			var player = SpeedMatchConfig.players[i];
			html.push('<iframe style="display:none" name="match_player_' + i + '" src="' + player.url + '"></iframe>');
			titles.push(player.title);
		}
		html.push('<table><thead id="thead"><tr><th class="matchcases-title">cases</th><th class="framework">', titles.join('</th><th class="framework">'), '</th></tr></thead>', '<tbody id="tbody"><tr><th class="matchcase">', SpeedMatchConfig.cases.join('</th>' + new Array(titles.length + 1).join('<td class="empty"></td>', '') + '</tr><tr><th class="matchcase">', ''), '</th>' + new Array(titles.length + 1).join('<td class="empty"></td>', '') + '</tr></tbody>', '<tfoot id="tfoot"><tr><th class="score-title"><strong>final time (less is better)</strong></th>', new Array(titles.length + 1).join('<td class="score">0</td>', ''), '</tr></tfoot>', '</table>', '<h2>Legend</h2>', '<table id="legend"><tr><th>the faster</th><th>the slower</th><th>exception thrown or zero elements found</th><th>different returned elements</th></tr>', '<tr><td class="good"></td><td class="bad"></td><td class="exception"></td><td class="mismatch"></td></tr>', '</table>');
		//document.write(html.join(''));
		ctn.innerHTML = html.join('');
		forEach(document.getElementsByTagName('iframe'), function(el, i) {
			el.src = SpeedMatchConfig.players[i].url;
			SpeedMatchConfig.players[i].iframeEl = el;
		});
	};

	function forEach(iterable, fn, bind) {
		for (var i = 0, j = iterable.length; i < j; i++) fn.call(bind, iterable[i], i, iterable);
	}

	//test start

	window.onload = function() {
		setTimeout(function() {
			var players = SpeedMatchConfig.players,
				cases = SpeedMatchConfig.cases;

			var frameworks = {};

			forEach(players, function(player) {
				try {
					player.test = window.frames[player.iframeEl.name].test;
				} catch (ex) {
					alert(player.title + ' is not ready.');
				}
			});

			var tbody = document.getElementById('tbody');
			var tfoot = document.getElementById('tfoot');
			var lastrow = tfoot.getElementsByTagName('tr')[0];

			var controls = document.getElementById('controls');

			var links = controls.getElementsByTagName('a');

			var start = links[1];
			var stop = links[0];

			start.onclick = function() {
				testRunner();
				return false;
			};

			stop.onclick = function() {
				clearTimeout(timer);
				timer = null;
				return false;
			};

			var score = [];
			var scores = [];

			for (var i = 0; i < players.length; i++) {
				scores[i] = lastrow.getElementsByTagName('td')[i];
				score[i] = 0;
			}

			var tests = [];

			forEach(cases, function(matchcase, i) {
				var row = tbody.getElementsByTagName('tr')[i];
				for (var name = 0; name < players.length; name++) {
					var player = players[name];
					var cell = row.getElementsByTagName('td')[name];
					tests.push({
						'execute': player.test,
						'matchcase': matchcase,
						'name': name,
						'row': row,
						'cell': cell
					});
				}
			});

			var timer = null;

			var testRunner = function() {
				var test = tests.shift();
				if (!test) return;
				var d0 = new Date();
				var ex = '';
				try {
					var results = test.execute(test.matchcase);
				} catch (e) {
					ex = e;
				}
				var dDelta = new Date() - d0;
				test.cell.className = 'test';
				test.cell.innerHTML = dDelta + ' ms | ' + results;
				test.cell.speed = dDelta;
				if (ex) {
					test.cell.innerHTML = dDelta + ' ms | <span class="exception" title="' + (ex + '').replace(/'"></g, '') + '">error returned</a>';
					test.cell.className += ' exception';
					test.cell.found = results;
					test.cell.error = true;
				} else {
					test.cell.found = results;
					test.cell.error = false;
				}

				score[test.name] += test.cell.speed;
				scores[test.name].innerHTML = '&nbsp;' + score[test.name] + '&nbsp;';

				if (test.cell == test.row.lastChild) colourRow(test.row);
				timer = setTimeout(testRunner, 250);
			};

			var colourRow = function(row) {

				var cells = [];

				var tds = row.getElementsByTagName('td');
				forEach(tds, function(td) {
					cells.push(td);
				});

				var speeds = [];

				forEach(cells, function(cell, i) {
					if (!cell.error) speeds[i] = cell.speed;
					//error, so we exclude it from colouring good. does not affect score (it should?).
					else speeds[i] = 99999999999999999999999;
				});

				var min = Math.min.apply(this, speeds);
				var max = Math.max.apply(this, speeds);

				var found = [];
				var mismatch = false;
				forEach(cells, function(cell, i) {
					found.push(cell.found);
					if (!mismatch) {
						forEach(found, function(n) {
							if (!cell.error && cell.found != undefined && n && cell.found != n) {
								mismatch = true;
								return;
							}
						});
					}
					if (cell.speed == min) cell.className += ' good';
					else if (cell.speed == max) cell.className += ' bad';
					else cell.className += ' normal';
				});

				if (mismatch) {
					forEach(cells, function(cell, i) {
						if (cell.found != undefined) cell.className += ' mismatch';
					});
				}

			};

		}, 1000);
	};



	window.SpeedMatch = SpeedMatch;


}());