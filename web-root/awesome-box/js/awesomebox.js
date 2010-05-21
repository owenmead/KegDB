/* 
	The following information must not be removed:
	Awesome Box v2
	Written by: Paul Armstrong, Paul Armstrong Designs
	Site: http://paularmstrongdesigns.com
	Idea and some functions from "LightBox" http://www.huddletogether.com
	Example & Documentation: http://paularmstrongdesigns.com/awesome/box/
	Last Updated: Friday, February 2, 2007 at 12:31:10

	This work is licensed under a Creative Commons Attribution-ShareAlike 2.5 License
	http://creativecommons.org/licenses/by-sa/2.5/
	
	Required Yahoo! UI Files:
		* yahoo.js
		* dom.js
		* event.js
		* [ or: yahoo-dom-event.js ]
		* animation.js
		* [ or: animation-min.js ]
*/

var aLoadImgSrc = '/site_media/awesome-box/images/aBox-loading.gif'; // where is the loading image? (recommend absolute)
var siteURL = 'http://paularmstrongdesigns.com/'; // requires trailing / (after .com)

var aImgTypes = new Array('jpg', 'gif', 'png', 'bmp'); // types of images to place in Awesome Box

/*
 *  ***************************************
 *  EDIT BEYOND THIS POINT AT YOUR OWN RISK
 *  ***************************************
 */

var aClient = new Object();
/* 
 *  aClient.allImgs()
 *    Find all links going to an image with an aImgTypes and return it as an array.
 */
aClient.allImgs = function() {
	var links = document.getElementsByTagName('a');
	var photos = new Array();
	for(i = 0; i < links.length; i++) {
		for(j = 0; j < aImgTypes.length; j++) {
			if(links[i].href.indexOf(aImgTypes[j]) != -1) {
				photos.push(links[i])
			}
		}
	}
	return photos;
}

/* 
 *  aClient.pageWidth() and aClient.pageHeight()
 *    Returns the width and height of the content in the document.
 */
aClient.pageWidth = function() {
	var xScroll;
	if(window.innerHeight && window.scrollMaxY) {	
		xScroll = document.body.scrollWidth;
	} else if(document.body.scrollHeight > document.body.offsetHeight){ // all but Explorer Mac
		xScroll = document.body.scrollWidth;
	} else { // Explorer Mac...would also work in Explorer 6 Strict, Mozilla and Safari
		xScroll = document.body.offsetWidth;
	}
	if(xScroll < $D.getViewportWidth()) {
		pageWidth = $D.getViewportWidth();
	} else {
		pageWidth = xScroll;
	}
	return pageWidth;
};
aClient.pageHeight = function() {
	var yScroll;
	if(window.innerHeight && window.scrollMaxY) {	
		yScroll = window.innerHeight + window.scrollMaxY;
	} else if(document.body.scrollHeight > document.body.offsetHeight){ // all but Explorer Mac
		yScroll = document.body.scrollHeight;
	} else { // Explorer Mac...would also work in Explorer 6 Strict, Mozilla and Safari
		yScroll = document.body.offsetHeight;
	}
	if(yScroll <= $D.getViewportHeight()) {
		pageHeight = $D.getViewportHeight();
	} else { 
		pageHeight = yScroll;
	}
	return pageHeight;
};

/* 
 *  aClient.xScroll(), aClient.yScroll()
 *    Returns the position of the X and Y scrollbars.
 */
aClient.xScroll = function() {
	var xScroll = window.scrollX || document.documentElement.scrollLeft;
	return xScroll;
}	
aClient.yScroll = function() {
	var yScroll = window.scrollY || document.documentElement.scrollTop;
	return yScroll;
}	

/* 
 *  array.inArray(value)
 *    Returns the key of the array that value is assigned to if true, null if false.
 */
Array.prototype.inArray = function(value) {
	for (i=0; i < this.length; i++) { if(this[i] == value) { return i; } }
	return null;
}

/*
 *  Helper Variables
 */
var $D = YAHOO.util.Dom;
var $E = YAHOO.util.Event;
var $A = YAHOO.util.Anim;
var $M = YAHOO.util.Motion;
var $S = YAHOO.util.Scroll;
var $Ease = YAHOO.util.Easing;
var $ = $D.get;

