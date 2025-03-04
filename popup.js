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

    if (!itemURL.startsWith('http://') && !itemURL.startsWith('https://')) {
      itemURL = 'https://' + itemURL;
      document.getElementById('itemURL').value = itemURL;
    }

    chrome.storage.local.get('savedItems', function (data) {
      let savedItems = data.savedItems || [];
      let editIndex = document.getElementById('saveButton').dataset.editIndex;
      
      if (editIndex !== undefined) {
        editIndex = parseInt(editIndex);
      }
      
      let isDuplicate = savedItems.some((item, index) => 
        item.title === itemTitle && 
        item.url === itemURL && 
        (editIndex === undefined || index !== editIndex)
      );
      
      if (isDuplicate && editIndex === undefined) {
        if (!confirm('An item with the same title and URL already exists. Do you want to save it anyway?')) {
          return;
        }
      }
      
      let newItem = { 
        url: itemURL, 
        title: itemTitle, 
        tags: itemTags,
        pinned: editIndex !== undefined ? savedItems[editIndex].pinned : false
      };
      
      if (editIndex !== undefined) {
        savedItems[editIndex] = newItem;
        document.getElementById('saveButton').textContent = 'Save';
        document.getElementById('saveButton').removeAttribute('data-edit-index');
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
    if (!savedList) {
        console.error('savedList element not found');
        return;
    }
    savedList.innerHTML = '';

    if (!Array.isArray(savedItems) || savedItems.length === 0) {
        const emptyMessage = document.createElement('p');
        emptyMessage.textContent = 'Nothing saved yet :)';
        savedList.appendChild(emptyMessage);
        return;
    }

    // Sort items: pinned first, then by title
    savedItems.sort((a, b) => {
        if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
        return a.title.localeCompare(b.title);
    });

    savedItems.forEach((item, index) => {
      let listItem = document.createElement('li');
      listItem.draggable = true;
      listItem.dataset.index = index;
      
      if (item.pinned) {
        listItem.classList.add('pinned');
      }
      
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
      
      listItem.addEventListener('dragstart', handleDragStart);
      listItem.addEventListener('dragend', handleDragEnd);
      listItem.addEventListener('dragover', handleDragOver);
      listItem.addEventListener('drop', handleDrop);
      listItem.addEventListener('dragenter', handleDragEnter);
      listItem.addEventListener('dragleave', handleDragLeave);
      
      pinButton.addEventListener('mousedown', e => e.stopPropagation());
      editButton.addEventListener('mousedown', e => e.stopPropagation());
      deleteButton.addEventListener('mousedown', e => e.stopPropagation());
      
      deleteButton.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        
        const itemIndex = parseInt(listItem.getAttribute('data-index'));
        
        if (confirm('Are you sure you want to delete this item?')) {
          deleteItem(itemIndex).then(updatedItems => {
            displaySavedList(updatedItems);
          }).catch(error => {
            console.error('Error deleting item:', error);
            showNotification('Error deleting item. Please try again.', 'error');
          });
        }
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
          const itemIndex = items.findIndex(i => i.title === item.title && i.url === item.url);
          
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

  let draggedItem = null;

  function handleDragStart(e) {
    draggedItem = this;
    this.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', this.dataset.index);
    
    // Ensure the dragged item stays visible for native drag feedback
    setTimeout(() => {
      this.style.opacity = '0.9'; // Matches .dragging opacity in CSS
    }, 0);
  }

  function handleDragEnd(e) {
    if (draggedItem) {
      draggedItem.classList.remove('dragging');
      draggedItem.style.opacity = '1';
    }
    
    document.querySelectorAll('#savedList li').forEach(item => {
      item.classList.remove('drag-over', 'drag-over-top', 'drag-over-bottom');
    });
    
    draggedItem = null;
  }

  function handleDragOver(e) {
    e.preventDefault();
    if (!draggedItem || draggedItem === this) return;
    
    const rect = this.getBoundingClientRect();
    const midY = rect.top + rect.height / 2;
    const isAbove = e.clientY < midY;
    
    // Clear previous indicators
    document.querySelectorAll('#savedList li').forEach(item => {
      item.classList.remove('drag-over-top', 'drag-over-bottom');
    });
    
    // Add drop zone indicator
    this.classList.add(isAbove ? 'drag-over-top' : 'drag-over-bottom');
    
    // Move the dragged item in the DOM
    const parent = this.parentNode;
    if (isAbove) {
      parent.insertBefore(draggedItem, this);
    } else {
      parent.insertBefore(draggedItem, this.nextSibling);
    }
    
    // Update indices
    updateIndices();
    
    e.dataTransfer.dropEffect = 'move';
  }

  function handleDragEnter(e) {
    if (draggedItem !== this) {
      this.classList.add('drag-over');
    }
  }

  function handleDragLeave(e) {
    this.classList.remove('drag-over', 'drag-over-top', 'drag-over-bottom');
  }

  function handleDrop(e) {
    e.preventDefault();
    e.stopPropagation();
    
    if (!draggedItem || draggedItem === this) return;
    
    const fromIndex = parseInt(draggedItem.dataset.index);
    const toIndex = parseInt(this.dataset.index);
    
    if (isNaN(fromIndex) || isNaN(toIndex)) {
        console.error('Invalid indices during drag and drop');
        return;
    }

    chrome.storage.local.get('savedItems', async function(data) {
        try {
            let items = Array.isArray(data.savedItems) ? data.savedItems : [];
            const [itemToMove] = items.splice(fromIndex, 1);
            const adjustedToIndex = toIndex > fromIndex ? toIndex - 1 : toIndex;
            items.splice(adjustedToIndex, 0, itemToMove);
            
            await new Promise((resolve, reject) => {
                chrome.storage.local.set({ 'savedItems': items }, function() {
                    if (chrome.runtime.lastError) reject(chrome.runtime.lastError);
                    else resolve();
                });
            });

            displaySavedList(items);
            const movedItem = document.querySelector(`#savedList li[data-index="${adjustedToIndex}"]`);
            if (movedItem) {
                movedItem.classList.add('dropped');
                setTimeout(() => movedItem.classList.remove('dropped'), 500);
            }
        } catch (error) {
            console.error('Error during drag and drop:', error);
            showNotification('Failed to reorder items', 'error');
        }
    });
  }

  function updateIndices() {
    const items = document.querySelectorAll('#savedList li');
    items.forEach((item, index) => {
      item.dataset.index = index;
    });
  }

  function filterItems(query) {
    if (typeof query !== 'string') {
        console.error('Invalid query type');
        return;
    }

    query = query.toLowerCase().trim();
    
    chrome.storage.local.get('savedItems', function(data) {
        try {
            const savedItems = Array.isArray(data.savedItems) ? data.savedItems : [];
            const filteredItems = savedItems.filter(item => 
                (item.title && item.title.toLowerCase().includes(query)) ||
                (item.url && item.url.toLowerCase().includes(query)) ||
                (Array.isArray(item.tags) && item.tags.some(tag => 
                    tag && tag.toLowerCase().includes(query)
                ))
            );
            displaySavedList(filteredItems);
        } catch (error) {
            console.error('Error filtering items:', error);
            showNotification('Error filtering items', 'error');
        }
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
        console.log('Saved list has been cleared :)');
        displaySavedList([]);
        showNotification('All items cleared!', 'success');
      });
    }
  });

  document.getElementById('searchButton').addEventListener('click', function() {
    let query = document.getElementById('searchInput').value.trim();
    if (query) {
      filterItems(query);
    } else {
      alert('Please enter a search query.');
    }
  });

  document.getElementById('searchInput').addEventListener('input', function() {
    if (this.value.trim() === '') {
      chrome.storage.local.get('savedItems', function(data) {
        displaySavedList(data.savedItems || []);
      });
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
        const content = e.target.result.trim();
        const lines = content.split('\n\n');
        
        const importedItems = lines.map(line => {
          const parts = line.split('\n');
          const title = parts[0] ? parts[0].trim() : '';
          const url = parts[1] ? parts[1].trim() : '';
          const tags = parts[2] ? parts[2].split(',').map(tag => tag.trim()) : [];
          return { title, url, tags, pinned: false };
        }).filter(item => item.title && item.url);

        chrome.storage.local.get('savedItems', function(data) {
          let savedItems = data.savedItems || [];
          savedItems = savedItems.concat(importedItems);
          chrome.storage.local.set({'savedItems': savedItems}, function() {
            displaySavedList(savedItems);
            showNotification('Items imported successfully!', 'success');
          });
        });
      } catch (error) {
        alert('Error importing file. Please make sure it\'s a valid text file.');
      }
    };
    
    reader.readAsText(file);
  });

  function showNotification(message, type = 'info') {
    if (!message) return;
    
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    // Remove existing notifications
    document.querySelectorAll('.notification').forEach(n => n.remove());
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s forwards';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
  }

  function deleteItem(index) {
    return new Promise((resolve, reject) => {
        chrome.storage.local.get('savedItems', function(data) {
            if (chrome.runtime.lastError) {
                reject(chrome.runtime.lastError);
                return;
            }

            const currentItems = Array.isArray(data.savedItems) ? data.savedItems : [];
            if (index < 0 || index >= currentItems.length) {
                reject(new Error('Invalid item index'));
                return;
            }

            const updatedItems = currentItems.filter((_, idx) => idx !== index);
            
            chrome.storage.local.set({ 'savedItems': updatedItems }, function() {
                if (chrome.runtime.lastError) {
                    reject(chrome.runtime.lastError);
                    return;
                }
                resolve(updatedItems);
            });
        });
    });
  }

  document.getElementById('itemTitle').value = currentTitle;
  document.getElementById('itemURL').value = currentURL;
});