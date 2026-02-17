# Testing Guide

This document outlines how to test all features of the Smart Bookmark App.

## Testing Checklist

Use this checklist to verify all features are working correctly:

### Authentication Tests

- [ ] **Google Sign In Works**
  - Click "Sign in with Google"
  - Select Google account
  - Redirect back to app successfully
  - User name/email displayed in header

- [ ] **Sign Out Works**
  - Click "Sign Out" button
  - Redirected to login page
  - Cannot access bookmarks without signing in

- [ ] **Session Persistence**
  - Sign in
  - Close browser
  - Open browser and visit app
  - Should still be signed in (session persisted)

### Bookmark Management Tests

- [ ] **Add Bookmark - Valid Input**
  - Enter title: "Google"
  - Enter URL: "https://google.com"
  - Click "Add Bookmark"
  - Bookmark appears in list immediately
  - Form clears after adding

- [ ] **Add Bookmark - Invalid Input**
  - Try submitting with empty title → Shows alert
  - Try submitting with empty URL → Shows alert

- [ ] **Delete Bookmark**
  - Click "Delete" on any bookmark
  - Bookmark disappears immediately
  - Deleted bookmark no longer appears after page refresh

- [ ] **Bookmark Persistence**
  - Add several bookmarks
  - Refresh the page
  - All bookmarks still appear
  - Bookmarks maintain correct order (newest first)

### Real-time Updates Tests

- [ ] **Real-time Add**
  - Open app in Tab A (signed in)
  - Open app in Tab B (same account)
  - Add bookmark in Tab A
  - Verify bookmark appears in Tab B **immediately** (without refresh)

- [ ] **Real-time Delete**
  - Open app in Tab A (signed in)
  - Open app in Tab B (same account)
  - Delete bookmark in Tab A
  - Verify bookmark disappears in Tab B **immediately** (without refresh)

- [ ] **Multiple Tabs Sync**
  - Open app in 3+ tabs (same account)
  - Add bookmark in one tab
  - Verify it appears in all tabs simultaneously
  - Delete bookmark in different tab
  - Verify it disappears in all tabs simultaneously

### Privacy & Security Tests

- [ ] **Bookmarks are Private**
  - Sign in with Account A
  - Add bookmark "Private A"
  - Sign out
  - Sign in with Account B
  - Verify "Private A" bookmark is NOT visible
  - Add bookmark "Private B"
  - Sign out
  - Sign in with Account A again
  - Verify only "Private A" bookmark is visible (not "Private B")

- [ ] **Cannot Access Without Login**
  - Sign out (or use incognito)
  - Visit app URL
  - Should see login page, not bookmarks

- [ ] **RLS Working**
  - Check Supabase SQL editor
  - Run: `SELECT * FROM bookmarks;`
  - Should only see your own bookmarks (if any)

### UI/UX Tests

- [ ] **Responsive Design**
  - Test on desktop (1920x1080)
  - Test on tablet (768px width)
  - Test on mobile (375px width)
  - All elements visible and functional

- [ ] **Loading States**
  - Observe loading spinner when page first loads
  - Observe "Adding..." button state when adding bookmark
  - Loading states appear and disappear appropriately

- [ ] **Empty State**
  - Delete all bookmarks
  - Verify "No bookmarks" message appears with icon
  - Helpful message displayed

- [ ] **Link Functionality**
  - Click on bookmark URL
  - Opens in new tab
  - Correct website loads

- [ ] **Visual Feedback**
  - Hover over "Delete" button → Color changes
  - Hover over bookmark link → Underline appears
  - Hover over bookmark card → Shadow increases
  - Form inputs focus → Blue ring appears

### Performance Tests

- [ ] **Large Dataset**
  - Add 50+ bookmarks (use a script if needed)
  - Page loads quickly
  - Scrolling is smooth
  - Real-time updates still work

- [ ] **Network Conditions**
  - Use browser dev tools
  - Throttle network to "Slow 3G"
  - Test adding bookmarks → Should still work (just slower)
  - Test real-time updates → Should still work

### Edge Cases

- [ ] **Very Long URL**
  - Add bookmark with 500+ character URL
  - URL displays properly (truncated with ellipsis)
  - Clicking still works

