# V2 Saver - Smart Link Management Extension

![V2 Saver](V2.png)

## Overview

V2 Saver is a powerful Chrome extension designed for professionals, researchers, and power users who need advanced link management beyond traditional bookmarking. Built with modern web technologies, V2 Saver transforms the way you save, organize, and retrieve web content with intelligent features that adapt to your workflow.

---

## Why V2 Saver Over Traditional Bookmarks?

### Traditional Browser Bookmarks: Limitations
- **Rigid folder hierarchy** that becomes unmanageable with scale
- **No tagging system** for flexible categorization
- **Limited search capabilities** - only title and URL matching
- **No reordering** within folders without manual drag-and-drop
- **No undo functionality** - deleted bookmarks are gone forever
- **Poor export/import** options with proprietary formats
- **No visual feedback** during organization
- **Zero metadata** beyond title and URL

### V2 Saver: The Modern Solution

| Feature | Traditional Bookmarks | V2 Saver |
|---------|----------------------|----------|
| **Organization** | Fixed folder hierarchy | Flexible tag-based system |
| **Search** | Title/URL only | Title, URL, and tags |
| **Reordering** | Limited, not persistent | Full drag-and-drop with persistence |
| **Undo/Redo** | ❌ Not available | ✅ 20-level undo history |
| **Pinning** | ❌ Not available | ✅ Pin important items to top |
| **Import/Export** | HTML format only | Human-readable text format |
| **Context Menu** | Basic bookmarking | Quick-save with metadata |
| **Keyboard Shortcuts** | Limited | Full keyboard navigation |
| **Visual Feedback** | Minimal | Smooth animations & notifications |
| **Bulk Actions** | ❌ Limited | ✅ Export/Import, Clear all |

---

## Key Features

### 🎯 **Smart Organization**
- **Tag-Based System**: Categorize links with multiple tags for flexible organization
- **Pin Important Items**: Keep critical links at the top of your list
- **Custom Sorting**: Sort by title or URL with instant filtering
- **Drag-and-Drop Reordering**: Arrange items visually with automatic persistence

### � **Powerful Search**
- Real-time search across titles, URLs, and tags
- Instant filtering as you type
- Clear visual indicators for search results

### ⚡ **Productivity Enhancements**
- **20-Level Undo System**: Never lose work with comprehensive undo history
- **Keyboard Shortcuts**: Quick access with `Ctrl+Shift+S` (Windows/Linux) or `Cmd+Shift+S` (Mac)
- **Context Menu Integration**: Right-click to save from anywhere
- **Batch Operations**: Export, import, and clear all with one click

### 📤 **Data Portability**
- Export to human-readable text format with metadata
- Import with merge or replace options
- Full backup and restore capabilities
- No vendor lock-in

### 🎨 **User Experience**
- Clean, modern interface with smooth animations
- Visual feedback for all actions
- Responsive design that scales beautifully
- Minimal learning curve with intuitive controls

### 🔒 **Privacy-First Design**
- All data stored locally on your device
- No external servers or cloud sync
- Zero telemetry or tracking
- Complete data ownership

---

## Installation

### From Source
1. Download or clone this repository
```bash
git clone https://github.com/yourusername/V2-Saver.git
```

2. Open Chrome and navigate to `chrome://extensions/`

3. Enable **Developer mode** (toggle in top-right corner)

4. Click **"Load unpacked"**

5. Select the `V2-Saver` folder

### From Chrome Web Store
*Coming soon*

---

## Quick Start Guide

### Saving Your First Link

1. **Method 1: Extension Icon**
   - Click the V2 Saver icon in your browser toolbar
   - Current page details auto-fill
   - Add custom tags (optional)
   - Click "Save"

2. **Method 2: Keyboard Shortcut**
   - Press `Ctrl+Shift+S` (Windows/Linux) or `Cmd+Shift+S` (Mac)
   - Modify details as needed
   - Press Enter or click "Save"

3. **Method 3: Context Menu**
   - Right-click anywhere on a page
   - Select "Save to V2 Saver"
   - Item saved instantly with notification

### Managing Your Collection

#### Search and Filter
- Type in the search box to filter by title, URL, or tags
- Clear search to show all items
- Use dropdown to sort by title or URL

#### Organizing Items
- **Pin**: Click the pin icon to keep important items at the top
- **Edit**: Click the edit icon to modify title, URL, or tags
- **Delete**: Click the delete icon (with confirmation)
- **Reorder**: Drag and drop items to custom positions (persists automatically)

#### Undo Actions
- Click "Undo" button to reverse the last 20 actions
- Keyboard shortcut: `Ctrl+Z` or `Cmd+Z`
- Visual indicator shows available undo count

#### Export and Import
- **Export**: Saves all items to a dated text file with metadata
- **Import**: Load previous exports with merge or replace options
- **Clear All**: Remove all items (with confirmation and undo support)

---

## Configuration

Access settings by clicking the extension icon and selecting "Options":

### Available Settings

