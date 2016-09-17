var chapterController = (function() {

	/* *******************
	* private variables
	* ********************/
	var _debug = true; //set to true to see console logging

	// vis stuff
	var _visNodes;
	var _visEdges;
	var _visContainer;
	var _visData;
	var _visOptions;
	var _visNetwork;
	var _visObject;

	_log = function (message) {
		if (_debug) {
			console.log(message);
		}
	}

	/**
	* Initializes vis, the javascript library that displays the animated network of nodes
	* @method _initVis
	* @private
	* @return {Object} A dictionary with a variety of things needed for running the vis node
	*/
	_initVis  = function() {
		_visNodes = new vis.DataSet([
			{id: 1010, label: 'Automation of Everything', image: 'http://loremflickr.com/80/80?random=1'},
			{id: 1020, label: 'The Spirograph Problem', image: 'http://loremflickr.com/80/80?random=2'},
			{id: 1050, label: 'A Future Economy', image: 'http://loremflickr.com/80/80?random=3'},
			{id: 1100, label: 'A New IP System', image: 'http://loremflickr.com/80/80?random=4'},
			{id: 2005, label: 'Patterns', image: 'http://loremflickr.com/80/80?random=5'},
			{id: 2010, label: 'Change vs Repetition', image: 'http://loremflickr.com/80/80?random=6'},
			{id: 2015, label: 'Structure', image: 'http://loremflickr.com/80/80?random=7'},
			{id: 2018, label: 'Originality', image: 'http://loremflickr.com/80/80?random=8'},
			{id: 2020, label: 'Cross Pollination', image: 'http://loremflickr.com/80/80?random=9'},
			{id: 2050, label: 'Uses for Creativity', image: 'http://loremflickr.com/80/80?random=10'},
			{id: 2060, label: 'Creative People', image: 'http://loremflickr.com/80/80?random=11'}
	    ]);

		_visEdges = new vis.DataSet([
			{from: 1010, to: 1050},
			{from: 1010, to: 1020},
			{from: 1020, to: 1050},
			{from: 1050, to: 1100},
			{from: 1100, to: 2005},
			{from: 2005, to: 2010},
			{from: 2010, to: 2015},
			{from: 2015, to: 2018},
			{from: 2018, to: 2020},
			{from: 2020, to: 2050},
			{from: 2050, to: 2060},
	    ]);
		_visContainer = {};
		_visData = {};
		_visOptions = {
			width: '100%',
			height: '100%',
			physics: {},
			nodes: {
				shape: 'circularImage',
				shapeProperties: {
					borderDashes: false, // only for borders
					interpolation: false,  // resample image when scaling its size down (additional time needed for this)
					useImageSize: true,  // this overrides the size option
	    		}
			}
		};
		_visNetwork;

		return {
			'visNodes' : _visNodes,
			'visEdges' : _visEdges,
			'visContainer' : _visContainer,
			'visData' : _visData,
			'visOptions' : _visOptions,
			'visNetwork' : _visNetwork,
		}
	}

	/**
	* Display the Vis network of chapter nodes and make sure they do something when clicked on
	* @method _showChapterNodes
	* @private
	*/
	_showChapterNodes = function() {
		_visObject.visData = {
			nodes: _visObject.visNodes,
			edges: _visObject.visEdges,
		};
		_visObject.visContainer = document.getElementById('menu-network');
		_visObject.visNetwork = new vis.Network(_visObject.visContainer, _visObject.visData, _visObject.visOptions);

		_visObject.visNetwork.on('click', function(clickInfo) {
			// clickInfo looks like this
			// {
			// 	nodes: [Array of selected nodeIds],
			// 	edges: [Array of selected edgeIds],
			// 	event: [Object] original click event,
			// 	pointer: {
			// 		DOM: {x:pointer_x, y:pointer_y},
			// 		canvas: {x:canvas_x, y:canvas_y}
			// 	}
			// }
			console.log('Got a click, id: ' + clickInfo.nodes + '; mouse position: ' + clickInfo.pointer.DOM.x + ', ' + clickInfo.pointer.DOM.y);
			_showChapter(clickInfo.nodes)
		});
	}

	/**
	* Diplay a particular chapter - this is called when the user clicks on a chapter node
	* @method _showChapter
	* @param {Number} chapterId The unique id number of the chapter
	* @param {Object} dataSet An object from vis that has all the chapter ids in it
	* @private
	*/
	_showChapter = function(chapterId) {
		var item;
		var itemHiding;
		var dataSet = _visObject.visData.nodes.getDataSet()
		//show the chapter with the given id
		$('#chapter-' + chapterId).load('chapter-' + chapterId + '.html');
		$('#chapter-' + chapterId).css('display', 'block');
		$('#chapter-' + chapterId).animate(
			{
				opacity: 1.0,
			},
			1200,
			function() {
				// Animation complete.
				$('#chapter-' + chapterId).css('z-index', '0');
				_log('completed show-animation for chapter ' + chapterId);
			}
		);

		// hide any other chapters currently showing
		for (item in dataSet._data) {
			if ((item != chapterId) && ($('#chapter-' + item).css('display') == 'block')) {
				itemHiding = item;
				$('#chapter-' + item).animate(
					{
						opacity: 0.0,
					},
					1200,
					function() {
						// Animation complete - make sure it is really gone
						$('#chapter-' + itemHiding).css('display', 'none');
						_log('completed hide-animation for chapter ' + itemHiding);
					}
				);
			}
		}
	}

	return {

		/**
		* Initialize & display the chapter nodes and the first chapter
		* @method init
		*/
		init : function() {
			_visObject = _initVis();
			_showChapterNodes();
			_showChapter(1010);
		}
	}

})();

$(document).ready(function() {
    console.log( "ready!" );
    chapterController.init();
});