/*
 *  AnimMgr
 *    Sets the default frames per second higher so Safari will display animations
 *    at the correct speed. Degrades for slower browsers.
 */
YAHOO.util.AnimMgr.fps = 500;

YAHOO.widget.aEffect = function(el) { this.oEl = YAHOO.util.Dom.get(el); };

/*
 *  YAHOO.widget.aEffect.aShowLoad()
 *    Animation widget for transition period on Awesome Box initialize or between images.
 */
YAHOO.widget.aEffect.prototype.aShowLoad = function() {
	var showLoad = new $A('aLoadImg', {opacity: {to: 1}}, 0.2);
	showLoad.onStart.subscribe(function() {
		$D.setStyle('aLoadImg', 'display', 'block');
		$D.setXY('aLoadImg', [
			($D.getViewportWidth()/2)-16+aClient.xScroll(), 
			($D.getViewportHeight()/2)-16+aClient.yScroll()
		]);
		if($D.hasClass('aBoxMeta', 'aOpen')) {
			var hideMeta = new $A('aBoxMeta', {opacity: {to: 0}, height: {to: 0}}, 0.2);
			hideMeta.onStart.subscribe(function() {
				$D.setStyle('aImg', 'opacity', '0');
				$D.setStyle('aImg', 'visibility', 'hidden');
			});
			hideMeta.animate();
		}
	});
	showLoad.animate();
};

/*
 *  YAHOO.widget.aEffect.aShowOverlay
 *    Fades in #aOverlay and #aBox.
 *    Initializes YAHOO.widget.aEffect.aShowLoad()
 */
YAHOO.widget.aEffect.prototype.aShowOverlay = function() {
	selects = document.getElementsByTagName("select");
	for (i = 0; i != selects.length; i++) {
		$D.setStyle(selects[i], 'visibility', 'hidden');
	}

	var fadeOverlay = new $A('aOverlay', {opacity: {to: 0.85}}, 0.3);
	fadeOverlay.onStart.subscribe(function() {
		$D.setStyle('aOverlay', 'display', 'block');
		$D.setStyle('aOverlay', 'height', aClient.pageHeight()+'px');
	});
	var showBox = new $A('aBox', {opacity: {to: 1}}, 0.3);
	showBox.onStart.subscribe(function() {
		$D.setStyle('aBox', 'display', 'block');
		var showLoad = new YAHOO.widget.aEffect();
		showLoad.aShowLoad();
	});
	showBox.animate();
	fadeOverlay.animate();
};

/*
 *  YAHOO.widget.aEffect.aResizeBox()
 *    Initialized after new image is completed loading. Resizes and moves #aBox, times out
 *    and displays #aBoxMeta information
 */
YAHOO.widget.aEffect.prototype.aResizeBox = function(aPreload) {
	var imgScale = YAHOO.awesomebox.scaleImage(aPreload);

	var moveBox = new $M('aBox', {
		width: {to: (imgScale[0]+20)},
		height: {to: (imgScale[1]+20)},
		points: {to: [
			($D.getViewportWidth()/2)-(imgScale[0]/2)+aClient.xScroll()-10,
			($D.getViewportHeight()/2)-(imgScale[1]/2)+aClient.yScroll()-10
			]
		}
	}, 0.3);
	moveBox.onStart.subscribe(function() {
		$D.setStyle('aBox', 'display', 'block');
		
		var hideLoad = new $A('aLoadImg', {opacity: {to: 0}}, 0.3);
		var sizeImage = new $A('aImg', {width: {to: imgScale[0]}, height: {to: imgScale[1]}}, 0.3);
	
		hideLoad.onComplete.subscribe(function() { $D.setStyle('aLoadImg', 'display', 'none'); });
		hideLoad.animate();
		sizeImage.animate();
	});
	moveBox.onComplete.subscribe(function() {
		$D.setStyle('aBox', 'height', imgScale[1]+70+'px');
		$D.setStyle('aBoxMeta', 'width', imgScale[0]+'px');
		$D.addClass('aBoxMeta', 'aOpen');
		$('aImg').setAttribute('width', imgScale[0]);
		$('aImg').setAttribute('height', imgScale[1]);
		$D.setStyle('aImg', 'visibility', 'visible');
	
		var fadeImg = new $A('aImg', {opacity: {from: 0, to: 1}}, 0.3);

		fadeImg.onComplete.subscribe(function() {
			var showMeta = new $A('aBoxMeta', {opacity: {from: 0, to: 1}, height: {to: 40}}, 0.2);
			showMeta.animate();
		});
		fadeImg.animate();
	});
	if($D.hasClass('aBoxMeta', 'aOpen')) {
		setTimeout(function() {
			$('aImg').setAttribute('src', aPreload.src);
			moveBox.animate();
		}, 300);
	} else {
		$('aImg').setAttribute('src', aPreload.src);
		moveBox.animate();
	}
};

