
chrome.runtime.onInstalled.addListener((details) => {
    if (details.reason === 'install') {
      
      console.log('Thank you for installing V2 Saver!');
      
    } else if (details.reason === 'update') {
      console.log('V2 Saver has been updated to version ' + chrome.runtime.getManifest().version);
      
    }
  });
  
  
  chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.create({
      id: 'saveToV2',
      title: 'Save to V2 Saver',
      contexts: ['page', 'selection', 'link']
    });
  });
  
 
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
  
 
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'quickSave') {

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
      return true; 
    }
  });
  

  chrome.alarms.create('periodicSync', { periodInMinutes: 60 });
  chrome.alarms.onAlarm.addListener((alarm) => {
    if (alarm.name === 'periodicSync') {
      console.log('Performing periodic sync or backup');
    }
  });