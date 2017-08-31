console.log('started menu.js');

//// QQQQ it would be cool to hold one planet with one finger and move the other to a fixed distance away with the other

$(document).ready(function() {
	if (!planetController.getPlanets() || planetController.getPlanets().length == 0) {
		planetController.init();
	}
});

$(window).on('load', function() {
	if (!planetController.getPlanets() || planetController.getPlanets().length == 0) {
		planetController.init();
	}		
});



function Planet(divId) {
	this.name = divId;
	this.div = $(divId);
	this.maxDistanceFromNeighbor = 125;
	this.minDistanceFromNeighbor = 85;
	this.eventCache = new Array();
	this.distanceBetweenPointers = -1;
	this.positionUpdated = false;

	this.init = function() {
		this.div.on('pointerdown', {'eventCache': this.eventCache}, this.onPointerDown);
		this.div.on('pointermove', {
				'eventCache': this.eventCache,
				'distanceBetweenPointers': this.distanceBetweenPointers
			}, this.onPointerMove);
		this.div.on('pointerout', {'eventCache': this.eventCache}, this.onPointerUp);
		this.div.on('pointercancel', {'eventCache': this.eventCache}, this.onPointerUp);
		this.div.on('pointerleave', {'eventCache': this.eventCache}, this.onPointerUp);
		this.updatePosition();
	}

	this.onPointerDown = function(event) {
		event.data.eventCache.push(event);
	}

	this.onPointerMove = function(event) {
		var i, newDistanceBetweenPointers;
		// Find this event in the cache and update its record with this event
		for (var i = 0; i < event.data.eventCache.length; i++) {
			if (event.pointerId == event.data.eventCache[i].pointerId) {
				event.data.eventCache[i] = event;
				break;
			}
		}

		// If two pointers are down, check for pinch gestures
		if (event.data.eventCache.length == 2) {
			// Calculate the distance between the two pointers
			newDistanceBetweenPointers = planetController.calcDistanceBetweenPoints(
				event.data.eventCache[0].clientX, event.data.eventCache[0].clientY,
				event.data.eventCache[1].clientX, event.data.eventCache[1].clientY);

			if (newDistanceBetweenPointers > 0) {
				if (newDistanceBetweenPointers > event.data.distanceBetweenPointers) {
					// The distance between the two pointers has increased
					console.log('Pinch moving OUT -> Zoom in');
					////// zoom out here - ??? need to do anything?
				} else if (newDistanceBetweenPointers < event.data.distanceBetweenPointers) {
					// The distance between the two pointers has decreased
					console.log('Pinch moving IN -> Zoom out');
					///// zoom in here - ???? show chapter? could the chapter be made really small? then the text magnified?
				}
				$(event.target).css('width', newDistanceBetweenPointers + 'px');
				$(event.target).css('height', newDistanceBetweenPointers + 'px');
			}

			// Cache the distance for the next move event
			event.data.distanceBetweenPointers = newDistanceBetweenPointers;
		}
	}

	this.onPointerUp = function(event) {
		// remove event from cache
		for (var i = 0; i < event.data.eventCache.length; i++) {
			if (event.data.eventCache[i].pointerId == event.pointerId) {
				event.data.eventCache.splice(i, 1);
				break;
			}
		}
		// If the number of pointers down is less than two then reset diff tracker
		if (event.data.eventCache.length < 2) {
			this.distanceBetweenPointers = -1;
		}
	}
	
	this.updatePosition = function() {
		this.x = $(this.name).offset().left;
		this.y = $(this.name).offset().top;
	}
	
	this.setPosition = function(x,y, centerIt) {
		var xPercent, yPercent, xCenterOffset, yCenterOffset, currentOffset;
		
		// convert e.g. '20%' to 20 and calculate the actual pixels for 20%
		if (typeof x == 'string' && (x.match('%').length > 0 || x.match('vw').length > 0)) {
			xPercent  = parseFloat(x)/100;
			x = Math.round(xPercent * $(window).width());
		}
		if (typeof y == 'string' && (y.match('%').length > 0 ||  y.match('vh').length > 0)) {
			yPercent  = parseFloat(y)/100;
			y = Math.round(yPercent * $(window).height());
		}
		
		if (centerIt) {
			xCenterOffset = $(this.name).width() / 2;
			yCenterOffset = $(this.name).height() / 2;
			$(this.name).offset({left: x - xCenterOffset, top: y - yCenterOffset});
		} else {
			$(this.name).offset({left: x, top: y});
		}
		
		this.x = $(this.name).offset().left;
		this.y = $(this.name).offset().top;
	}
}

