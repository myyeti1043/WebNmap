document.getElementById('start').addEventListener('click', function() {
  chrome.runtime.sendMessage({command: 'startCapturing'});
});

document.getElementById('stop').addEventListener('click', function() {
  chrome.runtime.sendMessage({command: 'stopCapturing'});
});

document.getElementById('export').addEventListener('click', function() {
  chrome.runtime.sendMessage({command: 'exportIPs'}, function(response) {
    let a = document.createElement('a');
    a.href = response.dataUrl;
    a.download = 'ServerIPs.txt';
    a.click();
  });
});

document.getElementById('exportDomains').addEventListener('click', function() {
  chrome.runtime.sendMessage({command: 'exportDomains'}, function(response) {
    let a = document.createElement('a');
    a.href = response.dataUrl;
    a.download = 'ServerDomains.txt';
    a.click();
  });
});
