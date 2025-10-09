# TLC Planner - Accessibility Guide

## Overview

TLC Planner is designed to be accessible to all users, following WCAG 2.1 Level AA guidelines.

## Keyboard Navigation

### Global Navigation
- `Tab` - Move forward through interactive elements
- `Shift + Tab` - Move backward through interactive elements
- `Enter` - Activate buttons and links
- `Escape` - Close modals and dialogs

### Calendar Navigation
- Arrow keys navigate between dates
- `Enter` selects a date
- `Home` jumps to first day of week
- `End` jumps to last day of week
- `PageUp` goes to previous month
- `PageDown` goes to next month

### Forms
- All form fields are keyboard accessible
- Tab order follows visual flow
- Required fields are clearly marked
- Error messages are announced

## Screen Readers

### ARIA Landmarks
- `<header>` for page headers
- `<main>` for primary content
- `<nav>` for navigation menus
- `<aside>` for supplementary content

### Live Regions
- Toast notifications use `aria-live="polite"`
- Loading states announced to screen readers
- Form validation errors announced immediately

### Labels and Descriptions
- All form inputs have associated labels
- Buttons have descriptive text or `aria-label`
- Images have meaningful alt text
- Icons have `aria-hidden` or descriptive text

## Visual Design

### Color Contrast
- Text meets WCAG AA standards (4.5:1)
- Large text meets AAA standards (3:1)
- Interactive elements have sufficient contrast
- Focus indicators are clearly visible

### Focus States
- Custom focus rings on all interactive elements
- Never remove focus outlines
- Focus order follows logical flow
- Skip links for main content

### Typography
- Minimum font size: 14px
- Line height: 1.5 for body text
- Letter spacing optimized for readability
- Font family: system fonts for performance

## Responsive Design

### Mobile Accessibility
- Touch targets minimum 44x44px
- Sufficient spacing between interactive elements
- No horizontal scrolling required
- Zoom enabled (up to 200%)

### Viewport
- Supports portrait and landscape
- Responsive breakpoints at 768px and 1024px
- Content reflows appropriately
- No loss of functionality at any size

## Form Accessibility

### Input Fields
- Clear, descriptive labels
- Placeholder text as hints, not labels
- Required fields marked with asterisk
- Error messages linked to fields

### Validation
- Client-side validation with clear messaging
- Errors shown near relevant fields
- Success states clearly indicated
- No reliance on color alone

### Error Handling
- Descriptive error messages
- Guidance on how to fix errors
- Keyboard accessible error recovery
- No automatic form submission

## Component Accessibility

### Buttons
- Semantic `<button>` elements
- Clear hover and active states
- Loading states indicated
- Disabled state when appropriate

### Modals
- Focus trapped within modal
- Close on `Escape`
- Return focus to trigger on close
- Backdrop click closes modal

### Calendar
- Grid pattern with proper ARIA
- Date cells have semantic meaning
- Selected date clearly indicated
- Keyboard navigation supported

## Testing

### Tools Used
- Lighthouse accessibility audit
- axe DevTools
- Screen reader testing (NVDA, JAWS)
- Keyboard-only navigation testing

### Checklist
- ✅ All interactive elements keyboard accessible
- ✅ Proper heading hierarchy (h1-h6)
- ✅ ARIA landmarks used correctly
- ✅ Color contrast passes WCAG AA
- ✅ Images have alt text
- ✅ Forms have proper labels
- ✅ Focus states visible
- ✅ No keyboard traps

## Known Issues

Currently none. Report accessibility issues through support.

## Future Improvements

- High contrast mode support
- Reduced motion preferences
- Customizable text size
- Dark mode enhancements

## Resources

- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/)
- [WebAIM Resources](https://webaim.org/resources/)

---

**TLC Planner** - Accessible by design, inclusive by default
