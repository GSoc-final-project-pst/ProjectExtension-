let feedCleaner;
let cleanedCount = 0;
let isEnabled = false;

async function initializeCleaner() {
    feedCleaner = new FeedCleaner();
    await feedCleaner.initialize();
}

async function cleanFeed() {
    if (!isEnabled) return;

    const posts = document.querySelectorAll('[role="article"]'); 
    
    for (const post of posts) {
        if (post.dataset.cleaned) continue;

        const score = await feedCleaner.predictPost(post);
        if (score > 0.5) {
            post.style.display = 'none';
            post.dataset.cleaned = 'true';
            cleanedCount++;
            updateStats();
        }
    }
}

function updateStats() {
    chrome.storage.local.set({ cleanedCount });
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    switch (request.action) {
        case 'toggleCleaning':
            isEnabled = request.value;
            break;
        case 'getStats':
            sendResponse({ cleanedCount });
            break;
        case 'resetStats':
            cleanedCount = 0;
            updateStats();
            break;
    }
});

initializeCleaner().then(() => {
    setInterval(cleanFeed, 2000);
});