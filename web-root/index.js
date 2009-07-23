//  _   _      _                   _____                 _   _                 
// | | | | ___| |_ __   ___ _ __  |  ___|   _ _ __   ___| |_(_) ___  _ __  ___ 
// | |_| |/ _ \ | '_ \ / _ \ '__| | |_ | | | | '_ \ / __| __| |/ _ \| '_ \/ __|
// |  _  |  __/ | |_) |  __/ |    |  _|| |_| | | | | (__| |_| | (_) | | | \__ \
// |_| |_|\___|_| .__/ \___|_|    |_|   \__,_|_| |_|\___|\__|_|\___/|_| |_|___/
//              |_|

function styleToInt(el, style) {
	// Grab the style which is a string
	var theTop = el.getStyle(style);
	
	if (theTop == 'auto') return 0;

	// Chop the negative sign, and the 'px'
	return parseInt(theTop.substr(0, theTop.length-2));
}

//  __  __                  ___ _                 __  __                                   
// |  \/  | ___ _ __  _   _|_ _| |_ ___ _ __ ___ |  \/  | __ _ _ __   __ _  __ _  ___ _ __ 
// | |\/| |/ _ \ '_ \| | | || || __/ _ \ '_ ` _ \| |\/| |/ _` | '_ \ / _` |/ _` |/ _ \ '__|
// | |  | |  __/ | | | |_| || || ||  __/ | | | | | |  | | (_| | | | | (_| | (_| |  __/ |   
// |_|  |_|\___|_| |_|\__,_|___|\__\___|_| |_| |_|_|  |_|\__,_|_| |_|\__,_|\__, |\___|_|   
//                                                                         |___/
MenuItemManager = function(scrollingDOMID, canvasDOMID) {
    this.scrollManager = new ScrollManager(scrollingDOMID, canvasDOMID);
    this.scrollingDOMID = scrollingDOMID;
}

MenuItemManager.prototype.init = function() {
	var callback = {
		success: this.menuItemCallBack,
		failure: this.menuItemCallBack_error,
		scope: this
	}
	YAHOO.util.Connect.asyncRequest('GET', '/menuitem/', callback, null);
}

MenuItemManager.prototype.menuItemCallBack = function(o) {
	var data = YAHOO.lang.JSON.parse(o.responseText);
	this.drawMenuItems(data);
}
MenuItemManager.prototype.menuItemCallBack_error = function(o) {
	alert("Error getting Menu Items")
}
MenuItemManager.prototype.drawMenuItems = function(data) {
	var letters = ["A","B","C","D","E","F","G","H","I","J","K",
					"L","M","N","O","P","Q","R","S","T","U",
					"V","W","X","Y","Z"]

	var collect = "";
	var menu_item_pos = 0;
	for (var i in letters) {
		collect += "<dt>" + letters[i] + "</dt>\n";
		while (menu_item_pos < data.length
							&& data[menu_item_pos]['name'][0].toUpperCase() == letters[i]) {
			collect += "<dd><a href=\"/menuitem/"+data[menu_item_pos]['id']+"/\">" +
			                        data[menu_item_pos]['name'] + "</a></dd>"
			menu_item_pos++;
		}
	}
	
	var toWriteTo = document.getElementById(this.scrollingDOMID);
	toWriteTo.innerHTML = collect;
	this.scrollManager.init();
}

//  ____                 _ _ __  __                                   
// / ___|  ___ _ __ ___ | | |  \/  | __ _ _ __   __ _  __ _  ___ _ __ 
// \___ \ / __| '__/ _ \| | | |\/| |/ _` | '_ \ / _` |/ _` |/ _ \ '__|
//  ___) | (__| | | (_) | | | |  | | (_| | | | | (_| | (_| |  __/ |   
// |____/ \___|_|  \___/|_|_|_|  |_|\__,_|_| |_|\__,_|\__, |\___|_|   
//                                                    |___/

ScrollManager = function (scrollingDOMID, canvasDOMID) {
	this.scrollingDOMID = scrollingDOMID;
	this.canvasDOMID = canvasDOMID;
	this.isDragging = false;

	this.startScrollPos;
	this.startScrollTime;
}

ScrollManager.prototype.init = function() {
	this.scrollingrEl = new YAHOO.util.Element(this.scrollingDOMID);
	this.scrollingDD = new YAHOO.util.DD(this.scrollingDOMID);
	this.canvasEl = new YAHOO.util.Element(this.canvasDOMID);

	// Needed for on dragging events
	this.scrollingDD.scrollManager = this;
	
	// Only drag in Y-axis
	this.scrollingDD.setXConstraint(0, 0);
	
	this.scrollingDD.on('dragEvent', this.onDragging, this, true);
	this.scrollingDD.on('endDragEvent', this.onEndDragging, this, true);
	this.scrollingDD.on('startDragEvent', this.onStartDragging, this, true);

	// Hook up the click events
	/*
		TODO : Create a dictionary of dd's and dt's so we only create one Element.
				Will also allow us to access them later
	*/
	/*
	var dds = this.scrollingrEl.getElementsByTagName('dd');
	for (var i=0; i<dds.length; i++) {
		new YAHOO.util.Element(dds[i]).addListener('click', this.stopScrolling);
	}
	var dts = this.scrollingrEl.getElementsByTagName('dt');
	for (var i=0; i<dts.length; i++) {
		new YAHOO.util.Element(dts[i]).addListener('click', this.stopScrolling);
	}
	*/
	this.scrollingrEl.on('mousedown', this.stopScrollingAnimation, this, true);
	//console.log(dds);
}

ScrollManager.prototype.onDragging = function(ev) {
	//console.log("dragging!");
}

ScrollManager.prototype.onStartDragging = function(ev) {
	this.isDragging = true;
	this.startScrollPos = styleToInt(this.scrollingrEl, 'top');
	this.startScrollTime = new Date().getTime();
}

ScrollManager.prototype.onEndDragging = function(ev) {
	this.isDragging = false;

	var posDiff = this.startScrollPos - styleToInt(this.scrollingrEl, 'top');
	var timeDiff = new Date().getTime() - this.startScrollTime;

	this.animateList(posDiff, timeDiff);
}

ScrollManager.prototype.animateList = function(posDiff, timeDiff) {
	var deAcel = 3000; //px/sec/sec
	var velocity = posDiff/timeDiff * 1000; // px / sec
	var timeToStop = Math.abs(velocity/deAcel); // sec
	var distanceToMove = timeToStop * velocity * -1; // px

	// Don't let it scroll past the top or bottom
	var attributes;
	var currentTop = styleToInt(this.scrollingrEl, 'top');
	var scrollerHeight = styleToInt(this.scrollingrEl, 'height');
	var canvasHeight = styleToInt(this.canvasEl, 'height');
	if ( currentTop + distanceToMove > 0 ) {
		attributes = {
		   top: { to: 0 }
		};
	} else if (Math.abs(currentTop + distanceToMove) > scrollerHeight - canvasHeight) {
		attributes = {
		   top: { to: scrollerHeight*-1 + canvasHeight }
		};
	} else {
		attributes = {
		   top: { by: distanceToMove }
		};
	}

	this.scrollAnimation = new YAHOO.util.Anim(this.scrollingDOMID, attributes);
	this.scrollAnimation.method = YAHOO.util.Easing.easeOut;
	this.scrollAnimation.duration = timeToStop;
	this.scrollAnimation.animate();
}

ScrollManager.prototype.stopScrollingAnimation = function(ev) {
	this.scrollAnimation.stop(false);
}