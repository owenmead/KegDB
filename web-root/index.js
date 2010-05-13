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

//  ____                        __  __
// / ___| _   _ _ __   ___ _ __|  \/  | __ _ _ __   __ _  __ _  ___ _ __
// \___ \| | | | '_ \ / _ \ '__| |\/| |/ _` | '_ \ / _` |/ _` |/ _ \ '__|
//  ___) | |_| | |_) |  __/ |  | |  | | (_| | | | | (_| | (_| |  __/ |
// |____/ \__,_| .__/ \___|_|  |_|  |_|\__,_|_| |_|\__,_|\__, |\___|_|
//             |_|                                       |___/

// Sub-Managers are really dumb. SuperManager knows what to deligate to whom

SuperManager = function(menuItemManager, categoryListManager, topNavigationManager) {
    this.menuItemManager;
    this.categoryListManager;
    this.topNavigationManager;
}

// Notify others of a change
SuperManager.prototype.notifyOthers = function(notifier, args) {
    if (notifier == 'nav_change') {
        self.menuItemManager.setMode(args);
        self.menuItemManager.pickLast();

    } else if (notifier == 'pick_category') {
        this.menuItemManager.redraw(args);
    }
}

SuperManager.prototype.go_prep = function(item_id) {
    alert("SUPER MANAGER " + item_id);
}

// _____           _   _             _             _   _             __  __
//|_   _|__  _ __ | \ | | __ ___   _(_) __ _  __ _| |_(_) ___  _ __ |  \/  | __ _ _ __   __ _  __ _  ___ _ __
//  | |/ _ \| '_ \|  \| |/ _` \ \ / / |/ _` |/ _` | __| |/ _ \| '_ \| |\/| |/ _` | '_ \ / _` |/ _` |/ _ \ '__|
//  | | (_) | |_) | |\  | (_| |\ V /| | (_| | (_| | |_| | (_) | | | | |  | | (_| | | | | (_| | (_| |  __/ |
//  |_|\___/| .__/|_| \_|\__,_| \_/ |_|\__, |\__,_|\__|_|\___/|_| |_|_|  |_|\__,_|_| |_|\__,_|\__, |\___|_|
//          |_|                        |___/                                                  |___/

TopNavigationManager = function(navContainerID, superManager) {
    this.navContainerID = navContainerID;
    this.superManager = superManager;
    this.superManager.topNavigationManager = this;
}

TopNavigationManager.prototype.init = function() {
    var nodeApply = function(n, self) {
        new YAHOO.util.Element(n).addListener('mouseup', self.clickNavButton, self);
    }
    YAHOO.util.Dom.getElementsBy(function(n) {return true}, "a", this.navContainerID, nodeApply, this);
}

TopNavigationManager.prototype.clearNavButtons = function() {
    var nodeApply = function(n) {
        n.setAttribute('state', 'unselected');
    }
    YAHOO.util.Dom.getElementsBy(function(n) {return true}, "a", this.navContainerID, nodeApply);
}

TopNavigationManager.prototype.clickNavButton = function(evnt, self) {
    // Update the graphics
    self.clearNavButtons();
    var buttonClicked = evnt.currentTarget;
    buttonClicked.setAttribute('state', 'selected');

    // Notify others of the change
    self.superManager.notifyOthers("nav_change", buttonClicked.getAttribute('display_type'));
}


//  ____      _                              _     _     _   __  __
// / ___|__ _| |_ ___  __ _  ___  _ __ _   _| |   (_)___| |_|  \/  | __ _ _ __   __ _  __ _  ___ _ __
//| |   / _` | __/ _ \/ _` |/ _ \| '__| | | | |   | / __| __| |\/| |/ _` | '_ \ / _` |/ _` |/ _ \ '__|
//| |__| (_| | ||  __/ (_| | (_) | |  | |_| | |___| \__ \ |_| |  | | (_| | | | | (_| | (_| |  __/ |
// \____\__,_|\__\___|\__, |\___/|_|   \__, |_____|_|___/\__|_|  |_|\__,_|_| |_|\__,_|\__, |\___|_|
//                    |___/            |___/                                          |___/

CategoryListManager = function(scrollingDOMID, canvasDOMID, superManager) {
    this.scrollManager = new ScrollManager(scrollingDOMID, canvasDOMID);
    this.scrollingDOMID = scrollingDOMID;
    this.superManager = superManager;
    this.superManager.categoryListManager = this;
}

