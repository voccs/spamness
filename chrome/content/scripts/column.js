var SpamnessColumn = {};

SpamnessColumn.handler = {
    getCellText:         function(row, col) {
        var prefs = Cc["@mozilla.org/preferences-service;1"]
                        .getService(Ci.nsIPrefBranch);
        var showText = prefs.getIntPref("extensions.spamness.display.column");

	if (showText == Spamness.settings.COLUMN_SHOW_IMAGE_NO_TEXT.value)
	    return null;

        var key = gDBView.getKeyAt(row);
        var hdr = gDBView.db.GetMsgHdrForKey(key);
        var txt = SpamnessColumn.handler.getSortLongForRow(hdr) / 10.0;
        return (isNaN(txt)) ? "" : txt;
    },

    getSortStringForRow: function(hdr) {
        return null;
    },

    isString:            function() {
        return false;
    },

    getCellProperties:   function(row, col, props) {},

    getRowProperties:    function(row, props) {},

    getImageSrc:         function(row, col) {
        var prefs = Cc["@mozilla.org/preferences-service;1"]
                        .getService(Ci.nsIPrefBranch);
        var showImage = prefs.getIntPref("extensions.spamness.display.column");

	if (showImage == Spamness.settings.COLUMN_NO_IMAGE_SHOW_TEXT.value)
	    return null;

        var key = gDBView.getKeyAt(row);
        var hdr = gDBView.db.GetMsgHdrForKey(key);
        var normalized = SpamnessColumn.handler.getSortLongForRow(hdr) / 10.0;
        var img;
        if (isNaN(normalized)) {
            img = "chrome://messenger/skin/icons/symbol-null.png";
        } else if (normalized < 0) {
            level = Math.round(Math.log(Math.abs(normalized) + 1));
            level = (level >= 5) ? 4 : level;
            img = "chrome://spamness/skin/ham" + level + ".png";
        } else {
            level = Math.round(Math.log(normalized + 1));
            level = (level >= 5) ? 4 : level;
            img = "chrome://spamness/skin/spam" + level + ".png";
        }
        return img;
    },

    getSortLongForRow:   function(hdr) {
        var prefs = Cc["@mozilla.org/preferences-service;1"]
                        .getService(Ci.nsIPrefBranch);
        var header = Spamness.getHeaderName(prefs);
        var spamreport = hdr.getStringProperty(header);
	if (spamreport != null) {
            var parsed = Spamness.parseHeader(spamreport);
	    if (parsed != null) {
		return parsed.getNormalScore() * 10.0;
	    }
	}
	return Number.NaN;
    }
};

SpamnessColumn.onLoad = function() {
    var ObserverService = Cc["@mozilla.org/observer-service;1"].getService(Ci.nsIObserverService);
    ObserverService.addObserver(SpamnessColumn.dbObserver, "MsgCreateDBView", false);
};

SpamnessColumn.dbObserver = {
    observe: function(aMsgFolder, aTopic, aData) {
        SpamnessColumn.addColumnHandler();
    }
};

SpamnessColumn.addColumnHandler = function() {
    gDBView.addColumnHandler("colSpamStatus", SpamnessColumn.handler);
}

window.addEventListener("load", SpamnessColumn.onLoad, false);
