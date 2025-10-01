// Options page functionality for V2 Saver

document.addEventListener('DOMContentLoaded', function() {
  // Load saved options
  loadOptions();

  // Save options when form is submitted
  document.getElementById('optionsForm').addEventListener('submit', function(e) {
    e.preventDefault();
    saveOptions();
  });
});

// Load options from storage
function loadOptions() {
  chrome.storage.sync.get({
    defaultTags: '',
    maxItems: 100,
    theme: 'light',
    autoSync: 60
  }, function(items) {
    document.getElementById('defaultTags').value = items.defaultTags;
    document.getElementById('maxItems').value = items.maxItems;
    document.getElementById('theme').value = items.theme;
    document.getElementById('autoSync').value = items.autoSync;
  });
}

// Save options to storage
function saveOptions() {
  const defaultTags = document.getElementById('defaultTags').value;
  const maxItems = parseInt(document.getElementById('maxItems').value);
  const theme = document.getElementById('theme').value;
  const autoSync = parseInt(document.getElementById('autoSync').value);

  // Validate inputs
  if (maxItems < 10 || maxItems > 1000) {
    showStatus('Maximum items must be between 10 and 1000', 'error');
    return;
  }

  if (autoSync < 5 || autoSync > 1440) {
    showStatus('Auto-sync frequency must be between 5 and 1440 minutes', 'error');
    return;
  }

  // Save to storage
  chrome.storage.sync.set({
    defaultTags: defaultTags,
    maxItems: maxItems,
    theme: theme,
    autoSync: autoSync
  }, function() {
    if (chrome.runtime.lastError) {
      showStatus('Error saving options: ' + chrome.runtime.lastError.message, 'error');
    } else {
      showStatus('Options saved successfully!', 'success');
      
      // Apply theme immediately
      applyTheme(theme);
      
      // Update alarm for auto-sync
      updateAutoSync(autoSync);
    }
  });
}

// Show status message
function showStatus(message, type) {
  const status = document.getElementById('status');
  status.textContent = message;
  status.className = 'status ' + type;
  status.style.display = 'block';

  // Hide after 3 seconds
  setTimeout(function() {
    status.style.display = 'none';
  }, 3000);
}

// Apply theme
function applyTheme(theme) {
  // Send message to background script to apply theme globally
  chrome.runtime.sendMessage({
    action: 'applyTheme',
    theme: theme
  });
}

// Update auto-sync alarm
function updateAutoSync(minutes) {
  chrome.runtime.sendMessage({
    action: 'updateAutoSync',
    minutes: minutes
  });
}