CategoryListManager.prototype.init = function() {
	var callback = {
		success: this.categoryListCallBack,
		failure: this.categoryListCallBack_error,
		scope: this
	}
	YAHOO.util.Connect.asyncRequest('GET', '/category/', callback, null);
}

CategoryListManager.prototype.categoryListCallBack = function(o) {
	var data = YAHOO.lang.JSON.parse(o.responseText);
	this.drawCategoryList(data);
	this.pickCategory("_ALL");
}
CategoryListManager.prototype.categoryListCallBack_error = function(o) {
	alert("Error getting Category List")
}
CategoryListManager.prototype.drawCategoryList = function(data) {
	var collect = "<dd id=\"_ALL\" class=\"topItem\">All Items</dd>";
	var category_item_pos = 0;
	while (category_item_pos < data.length) {
		collect += "<dd id=\"" + data[category_item_pos]['id'] + "\">" + data[category_item_pos]['name'] + "</dd>";
		category_item_pos++;
	}

	var toWriteTo = document.getElementById(this.scrollingDOMID);
	toWriteTo.innerHTML = collect;
	this.scrollManager.init();

    // Hook up the mouse click events
	var dds = this.scrollManager.scrollingrEl.getElementsByTagName('dd');
	for (var i=0; i<dds.length; i++) {
	    var data = {'self': this, 'id': dds[i].id};
		new YAHOO.util.Element(dds[i]).addListener('mouseup', this.clickMenuItem, data);
	}
}

CategoryListManager.prototype.clickMenuItem = function(evnt, data) {
    if (!data['self'].scrollManager.isDragging) {
        data['self'].pickCategory(data['id']);
    }
}

CategoryListManager.prototype.pickCategory = function(categoryID) {
    var nodeApply = function(n) {
        // Lets do some fade action here :-)
        if (n.id == categoryID) {
            var myAnim = new YAHOO.util.ColorAnim(n, {backgroundColor: { to: '#3C5F7F' }, color: { to: '#FFFFFF'}});
            myAnim.duration = 0.5;
            myAnim.animate();
            n.HAS_STYLE = true;
        } else if (n.HAS_STYLE) { // Only need to animate one of them back to normal state
            var myAnim = new YAHOO.util.ColorAnim(n, {backgroundColor: { to: '#FFFFFF' }, color: { to: '#1C3451'}});
            myAnim.duration = 0.25;
            myAnim.animate();
            n.HAS_STYLE = false;
        }
    }
    YAHOO.util.Dom.getElementsBy(function(n) {return true}, "dd", this.scrollingDOMID, nodeApply);

    this.superManager.notifyOthers("pick_category", categoryID);
}

//  __  __                  ___ _                 __  __
// |  \/  | ___ _ __  _   _|_ _| |_ ___ _ __ ___ |  \/  | __ _ _ __   __ _  __ _  ___ _ __
// | |\/| |/ _ \ '_ \| | | || || __/ _ \ '_ ` _ \| |\/| |/ _` | '_ \ / _` |/ _` |/ _ \ '__|
// | |  | |  __/ | | | |_| || || ||  __/ | | | | | |  | | (_| | | | | (_| | (_| |  __/ |
// |_|  |_|\___|_| |_|\__,_|___|\__\___|_| |_| |_|_|  |_|\__,_|_| |_|\__,_|\__, |\___|_|
//                                                                         |___/
MenuItemManager = function(scrollingDOMID, canvasDOMID, iFrameViewerDOMID, initialMode, superManager) {
    this.scrollManager = new ScrollManager(scrollingDOMID, canvasDOMID);
    this.scrollingDOMID = scrollingDOMID;
    this.iFrameViewerDOMID = iFrameViewerDOMID
    this.mode = initialMode;
    this.lastPickedID = null;
    this.superManager = superManager;
    this.superManager.menuItemManager = this;
}

MenuItemManager.prototype.init = function() {
    this.iFrameViewer = document.getElementById(this.iFrameViewerDOMID);
}

MenuItemManager.prototype.setMode = function(mode) {
    this.mode = mode;
}

