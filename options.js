document.addEventListener('DOMContentLoaded', function() {
  loadOptions();

  document.getElementById('optionsForm').addEventListener('submit', function(e) {
    e.preventDefault();
    saveOptions();
  });
});

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

function saveOptions() {
  const defaultTags = document.getElementById('defaultTags').value;
  const maxItems = parseInt(document.getElementById('maxItems').value);
  const theme = document.getElementById('theme').value;
  const autoSync = parseInt(document.getElementById('autoSync').value);

  if (maxItems < 10 || maxItems > 1000) {
    showStatus('Maximum items must be between 10 and 1000', 'error');
    return;
  }

  if (autoSync < 5 || autoSync > 1440) {
    showStatus('Auto-sync frequency must be between 5 and 1440 minutes', 'error');
    return;
  }

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
      
      applyTheme(theme);
      
      updateAutoSync(autoSync);
    }
  });
}

function showStatus(message, type) {
  const status = document.getElementById('status');
  status.textContent = message;
  status.className = 'status ' + type;
  status.style.display = 'block';

  setTimeout(function() {
    status.style.display = 'none';
  }, 3000);
}

function applyTheme(theme) {
  chrome.runtime.sendMessage({
    action: 'applyTheme',
    theme: theme
  });
}

function updateAutoSync(minutes) {
  chrome.runtime.sendMessage({
    action: 'updateAutoSync',
    minutes: minutes
  });
}
