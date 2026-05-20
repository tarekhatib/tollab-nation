Plan

- Identify which Beirut Scope URL shows the small WhatsApp preview: homepage, category page, article page, or another link.
- Verify metadata for that URL:
  - open graph image tags
  - twitter card settings
  - absolute image URLs vs relative URLs
- Confirm the default social preview image asset (`/og-image.png`) is accessible and has proper dimensions.
- Check article page metadata generation for `coverImage` and ensure it is returned as an absolute URL when used in Open Graph / Twitter metadata.
- Fix metadata generation as needed so WhatsApp can render a large preview reliably.
- Consider regenerating or clearing link preview cache after metadata changes.