/*
 *  YAHOO.widget.aEffect.aClose
 *    Closes #aBox and #aOverlay. Invoked via pressing 'x', clicking the 'X' image or #aOverlay
 */
YAHOO.widget.aEffect.prototype.aClose = function() {
	var that = $('aImg');
	var hideMeta = new $A('aBoxMeta', {height: {to: 0}, opacity: {to: 0}}, 0.2);
	var fadeBox = new $M('aBox', {opacity: {to: 0}}, 0.3);
	fadeBox.onComplete.subscribe(function() {
		var hideOverlay = new $A('aOverlay', {opacity: {to: 0}}, 0.3);
		hideOverlay.onStart.subscribe(function() {
			selects = document.getElementsByTagName("select");
			for (i = 0; i != selects.length; i++) {
				$D.setStyle(selects[i], 'visibility', 'visible');
			}
			$D.removeClass('aBoxMeta', 'aOpen');
			$D.setStyle('aBox', 'display', 'none');
			$D.setStyle('aImg', 'opacity', '0');
			$D.setStyle('aImg', 'visibility', 'hidden');
			$D.setStyle('aOverlay', 'display', 'none');
			$D.setStyle('aOverlay', 'height', '0px');
			$D.setStyle('aLoadImg', 'display', 'none');
		});
		hideOverlay.animate();
	});
	hideMeta.animate();
	fadeBox.animate();
	$E.removeListener('aNextButton', 'click');
	$E.removeListener('aPrevButton', 'click');
	$E.removeListener(document, 'keypress');
};

/*
 * YAHOO.widget.aEffect.aAwesome
 *   This is awesome. Pay no attention to it.
 */
