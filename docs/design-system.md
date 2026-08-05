# Design System

## Core Aesthetic
The application is designed to emulate a **modern digital art gallery**.
- **Calm**: Lots of negative space and desaturated background tones.
- **Confident**: Sharp typography and bold contrast.
- **Editorial**: Emulating print layouts through spacing and hierarchy.

## Tokens & Variables
All design parameters are abstracted in `src/core/theme/tokens.ts`.
- **Colors**: Organized by semantic purpose (`primary`, `surface`, `background`, `border`, `text`).
- **Spacing**: A strict mathematical scale (4, 8, 12, 16, 24, 32, 48, 64) to ensure rhythm.
- **Typography**: Handcrafted size and line-height pairings.

## Primitive Components
- `<Typography>`: The only text component allowed in the application. Prevents scattered `font-size` definitions.
- `<Button>`: Multi-variant (primary, secondary, glass, danger) interaction surface.
- `<TextField>`, `<SelectionField>`, `<PasswordField>`: Form inputs supporting icons, focus states, and `forwardRef` integration for React Hook Form.
