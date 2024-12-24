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
        
       
        let isDuplicate = savedItems.some(item => item.title === itemTitle && item.url === itemURL);
        
        if (isDuplicate && editIndex === undefined) {
          if (!confirm('An item with the same title and URL already exists. Do you want to save it anyway?')) {
            return;
          }
        }
        
        let newItem = { 
          url: itemURL, 
          title: itemTitle, 
          tags: itemTags,
          pinned: false
        };
        
        if (editIndex !== undefined) {
          
          savedItems[editIndex] = newItem;
          document.getElementById('saveButton').textContent = 'Save';
          document.getElementById('saveButton').dataset.editIndex = undefined;
        } else {
          
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
        return;
      }

      // Sort items to show pinned items first
      savedItems.sort((a, b) => {
        if (a.pinned === b.pinned) return 0;
        return a.pinned ? -1 : 1;
      });

      savedItems.forEach((item, index) => {
        let listItem = document.createElement('li');
        listItem.draggable = true;
        listItem.dataset.index = index;
        
        if (item.pinned) {
          listItem.classList.add('pinned');
        }
        
        // Content container
        let contentDiv = document.createElement('div');
        contentDiv.className = 'item-content';
        
        let link = document.createElement('a');
        link.href = item.url;
        link.textContent = item.title;
        link.target = "_blank";
        
        let tagSpan = document.createElement('span');
        tagSpan.textContent = item.tags ? item.tags.join(', ') : '';
        tagSpan.classList.add('tags');
        
        contentDiv.appendChild(link);
        contentDiv.appendChild(tagSpan);
        
        // Actions container
        let actionsDiv = document.createElement('div');
        actionsDiv.className = 'item-actions';
        
        let pinButton = document.createElement('button');
        pinButton.classList.add('pin-button');
        pinButton.innerHTML = `<i class="ri-pushpin-${item.pinned ? 'fill' : 'line'}"></i>`;
        
        let editButton = document.createElement('button');
        editButton.classList.add('edit-button');
        editButton.innerHTML = '<i class="ri-edit-line"></i>';
        
        let deleteButton = document.createElement('button');
        deleteButton.classList.add('delete-button');
        deleteButton.innerHTML = '<i class="ri-delete-bin-6-line"></i>';
        
        // Add drag events
        listItem.addEventListener('dragstart', handleDragStart);
        listItem.addEventListener('dragend', handleDragEnd);
        listItem.addEventListener('dragover', handleDragOver);
        listItem.addEventListener('drop', handleDrop);
        listItem.addEventListener('dragenter', handleDragEnter);
        listItem.addEventListener('dragleave', handleDragLeave);
        
        // Add button event listeners
        deleteButton.addEventListener('click', (e) => {
          e.stopPropagation();
          chrome.storage.local.get('savedItems', function(data) {
            let items = data.savedItems || [];
            items.splice(index, 1);
            chrome.storage.local.set({ 'savedItems': items }, () => {
              displaySavedList(items);
            });
          });
        });

        editButton.addEventListener('click', (e) => {
          e.stopPropagation();
          document.getElementById('itemTitle').value = item.title;
          document.getElementById('itemURL').value = item.url;
          document.getElementById('itemTags').value = item.tags ? item.tags.join(', ') : '';
          document.getElementById('saveButton').textContent = 'Update';
          document.getElementById('saveButton').dataset.editIndex = index;
        });
        
        pinButton.addEventListener('click', (e) => {
          e.stopPropagation();
          chrome.storage.local.get('savedItems', function(data) {
            let items = data.savedItems || [];
            // Find the item by matching title and URL to ensure we update the correct item
            const itemIndex = items.findIndex(i => 
              i.title === item.title && 
              i.url === item.url
            );
            
            if (itemIndex !== -1) {
              items[itemIndex].pinned = !items[itemIndex].pinned;
              chrome.storage.local.set({ 'savedItems': items }, () => {
                displaySavedList(items);
              });
            }
          });
        });

        actionsDiv.appendChild(pinButton);
        actionsDiv.appendChild(editButton);
        actionsDiv.appendChild(deleteButton);
        
        listItem.appendChild(contentDiv);
        listItem.appendChild(actionsDiv);
        savedList.appendChild(listItem);
      });
    }
  
    // Drag and Drop handlers
    let draggedItem = null;

    function handleDragStart(e) {
      draggedItem = this;
      this.classList.add('dragging');
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/plain', this.dataset.index);
    }

    function handleDragEnd(e) {
      this.classList.remove('dragging');
      let items = document.querySelectorAll('#savedList li');
      items.forEach(item => item.classList.remove('drag-over'));
    }

    function handleDragOver(e) {
      e.preventDefault();
      const rect = this.getBoundingClientRect();
      const midY = rect.top + rect.height / 2;
      
      // Remove existing drag-over classes
      this.classList.remove('drag-over-top', 'drag-over-bottom');
      
      if (e.clientY < midY) {
        this.classList.add('drag-over-top');
      } else {
        this.classList.add('drag-over-bottom');
      }
      
      e.dataTransfer.dropEffect = 'move';
      return false;
    }

    function handleDragEnter(e) {
      this.classList.add('drag-over');
    }

    function handleDragLeave(e) {
      this.classList.remove('drag-over', 'drag-over-top', 'drag-over-bottom');
    }

    function handleDrop(e) {
      e.stopPropagation();
      e.preventDefault();
      
      if (draggedItem !== this) {
        const fromIndex = parseInt(draggedItem.dataset.index);
        const toIndex = parseInt(this.dataset.index);
        const rect = this.getBoundingClientRect();
        const midY = rect.top + rect.height / 2;
        
        chrome.storage.local.get('savedItems', function(data) {
          let items = data.savedItems || [];
          const [movedItem] = items.splice(fromIndex, 1);
          
          // Insert above or below based on drop position
          const adjustedIndex = e.clientY < midY ? toIndex : toIndex + 1;
          items.splice(adjustedIndex, 0, movedItem);
          
          chrome.storage.local.set({ 'savedItems': items }, function() {
            displaySavedList(items);
            const droppedItem = document.querySelector(`[data-index="${adjustedIndex}"]`);
            if (droppedItem) {
              droppedItem.classList.add('dropped');
              setTimeout(() => {
                droppedItem.classList.remove('dropped');
              }, 400);
            }
          });
        });
      }
      
      // Clean up
      this.classList.remove('drag-over', 'drag-over-top', 'drag-over-bottom');
      return false;
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
            displaySavedList([filteredItems[0]]); 
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
  
    
    document.getElementById('itemTitle').value = currentTitle;
    document.getElementById('itemURL').value = currentURL;
});