| Setting | Options | Default | Description |
|---------|---------|---------|-------------|
| **Default Tags** | Text input | Empty | Auto-add these tags to new items |
| **Maximum Items** | 10-1000 | 100 | Limit total saved items |
| **Theme** | Light/Dark | Light | Interface appearance |
| **Auto-sync Frequency** | 5-1440 min | 60 | Background sync interval |

---

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+Shift+S` / `Cmd+Shift+S` | Open V2 Saver |
| `Ctrl+Z` / `Cmd+Z` | Undo last action |
| `Enter` | Save current item |
| `Esc` | Cancel edit mode |

---

## Technical Specifications

### Built With
- **Manifest Version**: 3 (latest Chrome extension standard)
- **Storage**: Chrome Storage API (local)
- **UI Framework**: Vanilla JavaScript with modern CSS
- **Drag-and-Drop**: SortableJS library
- **Icons**: Remix Icon library

### Browser Compatibility
- ✅ Chrome 88+
- ✅ Edge 88+
- ✅ Brave 1.20+
- ✅ Any Chromium-based browser

### Performance
- Lightweight: < 500KB total size
- Fast: Sub-100ms search and filter
- Efficient: Minimal memory footprint
- Scalable: Handles 1000+ items smoothly

---

## Privacy & Permissions

### Required Permissions Explained

| Permission | Purpose | Data Access |
|------------|---------|-------------|
| `activeTab` | Get current page title and URL | Active tab only |
| `storage` | Save items and settings locally | Local device only |
| `tabs` | Access tab information | Metadata only |
| `clipboardWrite` | Enable copy features | No data reading |
| `notifications` | Show save confirmations | No data collection |
| `contextMenus` | Right-click menu integration | No tracking |

**Data Collection**: None. All data remains on your device.

---

## Roadmap

### Version 1.2 (Planned)
- [ ] Cloud sync with encryption
- [ ] Collections/folders within tags
- [ ] Advanced search with filters
- [ ] Duplicate detection
- [ ] Bulk tag editing

### Version 1.3 (Planned)
- [ ] Firefox support
- [ ] Safari extension
- [ ] Mobile companion app
- [ ] API for third-party integrations
- [ ] Collaborative collections

### Version 2.0 (Future)
- [ ] Full-text search of saved pages
- [ ] Screenshot capture
- [ ] PDF annotation support
- [ ] AI-powered tagging suggestions
- [ ] Smart collections

---

## Changelog

### v1.1.1 (Current)
- ✅ Fixed drag-and-drop reordering persistence
- ✅ Improved visual feedback for drag operations
- ✅ Enhanced drop zone indicators
- ✅ Fixed index calculation during drops
- ✅ Smooth animations for dropped items

### v1.1.0
- Added undo/redo functionality (20 levels)
- Implemented keyboard shortcuts
- Enhanced search with tag filtering
- Improved export format with metadata

### v1.0.0
- Initial release
- Core save/edit/delete functionality
- Tag-based organization
- Basic import/export

---

## Troubleshooting

### Common Issues

**Q: Items revert after drag-and-drop**  
A: Fixed in v1.1.1. Update to the latest version.

**Q: Search not working for tags**  
A: Ensure tags are comma-separated when adding items.

**Q: Undo button is disabled**  
A: No actions to undo yet. Perform an action first.

**Q: Import fails with error**  
A: Ensure the file is in V2 Saver export format (.txt).

**Q: Extension not loading**  
A: Reload the extension from `chrome://extensions/` and check the console for errors.

### Need Help?

1. Check the [GitHub Issues](https://github.com/parthchilwerwar/V2-Saver/issues)
2. Open the browser console (`F12`) for error messages
3. Create a new issue with:
   - Chrome version
   - Extension version
   - Steps to reproduce
   - Console errors (if any)

---

## Contributing

We welcome contributions! Here's how you can help:

### Development Setup
```bash
git clone https://github.com/parthchilwerwar/V2-Saver.git
cd V2-Saver
```

Load the extension in Chrome as described in [Installation](#installation).

### Contribution Guidelines
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Style
- Use ES6+ JavaScript
- Follow existing code formatting
- Add comments for complex logic
- Test thoroughly before submitting

---

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## Acknowledgments

- [SortableJS](https://github.com/SortableJS/Sortable) - Drag-and-drop functionality
- [Remix Icon](https://remixicon.com/) - Beautiful icon library
- [Gotham Font Family](https://www.typography.com/fonts/gotham) - Typography
- All contributors and users providing feedback

---

## Support

If you find V2 Saver useful, consider:
- ⭐ Starring the repository
- 🐛 Reporting bugs
- 💡 Suggesting features
- 📢 Sharing with others

---

## Author

**Parth Chilwerwar**
- GitHub: [@parthchilwerwar](https://github.com/parthchilwerwar)
- Repository: [V2-Saver](https://github.com/parthchilwerwar/V2-Saver)

---

*Built with ❤️ for better web browsing*

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
