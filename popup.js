chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
  let currentURL = tabs[0].url;
  let currentTitle = tabs[0].title;

  // Undo System
  const MAX_UNDO_HISTORY = 20;
  let undoHistory = [];
  
  function updateUndoButton() {
    const undoButton = document.getElementById('undoButton');
    if (undoButton) {
      undoButton.disabled = undoHistory.length === 0;
      undoButton.title = undoHistory.length > 0 
        ? `Undo (${undoHistory.length} action${undoHistory.length > 1 ? 's' : ''} available)` 
        : 'No actions to undo';
    }
  }
  
  function saveStateForUndo(action, previousState, description = '') {
    const undoEntry = {
      action: action,
      previousState: JSON.parse(JSON.stringify(previousState)),
      timestamp: Date.now(),
      description: description
    };
    
    undoHistory.push(undoEntry);
    
    // Limit history size
    if (undoHistory.length > MAX_UNDO_HISTORY) {
      undoHistory.shift();
    }
    
    updateUndoButton();
    console.log(`Saved undo state: ${action}`, undoEntry);
  }
  
  function performUndo() {
    if (undoHistory.length === 0) {
      showNotification('Nothing to undo!', 'info');
      return;
    }
    
    const lastAction = undoHistory.pop();
    console.log('Undoing action:', lastAction);
    
    chrome.storage.local.set({ 'savedItems': lastAction.previousState }, function() {
      if (chrome.runtime.lastError) {
        console.error('Error during undo:', chrome.runtime.lastError);
        showNotification('Undo failed!', 'error');
        undoHistory.push(lastAction); // Restore to history on failure
      } else {
        displaySavedList(lastAction.previousState);
        showNotification(`Undone: ${lastAction.description || lastAction.action}`, 'success');
      }
      updateUndoButton();
    });
  }
  
  // Undo button click handler
  document.getElementById('undoButton').addEventListener('click', function() {
    performUndo();
  });
  
  // Keyboard shortcut for undo (Ctrl+Z or Cmd+Z)
  document.addEventListener('keydown', function(e) {
    if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
      e.preventDefault();
      performUndo();
    }
  });

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
      
      // Save state for undo BEFORE making changes
      const previousState = JSON.parse(JSON.stringify(savedItems));
      
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
        
        // Save to undo history
        const actionDescription = editIndex !== undefined 
          ? `Edit "${itemTitle}"` 
          : `Add "${itemTitle}"`;
        saveStateForUndo(editIndex !== undefined ? 'edit' : 'add', previousState, actionDescription);
        
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

    // Display items in their current order
    // Pinned items appear first, then unpinned items
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
        
        const itemTitle = item.title;
        const itemURL = item.url;
        
        if (confirm('Are you sure you want to delete this item?')) {
          deleteItem(itemTitle, itemURL).then(updatedItems => {
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
          
          // Save state for undo BEFORE pinning/unpinning
          const previousState = JSON.parse(JSON.stringify(items));
          
          const itemIndex = items.findIndex(i => i.title === item.title && i.url === item.url);
          
          if (itemIndex !== -1) {
            const isPinned = items[itemIndex].pinned;
            items[itemIndex].pinned = !isPinned;
            
            // When pinning, move to top of pinned items
            // When unpinning, move to top of unpinned items
            if (!isPinned) {
              // Pinning: move to start of array
              const [pinnedItem] = items.splice(itemIndex, 1);
              items.unshift(pinnedItem);
            } else {
              // Unpinning: move to after last pinned item
              const [unpinnedItem] = items.splice(itemIndex, 1);
              const lastPinnedIndex = items.findIndex(i => !i.pinned);
              if (lastPinnedIndex === -1) {
                items.push(unpinnedItem);
              } else {
                items.splice(lastPinnedIndex, 0, unpinnedItem);
              }
            }
            
            chrome.storage.local.set({ 'savedItems': items }, () => {
              // Save to undo history after successful pin/unpin
              const actionDescription = isPinned ? `Unpin "${item.title}"` : `Pin "${item.title}"`;
              saveStateForUndo(isPinned ? 'unpin' : 'pin', previousState, actionDescription);
              
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
  let draggedIndex = null;

  function handleDragStart(e) {
    draggedItem = this;
    draggedIndex = parseInt(this.dataset.index);
    this.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', this.dataset.index);
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
    draggedIndex = null;
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
    
    // Add visual drop zone indicator
    this.classList.add(isAbove ? 'drag-over-top' : 'drag-over-bottom');
    
    // Move the dragged item in the DOM for real-time visual feedback
    const parent = this.parentNode;
    if (isAbove) {
      parent.insertBefore(draggedItem, this);
    } else {
      parent.insertBefore(draggedItem, this.nextSibling);
    }
    
    // Update dataset indices after DOM reordering for accurate tracking
    const allItems = Array.from(parent.children);
    allItems.forEach((item, index) => {
      item.dataset.currentPosition = index;
    });
    
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
    
    if (!draggedItem) {
      return;
    }
    
    // Get the current order from the DOM (after visual reordering)
    const listItems = Array.from(document.querySelectorAll('#savedList li'));
    const newOrder = listItems.map(item => parseInt(item.dataset.index));
    
    // Check if order actually changed
    const originalOrder = listItems.map((item, index) => index);
    const orderChanged = !newOrder.every((val, idx) => val === originalOrder[idx]);
    
    if (!orderChanged) {
      console.log('No order change detected');
      return;
    }
    
    // Get the original saved items
    chrome.storage.local.get('savedItems', function(data) {
        try {
            let items = Array.isArray(data.savedItems) ? [...data.savedItems] : [];
            
            // Save state for undo BEFORE reordering
            const previousState = JSON.parse(JSON.stringify(items));
            
            // Reorder items based on the new DOM order using original indices
            const reorderedItems = newOrder.map(originalIndex => {
              if (originalIndex >= 0 && originalIndex < items.length) {
                return items[originalIndex];
              }
              return null;
            }).filter(item => item !== null);
            
            // Validate we didn't lose any items
            if (reorderedItems.length !== items.length) {
              console.error('Item count mismatch after reordering');
              showNotification('Reordering failed - item count mismatch', 'error');
              displaySavedList(items); // Restore original display
              return;
            }
            
            // Save the reordered array
            chrome.storage.local.set({ 'savedItems': reorderedItems }, function() {
                if (chrome.runtime.lastError) {
                    console.error('Error saving reordered items:', chrome.runtime.lastError);
                    showNotification('Failed to save new order', 'error');
                    displaySavedList(items); // Restore original display
                } else {
                    console.log('Items reordered successfully');
                    console.log('New order:', reorderedItems.map(item => item.title));
                    
                    // Save to undo history after successful reorder
                    saveStateForUndo('reorder', previousState, 'Reorder items');
                    
                    // Refresh display with new order
                    displaySavedList(reorderedItems);
                    
                    // Visual feedback - find the dragged item in new position
                    setTimeout(() => {
                      const newIndex = newOrder.indexOf(draggedIndex);
                      if (newIndex >= 0) {
                        const movedItem = document.querySelector(`#savedList li[data-index="${newIndex}"]`);
                        if (movedItem) {
                            movedItem.classList.add('dropped');
                            setTimeout(() => movedItem.classList.remove('dropped'), 500);
                        }
                      }
                    }, 50);
                    
                    showNotification('Items reordered successfully!', 'success');
                }
            });
        } catch (error) {
            console.error('Error during drag and drop:', error);
            showNotification('Failed to reorder items', 'error');
        }
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
      chrome.storage.local.get('savedItems', function(data) {
        // Save state for undo BEFORE clearing
        const previousState = data.savedItems || [];
        
        chrome.storage.local.set({'savedItems': []}, function() {
          console.log('Saved list has been cleared :)');
          
          // Save to undo history after successful clear
          saveStateForUndo('clear', previousState, `Clear all (${previousState.length} items)`);
          
          displaySavedList([]);
          showNotification('All items cleared!', 'success');
        });
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
      
      if (savedItems.length === 0) {
        showNotification('No items to export!', 'error');
        return;
      }
      
      // Create header with metadata
      let header = `V2 Saver Export\n`;
      header += `Export Date: ${new Date().toLocaleString()}\n`;
      header += `Total Items: ${savedItems.length}\n`;
      header += `${'='.repeat(50)}\n\n`;
      
      // Format each item with clear separators
      let content = savedItems.map((item, index) => {
        let itemText = `Item ${index + 1}:\n`;
        itemText += `Title: ${item.title}\n`;
        itemText += `URL: ${item.url}\n`;
        itemText += `Tags: ${item.tags && item.tags.length > 0 ? item.tags.join(', ') : 'No tags'}\n`;
        itemText += `Pinned: ${item.pinned ? 'Yes' : 'No'}\n`;
        return itemText;
      }).join('\n' + '-'.repeat(50) + '\n\n');
      
      let fullContent = header + content;
      let blob = new Blob([fullContent], {type: 'text/plain'});
      let url = URL.createObjectURL(blob);
      let a = document.createElement('a');
      a.href = url;
      a.download = `V2_Saver_Export_${new Date().toISOString().split('T')[0]}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      showNotification(`${savedItems.length} items exported successfully!`, 'success');
    });
  });

  document.getElementById('importInput').addEventListener('change', function(event) {
    let file = event.target.files[0];
    
    if (!file) {
      showNotification('No file selected!', 'error');
      return;
    }
    
    if (!file.name.endsWith('.txt')) {
      showNotification('Please select a valid .txt file!', 'error');
      return;
    }
    
    let reader = new FileReader();
    
    reader.onload = function(e) {
      try {
        const content = e.target.result.trim();
        
        if (!content) {
          showNotification('File is empty!', 'error');
          return;
        }
        
        // Parse the import file
        const importedItems = parseImportFile(content);
        
        if (importedItems.length === 0) {
          showNotification('No valid items found in the file!', 'error');
          return;
        }
        
        // Ask user if they want to merge or replace
        chrome.storage.local.get('savedItems', function(data) {
          let savedItems = data.savedItems || [];
          
          if (savedItems.length > 0) {
            if (confirm(`You have ${savedItems.length} existing items. Do you want to ADD ${importedItems.length} imported items?\n\nClick OK to add, or Cancel to replace all items.`)) {
              // Merge: Add imported items to existing
              savedItems = savedItems.concat(importedItems);
            } else {
              // Replace: Use only imported items
              savedItems = importedItems;
            }
          } else {
            savedItems = importedItems;
          }
          
          chrome.storage.local.set({'savedItems': savedItems}, function() {
            displaySavedList(savedItems);
            showNotification(`Successfully imported ${importedItems.length} items!`, 'success');
            // Reset the file input
            event.target.value = '';
          });
        });
      } catch (error) {
        console.error('Import error:', error);
        showNotification('Error importing file. Please check the file format.', 'error');
      }
    };
    
    reader.onerror = function() {
      showNotification('Error reading file!', 'error');
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

  function deleteItem(title, url) {
    return new Promise((resolve, reject) => {
        chrome.storage.local.get('savedItems', function(data) {
            if (chrome.runtime.lastError) {
                reject(chrome.runtime.lastError);
                return;
            }

            const currentItems = Array.isArray(data.savedItems) ? data.savedItems : [];
            
            // Save state for undo BEFORE deleting
            const previousState = JSON.parse(JSON.stringify(currentItems));
            
            const updatedItems = currentItems.filter(item => !(item.title === title && item.url === url));
            
            if (updatedItems.length === currentItems.length) {
                reject(new Error('Item not found'));
                return;
            }
            
            chrome.storage.local.set({ 'savedItems': updatedItems }, function() {
                if (chrome.runtime.lastError) {
                    reject(chrome.runtime.lastError);
                    return;
                }
                
                // Save to undo history after successful delete
                saveStateForUndo('delete', previousState, `Delete "${title}"`);
                
                showNotification('Item deleted successfully!', 'success');
                resolve(updatedItems);
            });
        });
    });
  }

  // Parse import file function
  function parseImportFile(content) {
    const items = [];
    
    // Split by item separators
    const itemBlocks = content.split(/[-]{50,}/);
    
    itemBlocks.forEach(block => {
      const lines = block.split('\n').filter(line => line.trim() !== '');
      
      let title = '';
      let url = '';
      let tags = [];
      let pinned = false;
      
      lines.forEach(line => {
        const trimmedLine = line.trim();
        
        // Skip header lines and empty lines
        if (trimmedLine.startsWith('V2 Saver Export') || 
            trimmedLine.startsWith('Export Date:') || 
            trimmedLine.startsWith('Total Items:') || 
            trimmedLine.startsWith('=') || 
            trimmedLine.startsWith('Item ')) {
          return;
        }
        
        // Parse each field
        if (trimmedLine.startsWith('Title:')) {
          title = trimmedLine.substring(6).trim();
        } else if (trimmedLine.startsWith('URL:')) {
          url = trimmedLine.substring(4).trim();
        } else if (trimmedLine.startsWith('Tags:')) {
          const tagText = trimmedLine.substring(5).trim();
          if (tagText && tagText !== 'No tags') {
            tags = tagText.split(',').map(tag => tag.trim()).filter(tag => tag !== '');
          }
        } else if (trimmedLine.startsWith('Pinned:')) {
          pinned = trimmedLine.substring(7).trim().toLowerCase() === 'yes';
        }
      });
      
      // Validate and add item
      if (title && url) {
        // Ensure URL has protocol
        if (!url.startsWith('http://') && !url.startsWith('https://')) {
          url = 'https://' + url;
        }
        
        items.push({
          title: title,
          url: url,
          tags: tags,
          pinned: pinned
        });
      }
    });
    
    return items;
  }

  document.getElementById('itemTitle').value = currentTitle;
  document.getElementById('itemURL').value = currentURL;
});