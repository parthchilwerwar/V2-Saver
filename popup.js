chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    let currentURL = tabs[0].url;
    let currentTitle = tabs[0].title;
  
    document.getElementById('saveButton').addEventListener('click', function () {
      let itemTitle = document.getElementById('itemTitle').value.trim();
      let itemURL = document.getElementById('itemURL').value.trim();
      let itemTags = document.getElementById('itemTags').value.split(',').map(tag => tag.trim()).filter(tag => tag !== '');

      if (!itemURL || !itemTitle) {
        alert('Please enter both a URL and a title.');
        return;
      }

      chrome.storage.local.get('savedItems', function (data) {
        let savedItems = data.savedItems || [];
        let editIndex = document.getElementById('saveButton').dataset.editIndex;
        
        // Check for duplicates
        let isDuplicate = savedItems.some(item => item.title === itemTitle && item.url === itemURL);
        
        if (isDuplicate && editIndex === undefined) {
          if (!confirm('An item with the same title and URL already exists. Do you want to save it anyway?')) {
            return;
          }
        }
        
        let newItem = { 
          url: itemURL, 
          title: itemTitle, 
          tags: itemTags
        };
        
        if (editIndex !== undefined) {
          // Update existing item
          savedItems[editIndex] = newItem;
          document.getElementById('saveButton').textContent = 'Save';
          document.getElementById('saveButton').dataset.editIndex = undefined;
        } else {
          // Add new item
          savedItems.push(newItem);
        }

        chrome.storage.local.set({ 'savedItems': savedItems }, function () {
          console.log('Item has been saved/updated :) ');
          displaySavedList(savedItems);
          document.getElementById('itemTitle').value = '';
          document.getElementById('itemURL').value = '';
          document.getElementById('itemTags').value = '';
        });
      });
    });
  
    function displaySavedList(savedItems) {
      const savedList = document.getElementById('savedList');
      savedList.innerHTML = '';

      if (savedItems.length === 0) {
        let emptyMessage = document.createElement('p');
        emptyMessage.textContent = 'Nothing saved yet :)';
        savedList.appendChild(emptyMessage);
      } else {
        savedItems.forEach(function (item, index) {
          let listItem = document.createElement('li');
          listItem.dataset.index = index;
          
          let link = document.createElement('a');
          link.href = item.url;
          link.textContent = item.title;
          link.target = "_blank";

          let tagSpan = document.createElement('span');
          tagSpan.textContent = item.tags ? item.tags.join(', ') : '';
          tagSpan.classList.add('tags');

          let deleteButton = document.createElement('button');
          deleteButton.classList.add('delete-button'); 
          deleteButton.innerHTML = '<i class="ri-delete-bin-6-line"></i>'; 
          
          let editButton = document.createElement('button');
          editButton.classList.add('edit-button');
          editButton.innerHTML = '<i class="ri-edit-line"></i>';
          
          deleteButton.addEventListener('click', function (e) {
            e.stopPropagation();
            chrome.storage.local.get('savedItems', function(data) {
              let savedItems = data.savedItems || [];
              savedItems.splice(index, 1); 
              chrome.storage.local.set({ 'savedItems': savedItems }, function () {
                console.log('Item deleted.');
                displaySavedList(savedItems); 
              });
            });
          });

          editButton.addEventListener('click', function (e) {
            e.stopPropagation();
            document.getElementById('itemTitle').value = item.title;
            document.getElementById('itemURL').value = item.url;
            document.getElementById('itemTags').value = item.tags ? item.tags.join(', ') : '';
            document.getElementById('saveButton').textContent = 'Update';
            document.getElementById('saveButton').dataset.editIndex = index;
          });

          listItem.appendChild(link);
          listItem.appendChild(tagSpan);
          listItem.appendChild(editButton);
          listItem.appendChild(deleteButton);
          savedList.appendChild(listItem);
        });

        // Initialize Sortable
        if (savedList.sortable) {
          savedList.sortable.destroy();
        }
        savedList.sortable = new Sortable(savedList, {
          animation: 150,
          onEnd: function (evt) {
            let oldIndex = evt.oldIndex;
            let newIndex = evt.newIndex;
            chrome.storage.local.get('savedItems', function(data) {
              let savedItems = data.savedItems || [];
              let [reorderedItem] = savedItems.splice(oldIndex, 1);
              savedItems.splice(newIndex, 0, reorderedItem);
              chrome.storage.local.set({ 'savedItems': savedItems }, function () {
                console.log('Items reordered.');
                displaySavedList(savedItems);
              });
            });
          }
        });
      }
    }
  
    function filterItems(query) {
      chrome.storage.local.get('savedItems', function(data) {
        let savedItems = data.savedItems || [];
        let filteredItems = savedItems.filter(item => 
          item.title.toLowerCase().includes(query.toLowerCase()) ||
          item.url.toLowerCase().includes(query.toLowerCase()) ||
          (item.tags && item.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase())))
        );
        displaySavedList(filteredItems);
      });
    }
  
    function sortItems(sortBy) {
      chrome.storage.local.get('savedItems', function(data) {
        let savedItems = data.savedItems || [];
        if (sortBy === 'title' || sortBy === 'url') {
          savedItems.sort((a, b) => a[sortBy].localeCompare(b[sortBy]));
        }
        displaySavedList(savedItems);
      });
    }
  
    chrome.storage.local.get('savedItems', function (data) {
      let savedItems = data.savedItems || [];
      displaySavedList(savedItems);
    });
  
    document.getElementById('clearAllButton').addEventListener('click', function() {
      if (confirm('Are you sure you want to clear all saved items?')) {
        chrome.storage.local.set({'savedItems': []}, function() {
          console.log('Saved list has been cleared :) ');
          displaySavedList([]);
        });
      }
    });
  
    document.getElementById('searchButton').addEventListener('click', function() {
      let query = document.getElementById('searchInput').value.trim();
      if (query) {
        chrome.storage.local.get('savedItems', function(data) {
          let savedItems = data.savedItems || [];
          let filteredItems = savedItems.filter(item => 
            item.title.toLowerCase().includes(query.toLowerCase()) ||
            item.url.toLowerCase().includes(query.toLowerCase()) ||
            (item.tags && item.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase())))
          );
          if (filteredItems.length > 0) {
            displaySavedList([filteredItems[0]]); // Display only the top result
          } else {
            alert('No matching items found.');
          }
        });
      } else {
        alert('Please enter a search query.');
      }
    });
  
    document.getElementById('sortSelect').addEventListener('change', function() {
      sortItems(this.value);
    });
  
    document.getElementById('exportButton').addEventListener('click', function() {
      chrome.storage.local.get('savedItems', function(data) {
        let savedItems = data.savedItems || [];
        let content = savedItems.map(item => `${item.title}\n${item.url}\n${item.tags.join(', ')}\n\n`).join('');
        let blob = new Blob([content], {type: 'text/plain'});
        let url = URL.createObjectURL(blob);
        let a = document.createElement('a');
        a.href = url;
        a.download = 'saved_items.txt';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      });
    });
  
    document.getElementById('importInput').addEventListener('change', function(event) {
      let file = event.target.files[0];
      let reader = new FileReader();
      reader.onload = function(e) {
        try {
          let importedItems = JSON.parse(e.target.result);
          chrome.storage.local.get('savedItems', function(data) {
            let savedItems = data.savedItems || [];
            savedItems = savedItems.concat(importedItems);
            chrome.storage.local.set({'savedItems': savedItems}, function() {
              displaySavedList(savedItems);
            });
          });
        } catch (error) {
          alert('Error importing file. Please make sure it\'s a valid JSON file.');
        }
      };
      reader.readAsText(file);
    });
  
    // Auto-fill current page info
    document.getElementById('itemTitle').value = currentTitle;
    document.getElementById('itemURL').value = currentURL;
});
