# V2-Saver

Are you tired of overflowing bookmark folders that make it difficult to find the links you need? I was too, so I built V2 Saver, a Chrome extension that streamlines your link saving process.
With V2 Saver, you can easily save any link you come across with a single click. No more scrambling to remember where you saved something important.

## Features

Here's what V2 Saver can do for you:

- 🔖 **Save links quickly and easily** - No more cluttered bookmarks
- 🏷️ **Organize with tags** - Add custom tags to categorize your saved items
- 🔍 **Powerful search** - Find any saved link instantly by title, URL, or tags
- 📌 **Pin important items** - Keep your most important links at the top
- ✏️ **Edit and manage** - Update titles, URLs, and tags anytime
- 🎯 **Drag and drop** - Reorder your saved items with smooth animations (Fixed reordering persistence)
- 📤 **Export/Import** - Backup and transfer your saved items easily
- 🖱️ **Context menu integration** - Right-click to save from anywhere
- ⌨️ **Keyboard shortcut** - Quick access with Ctrl+Shift+S (Cmd+Shift+S on Mac)
- 🎨 **Beautiful UI** - Clean, modern interface with smooth transitions

## Installation

1. Download or clone this repository
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" in the top right corner
4. Click "Load unpacked"
5. Select the V2-Saver folder

## Usage

### Saving Links

1. Click the V2 Saver icon in your browser toolbar, or use the keyboard shortcut (Ctrl+Shift+S)
2. The current page's title and URL will be pre-filled
3. Add custom tags (comma-separated) if desired
4. Click "Save" to add the item to your list

### Managing Your Saved Items

- **Search**: Use the search bar to filter items by title, URL, or tags
- **Sort**: Choose to sort by title or URL using the dropdown
- **Pin**: Click the pin icon to keep important items at the top
- **Edit**: Click the edit icon to modify title, URL, or tags
- **Delete**: Click the delete icon to remove an item
- **Reorder**: Drag and drop items to arrange them as you like - your custom order is automatically saved
- **Export**: Save all your items to a text file for backup
- **Import**: Load previously exported items back into V2 Saver

### Context Menu

Right-click on any page or selected text and choose "Save to V2 Saver" to quickly add items without opening the popup.

## Settings

Click the extension icon and go to "Options" to configure:

- **Default Tags**: Set tags that will be automatically added to new items
- **Maximum Items**: Limit the number of saved items (10-1000)
- **Theme**: Choose between light and dark themes
- **Auto-sync**: Set how often your items sync (5-1440 minutes)

## Keyboard Shortcuts

- `Ctrl+Shift+S` (Windows/Linux) or `Cmd+Shift+S` (Mac) - Open V2 Saver

## Privacy

V2 Saver stores all your data locally on your device using Chrome's storage API. No data is sent to external servers, and your saved items remain completely private.

## Permissions Explained

- **activeTab**: Access the current tab's title and URL
- **storage**: Save your items and settings locally
- **tabs**: Get information about browser tabs
- **clipboardWrite**: Enable copy-to-clipboard features
- **notifications**: Show notifications when items are saved
- **contextMenus**: Add "Save to V2 Saver" to right-click menu

## Known Issues & Fixes

### ✅ Fixed in v1.1.1
- **Drag-and-drop reordering now properly persists** - Items stay in their new positions after reordering
  - Fixed: Complex DOM manipulation during drag that caused order confusion
  - Fixed: Incorrect index calculation when dropping items
  - Fixed: Order not persisting correctly to Chrome storage
  - Improved: Visual feedback with smooth drop animations
  - Enhanced: More reliable drag-over indicators

## Troubleshooting

### Items Reverting After Drag-and-Drop
✅ **Fixed in v1.1.1** - The reordering now works correctly and persists your changes.

If you experience any issues:
1. Reload the extension from `chrome://extensions/`
2. Close and reopen the popup
3. Check the browser console (F12) for any error messages

## Contributing

Found a bug or have a feature request? Feel free to open an issue or submit a pull request!

## License

This project is open source and available for personal use.

## Version History

- **v1.1.1** - Current version (Bug fix release)
  - 🐛 **Fixed**: Drag-and-drop reordering now properly persists
    - Removed problematic DOM manipulation during drag events
    - Simplified drop position calculation logic
    - Added proper index tracking with `draggedIndex` variable
    - Fixed insertion point calculation (accounting for above/below drop)
    - Enhanced visual feedback with drop animations
    - Items now reliably stay in their new positions after reordering
  - 🔧 **Improved**: More consistent drag-over visual indicators
  - 🔧 **Enhanced**: Better error handling during reorder operations

- **v1.1.0** - Feature-rich release
  - Drag and drop reordering
  - Pin functionality
  - Enhanced search and filtering
  - Export/Import capabilities
  - Context menu integration

- **v1.0.0** - Initial release
  - Basic save and manage functionality
  - Tag support
  - Simple search

## Technical Details

### Drag-and-Drop Implementation
The reordering feature uses native HTML5 drag-and-drop API with the following approach:
- Visual indicators only during drag (no DOM manipulation)
- Precise drop position calculation based on cursor Y position
- Atomic storage updates to prevent race conditions
- Post-drop display refresh for consistency

---

Made with ❤️ for better link management
