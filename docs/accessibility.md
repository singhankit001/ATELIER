# Accessibility (a11y)

Premium design is worthless if it excludes users.

## Semantics
All primitive interactions (`<Button>`, `<TextField>`, `<GalleryItem>`) have explicit `accessibilityRole` declarations. Screen readers instantly recognize what an element is, rather than reading raw text nodes.

## State Communication
Interactive elements communicate their current state. A disabled button sets `accessibilityState={{ disabled: true }}`, giving VoiceOver and TalkBack users immediate context without requiring trial and error.

## Visual Accessibility
- **Contrast**: The design system strictly enforces high-contrast text against surfaces.
- **Touch Targets**: All `<Pressable>` regions, particularly back buttons or trailing icons in TextFields, are mapped to a minimum `48x48` tap target area, even if the visual icon is only `24x24`.