YAHOO.widget.aEffect.prototype.aAwesome = function() {
if(!$('aAwesome')){var aBody=document.getElementsByTagName("body").item(0);var aAwesome=document.createElement('a');$(aAwesome).setAttribute('id','aAwesome');$(aAwesome).setAttribute('href','http://paularmstrongdesigns.com/#awesomebox');
$D.setStyle(aAwesome,'background',"url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGQAAABkCAMAAABHPGVmAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAwBQTFRFUmuqGyQ5N0hxBwkOZobURFmNWXS4X33GKTZVFBsqDhIcv7+/PVB/ICAgIi1HYGBg57XREBAQ7+/vMD9j887ggICAS2KbQEBA6brUn5+fAgUI7MDYMDAw5rPQ6rzVI0R36LfSBQkQ8cve7cLZ6LjT57bSDhsw5bLP8MjcID9v5bHP677W8crd8szf673W7L/Xz8/P5LDOBw4Y8sze7MHYr6+vCRIg6rvV88/g7sTaHDZf7cHY8s3f7MDX78bbEyRA9NDhHjtn5rTQ8cnd677X39/f6bnTDBcoSWyxFSlHDw0O7cPZGTJX78fc7sPZ5rTR9dLiW33JUnS9cHBwPF6eFy1P6bnU7sXa5K7N467N8Mnd9dPj8cre9NHh78Xb5K/NQFqR57bRLlGL5bDO883fZIbWN1qYOzA28Mjd5K/O8Mfcj4+P67/XUFBQ9dHiPDI3OSwzV3nDHhgb8sveEiA29M/h9NHiHRgbQGOk463M88/hYILP6LnT7sPa6rvU7sXbroqePjU5LCQpaYvc5rLQ9tXk9tTjJyUlHBYa6r3W6LfT1aPAHxsd99bkTEFGjm2AHxoctZinl36KlXuJnXqO3rXLwZ2wvJWrrYidEA4OWUhRdFtpyZ22lXyJgGFz267HHhocRzdALCInPTM4yK65qI+b3bPKzqe8VHS7lHiHV0ZQdmFss5SlooOUdl9r1qTBOSsz1aK/SWKddm5uuIym58fVWU1UDQwMKyAmTWutSTpDn32QTnC3Rl6ValtiPjY6PTU5VkRODgsNyp63SDlBd2FsnnuPRWeq9dPioYGSSTpCsJCi5cPTLScqtpqnhGt5wJyvtJalpoyZSz9F2LvIV0VPk3aG0cPDKz9mspGiwZ6waWJiIjpk78fb2avFKkyFOUx5VkNOW01UvZasLCQoOi41c1lo2KrEDwwNclZmZ1NeW1VVtpuoqpSdDwwOt6ur1rfFTkZJaVhh9tTkKyEnXE9VPTQ4spGjKyInj2+Byp+3JUh/bY/i////AAAAAAAASn+ycwAAAQB0Uk5T////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////AFP3ByUAAAfcSURBVHjavJp3fBzFFcdn2+3uVd+d784nnZAV27Jk2llYFDfZgLGR5SqbYIxjqg0Y44Lp3aa3UFMoCSTUhAQCKUAaLYXee++dhF5u9pmZ2dlykiXtrDjeH/7DupvvZ97vvTdv3hzaKGJAra2O/ivyNSRGaGruapwqyggOIQvXNU+tVCqNTaKMoBC6iYUVZuuEGQEhZBe72ojKeKgRhIjdyhmVNlBEGYEgAM2NDqMDokYtIIThICqtdZCXagAB2NZlVKaDhGsAIXq4viLOAh1/95qQUJrqMkgayhhDDSAdnrPawMRY/c4hxFkeY1dQdIxRCEi/XyHOGu+PLA1jnA8BkfpLYIDp3ka2hSxhYDkEBKty3+EC0OpzlkEZOBkGgnHEhF6HBjcvRbpIhjCLhoNg3dkL9DRXkal1psoYOoSEYA18BDMbR9S0rNnkMBrrJJsRRhIOIVnMzcjzxZjd5jDaDP4/ESU8xGCEaNxPoDbfhjQ7DE2B8JA4RWi4t615mZYs/hc1CWEYDgRtGkFsw4xlC+wP6bISjuFAdFBxv6bmk7ZoG8NDMET6h8SjoRE+CMIDmBb9HiCk/oSlCEBY/RmsJkgmpvWvTXYwIRwBEp83rV69GkAxULWTzERCcuNbUwaTjHe9+4dFuy8du+9Fr1alpWomYpbVnjbwIOoKh0RP/+NRi3Y/cOyYMaMbLruTYPJ8TSmRsYiV0/IgKIhv5BdHLVpKGKNHNzTMGfLNm8ADIQIxi1lOwT5KGIgGt561aOlYxthxzpCfXfqkA5ET5RKki5Y1zRd+wq0E+apuwOlnUTnGjD65YcchQ/6aLq5wIYUCTfSyZUHel/6ilyApSjroHxM5CKOBMkY9WLZiLqTEqkmOQPwFVPCcR0gl27/yRiY5kWPvUT8lzol5mnBIe1W2qmKyIOb4wmdcjr1HDT8x5oNgu/aWrYJSVabFmi+6VrLbKn3N5Bg1fPjI11MkmMDxjmpCemUskwK5OvUlUYi5wiq9ZTPOHLnLsN+kYjHwFiVlMQFg9KgvushWKATIov+eQxkjCWPYdvcecYQPglVNlnuXT0MUUkjD3VSOkcfuRhibnbHV5m9wCEJ6XxVZYCs0T+D+P9/D5Nhlt2HHb7fZVpvvvPVyG0KLbjS/aYokBEHgykG2wRiTLoEkOwDef/p/H/dxMmuCkLddOSjj4K3rx/3W7nxl+EtvzR2pgvuLQb56ySfHwZPqx/3kX7y9VlHfJ2ZSDAK/OtGTY1L9xcupFEzdZBSUZB/dUhyEhIdE4r5fOnLUT1hfJEUX6Drmac/fcprSR4AFTxUWwikrk7rdZtSPmzCCniEl4C2yGeeM3tGsCEHIopnEU7bkE0bMXLvCslJ28YrwyNIk1pDLaqggdiBW93vMVSNGzN7hBnLkFv1VNx+FVDEW606A4g9nWQQikePCWvkwY8ycvcMPf3T5ysw0X13JQmoaO4NJnfRT4kKQRC5XWnsNc9VxhDF51qOrCnY2MmHS7ZZjKTouED6GES8eax/hjBMmT57VcsBOW3wCzj7SZcuzgu+EFIJo7/z+dyQDqRyE8eJBlPGDx/ihjqDdxyCxHQ0HicC1rhyTZx3UsgdhbLNlJ7+2F6wqS3mlTAiClevHPfvlczajpWWPLfYkjImvsXuRWr0R0kx6ESEGMZavJ7J8dCGVo2Unypi439APIM4W8tbPpAqpsuVFhBiEfLpUjOXgBluOQ7ecOHTo9od1Uu/HS35PAaSnFaRwEN7xdj/O5aCMB75gzYTskyTBuiMPEheDIJb0uVVcDsKYci6k0mQ5LdEDUvQgshgEJ+lWSqsYY7+h2x89ZQmkMzlSWhBkqt2VSUte7RKDqNFSJgYXUDkI47ApSw45L2Gx9ZSiT3golctedAlVYfs+UEo/7rhqyuFz534ORVIlNWwk+sqTCIhC6KXzfM5Ycvjc/y7+Uyekcuko1pVcdZqI6+5BsJqFXz/E5Dhk7uLFp55yVSfA2T+XSVfiOcyKpb0jIPhV2N8ooCRc8Y+r/08Yp356yjlPfHjuP8+mRdeAHBefhIJXHwUaVSQpZtatRno8SW6EnXecdBLZhiJlNd2+8Sa6Y7FYeyoNSh4LB7DdrUjgb0hUZFvVNduerFQdv9HgsxZkSygNOIxAPRsJgSkI4gdskKlH70Y1IAXx65mBa0hxZpBSGAjtywQgeQi88JoX1rnz0IBDYncGWb3SMWtmzPjbMZtiHFmptLYpstBd2ymQPsiG+Qv4OHifBTPmz5s3b39fkD1jj3CBz6I1EQj2QeYduU+lpy0juOv+bkSdwXoz2FN1XQSiV7tr//n/Webthmwlohlm1RNBM08tUU10lJdlyTFDfmUvYjejuJyUwBnXem8E0+1zJdDB5UIGsp4Pgo1N7N6SFYDEIehoGaDLeQROBj1UkNO4B3+Wb3IfNlHAtgg5B5DA23+H86ZiBlSez/pFxjHuQ1cHPcHMwBBZaHzl014NVL7sm6HYtA+A/wJgIciBch6FGY9CHXcYCWM9EEQ3xKfJjsMWghFEFGSGmb67DmsCPUA6onDvCM4DehdIARpJtDGcQVMjfxBGZu0g/Ol5PEjxmkHcxG+GgctXaAihsJ/ktELUrB3EEX8d1BJCcrKL1ckBk2AwEJ4uHbWF0BhrpRlZUwj9uVTz+IUDbWWQEPenAv1+5lsBBgD0KVsy7Bzn5gAAAABJRU5ErkJggg==')");
$D.setStyle(aAwesome,'display','block');$D.setStyle(aAwesome,'width','100px');$D.setStyle(aAwesome,'height','100px');$D.setStyle(aAwesome,'position','absolute');$D.setStyle(aAwesome,'z-index','999');aBody.appendChild(aAwesome);
var aMove=new $M('aAwesome',{points:{from:[-100,(($D.getViewportHeight()/2)+aClient.yScroll()-50)],to:[0,(($D.getViewportHeight()/2)+aClient.yScroll()-50)]}},0.1);aMove.animate();setTimeout(function(){var aMove=new $M('aAwesome',{points:{to:[-100,(($D.getViewportHeight()/2)+aClient.yScroll()-50)] }},0.1);aMove.onComplete.subscribe(function(){aBody.removeChild(aAwesome);});aMove.animate();},2000);}
};

