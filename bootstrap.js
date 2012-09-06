const Cc = Components.classes;
const Ci = Components.interfaces;
const Cu = Components.utils;

Cu.import("resource://gre/modules/Services.jsm");

function isNativeUI() {
  return (Services.appinfo.ID == "{aa3c5121-dab2-40e2-81ca-7ea25febc110}");
}

function showToast(aWindow) {
  aWindow.NativeWindow.toast.show("Showing you a toast", "short");
}

function showDoorhanger(aWindow) {
  buttons = [
    {
      label: "Button 1",
      callback: function() {
        aWindow.NativeWindow.toast.show("Button 1 was tapped", "short");
      }
    } , {
      label: "Button 2",
      callback: function() {
        aWindow.NativeWindow.toast.show("Button 2 was tapped", "short");
      }
    }];

  aWindow.NativeWindow.doorhanger.show("Showing a doorhanger with two button choices.", "doorhanger-test", buttons);
}

function copyLink(aWindow, aTarget) {
  let url = aWindow.NativeWindow.contextmenus._getLinkURL(aTarget);
  aWindow.NativeWindow.toast.show("Todo: copy > " + url, "short");
}

var gToastMenuId = null;
var gDoorhangerMenuId = null;
var gContextMenuId = null;

function loadIntoWindow(window) {
  if (!window)
    return;

  if (isNativeUI()) {
    gToastMenuId = window.NativeWindow.menu.add("Show Toast", null, function() { showToast(window); });
    gDoorhangerMenuId = window.NativeWindow.menu.add("Show Doorhanger", null, function() { showDoorhanger(window); });
    gContextMenuId = window.NativeWindow.contextmenus.add("Copy Link", window.NativeWindow.contextmenus.linkOpenableContext, function(aTarget) { copyLink(window, aTarget); });
  }
}

function unloadFromWindow(window) {
  if (!window)
    return;

  if (isNativeUI()) {
    window.NativeWindow.menu.remove(gToastMenuId);
    window.NativeWindow.menu.remove(gDoorhangerMenuId);
    window.NativeWindow.contextmenus.remove(gContextMenuId);
  }
}


/**
 * bootstrap.js API
 */
var windowListener = {
  onOpenWindow: function(aWindow) {
    // Wait for the window to finish loading
    let domWindow = aWindow.QueryInterface(Ci.nsIInterfaceRequestor).getInterface(Ci.nsIDOMWindowInternal || Ci.nsIDOMWindow);
    domWindow.addEventListener("load", function() {
      domWindow.removeEventListener("load", arguments.callee, false);
      loadIntoWindow(domWindow);
    }, false);
  },
  
  onCloseWindow: function(aWindow) {
  },
  
  onWindowTitleChange: function(aWindow, aTitle) {
  }
};

function startup(aData, aReason) {
  // Load into any existing windows
  let windows = Services.wm.getEnumerator("navigator:browser");
  while (windows.hasMoreElements()) {
    let domWindow = windows.getNext().QueryInterface(Ci.nsIDOMWindow);
    loadIntoWindow(domWindow);
  }

  // Load into any new windows
  Services.wm.addListener(windowListener);
}

function shutdown(aData, aReason) {
  // When the application is shutting down we normally don't have to clean
  // up any UI changes made
  if (aReason == APP_SHUTDOWN)
    return;

  // Stop listening for new windows
  Services.wm.removeListener(windowListener);

  // Unload from any existing windows
  let windows = Services.wm.getEnumerator("navigator:browser");
  while (windows.hasMoreElements()) {
    let domWindow = windows.getNext().QueryInterface(Ci.nsIDOMWindow);
    unloadFromWindow(domWindow);
  }
}

function install(aData, aReason) {
}

function uninstall(aData, aReason) {
}