MenuItemManager.prototype.redraw = function(categoryID) {
	var callback = {
		success: this.menuItemCallBack,
		failure: this.menuItemCallBack_error,
		scope: this
	}

	var url = "/menuitem/";
	if (categoryID != "_ALL") {
	    url = "/menuitem/byCategory/"+categoryID+"/";
	}
	YAHOO.util.Connect.asyncRequest('GET', url, callback, null);
}
MenuItemManager.prototype.menuItemCallBack = function(o) {
	var data = YAHOO.lang.JSON.parse(o.responseText);
	this.drawMenuItems(data);
}
MenuItemManager.prototype.menuItemCallBack_error = function(o) {
	alert("Error getting Menu Items")
}
var isNumber = new RegExp("[0-9]+");
var getFirstCharacter = function(menu_name) {
    var first_character = menu_name[0].toUpperCase();
    return isNumber.test(first_character) ? '#' : first_character;
}
MenuItemManager.prototype.drawMenuItems = function(data) {
	var letters = ["#","A","B","C","D","E","F","G","H","I","J",
	                "K","L","M","N","O","P","Q","R","S","T","U",
					"V","W","X","Y","Z"]

	var collect = "";
	var menu_item_pos = 0;
	for (var i in letters) {
	    if (data[menu_item_pos] != null) {
    	    var first_character = getFirstCharacter(data[menu_item_pos]['name']);
    	}

	    if (data[menu_item_pos] != null && first_character == letters[i]) {
    	    collect += "<dt>" + letters[i] + "</dt>\n";
		}
		while (menu_item_pos < data.length
							&& (first_character=getFirstCharacter(data[menu_item_pos]['name'])) == letters[i]) {
			collect += "<dd id=\"" + data[menu_item_pos]['id'] + "\">" + data[menu_item_pos]['name'] + "</dd>";
			menu_item_pos++;
		}
	}

	if (data.length == 0 ) {
        collect = "<div class=\"noItems\">No Items Found, Sorry</div>";
    }

	var toWriteTo = document.getElementById(this.scrollingDOMID);
	toWriteTo.innerHTML = collect;
	this.scrollManager.init();

    // Hook up the mouse click events
	var dds = this.scrollManager.scrollingrEl.getElementsByTagName('dd');
	for (var i=0; i<dds.length; i++) {
	    var data = {'self': this, 'id': dds[i].id};
		new YAHOO.util.Element(dds[i]).addListener('mouseup', this.clickMenuItem, data);
	}
}

MenuItemManager.prototype.clickMenuItem = function(evnt, data) {
    if (!data['self'].scrollManager.isDragging) {
        data['self'].pickItem(data['id']);
    }
}

MenuItemManager.prototype.pickLast = function() {
    if (this.lastPickedID != null) {
        this.pickItem(this.lastPickedID);
    }
}

MenuItemManager.prototype.pickItem = function(itemID) {
    this.lastPickedID = itemID;
    var nodeApply = function(n) {
        // Lets do some fade action here :-)
        if (n.id == itemID) {
            var myAnim = new YAHOO.util.ColorAnim(n, {backgroundColor: { to: '#3C5F7F' }, color: { to: '#FFFFFF'}});
            myAnim.duration = 0.5;
            myAnim.animate();
            n.HAS_STYLE = true;
        } else if (n.HAS_STYLE) { // Only need to animate one of them back to normal state
            var myAnim = new YAHOO.util.ColorAnim(n, {backgroundColor: { to: '#FFFFFF' }, color: { to: '#1C3451'}});
            myAnim.duration = 0.25;
            myAnim.animate();
            n.HAS_STYLE = false;
        }
    }
    YAHOO.util.Dom.getElementsBy(function(n) {return true}, "dd", this.scrollingDOMID, nodeApply);

    this.iFrameViewer.src = "/menuitem/" + itemID + "/" + this.mode + "/";

}


//  ____                 _ _ __  __
// / ___|  ___ _ __ ___ | | |  \/  | __ _ _ __   __ _  __ _  ___ _ __
// \___ \ / __| '__/ _ \| | | |\/| |/ _` | '_ \ / _` |/ _` |/ _ \ '__|
//  ___) | (__| | | (_) | | | |  | | (_| | | | | (_| | (_| |  __/ |
// |____/ \___|_|  \___/|_|_|_|  |_|\__,_|_| |_|\__,_|\__, |\___|_|
//                                                    |___/

/*
    TODO : Calc dragging velocity at intervals instead of over whole drag event
*/

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

	this.scrollingrEl.on('mousedown', this.stopScrollingAnimation, this, true);

    // Rest the list to start at the top
	this.resetPosition();
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

ScrollManager.prototype.resetPosition = function() {
    this.scrollingrEl.setStyle('top', 0);
}