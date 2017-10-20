var log = (function() {
	var _debug = true; //set to true to see console logging

	return {
		// use:
		// log.it("my message");
		it : function (message) {
			if (_debug) {
				console.log(message);
			}
		}
	}

})();

var chapterController = (function() {

	/* *******************
	* private variables
	* ********************/
	var _chapters = [];
	var _currentChapter; // will contain an index into the _chapters array
	var _chapterDiv; //this is the div that contains the chapter text and is used frequently
	var _standardAnimDuration = '1.0s'

	/* *******************
	* private functions
	* ********************/
	function _addChapter(url) {
		deferred = jQuery.ajax({
			url: url,
			dataType: 'html',
			success: function(htmlData, status, jqXHR) {
				var newChapter = new Chapter(htmlData);
				_chapters.push(newChapter);
				log.it('loaded chapter at url ' + url + ', status = ' + status);

			},
			error: function(jqXHR, status, error) {
				log.it('when trying to load ' + url + ', got status: ' + status + ', and error: ' + error);
			},
			complete: function() {
				log.it('completed loading ' + url);
			}
		});
		return deferred;
	}

	function _animatedPageChange(direction) {
		var animName = direction + '-chapter-part1';
		var anim1CssProperties = {
			'-webkit-animation-name' : animName,
			'-moz-animation-name' : animName,
			'-o-animation-name' : animName,
			'animation-name' : animName,

			'-webkit-animation-duration' : _standardAnimDuration,
			'-moz-animation-duration' : _standardAnimDuration,
			'-o-animation-duration' : _standardAnimDuration,
			'animation-duration' : _standardAnimDuration,

			'-webkit-animation-timing-function' : 'ease-in',
			'-moz-animation-timing-function' : 'ease-in',
			'-o-animation-timing-function' : 'ease-in',
			'animation-timing-function' : 'ease-in',
		}

		//animate the first part - disappearing the chapter by rotating it's Y value to -90 deg
		_chapterDiv.css(anim1CssProperties);
		$('#page-turn-btns').css(anim1CssProperties);

		// after the first animation to -90deg swap out the chapter to the new chapter and rotate back to 0deg with the 2nd animation.
		// note that .one() is like jQuery .on() except that the event listener 'detaches' after one use
		// got this from http://blog.teamtreehouse.com/using-jquery-to-detect-when-css3-animations-and-transitions-end
		_chapterDiv.one('webkitAnimationEnd oanimationend msAnimationEnd animationend',
			function(event) {
				// note we can get event.currentTarget here if needed

				animName = direction + '-chapter-part2';
				var anim2CssProperties = {
					'-webkit-animation-name' : animName,
					'-moz-animation-name' : animName,
					'-o-animation-name' : animName,
					'animation-name' : animName,

					'-webkit-animation-timing-function' : 'ease-out',
					'-moz-animation-timing-function' : 'ease-out',
					'-o-animation-timing-function' : 'ease-out',
					'animation-timing-function' : 'ease-out',
				}

				chapterController.showCurrentChapter();
				chapterController.getChapterDiv().css(anim2CssProperties);
				$('#page-turn-btns').css(anim2CssProperties);
			}
		);
	}

	return {
		getChapterDiv : function() {
			return _chapterDiv; // make it easy to get a hold of this div
		},

		init : function() {
			_chapterDiv = $('#current-chapter'); //settng up this controller-wide variable

			// add all the chapters
			_addChapter('chapter-1010.html');
			_addChapter('chapter-1020.html');
			_addChapter('chapter-2010.html');

			// as we load the last chapter show the first chapter that has downloaded
			chapterDeferred = _addChapter('chapter-2015.html');
			chapterDeferred.then(function() {
				_chapters[0].show();
				_currentChapter = 0;
			},
			function() {
				log.it('loading of chapter-2015.html failed');
			});
		},

		getNextId : function() {
			return _chapters.length;
		},

		showNextChapter : function() {
			// set up the next chapter
			if (_currentChapter >= _chapters.length - 1) {
				_currentChapter = 0;
			} else {
				_currentChapter++;
			}
			_animatedPageChange('next');
 			log.it('at end of showNextChapter, _currentChapter is ' + _currentChapter);
		},

		showPrevChapter : function() {
			// set up the previous chapter
			if (_currentChapter <= 0) {
				_currentChapter = _chapters.length - 1;
			} else {
				_currentChapter--;
			}
			_animatedPageChange('prev');
 			log.it('at end of showPrevChapter, _currentChapter is ' + _currentChapter);
		},

		showCurrentChapter : function() {
			_chapters[_currentChapter].show();
		}
	}
})();

/* *******************
* Chapter
* TODO this is the Model but it has the View functionality as well. Should separate the View out.
* ********************/
function Chapter(html, id, title) {
	this.id = id || chapterController.getNextId();
	this.title = title || 'Chapter ' + this.id;
	this.html = html;
	this.animLength = 1200; //ms

	this.show = function () {
		var chapterText = $('.chapter-text');
		chapterText.empty(); //get rid of the old chapter text
		chapterText.append(this.html); // put in the new text

		// make sure everything is visible
		chapterText.show();
		chapterController.getChapterDiv().show();
	}
}

$(document).ready(function() {
	chapterController.init();
});