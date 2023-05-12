let serverIPs = new Set();
let serverDomains = new Set();  // New Set to hold the domains
let debuggerAttached = false;

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.command === 'startCapturing') {
    attachDebugger();
  } else if (request.command === 'stopCapturing') {
    detachDebugger();
  } else if (request.command === 'exportIPs') {
    exportSet(serverIPs, sendResponse);
    return true;
  } else if (request.command === 'exportDomains') {  // New command for exporting domains
    exportSet(serverDomains, sendResponse);
    return true;
  }
});

// Function to handle exporting a Set
function exportSet(set, sendResponse) {
  let items = Array.from(set).join('\n');
  let blob = new Blob([items], {type: 'text/plain'});
  let reader = new FileReader();
  reader.onloadend = function() {
    sendResponse({dataUrl: reader.result});
  };
  reader.readAsDataURL(blob);
}

function attachDebugger() {
  if (debuggerAttached) return;
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    if (tabs[0]) {
      let tabId = tabs[0].id;
      chrome.debugger.attach({tabId: tabId}, '1.0', function() {
        if (chrome.runtime.lastError) {
          console.error(chrome.runtime.lastError.message);
        } else {
          serverIPs.clear();
          chrome.debugger.sendCommand({tabId: tabId}, 'Network.enable', {}, function() {
            if (chrome.runtime.lastError) {
              console.error(chrome.runtime.lastError.message);
            } else {
              chrome.debugger.onEvent.addListener(allEventHandler);
              debuggerAttached = true;
            }
          });
        }
      });
    }
  });
}

function allEventHandler(debuggeeId, message, params) {
  if (message === 'Network.responseReceived') {
    serverIPs.add(params.response.remoteIPAddress);
    serverDomains.add(new URL(params.response.url).hostname);  // Add the domain to the Set
  }
}

function detachDebugger() {
  if (!debuggerAttached) return;
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    if (tabs[0]) {
      let tabId = tabs[0].id;
      chrome.debugger.onEvent.removeListener(allEventHandler);
      chrome.debugger.detach({tabId: tabId}, function() {
        if (chrome.runtime.lastError) {
          console.error(chrome.runtime.lastError.message);
        } else {
          debuggerAttached = false;
        }
      });
    }
  });
}
