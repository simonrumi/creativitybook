/**
* Initializes vis, the javascript library that displays the animated network of nodes
* @method initVis
* @private
* @return {Object} A dictionary with a variety of things needed for running the vis node
*/
initVis  = function() {
	var _visNodes = new vis.DataSet([
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

    // TODO remove this fake data and make it real
	var _visEdges = new vis.DataSet([
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
	var _visContainer = {};
	var _visData = {};
	var _visOptions = {
		width: '800px',
		height: '600px',
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
	var _nextVisId = 100;
	var _visNetwork;

	return {
		'visNodes' : _visNodes,
		'visEdges' : _visEdges,
		'visContainer' : _visContainer,
		'visData' : _visData,
		'visOptions' : _visOptions,
		'visNetwork' : _visNetwork,
		'nextVisId' : _nextVisId
	}
}

showVis = function() {
	var _visObject = initVis();
	_visObject.visData = {
		nodes: _visObject.visNodes,
		edges: _visObject.visEdges,
	};
	_visObject.visContainer = document.getElementById('menu-network');
	_visObject.visNetwork = new vis.Network(_visObject.visContainer, _visObject.visData, _visObject.visOptions);
}

$(document).ready(function() {
    console.log( "ready!" );
    showVis();
});
