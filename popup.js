document.addEventListener('DOMContentLoaded', () => {
    const enableSwitch = document.getElementById('enableCleaning');
    const statusText = document.getElementById('statusText');
    const cleanedCountElement = document.getElementById('cleanedCount');
    const refreshButton = document.getElementById('refreshFeed');
    const resetButton = document.getElementById('resetStats');
  
    chrome.storage.local.get(['enabled', 'cleanedCount'], (result) => {
        enableSwitch.checked = result.enabled || false;
        cleanedCountElement.textContent = result.cleanedCount || 0;
        updateStatus(result.enabled);
    });
  
    enableSwitch.addEventListener('change', (e) => {
        const enabled = e.target.checked;
        chrome.storage.local.set({ enabled });
        chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
            chrome.tabs.sendMessage(tabs[0].id, {
                action: 'toggleCleaning',
                value: enabled
            });
        });
        updateStatus(enabled);
    });
  
    refreshButton.addEventListener('click', () => {
        chrome.tabs.reload();
    });
  
    resetButton.addEventListener('click', () => {
        chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
            chrome.tabs.sendMessage(tabs[0].id, { action: 'resetStats' });
        });
        cleanedCountElement.textContent = '0';
    });
  
    function updateStatus(enabled) {
        statusText.textContent = enabled ? 'Cleaner is active' : 'Cleaner is inactive';
        statusText.style.color = enabled ? '#4CAF50' : '#F44336';
    }
  
    setInterval(() => {
        chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
            chrome.tabs.sendMessage(tabs[0].id, { action: 'getStats' }, (response) => {
                if (response) {
                    cleanedCountElement.textContent = response.cleanedCount;
                }
            });
        });
    }, 1000);
  });