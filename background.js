// Listen for installation or update of the extension
chrome.runtime.onInstalled.addListener((details) => {
    if (details.reason === 'install') {
      // First time installation
      console.log('Thank you for installing V2 Saver!');
      // You could set up default settings or show a welcome page here
    } else if (details.reason === 'update') {
      // Extension has been updated
      console.log('V2 Saver has been updated to version ' + chrome.runtime.getManifest().version);
      // You could show release notes or new feature information here
    }
  });
  
  // Context menu creation
  chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.create({
      id: 'saveToV2',
      title: 'Save to V2 Saver',
      contexts: ['page', 'selection', 'link']
    });
  });
  
  // Listen for context menu clicks
  chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === 'saveToV2') {
      let itemToSave = {
        url: info.pageUrl,
        title: tab.title,
        description: info.selectionText || '',
        dateAdded: new Date().toISOString()
      };
  
      chrome.storage.local.get('savedItems', (data) => {
        let savedItems = data.savedItems || [];
        savedItems.push(itemToSave);
        chrome.storage.local.set({ 'savedItems': savedItems }, () => {
          console.log('Item saved from context menu');
          // Optionally, show a notification
          chrome.notifications.create({
            type: 'basic',
            iconUrl: 'icons/V2_48.png',
            title: 'Item Saved',
            message: 'The item has been saved to V2 Saver'
          });
        });
      });
    }
  });
  
  // Listen for messages from content scripts or popup
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'quickSave') {
      // Implement quick save functionality
      // This could be triggered by a keyboard shortcut or browser action
      chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
        let currentTab = tabs[0];
        let itemToSave = {
          url: currentTab.url,
          title: currentTab.title,
          dateAdded: new Date().toISOString()
        };
  
        chrome.storage.local.get('savedItems', (data) => {
          let savedItems = data.savedItems || [];
          savedItems.push(itemToSave);
          chrome.storage.local.set({ 'savedItems': savedItems }, () => {
            console.log('Item quick saved');
            sendResponse({status: 'success'});
          });
        });
      });
      return true; // Indicates that the response is asynchronous
    }
  });
  
  // Optional: Implement periodic sync or backup
  chrome.alarms.create('periodicSync', { periodInMinutes: 60 });
  chrome.alarms.onAlarm.addListener((alarm) => {
    if (alarm.name === 'periodicSync') {
      // Implement sync or backup logic here
      console.log('Performing periodic sync or backup');
    }
  });