- [ ] **Very Long Title**
  - Add bookmark with 200+ character title
  - Title displays properly (truncated with ellipsis)

- [ ] **Special Characters**
  - Add bookmark with title: `Test & Bookmark <script>`
  - Displays correctly (no XSS issues)

- [ ] **Invalid URL Format**
  - Try adding "not-a-url" as URL
  - Browser validates URL format
  - Suggests adding https://

- [ ] **Concurrent Edits**
  - Open two tabs
  - Add bookmark in both tabs simultaneously
  - Both bookmarks should appear in both tabs

- [ ] **Rapid Actions**
  - Add 5 bookmarks quickly in succession
  - All appear correctly
  - Real-time updates work for all

## Automated Testing Script

Here's a simple test you can run in the browser console:

```javascript
// Test adding multiple bookmarks quickly
async function testMultipleBookmarks() {
  const titles = ['Test 1', 'Test 2', 'Test 3', 'Test 4', 'Test 5'];
  const urls = [
    'https://example1.com',
    'https://example2.com',
    'https://example3.com',
    'https://example4.com',
    'https://example5.com'
  ];

  for (let i = 0; i < titles.length; i++) {
    const titleInput = document.querySelector('input#title');
    const urlInput = document.querySelector('input#url');
    const submitButton = document.querySelector('button[type="submit"]');

    titleInput.value = titles[i];
    urlInput.value = urls[i];
    
    titleInput.dispatchEvent(new Event('input', { bubbles: true }));
    urlInput.dispatchEvent(new Event('input', { bubbles: true }));
    
    submitButton.click();
    
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  console.log('Test completed! Check if all bookmarks appeared.');
}

// Run the test
testMultipleBookmarks();
```

## Test Cases for Evaluators

### Test Case 1: Basic Functionality
1. Visit the deployed URL
2. Sign in with Google
3. Add a bookmark: Title="GitHub", URL="https://github.com"
4. Verify bookmark appears
5. Delete the bookmark
6. Verify bookmark disappears
7. Sign out
**Expected:** All actions work smoothly

### Test Case 2: Real-time Sync
1. Sign in with your Google account
2. Open the same URL in a new tab (same account)
3. In Tab 1: Add bookmark "Real-time Test"
4. **Immediately** check Tab 2
**Expected:** Bookmark appears in Tab 2 without refreshing

### Test Case 3: Privacy
1. Sign in with Google Account A
2. Add bookmark "Account A Bookmark"
3. Sign out
4. Sign in with Google Account B
5. Check bookmark list
**Expected:** "Account A Bookmark" is NOT visible

### Test Case 4: Persistence
1. Sign in and add 3 bookmarks
2. Close browser completely
3. Open browser and visit URL again
**Expected:** Still signed in, all 3 bookmarks visible

## Performance Benchmarks

### Page Load
- Initial load: < 2 seconds
- Time to interactive: < 3 seconds

### Real-time Updates
- Latency: < 500ms from action to update
- Should feel instant

### Database Operations
- Add bookmark: < 500ms
- Delete bookmark: < 300ms
- Load bookmarks: < 1 second

## Browser Compatibility

Test on these browsers:

- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)
- [ ] Mobile Safari (iOS)
- [ ] Chrome Mobile (Android)

## Known Limitations

1. **Browser Tab Limit**: Real-time updates work best with < 10 tabs open
2. **Offline Support**: Not yet implemented (requires service worker)
3. **Bookmark Import**: Not yet implemented
4. **Search/Filter**: Not yet implemented
5. **Categories/Tags**: Not yet implemented

## Reporting Issues

If you find a bug:
1. Note which test case failed
2. Record browser and OS version
3. Capture console errors (F12 → Console)
4. Take screenshot if relevant
5. Note steps to reproduce
6. Open GitHub issue with details

## Success Criteria

The app passes testing if:
- ✅ All authentication tests pass
- ✅ All bookmark management tests pass
- ✅ All real-time update tests pass
- ✅ All privacy & security tests pass
- ✅ Works on major browsers
- ✅ No console errors
- ✅ Responsive on all screen sizes

---

**Happy Testing! 🧪**
