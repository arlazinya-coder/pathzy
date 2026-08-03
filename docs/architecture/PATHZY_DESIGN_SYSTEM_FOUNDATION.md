# PATHZY Design System Foundation

PATHZY's Foundation design direction is calm, premium, supportive, and employment-focused.

## Tokens

Core CSS custom properties live in `app/globals.css`:

- Ink: `--pathzy-ink`
- Navy: `--pathzy-navy`
- Deep Navy: `--pathzy-deep-navy`
- Red accent: `--pathzy-red`
- Red dark: `--pathzy-red-dark`
- Ivory: `--pathzy-ivory`
- Mist: `--pathzy-mist`
- Slate: `--pathzy-slate`
- Border: `--pathzy-border`
- Success: `--pathzy-success`
- Warning: `--pathzy-warning`
- Error: `--pathzy-error`
- Radius scale: `--pathzy-radius-*`
- Shadow scale: `--pathzy-shadow-*`
- Typography stacks: `--pathzy-font-display`, `--pathzy-font-body`

## Typography

Display and headings use the shared display stack. Body, form controls, captions, labels, and status text use the body stack. The current implementation avoids remote font downloads during the stabilization phase and uses safe fallbacks until a production font-loading decision is approved.

## Interaction Rules

- Focus states must remain visible.
- Primary brand moments may use controlled PATHZY red.
- Long forms should use warm light surfaces, refined borders, generous spacing, and clear save status.
- Red is not a general decoration colour and should not be used for success.
- No page should rely on colour alone to communicate completion or error state.

## Responsive Rules

Guided onboarding and Professional Identity sections must remain single-task focused on mobile, with large tap targets, no horizontal overflow, visible language access, and no fixed bottom action area that covers form content.
