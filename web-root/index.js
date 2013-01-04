/*
    NOTE : This will eventually all be upgraded.
           Just need get it working on tablets to see if we can sell this beast
*/

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
        this.menuItemManager.setMode(args);
        this.menuItemManager.pickLast();

    } else if (notifier == 'pick_category') {
        this.menuItemManager.redraw(args);
    }
}

SuperManager.prototype.show_prep_item = function(item_id) {
    this.topNavigationManager.setMode('prep');
    this.menuItemManager.setMode('prep');
    this.menuItemManager.pickItem(item_id);
}

SuperManager.prototype.show_cook_item = function(item_id) {
    this.topNavigationManager.setMode('cook');
    this.menuItemManager.setMode('cook');
    this.menuItemManager.pickItem(item_id);
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
	var self = this;
	// Grab all the links and setup the click event with notification
	$("#" + this.navContainerID + " a").click(function() {
		var new_nav_mode = $(this).attr("display_type");
	    self.setMode(new_nav_mode);
	    self.superManager.notifyOthers("nav_change", new_nav_mode);
	});

}

TopNavigationManager.prototype.setMode = function(mode) {
	// Change the display_type attribute depending on which one is clicked
	$("#" + this.navContainerID + " a").each(function() {
		$(this).attr("state", $(this).attr("display_type") == mode ? 'selected' : 'unselected');
	});
}

//  ____      _                              _     _     _   __  __
// / ___|__ _| |_ ___  __ _  ___  _ __ _   _| |   (_)___| |_|  \/  | __ _ _ __   __ _  __ _  ___ _ __
//| |   / _` | __/ _ \/ _` |/ _ \| '__| | | | |   | / __| __| |\/| |/ _` | '_ \ / _` |/ _` |/ _ \ '__|
//| |__| (_| | ||  __/ (_| | (_) | |  | |_| | |___| \__ \ |_| |  | | (_| | | | | (_| | (_| |  __/ |
// \____\__,_|\__\___|\__, |\___/|_|   \__, |_____|_|___/\__|_|  |_|\__,_|_| |_|\__,_|\__, |\___|_|
//                    |___/            |___/                                          |___/

CategoryListManager = function(scrollingDOMID, canvasDOMID, superManager) {
    this.scrollingDOMID = scrollingDOMID;
    this.canvasDOMID = canvasDOMID;

    this.superManager = superManager;
    this.superManager.categoryListManager = this;
}

CategoryListManager.prototype.init = function() {
	$.ajax({
		url: '/category/',
		dataType: 'json',
		context: this,
		success: this.categoryListCallBack,
		error: this.categoryListCallBack_error
	});
}
CategoryListManager.prototype.categoryListCallBack = function(data) {
	this.drawCategoryList(data);
	this.pickCategory("_ALL");
}
CategoryListManager.prototype.categoryListCallBack_error = function(o) {
	alert("Error getting Category List")
}
CategoryListManager.prototype.drawCategoryList = function(data) {
	var collect = "<dd id=\"category__ALL\" class=\"topItem\">All Items</dd>";
	var category_item_pos = 0;
	while (category_item_pos < data.length) {
		collect += "<dd id=\"category_" + data[category_item_pos]['id'] + "\">" + data[category_item_pos]['name'] + "</dd>";
		category_item_pos++;
	}
	var toscroll = $("#"+this.scrollingDOMID).html(collect);

	if (this.scrollManager === undefined) {
        this.scrollManager = new iScroll(this.canvasDOMID);
    } else {
        this.scrollManager.refresh();
        this.scrollManager.scrollTo(0, 0, 0);
    }


	var that = this;
	toscroll.find('dd').on('click', function() {
	    that.pickCategory($(this).attr('id').split('category_')[1]);
	});
}
CategoryListManager.prototype.pickCategory = function(categoryID) {
    // Ensure the state of the cateogry buttons is correct
    $("#category_"+categoryID).attr('state', 'selected');
    $('#'+this.scrollingDOMID + ' dd').not("#category_"+categoryID).attr('state', 'unselected');

    // Notify others that the category has been selected
    this.superManager.notifyOthers("pick_category", categoryID);
}

//  __  __                  ___ _                 __  __
// |  \/  | ___ _ __  _   _|_ _| |_ ___ _ __ ___ |  \/  | __ _ _ __   __ _  __ _  ___ _ __
// | |\/| |/ _ \ '_ \| | | || || __/ _ \ '_ ` _ \| |\/| |/ _` | '_ \ / _` |/ _` |/ _ \ '__|
// | |  | |  __/ | | | |_| || || ||  __/ | | | | | |  | | (_| | | | | (_| | (_| |  __/ |
// |_|  |_|\___|_| |_|\__,_|___|\__\___|_| |_| |_|_|  |_|\__,_|_| |_|\__,_|\__, |\___|_|
//                                                                         |___/
MenuItemManager = function(scrollingDOMID, canvasDOMID, iFrameViewerDOMID, initialMode, superManager) {
    this.scrollingDOMID = scrollingDOMID;
    this.canvasDOMID = canvasDOMID;

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
	var url = "/menuitem/";
	if (categoryID != "_ALL") {
	    url = "/menuitem/byCategory/"+categoryID+"/";
	}
	$.ajax({
		url: url,
		dataType: 'json',
		context: this,
		success: this.menuItemCallBack,
		error: this.menuItemCallBack_error
	});
}
MenuItemManager.prototype.menuItemCallBack_error = function(o) {
	alert("Error getting Menu Items")
}
var isNumber = new RegExp("[0-9]+");
var getFirstCharacter = function(menu_name) {
    var first_character = menu_name[0].toUpperCase();
    return isNumber.test(first_character) ? '#' : first_character;
}
MenuItemManager.prototype.menuItemCallBack = function(data) {
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
			collect += "<dd id=\"menuitem_" + data[menu_item_pos]['id'] + "\">" + data[menu_item_pos]['name'] + "</dd>";
			menu_item_pos++;
		}
	}

	if (data.length == 0 ) {
        collect = "<div class=\"noItems\">No Items Found, Sorry</div>";
    }

    var toscroll = $("#" + this.scrollingDOMID).html(collect);

    if (this.scrollManager === undefined) {
        this.scrollManager = new iScroll(this.canvasDOMID);
    } else {
        this.scrollManager.refresh();
        this.scrollManager.scrollTo(0, 0, 0);
    }

    var that = this;
	toscroll.find('dd').on('click', function() {
	    that.pickItem($(this).attr('id').split('menuitem_')[1]);
	});
}

MenuItemManager.prototype.pickLast = function() {
    if (this.lastPickedID != null) {
        this.pickItem(this.lastPickedID);
    }
}

MenuItemManager.prototype.pickItem = function(itemID) {
    // Used for when user changes view type (prep, cook, allergy)
    this.lastPickedID = itemID;

    // Show a selected menuitem in the list... but only one
    $("#menuitem_"+itemID).attr('state', 'selected');
    $('#'+this.scrollingDOMID + ' dd').not("#menuitem_"+itemID).attr('state', 'unselected');

    // Use the iFrame to switch what we are viewing
    this.iFrameViewer.src = "/menuitem/" + itemID + "/" + this.mode + "/";
}