/*
 *  YAHOO.awesomebox()
 *    Non-animating functions, initialized on window load completion.
 */
YAHOO.awesomebox = function() {
	return {
		
		/*
		 *  init()
		 *    Creates the markup, checks for direct image link, adds event listeners.
		 */
		init : function() {
			if(!document.getElementsByTagName){ return; }
			
			/*
			 *  Awesome Box Markup
			 *  
				<div id="aOverlay" title="Click to Close"></div>
				<div id="aBox">
					<div id="aImgHolder">
						<img id="aImg" />
					</div>
					<div id="aBoxMeta">
						<a class="aButton" href="#next" id="aNextButton"></a>
						<a class="aButton" href="#prev" id="aPrevButton"></a>
						<a class="aButton" href="#close" id="aCloseButton"></a>
						<h1 id="aInfoTitle"></h1>
						<p id="aCount"></p>
						<p id="aInfo"></p>
					</div>
				</div>
				<img src="images/aBox-loading.gif" id="aLoadImg" />
			 */
			
			var aBody = document.getElementsByTagName("body").item(0);
	
			var aOverlay = document.createElement('div');
			$(aOverlay).setAttribute('id', 'aOverlay');
			$(aOverlay).setAttribute('title', 'Click to Close');
			aBody.appendChild(aOverlay);
			$D.setStyle('aOverlay', 'opacity', '0');
			
			var aBox = document.createElement('div');
			$(aBox).setAttribute('id', 'aBox');
			aBody.appendChild(aBox);
			$D.setStyle('aBox', 'opacity', '0');
			$D.setXY('aBox', [($D.getViewportWidth()/2)-21, ($D.getViewportHeight()/2)-21])
			$D.setStyle('aBox', 'display', 'none');
			
			var aImgHolder = document.createElement('div');
			$(aImgHolder).setAttribute('id', 'aImgHolder');
			aBox.appendChild(aImgHolder);

			var aImg = document.createElement('img');
			$(aImg).setAttribute('id', 'aImg');
			aImgHolder.appendChild(aImg);
			$D.setStyle('aImg', 'opacity', '0');
			$D.setStyle('aImg', 'visibility', 'hidden');
			
			var aBoxMeta = document.createElement('div');
			$(aBoxMeta).setAttribute('id', 'aBoxMeta');
			aBox.appendChild(aBoxMeta);
			
			var aNextButton = document.createElement('a');
			$(aNextButton).setAttribute('id', 'aNextButton');
			aBoxMeta.appendChild(aNextButton);
			$(aNextButton).setAttribute('href', '#next');
			$D.addClass(aNextButton, 'aButton');

			var aPrevButton = document.createElement('a');
			$(aPrevButton).setAttribute('id', 'aPrevButton');
			aBoxMeta.appendChild(aPrevButton);
			$(aPrevButton).setAttribute('href', '#prev');
			$D.addClass(aPrevButton, 'aButton');

			var aCloseButton = document.createElement('a');
			$(aCloseButton).setAttribute('id', 'aCloseButton');
			aBoxMeta.appendChild(aCloseButton);
			$(aCloseButton).setAttribute('href', '#close');
			$D.addClass(aCloseButton, 'aButton');
			
			var aInfoTitle = document.createElement('h1');
			$(aInfoTitle).setAttribute('id', 'aInfoTitle');
			aBoxMeta.appendChild(aInfoTitle);

			var aCount = document.createElement('p');
			$(aCount).setAttribute('id', 'aCount');
			aBoxMeta.appendChild(aCount);
			$D.setStyle(aCount, 'opacity', '0');

			var aInfo = document.createElement('p');
			$(aInfo).setAttribute('id', 'aInfo');
			aBoxMeta.appendChild(aInfo);
			
			var preloadLoading = new Image();
			preloadLoading.src = aLoadImgSrc;
			
			var aLoadImg = document.createElement('img');
			$(aLoadImg).setAttribute('id', 'aLoadImg');
			aBody.appendChild(aLoadImg);
			$(aLoadImg).setAttribute('src', preloadLoading.src);
			$D.setStyle('aLoadImg', 'opacity', '0');
			
			/*
			 *  Hash Check
			 *    Checks the URL on page load for #filename and attempts to load it
			 */
			if(window.location.href.indexOf('#') != -1) {
				// generate an ID for the body if it doesn't exist
				if(document.body.id != '' || document.body.id != null) {
					var body = $D.generateId(document.body);
				} else {
					var body = document.body.id;
				}
				var imgArray = aClient.allImgs();
				var loadImg = window.location.href.split('#')[1];
				for(i = 0; i < imgArray.length; i++) {
					var imgUrl = imgArray[i].getAttribute('href').split('/');
					if(imgUrl[imgUrl.length-1].split('.')[0] == loadImg) {
						$E.onAvailable(body, this.load, $(imgArray[i]), true);
					}
				}
			}

			$E.on(aOverlay, 'click', this.close);
			$E.on(aCloseButton, 'click', this.close);
			
			$E.on(aClient.allImgs(), 'click', this.load);
		},
		
		/*
		 *  load()
		 *    Gets information for new image and invokes appropriate actions.
		 */
		load : function(e, newImg) {
			var fadeOverlayIn = new YAHOO.widget.aEffect();
			fadeOverlayIn.aShowOverlay();
						
			if(newImg) { var that = newImg;
			} else { var that = this; }
			
			$E.stopEvent(e);
			$E.removeListener(document, 'keypress');
	
			aPreload = new Image();
			aPreload.onload = function() {
				var resizeBox = new YAHOO.widget.aEffect(that);
				resizeBox.aResizeBox(aPreload);
				
				//urchinTracker(aPreload.src.split(siteURL)[1]);
				
				if(!that.getAttribute('rel')) {
					$D.setStyle('aNextButton', 'visibility', 'hidden');
					$D.setStyle('aPrevButton', 'visibility', 'hidden');
					$D.setStyle('aCount', 'opacity', '0');
				} else {
					$D.setStyle('aCount', 'opacity', '1');
					$E.removeListener('aNextButton', 'click');
					$E.removeListener('aPrevButton', 'click');
				}
				var aInfoTitle = '';
				var aInfo = '';

				if(that.getAttribute('title') != null) {
					var aInfoTitle = that.getAttribute('title');
				}
				if(
					that.getElementsByTagName('img')[0] &&
					that.getElementsByTagName('img')[0].getAttribute('title') != null
				) {
					var aInfoTitle = that.getElementsByTagName('img')[0].getAttribute('title');
				}
				if(
					that.getElementsByTagName('img')[0] &&
					that.getElementsByTagName('img')[0].getAttribute('alt') != null
				) {
					var aInfo = that.getElementsByTagName('img')[0].getAttribute('alt');
				} else {
					var aInfo = that.innerHTML;
				}
				if($D.hasClass('aBoxMeta', 'aOpen')) {
					setTimeout(function() {
						$('aInfoTitle').innerHTML = aInfoTitle;
						$('aInfo').innerHTML = aInfo;
					}, 250);
				} else {
					$('aInfoTitle').innerHTML = aInfoTitle;
					$('aInfo').innerHTML = aInfo;
				}
				
				var urlSplit = that.getAttribute('href').split('/');
				var filename = urlSplit[urlSplit.length-1].split('.')[0];
				if(window.location.href.indexOf('#') != -1) {
					var url = window.location.href.split('#')[0];
				} else {
					var url = window.location.href;
				}
				window.location = url+'#'+filename;

				if(that.getAttribute('rel')) {
					YAHOO.awesomebox.loadNeighbors(that);
				}
				$E.addListener(document, 'keypress', function(e) {
					$E.stopEvent(e);
					switch($E.getCharCode(e)) {
						case (120) : YAHOO.awesomebox.close();
						break;
						case (97) : YAHOO.awesomebox.awesome();
						break;
					}
				});
			};
			aPreload.src = that.getAttribute('href');
		},
		
		/*
		 *  loadNeighbors()
		 *    Invoked via load(), finds and preloads next and previous image.
		 */
		loadNeighbors : function(that) {
			var imgRefs = aClient.allImgs();
			var photoSet = new Array();
			for(j = 0; j < imgRefs.length; j++) {
				if(
					imgRefs[j].getAttribute('rel') && 
					imgRefs[j].getAttribute('rel') == that.getAttribute('rel')
				) {
					photoSet.push(imgRefs[j]);
				}
			}
			var key = photoSet.inArray(that);
			setTimeout(function() {
				$('aCount').innerHTML = 'Image '+(key+1)+' of '+photoSet.length;
			}, 300);
			
			if(key != photoSet.length-1) {
				var next = new Image();
				next.src = photoSet[key+1].getAttribute('href');
				$D.setStyle('aNextButton', 'visibility', 'visible');
			} else {
				$D.setStyle('aNextButton', 'visibility', 'hidden');
			}
			if(key != 0) {
				var prev = new Image();
				prev.src = photoSet[key-1].getAttribute('href');
				$D.setStyle('aPrevButton', 'visibility', 'visible');
			} else {
				$D.setStyle('aPrevButton', 'visibility', 'hidden');
			}
			$E.addListener('aNextButton', 'click', this.load, photoSet[key+1], true);
			$E.addListener('aPrevButton', 'click', this.load, photoSet[key-1], true);
			$E.addListener(document, 'keypress', function(e) {
				$E.stopEvent(e);
				switch($E.getCharCode(e)) {
					// 110 = n, 112 = p
					case (110) :
						if(key != photoSet.length-1) { 
							YAHOO.awesomebox.load('', photoSet[key+1]);
						}
					break;
					case (112) :
						if(key != 0) { 
							YAHOO.awesomebox.load('', photoSet[key-1]); 
						}
					break;
				}
			});
		},
		
		/*
		 *  scaleImage()
		 * Returns proportional values for height and width of image, scaled if necessary.
		 */
		scaleImage : function(aImage) {
			var sHeight = aImage.height;
			var sWidth = aImage.width;
			if(aImage.width > $D.getViewportWidth()) {
				sWidth = $D.getViewportWidth()-20;
				sHeight = aImage.height * (sWidth / aImage.width);
				if(sHeight+100 > ($D.getViewportHeight()-20)) {
					sHeight = $D.getViewportHeight()-120;
					sWidth = aImage.width * (sHeight / aImage.height);
				}
			} else if(aImage.height+100 > $D.getViewportHeight()) {
				sWidth = aImage.width * (($D.getViewportHeight()-120) / aImage.height);
				sHeight = $D.getViewportHeight()-120;
				if(sWidth > ($D.getViewportWidth()-20)) {
					sWidth = aImage.width * (sHeight / aImage.height);
					sHeight = aImage.height * (sWidth / aImage.width);
				}
			}
			var scaleAtts = new Array(Math.floor(sWidth), Math.floor(sHeight));
			return scaleAtts;
		},
		
		/*
		 *  close()
		 *    Calls YAHOO.widget.aEffect.aClose() and resets the #filename to #close.
		 *    Not the most elegant solution.
		 */
		close : function() {
			var aClose = new YAHOO.widget.aEffect();
			aClose.aClose();
			if(window.location.href.indexOf('#') != -1) {
				var url = window.location.href.split('#')[0];
			} else {
				var url = window.location.href;
			}
			window.location = url+'#close';
		},
		
		awesome : function() {
			var aAwesome = new YAHOO.widget.aEffect();
			aAwesome.aAwesome();
		}
	}
}();

/*
 *  Start up the processes on window load.
 */
YAHOO.util.Event.on(window, 'load', YAHOO.awesomebox.init, YAHOO.awesomebox, true);