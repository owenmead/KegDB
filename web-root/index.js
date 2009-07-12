MenuItemManager = function() {
    // pass
}

MenuItemManager.prototype.init = function() {
	var callback = {
		success: this.menuItemCallBack,
		failure: this.menuItemCallBack_error,
		scope: this
	}
	YAHOO.util.Connect.asyncRequest('GET', '/menuitems/', callback, null);
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
			collect += "<dd>" + data[menu_item_pos]['name'] + "</dd>"
			menu_item_pos++;
		}
	}

	var toWriteTo = document.getElementById("toScroll")
	toWriteTo.innerHTML = collect;
}