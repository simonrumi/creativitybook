/** 
see 
http://www.htmlgoodies.com/beyond/javascript/js-ref/testing-dom-events-using-jquery-and-jasmine-2.0.html
and 
http://www.htmlgoodies.com/html5/javascript/spy-on-javascript-methods-using-the-jasmine-testing-framework.html
*/
	
	describe("Planet object", function() {
		beforeEach(function(){
			$(	'<div id="container" style="width: 100vw; height: 100vh; position: relative;">' +
				'	<div id="planet-draggable3" class="planet-draggable" style="position: absolute;	z-index: 100; width: 20vw; height: 20vh">' +
				'		<img id="planet3" class="planet-img" src="img/planet3.png" style="position: relative; width: 20vw; height: 20vw;"></img>' +
				'	</div>' +
				'</div>'
			).appendTo('body');
		});

		afterEach(function(){
			$('#container').remove();
		});

		it("finds the test div in the DOM", function() {
			expect($('#planet-draggable3')).toBeInDOM();
		});
		
		it("creates a Planet object given a div id", function() {
			var fakePlanet = new Planet('#planet-draggable3');
			expect(fakePlanet.div).toEqual($('#planet-draggable3'));
			expect(fakePlanet.name).toEqual('#planet-draggable3');
		});
	  
		it("sets the max and min distance from neighbor", function() {
			var fakePlanet = new Planet('#planet-draggable3');
			expect(fakePlanet.maxDistanceFromNeighbor).toEqual(125);
			expect(fakePlanet.minDistanceFromNeighbor).toEqual(85);
		});
		
		it("knows the position of the planet's div", function() {
			var fakePlanet = new Planet('#planet-draggable3');
			fakePlanet.updatePosition();
			expect(fakePlanet.x).toEqual($(fakePlanet.name).offset().left);
			expect(fakePlanet.y).toEqual($(fakePlanet.name).offset().top);
		});
		
		it("can set the planet's position relative to the top left", function() {
			var fakePlanet = new Planet('#planet-draggable3');
			fakePlanet.setPosition(10,20);
			expect(fakePlanet.x).toEqual(10);
			expect(fakePlanet.y).toEqual(20);
		});
		
		it("can set the planet's position relative to its center", function() {
			var fakePlanet = new Planet('#planet-draggable3');
			var xCenterOffset = Math.round($('#planet-draggable3').width() / 2);
			var yCenterOffset = Math.round($('#planet-draggable3').height() / 2);
			fakePlanet.setPosition(10,20, true);
			expect(Math.round(fakePlanet.x)).toEqual(10 - xCenterOffset);
			expect(Math.round(fakePlanet.y)).toEqual(20 - yCenterOffset);
		});
		
		it("can set the planet's position relative to the top left, using percentages", function() {
			var fakePlanet = new Planet('#planet-draggable3');
			fakePlanet.setPosition('10%','20%');
			var expectedX = Math.round(0.1 * $(window).width());
			var expectedY = Math.round(0.2 * $(window).height());
			expect(fakePlanet.x).toEqual(expectedX);
			expect(fakePlanet.y).toEqual(expectedY);

		});
		
		it("can set the planet's position relative to its center, using percentages", function() {
			var fakePlanet = new Planet('#planet-draggable3');
			var xCenterOffset = $('#planet-draggable3').width() / 2;
			var yCenterOffset = $('#planet-draggable3').height() / 2;
			fakePlanet.setPosition('10%','20%', true);
			var expectedX = Math.round(0.1 * $(window).width()) - xCenterOffset;
			var expectedY = Math.round(0.2 * $(window).height()) - yCenterOffset;
			expect(Math.round(fakePlanet.x)).toEqual(Math.round(expectedX));
			expect(Math.round(fakePlanet.y)).toEqual(Math.round(expectedY));
		});
		
		/// TODO make more tests for the Planet constuctor
		
	});
	
	describe('calcDistanceBetweenPoints', function () {
		it('calculates the distance from the origin to 3,4', function() {
			var point1 = {left: 0, top: 0};
			var point2 = {left: 3, top: 4};
			var distance = planetController.calcDistanceBetweenPoints(point1,point2);
			expect(distance).toEqual(5);
		});
		
		it('calculates the distance from the origin to -3,4', function() {
			var point1 = {left: 0, top: 0};
			var point2 = {left: -3, top: 4};
			var distance = planetController.calcDistanceBetweenPoints(point1,point2);
			expect(distance).toEqual(5);
		});
		
		it('calculates the distance from the origin to -3,-4', function() {
			var point1 = {left: 0, top: 0};
			var point2 = {left: -3, top: -4};
			var distance = planetController.calcDistanceBetweenPoints(point1,point2);
			expect(distance).toEqual(5);
		});
		
		it('calculates the distance from 5,5 to 8,9', function() {
			var point1 = {left: 5, top: 5};
			var point2 = {left: 8, top: 9};
			var distance = planetController.calcDistanceBetweenPoints(point1,point2);
			expect(distance).toEqual(5);
		});
	});

	describe('checkWindowConstraints', function () {
		beforeEach(function() {
			$(	'<div id="container" style="width: 100vw; height: 100vh; position: relative;">' +
				'	<div id="planet-draggable3" class="planet-draggable" style="position: absolute;	z-index: 100; width: 20vw; height: 20vh">' +
				'		<img id="planet3" class="planet-img" src="img/planet3.png" style="position: relative; width: 20vw; height: 20vw;"></img>' +
				'	</div>' +
				'</div>'
			).appendTo('body');
			
			this.fakePlanet = new Planet('#planet-draggable3');
		})
		
		it('makes sure the proposed position 20,40 is not outside the window', function() {
			var proposedXpos = 20;
			var proposedYpos = 40;
			var newPoint = planetController.checkWindowConstraints(this.fakePlanet, proposedXpos, proposedYpos);
			
			expect(newPoint.left).toEqual(20);
			expect(newPoint.top).toEqual(40);
		});
		
		it('checks whether the proposed position (window-width, window-height) is outside the window', function() {
			var proposedXpos = $(window).width();
			var proposedYpos = $(window).height();
			var newPoint = planetController.checkWindowConstraints(this.fakePlanet, proposedXpos, proposedYpos);
			expect(newPoint.left).toBeLessThanOrEqual(proposedXpos);
			expect(newPoint.top).toBeLessThanOrEqual(proposedYpos);
			expect(newPoint.left).toEqual($(window).width() - $(this.fakePlanet.name).width());
			expect(newPoint.top).toEqual($(window).height() - $(this.fakePlanet.name).height());
		});
		
		it('checks whether the proposed position (window-width+1, window-height+1) is outside the window', function() {
			var proposedXpos = $(window).width() + 1;
			var proposedYpos = $(window).height() + 1;
			var newPoint = planetController.checkWindowConstraints(this.fakePlanet, proposedXpos, proposedYpos);
			expect(newPoint.left).not.toEqual(proposedXpos);
			expect(newPoint.top).not.toEqual(proposedYpos);
			expect(newPoint.left).toEqual($(window).width() - $(this.fakePlanet.name).width());
			expect(newPoint.top).toEqual($(window).height() - $(this.fakePlanet.name).height());
		});
		
		afterEach(function(){
			$('#container').remove();
		});
	});

	describe('setPosition', function() {
		beforeEach(function() {
			$(	'<div id="container" style="width: 100vw; height: 100vh; position: relative;">' +
				'	<div id="planet-draggable3" class="planet-draggable" style="position: absolute;	z-index: 100; width: 20vw; height: 20vh">' +
				'		<img id="planet3" class="planet-img" src="img/planet3.png" style="position: relative; width: 20vw; height: 20vw;"></img>' +
				'	</div>' +
				'</div>'
			).appendTo('body');
			
			this.fakePlanet = new Planet('#planet-draggable3');
		});
		
		it('Sets the position of a planet to 5%,5%', function() {
			this.fakePlanet.setPosition('5%','5%');
			expect($(this.fakePlanet.name).offset().left).toEqual(Math.round($(window).width() * 0.05));
			expect($(this.fakePlanet.name).offset().top).toEqual(Math.round($(window).height() * 0.05));
		});
		
		it('Sets the position of a planet to 5,5', function() {
			this.fakePlanet.setPosition(5,5);
			expect($(this.fakePlanet.name).offset().top).toEqual(5);
			expect($(this.fakePlanet.name).offset().left).toEqual(5);
		});
		
		afterEach(function(){
			$('#container').remove();
		});
	});
	
	describe('increaseDistance', function() {
				//// TODO need to test recursion !!!!
		
		it('returns a point that is father from the comparison point (40,0) than the min distance, 75, from the pointToMove (0,30)', function() {
			var minDistance = 75;
			var maxDistance = 100;
			var pointToMove = {left: 0, top: 30};
			var comparisonPoint = {left: 40, top: 0};
			var movedPoint = planetController.increaseDistance(pointToMove, comparisonPoint, minDistance, maxDistance);
			var newDistance = planetController.calcDistanceBetweenPoints(movedPoint, comparisonPoint);
			expect(newDistance).toBeLessThan(maxDistance);
			expect(newDistance).toBeGreaterThan(minDistance);
		});
		
		it('increase the distance between 2 points, (30, 40) and (5,5) with a min distance of 60 and max distance of 100', function() {
			var maxDistance = 100; 
			var minDistance = 60;
			var pointToMove = {left: 30, top: 40};
			var comparisonPoint = {left: 5, top: 5};
			var movedPoint = planetController.increaseDistance(pointToMove, comparisonPoint, minDistance, maxDistance);
			var newDistance = planetController.calcDistanceBetweenPoints(movedPoint, comparisonPoint);
			expect(newDistance).toBeLessThan(maxDistance);
			expect(newDistance).toBeGreaterThan(minDistance);
		});
		
		it('does not increase the distance between 2 points, (50,50) and (0,0) which are already more than the min distance of 20 apart', function() {
			var maxDistance = 100; 
			var minDistance = 20;
			var pointToMove = {left: 50, top: 50};
			var comparisonPoint = {left: 0, top: 0};
			var movedPoint = planetController.increaseDistance(pointToMove, comparisonPoint, minDistance, maxDistance);
			var newDistance = planetController.calcDistanceBetweenPoints(movedPoint, comparisonPoint);
			expect(newDistance).toBeLessThan(maxDistance);
			expect(newDistance).toBeGreaterThan(minDistance);
			expect(movedPoint).toEqual(pointToMove);
		});
		
	});
	
	describe('reduceDistance', function() {
		//// TODO need to test recursion !!!!
		
		it('returns a point that is closer to the comparison point (40,0) than the max distance of 20 from the pointToMove (0,30)', function() {
			var minDistance = 10;
			var maxDistance = 20;
			var pointToMove = {left: 0, top: 30};
			var comparisonPoint = {left: 40, top: 0};
			var movedPoint = planetController.reduceDistance(pointToMove, comparisonPoint, minDistance, maxDistance);
			var newDistance = planetController.calcDistanceBetweenPoints(movedPoint, comparisonPoint);
			expect(newDistance).toBeLessThan(maxDistance);
			expect(newDistance).toBeGreaterThan(minDistance);
		});
		
		it('reduces the distance between 2 points, (300,400) and (5,5), to less than 100 but more than 50', function() {
			var maxDistance = 100; 
			var minDistance = 50;
			var pointToMove = {left: 300, top: 400};
			var comparisonPoint = {left: 5, top: 5};
			var movedPoint = planetController.reduceDistance(pointToMove, comparisonPoint, minDistance, maxDistance);
			var newDistance = planetController.calcDistanceBetweenPoints(movedPoint, comparisonPoint);
			expect(newDistance).toBeLessThan(maxDistance);
			expect(newDistance).toBeGreaterThan(minDistance);
		});
		
		it('does not reduce the distance between 2 points, (50,50) and (0,0), which are less than the max distance of 100 apart', function() {
			var maxDistance = 100; 
			var minDistance = 50;
			var pointToMove = {left: 50, top: 50};
			var comparisonPoint = {left: 0, top: 0};
			var movedPoint = planetController.reduceDistance(pointToMove, comparisonPoint, minDistance, maxDistance);
			var newDistance = planetController.calcDistanceBetweenPoints(movedPoint, comparisonPoint);
			expect(newDistance).toBeLessThan(maxDistance);
			expect(newDistance).toBeGreaterThan(minDistance);
			expect(movedPoint).toEqual(pointToMove);
		});
		
	});

	describe('adjustDistanceIfNecessary', function() {
		it('moves a point (0,30) father from the comparison point (40,0) than the min distance, 75, (and less than the max distance, 100, apart)', function() {
			var minDistance = 75;
			var maxDistance = 100;
			var pointToMove = {left: 0, top: 30};
			var comparisonPoint = {left: 40, top: 0};
			var movedPoint = planetController.adjustDistanceIfNecessary(pointToMove, comparisonPoint, minDistance, maxDistance);
			var newDistance = planetController.calcDistanceBetweenPoints(movedPoint, comparisonPoint);
			expect(newDistance).toBeLessThan(maxDistance);
			expect(newDistance).toBeGreaterThan(minDistance);
		});
		
		it('moves a point (0,30) to between the max distance 80, and min distance 78, from the comparison point (40,0)', function() {
			var minDistance = 78;
			var maxDistance = 80;
			var pointToMove = {left: 0, top: 30};
			var comparisonPoint = {left: 40, top: 0};
			var movedPoint = planetController.adjustDistanceIfNecessary(pointToMove, comparisonPoint, minDistance, maxDistance);
			var newDistance = planetController.calcDistanceBetweenPoints(movedPoint, comparisonPoint);
			expect(newDistance).toBeLessThan(maxDistance);
			expect(newDistance).toBeGreaterThan(minDistance);
		});
		
		it('throws an exception if the min distance is greater than the max distance', function() {
			expect(function(){ 
				var pointToMove = {left: 2, top: 2};
			var comparisonPoint = {left: 10, top: 10};
				var minDistance = 10;
				var maxDistance = 9;
				planetController.adjustDistanceIfNecessary(pointToMove, comparisonPoint, minDistance, maxDistance)
			}).toThrowError(/is greater than the maximum distance/);
		});
	});

	describe('isLessThanMaxDistanceApart', function() {
		it('returns true if the distance is no more than the max distance', function() {
			var point1 = {left: 0, top: 30};
			var point2 = {left: 40, top: 0};
			var maxDistance = 100;
			expect(planetController.isLessThanMaxDistanceApart(point1, point2, maxDistance)).toBeTruthy();
		});
		
		it('returns true if the distance is equal to the max distance', function() {
			var point1 = {left: 0, top: 30};
			var point2 = {left: 40, top: 0};
			var maxDistance = 50;
			expect(planetController.isLessThanMaxDistanceApart(point1, point2, maxDistance)).toBeTruthy();
		});
		
		it('returns false if the distance is more than the max distance', function() {
			var point1 = {left: 0, top: 30};
			var point2 = {left: 40, top: 0};
			var maxDistance = 10;
			expect(planetController.isLessThanMaxDistanceApart(point1, point2, maxDistance)).toBeFalsy();
		});
	});

	describe('isGreaterThanMinDistanceApart', function() {
		it('returns true if the distance is no less than the min distance', function() {
			var point1 = {left: 0, top: 30};
			var point2 = {left: 40, top: 0};
			var minDistance = 20;
			expect(planetController.isGreaterThanMinDistanceApart(point1, point2, minDistance)).toBeTruthy();
		});
		
		it('returns true if the distance is equal to the min distance', function() {
			var point1 = {left: 0, top: 30};
			var point2 = {left: 40, top: 0};
			var minDistance = 50;
			expect(planetController.isGreaterThanMinDistanceApart(point1, point2, minDistance)).toBeTruthy();
		});
		
		it('returns false if the distance is less than the min distance', function() {
			var point1 = {left: 0, top: 30};
			var point2 = {left: 40, top: 0};
			var minDistance = 60;
			expect(planetController.isGreaterThanMinDistanceApart(point1, point2, minDistance)).toBeFalsy();
		});
	});

	describe('findMidPoint', function() {
		it('returns a point (10,10) which is midway between the given points (0,20) and (20,0)', function() {
			var point1 = {left: 0, top: 20};
			var point2 = {left: 20, top: 0};
			var expectedPoint = {left: 10, top: 10};
			expect(planetController.findMidPoint(point1, point2)).toEqual(expectedPoint);
		});
		
		it('returns a point (55,60) which is midway between the given points (10,80) and (100,40)', function() {
			var point1 = {left: 10, top: 80};
			var point2 = {left: 100, top: 40};
			var expectedPoint = {left: 55, top: 60};
			expect(planetController.findMidPoint(point1, point2)).toEqual(expectedPoint);
		});
		
		it('returns a point (10,10) which is midway between the given points (0,0) and (20,20)', function() {
			var point1 = {left: 0, top: 0};
			var point2 = {left: 20, top: 20};
			var expectedPoint = {left: 10, top: 10};
			expect(planetController.findMidPoint(point1, point2)).toEqual(expectedPoint);
		});
		
		it('returns a point (15,15) which is midway between the given points (0,0) and (20,20) given a reduction ration of 0.75', function() {
			var point1 = {left: 0, top: 0};
			var point2 = {left: 20, top: 20};
			var expectedPoint = {left: 15, top: 15};
			expect(planetController.findMidPoint(point1, point2, 0.75)).toEqual(expectedPoint);
		});
		
	});

	describe('findExtensionPoint', function() {		
		var increaseRatio = 0.5;
		
		it('returns a point (50,50) which is 50% farther away from the comparisonPoint (20,20) than the pointToMove (40,40)', function() {
			var comparisonPoint = {left: 20, top: 20};
			var pointToMove = {left: 40, top: 40};
			var newPoint = planetController.findExtensionPoint(pointToMove, comparisonPoint, increaseRatio);
			expect(newPoint).toEqual({left: 50, top: 50});
		});
		
		it('returns a point (10,10) which is 50% farther away from the comparisonPoint (40,40) than  the pointToMove (20,20)', function() {
			var pointToMove = {left: 20, top: 20};
			var comparisonPoint = {left: 40, top: 40};
			var newPoint = planetController.findExtensionPoint(pointToMove, comparisonPoint, increaseRatio);
			expect(newPoint).toEqual({left: 10, top: 10});
		});
		
		it('returns a point (0,30) which is 50% farther away in just the y dimension from the comparisonPoint (20,0) than the pointToMove (0,20)', function() {
			var pointToMove = {left: 0, top: 20};
			var comparisonPoint = {left: 20, top: 0};
			var newPoint = planetController.findExtensionPoint(pointToMove, comparisonPoint, increaseRatio);
			expect(newPoint).toEqual({left: 0, top: 30});
		});
		
		it('returns a point (30,0) which is 50% farther away in just the x dimension from the comparisonPoint (0,20) than the pointToMove (20,0)', function() {
			var pointToMove = {left: 20, top: 0};
			var comparisonPoint = {left: 0, top: 20};
			var newPoint = planetController.findExtensionPoint(pointToMove, comparisonPoint, increaseRatio);
			expect(newPoint).toEqual({left: 30, top: 0});
		});
		
		it('returns a point at the maxWidth, given a pointToMove at the max width, and a comparisonPoint at the maxHeight which are 50px apart. The new point should be further from the comparisonPoint than 50px', function() {
			var maxWidth = $(window).width();
			var maxHeight = $(window).height();
			var pointToMove = {left: maxWidth, top: maxHeight - 30};
			var comparisonPoint = {left: maxWidth - 40, top: maxHeight};
			var newPoint = planetController.findExtensionPoint(pointToMove, comparisonPoint, increaseRatio);
			var newDistance = planetController.calcDistanceBetweenPoints(newPoint, comparisonPoint);
			expect(newPoint).toEqual({left: maxWidth, top: maxHeight - 45});
			expect(newDistance).toBeGreaterThan(50);
		});
	});

	describe('findPlanetClosestToPoint', function() {
		beforeEach(function() {
			$(	'<div id="container" style="width: 100vw; height: 100vh; position: relative;">' +
				'	<div id="planet-draggable2" class="planet-draggable" style="position: absolute;	z-index: 100; width: 20vw; height: 20vh">' +
				'		<img id="planet3" class="planet-img" src="img/planet2.png" style="position: relative; width: 20vw; height: 20vw;"></img>' +
				'	</div>' +
				'	<div id="planet-draggable3" class="planet-draggable" style="position: absolute;	z-index: 100; width: 20vw; height: 20vh">' +
				'		<img id="planet3" class="planet-img" src="img/planet3.png" style="position: relative; width: 20vw; height: 20vw;"></img>' +
				'	</div>' +
				'</div>'
			).appendTo('body');
			
			this.planet2 = new Planet('#planet-draggable2');
			this.planet2.init();
			this.planet3 = new Planet('#planet-draggable3');
			this.planet3.init();
		});
		
		it('returns planet2 as it is closer to 0,0 than planet 3', function() {
			this.planet2.setPosition(5,5);
			this.planet3.setPosition(100,100);
			expect(planetController.findPlanetClosestToPoint(this.planet2, this.planet3, 0, 0)).toEqual(this.planet2);
		});
		
		afterEach(function(){
			$('#container').remove();
		});
	});
	
	describe('planetController.init', function() {
		beforeEach(function() {
			$(	'<div id="container" style="width: 100vw; height: 100vh; position: relative;">' +
				'	<div id="planet-draggable1" class="planet-draggable" style="position: absolute;	z-index: 100; width: 20vw; height: 20vh">' +
				'		<img id="planet1" class="planet-img" src="img/planet1.png" style="position: relative; width: 20vw; height: 20vw;"></img>' +
				'	</div>' +
				'	<div id="planet-draggable2" class="planet-draggable" style="position: absolute;	z-index: 100; width: 20vw; height: 20vh">' +
				'		<img id="planet2" class="planet-img" src="img/planet2.png" style="position: relative; width: 20vw; height: 20vw;"></img>' +
				'	</div>' +
				'	<div id="planet-draggable3" class="planet-draggable" style="position: absolute;	z-index: 100; width: 20vw; height: 20vh">' +
				'		<img id="planet3" class="planet-img" src="img/planet3.png" style="position: relative; width: 20vw; height: 20vw;"></img>' +
				'	</div>' +
				'</div>'
			).appendTo('body');
		});
	
		it('sets up the _planets array', function() {
			planetController.init();
			expect(planetController.getPlanets().length).toEqual(3);
		});
		
		afterEach(function(){
			$('#container').remove();
		});
	}); 
	
	describe('comparePoints', function() {
		var point1, point2;
		beforeEach(function() {
			point1 = {left: 10, top: 20};
			point2 = {left: 10, top: 20};
		});
		it('returns true if 2 points are equal', function() {
			
			planetController.comparePoints(point1, point2);
			expect(planetController.comparePoints(point1, point2)).toBeTruthy();
		});
	});
