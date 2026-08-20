# Real Estate Lead App - Progressive Web App (PWA) Guide

This app is built as a Progressive Web App (PWA), which means it can be installed on mobile devices and desktops like a native app.

## What is a PWA?

A Progressive Web App combines the best of web and mobile apps. Users can:
- Install it on their home screen
- Use it offline (with limited functionality)
- Receive push notifications (future feature)
- Get app-like experience without App Store downloads

## Installing the PWA

### On Android (Chrome)

1. Open the app in Chrome
2. Tap the menu (three dots)
3. Select "Add to Home screen"
4. Confirm the installation
5. The app icon will appear on your home screen

### On iOS (Safari)

1. Open the app in Safari
2. Tap the Share button
3. Scroll down and tap "Add to Home Screen"
4. Give it a name (e.g., "RE Lead App")
5. Tap "Add"

### On Desktop (Chrome, Edge)

1. Open the app in Chrome or Edge
2. Look for the install icon in the address bar
3. Click "Install"
4. The app will open in its own window

## PWA Features

### ✅ Currently Implemented

- **Installable**: Can be added to home screen
- **Responsive**: Works on all screen sizes
- **Offline Basic**: Caches essential pages
- **App-like**: Runs in standalone mode without browser UI
- **Fast Loading**: Service worker caches resources

### 🚧 Future Enhancements

- **Background Sync**: Sync data when connection is restored
- **Push Notifications**: Get notified about new leads
- **Offline Forms**: Save lead submissions when offline
- **App Updates**: Automatic updates when new version is available

## Technical Details

### Manifest

The app includes a `manifest.json` file that defines:
- App name and icons
- Display mode (standalone)
- Theme colors
- Orientation preferences

### Service Worker

The service worker (`sw.js`) provides:
- Network-first caching strategy
- Offline fallback for essential pages
- Automatic cache management
- Version control

### Caching Strategy

**Network First, Cache Fallback:**
- Tries to fetch fresh content from network
- Falls back to cache if network fails
- Caches successful responses for future use

**What's Cached:**
- Home page
- Login page
- Dashboard
- Static assets (CSS, JS, images)

**What's NOT Cached:**
- API requests to Supabase
- Dynamic property data
- User-specific information

## Testing PWA Features

### Install Test

1. Open the app in a supported browser
2. Check for install prompt or install icon
3. Install the app
4. Verify it opens in standalone mode

### Offline Test

1. Install the app
2. Visit the dashboard
3. Enable airplane mode or disconnect internet
4. Navigate to cached pages (they should load)
5. Try to access uncached pages (will show error)

### Mobile Test

1. Open on a mobile device
2. Install to home screen
3. Test touch interactions
4. Check responsive layout
5. Verify status bar color

## Browser Support

### Fully Supported
- ✅ Chrome (Android & Desktop)
- ✅ Edge (Desktop)
- ✅ Samsung Internet
- ✅ Opera

### Partial Support
- ⚠️ Safari (iOS) - Limited PWA features
- ⚠️ Firefox - Some PWA features missing

### Not Supported
- ❌ Internet Explorer
- ❌ Older browser versions

## Best Practices for Users

### For Best Experience:

1. **Install the App**: Better performance and app-like experience
2. **Use Mobile Data**: Works on cellular and WiFi
3. **Update Regularly**: Close and reopen to get updates
4. **Clear Cache**: If experiencing issues, clear browser cache

### Recommended:

- Use Chrome on Android for best PWA experience
- Keep browser updated
- Enable notifications (when feature is added)

## Development

### Running PWA Locally

```bash
# Development server
npm run dev

# Build and test production PWA
npm run build
npm start
```

### Testing PWA Features

Use Chrome DevTools:
1. Open DevTools (F12)
2. Go to "Application" tab
3. Check:
   - Manifest
   - Service Workers
   - Cache Storage
   - Install prompt

### Lighthouse Audit

Run a PWA audit:
1. Open Chrome DevTools
2. Go to "Lighthouse" tab
3. Select "Progressive Web App"
4. Click "Generate report"

Target scores:
- PWA: 90+
- Performance: 90+
- Accessibility: 90+
- Best Practices: 90+

## Troubleshooting

### App Not Installing

- Clear browser cache
- Check browser version
- Ensure HTTPS (or localhost)
- Verify manifest.json is accessible

### Service Worker Not Registering

- Check browser console for errors
- Verify sw.js is in public folder
- Check HTTPS connection
- Disable ad blockers

### Offline Mode Not Working

- Ensure service worker is registered
- Check cache storage in DevTools
- Verify network requests in DevTools
- Try uninstalling and reinstalling

### Updates Not Showing

- Close all app instances
- Clear service worker cache
- Hard refresh (Ctrl+Shift+R)
- Uninstall and reinstall

## Security Considerations

- PWA requires HTTPS (except localhost)
- Service worker runs in secure context
- Cached data is stored locally
- Users can clear cached data anytime

## Future PWA Features

Planned enhancements:
1. **Push Notifications**: New lead alerts
2. **Background Sync**: Offline form submissions
3. **Share Target**: Share listings from other apps
4. **Shortcuts**: Quick actions from home screen icon
5. **Periodic Background Sync**: Auto-update lead status

## Resources

- [PWA Documentation](https://web.dev/progressive-web-apps/)
- [Service Worker API](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
- [Web App Manifest](https://developer.mozilla.org/en-US/docs/Web/Manifest)