var planetController = (function() {
	var _planets = [];
	var _links = [];
	var _planetsToMake = [
		{name: '#planet-draggable1', position: {left: '20%', top: '30%'}}, 
		{name: '#planet-draggable2', position: {left: '20%', top: '50%'}}, 
		{name: '#planet-draggable3', position: {left: '50%', top: '30%'}}, 
	];

	return {
		init: function() {
			var i;
			for (i=0; i<_planetsToMake.length; i++) {
				newPlanet = new Planet(_planetsToMake[i].name)
				_planets.push(newPlanet);
				newPlanet.setPosition(_planetsToMake[i].position.left, _planetsToMake[i].position.top)
			}
			
			for (i in _planets) {
				_planets[i].init();
			}
			
			_links = [
				{planetA: _planets[0], planetB: _planets[1]},
				{planetA: _planets[0], planetB: _planets[2]},
				{planetA: _planets[1], planetB: _planets[2]},
			];

			$('.planet-draggable').children().show();
			$('.planet-draggable').draggable({
				start: function() {},
				drag: function(event, ui) {
					planetController.onPlanetDrag(event, ui);
				},
				stop: function(event, ui) {
					planetController.onPlanetStopDrag(event, ui);
				},
			});
		},
	
		onPlanetDrag: function(event, ui) {
			var planetBeingDragged = event.target;
			planetController.addTransition(planetBeingDragged, ui.position.left, ui.position.top);
		},

		onPlanetStopDrag: function(event, ui) {
			var i, positionAdjusted;
			var elementBeingDragged = event.target;
			var planetBeingDragged = this.getPlanetByName(elementBeingDragged.id);
			
			this.resetAllPlanetPositionUpdateFlags();
			this.adjustPosition(planetBeingDragged);
			this.adjustPositionOfLinkedPlanets(planetBeingDragged);
		},
		
		resetAllPlanetPositionUpdateFlags: function() {
			var i;
			for (i in _planets) {
				_planets[i].positionUpdated = false;
			}
		},
		
		/**
		* move the position of the planet, either to keep within the window or to keep within the allowed distance from the comparisonPlanet 
		*/
		/// TODO: main problem here is that the planet originally moved gets moved again. It needs to stay where it is
		adjustPosition: function(planet, comparisonPlanet) {
			var updatedPoint;
			var originalPoint = {left: planet.x, top: planet.y};
			if (comparisonPlanet) {
				updatedPoint = this.checkPlanetDistanceConstraints(planet, comparisonPlanet);
			} else {
				updatedPoint = this.checkWindowConstraints(planet);
			}
			if (!this.pointEqualityTest(updatedPoint, originalPoint) && !planet.positionUpdated) {
				this.addTransition(planet, updatedPoint.left, updatedPoint.top);
				//this.adjustPositionOfLinkedPlanets(planet);
				this.adjustPositionOfAllPlanets(planet);
				planet.positionUpdated = true;
			}
		},
		
		/**
		* move the position of all the planets linked, directly or indirectly, either to keep within the window or to keep within the allowed distance from
		* the given planet
		*/
		adjustPositionOfLinkedPlanets: function(planet) {
			var i;
			for (i in _links) {
				if (_links[i].planetA == planet) {
					this.adjustPosition(_links[i].planetB, planet);
				} else if (_links[i].planetB == planet) {
					this.adjustPosition(_links[i].planetA, planet);
				}
			} 
		},
		
		adjustPositionOfAllPlanets: function(planetMovedByUser) {
			var i, planetA, planetB, originalPointA, originalPointB, updatedPointA, updatedPointB, windowConstrainedPointA, windowConstrainedPointB;
			for (i in _links) {
				planetA = _links[i].planetA;
				planetB = _links[i].planetB;
				originalPointA = {left: planetA.x, top: planetA.y};
				originalPointB = {left: planetB.x, top: planetB.y};
				
				/// TODO - make these 2 similar if blocks into a function
				
				// update point A first
				if (planetA != planetMovedByUser) {
					updatedPointA = this.checkPlanetDistanceConstraints(planetA, planetB);
					windowConstrainedPointA = this.checkWindowConstraints(planetA, updatedPointA);
					
					if (!this.pointEqualityTest(windowConstrainedPointA, originalPointA)) {
						planetA.positionUpdated = true;
						this.addTransition(planetA, windowConstrainedPointA.left, windowConstrainedPointA.top);
					}
				}
				
				// now update B 
				if (planetB != planetMovedByUser) {
					updatedPointB = this.checkPlanetDistanceConstraints(planetB, planetA);
					windowConstrainedPointB = this.checkWindowConstraints(planetB, updatedPointB);
				
					if (!this.pointEqualityTest(windowConstrainedPointB, originalPointB)) {
						planetB.positionUpdated = true;
						this.addTransition(planetB, windowConstrainedPointB.left, windowConstrainedPointB.top);
					}
				}
					
			}
		},
		
		addTransition: function(planet, xpos, ypos) {
			$(planet.name).css({
				'-webkit-transition': '1s',
				'-moz-transition': '1s',
				'-ms-transition': '1s',
				'-o-transition': '1s',
				'transition': '1s',
				'left': xpos + 'px',
				'top': ypos + 'px',
				'-webkit-transition-timing-function': 'cubic-bezier(.13,.82,.34,1.47)', // see http://cubic-bezier.com/#.13,.82,.34,1.47 
				'-moz-transition-timing-function': 'cubic-bezier(.13,.82,.34,1.47)',
				'-ms-transition-timing-function': 'cubic-bezier(.13,.82,.34,1.47)',
				'-o-transition-timing-function': 'cubic-bezier(.13,.82,.34,1.47)',
				'transition-timing-function': 'cubic-bezier(.13,.82,.34,1.47)'
			});

			$(planet.name).on('transitionend', function(event) {
				$(planet.name).css({
					'-webkit-transition': '',
					'-moz-transition': '',
					'-ms-transition': '',
					'-o-transition': '',
					'transition': '',
				});
				planet.updatePosition();
			});
		},
		
		/**
		* make sure that this element isn't outside the window
		* @param Planet planet 
		* @param Point proposedPoint - in the format {left: 0, top: 0} - optional
		*/
		checkWindowConstraints: function(planet, proposedPoint) {
			var xpos, ypos;
			var winHeight = $(window).height();
			var winWidth = $(window).width();
			var elWidth = $(planet.name).width();
			var elHeight = $(planet.name).height();
			if (proposedPoint) {
				xpos = proposedPoint.left;
				ypos = proposedPoint.top;
			} else {
				xpos = $(planet.name).offset().left;
				ypos = $(planet.name).offset().top;
			}
			
			//is element too far to the left?
			if (xpos < 0) {
				xpos = 0;
			}
			
			//is element too far to the right?
			if ((xpos + elWidth) > winWidth) {
				xpos = winWidth - elWidth;
			}
			
			// is element too far up?
			if (ypos < 0) {
				ypos = 0;
			}
			
			//is element too far down?
			if ((ypos + elHeight) > winHeight) {
				ypos = winHeight - elHeight;
			}
			return {left: xpos, top: ypos};
		},
		
		/**
		* make sure the distance between a planet and a comparison planet is not greater than the max distance, or smaller than the min distance
		*/
		checkPlanetDistanceConstraints: function(planetToMove, comparisonPlanet, proposedXpos, proposedYpos) {
			var pointToMove, updatedPoint, comparisonPoint, planetToMoveNewXpos, planetToMoveNewYpos, distanceBetweenPlanets, deltaX, deltaY;
			var newPositionProposed = proposedXpos && proposedYpos ? true : false;
			if (!newPositionProposed) {
				planetToMove.updatePosition();
				pointToMove = {left: planetToMove.x, top: planetToMove.y};		
			} else {
				pointToMove = {left: proposedXpos, top: proposedYpos}
			}
			comparisonPlanet.updatePosition();
			comparisonPoint = {left: comparisonPlanet.x, top: comparisonPlanet.y};
			updatedPoint = this.adjustDistanceIfNecessary(pointToMove, comparisonPoint,  planetToMove.minDistanceFromNeighbor, planetToMove.maxDistanceFromNeighbor);
			return updatedPoint;
		},
		
		adjustDistanceIfNecessary: function(pointToMove, comparisonPoint, minDistance, maxDistance) {
			var movedPoint = pointToMove; // default is not to change the initial position of the point 
			if (minDistance > maxDistance) {
				throw new Error('Error: minimum distance ' + minDistance + ' is greater than the maximum distance ' + maxDistance);
			} else if (maxDistance < minDistance) {
				throw new Error('Error: maximum distance ' + maxDistance + ' is less than the minimum distance ' + minDistance);
			}
			if (!this.isLessThanMaxDistanceApart(pointToMove, comparisonPoint, maxDistance)) {
				movedPoint = this.reduceDistance(pointToMove, comparisonPoint, minDistance, maxDistance);
			} else if (!this.isGreaterThanMinDistanceApart(pointToMove, comparisonPoint, minDistance)) {
				movedPoint = this.increaseDistance(pointToMove, comparisonPoint, minDistance, maxDistance);
			}
			return movedPoint;
		},
		
		reduceDistance: function(pointToMove, comparisonPoint, minDistance, maxDistance, reductionRatio) {
			var increaseRatio;
			if (!reductionRatio) {
				reductionRatio = 0.5;
			}
			var movedPoint = this.getDecreasedPosition(pointToMove, comparisonPoint, minDistance, maxDistance, reductionRatio);
			if (!this.isLessThanMaxDistanceApart(movedPoint, comparisonPoint, maxDistance)) {
				movedPoint = this.reduceDistance(movedPoint, comparisonPoint, minDistance, maxDistance, reductionRatio);
			} else if (!this.isGreaterThanMinDistanceApart(movedPoint, comparisonPoint, minDistance)) {
				movedPoint = this.increaseDistance(movedPoint, comparisonPoint, minDistance, maxDistance, increaseRatio);
			}
			return movedPoint;
		},
		
		getDecreasedPosition: function(pointToMove, comparisonPoint, minDistance, maxDistance, reductionRatio) {
			var newPoint;
			
			// first check that we really need to do anything
			if (this.isLessThanMaxDistanceApart(pointToMove, comparisonPoint, maxDistance)) {
				return pointToMove;
			}
			newPoint = this.findMidPoint(pointToMove, comparisonPoint, reductionRatio);
			return newPoint;
		},
		
		increaseDistance: function(pointToMove, comparisonPoint, minDistance, maxDistance, increaseRatio) {
			var reductionRatio;
			if (!increaseRatio) {
				increaseRatio = 2;
			}
			var movedPoint = this.getIncreasedPosition(pointToMove, comparisonPoint, minDistance, maxDistance, increaseRatio);
			if (!this.isGreaterThanMinDistanceApart(movedPoint, comparisonPoint, minDistance)) {
				movedPoint = this.increaseDistance(movedPoint, comparisonPoint, minDistance, maxDistance, increaseRatio);
			} else if (!this.isLessThanMaxDistanceApart(movedPoint, comparisonPoint, maxDistance)) {
				movedPoint = this.reduceDistance(movedPoint, comparisonPoint, minDistance, maxDistance, reductionRatio);
			}
			return movedPoint;
		},
		
		getIncreasedPosition: function(pointToMove, comparisonPoint, minDistance, maxDistance, increaseRatio) {
			var newPoint;
			
			// first check that we really need to do anything
			if (this.isGreaterThanMinDistanceApart(pointToMove, comparisonPoint, minDistance)) {
				return pointToMove;
			}
			newPoint = this.findExtensionPoint(pointToMove, comparisonPoint, increaseRatio);	
			return newPoint;
		},
		
		/**
		* Given 2 points, we can make a right triangle defined by 
		* (point1.x, point1.y) 
		* (point2.x, point2.y)
		* (point1.x, point2.y)
		*
		* the mid point on the hypotenuse is given by
		* midPointX = (point2.x - point1.x)/2 + point1.x
		* midPointY = (point1.y - point2.y)/2 + point2.y
		* @param point1 A point given in the format {left: x, top: y}
		* @param point2 A point given in the format {left: x, top: y}
		* @param reductionRatio a ratio that is used to get something other than the exact midpoint
		* @return a point given in the format {left: x, top: y}
		*/
		findMidPoint: function(point1, point2, reductionRatio) {
			if (!reductionRatio) {
				reductionRatio = 0.5;
			}
			var leftMostPoint = point1.left - point2.left < 0 ? point1 : point2;
			var topMostPoint = point1.top - point2.top < 0 ? point1 : point2;
			var midPointX = (Math.abs(point2.left - point1.left) * reductionRatio) + leftMostPoint.left;
			var midPointY = (Math.abs(point1.top - point2.top) * reductionRatio) + topMostPoint.top;
			return {left: midPointX, top: midPointY};
		},
		
		/**
		* findExtensionPoint
		* @param pointToMove A point given in the format {left: x, top: y}
		* @param comparisonPoint A point given in the format {left: x, top: y}
		* @param increaseRatio a ratio that gives the distance of the extension as a proportion of the current distance between the points 
		* @return a point that is further away from comparisonPoint in the format {left: x, top: y}
		*/
		findExtensionPoint: function(pointToMove, comparisonPoint, increaseRatio) {
			// calcuate the absolute value of 1/2 distance between the 2 points - the amountToMove
			// if the point is closer to origin than the amountToMove then move it away from the origin
			//  - start with the position of the comparisonPoint, then move the pointToMove by the distance between the 2 points, 
			//    plus the amountToMove, in the direction away from the origin (ie positive direction)
			// if the point is closer to edge of the window than the amountToMove then move it toward the origin
			//  - start with the position of the comparisonPoint, then move the pointToMove by the distance between the 2 points, 
			//    plus the amountToMove, in the direction toward from the origin (ie negative direction)
			// if neither, then move away from the origin (positive direction) by the amountToMove.
			// do this in both the x and y directions
			
			var newPointX, newPointY;
			var amountToMoveX = Math.abs(comparisonPoint.left - pointToMove.left) * increaseRatio;
			var amountToMoveY = Math.abs(pointToMove.top - comparisonPoint.top) * increaseRatio;
			var maxWidth = $(window).width();
			var maxHeight = $(window).height();
			
			newPointX = this.moveCoordinatesApart(pointToMove.left, comparisonPoint.left, amountToMoveX, maxWidth);
			newPointY = this.moveCoordinatesApart(pointToMove.top, comparisonPoint.top, amountToMoveY, maxHeight);
			
			return {left: newPointX, top: newPointY};
		},
		
		moveCoordinatesApart: function(coordToMove, comparisonCoord, amountToMove, maxCoord) {
			var newCoord;
			if (coordToMove >= comparisonCoord) {
				newCoord = coordToMove + amountToMove;
				if (newCoord > maxCoord) {
					newCoord = maxCoord;
				}
			} else {
				newCoord = coordToMove - amountToMove;
				if (newCoord < 0) {
					newCoord = 0;
				}
			}
			return newCoord;
		},
				
		/***
		* @param point1 Array with 2 elements [x,y]
		* @param point2 Array with 2 elements [x,y]
		* @param maxDistance Number the maximum distance allowed between the 2 points
		* @return Boolean true if distance Between Points is less than or equal to the maxDistance
		*/
		isLessThanMaxDistanceApart: function(point1, point2, maxDistance) {
			var distance = this.calcDistanceBetweenPoints(point1, point2);
			if (distance <= maxDistance) {
				return true;
			} else {
				return false;
			}
		},
		
		/***
		* @param point1 Array with 2 elements [x,y]
		* @param point2 Array with 2 elements [x,y]
		* @param maxDistance Number the maximum distance allowed between the 2 points
		* @return Boolean true if distance Between Points is greater than or equal to the minDistance
		*/
		isGreaterThanMinDistanceApart: function(point1, point2, minDistance) {
			var distance = this.calcDistanceBetweenPoints(point1, point2);
			if (distance >= minDistance) {
				return true;
			} else {
				return false;
			}
		},
		
		/*
		* haven't used this but keeping it here in case it is useful in future
		*/
		findPlanetClosestToPoint: function(planet1, planet2, x, y) {
			var planet1Point = {left: planet1.x, top: planet1.y};
			var planet2Point = {left: planet2.x, top: planet2.y};
			var pointToTest = {left: x, top: y};
			var planet1DistFromPoint = this.calcDistanceBetweenPoints(planet1Point, pointToTest);
			var planet2DistFromPoint = this.calcDistanceBetweenPoints(planet2Point, pointToTest);
			if (planet1DistFromPoint <= planet2DistFromPoint) {
				return planet1;
			} else {
				return planet2;
			}
		},
		
		calcDistanceBetweenPoints: function(point1, point2) {
			var base = point2.left - point1.left;
			var height = point2.top - point1.top;
			var distance = Math.sqrt((base * base) + (height * height));
			return distance;
		},
		
		/**
		* pointEqualityTest
		* @return true if both points are the same, false otherwise
		*/
		pointEqualityTest: function(point1, point2) {
			if ((point1.left == point2.left) && (point1.top == point2.top)) {
				return true;
			} else {
				return false;
			}
		},

		getPlanets: function() {
			return _planets;
		},
		
		getPlanetByName: function(name) {
			var i;
			var regex = new RegExp('^[\.#]?' + name + '$');
			for (i=0; i < _planets.length; i++) {
				if (regex.test(_planets[i].name)) {
					return _planets[i];
				}
			}
			console.log('error: no planet by the name ' + name + ' was found');
		}
	}
})();

