chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    let currentURL = tabs[0].url;
    let currentTitle = tabs[0].title;

    document.getElementById('saveButton').addEventListener('click', function () {
        let itemTitle = document.getElementById('itemTitle').value;
        let itemURL = document.getElementById('itemURL').value;

        if (!itemURL || !itemTitle) {
            alert('Please enter both a URL and a title.');
            return;
        }

        chrome.storage.local.get('savedItems', function (data) {
            let savedItems = data.savedItems || [];
            savedItems.push({ url: itemURL, title: itemTitle });

            chrome.storage.local.set({ 'savedItems': savedItems }, function () {
                console.log('Item has been saved :) ');
                displaySavedList();
                document.getElementById('itemTitle').value = '';
                document.getElementById('itemURL').value = '';
            });
        });
    });

    document.getElementById('clearAllButton').addEventListener('click', function() {
        chrome.storage.local.set({'savedItems': []}, function() {
            console.log('Saved list has been cleared :) ');
            displaySavedList(); 
        });
    });

    function displaySavedList() {
        console.log('displaySavedList called');
        const savedList = document.getElementById('savedList');
        savedList.innerHTML = ''; 

        chrome.storage.local.get('savedItems', function (data) {
            let savedItems = data.savedItems || [];

            if (savedItems.length === 0) { 
                let emptyMessage = document.createElement('p');
                emptyMessage.textContent = 'Nothing you have added :)';
                savedList.appendChild(emptyMessage);
            } else {
                savedItems.forEach(function (item) {
                    let listItem = document.createElement('li');
                    let link = document.createElement('a');
                    link.href = item.url;
                    link.textContent = item.title;
                    link.target = "_blank"; 
                    listItem.appendChild(link);
                    savedList.appendChild(listItem);
                });
            }
        });
    }

    
    displaySavedList();
});