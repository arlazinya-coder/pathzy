# Professional Photo and Profile Presentation Architecture

Status: Phase 2.7 implementation pending storage application and authenticated QA
Date: 2026-08-03

## Current Implementation Findings

- The locked Professional Identity section list includes `photo`.
- The current editor renders a real Professional Photo upload UI through `components/professional-identity/profile-action-editor.tsx`.
- The upload, replace, metadata update, signed-preview, and remove lifecycle is handled by `app/api/professional-identity/photo/route.ts`.
- The current metadata write path stores the canonical reference as `discovery_responses.answers.professional_photo_asset` and the human status marker as `discovery_responses.answers.profile_photo`.
- The current read path maps `professional_photo_asset` into Professional Identity through `lib/professional-identity/professional-identity-completion.ts`.
- The secure Supabase Storage setup is defined in `supabase/migrations/20260803120000_create_professional_photo_storage.sql`; it still must be applied and verified in the connected environment before the gate can close.
- `user_documents` supports owned document metadata, but it is not a canonical profile-photo asset store.
- CV templates declare whether they can use the canonical photo asset through `photoCapability`.

## Canonical Photo Model

The canonical professional photo is represented by `CanonicalProfessionalPhotoAsset` in `lib/professional-identity/professional-photo.ts`.

The model separates:

- the binary file in private object storage
- stable database metadata
- crop and focal-point metadata
- generated derivatives
- consent and visibility decisions
- downstream CV usage permission
- future public-sharing permission

Temporary browser URLs such as `blob:` and `data:` URLs must never be persisted.

## Storage Contract

The intended storage contract is:

- private bucket: `professional-photos`
- user-scoped path: `{userId}/profile/{photoAssetId}.{extension}`
- authenticated ownership enforcement
- no service-role credentials in client code
- no public unrestricted photo URLs
- no large base64 images in profile records
- no independent CV-owned profile photos

This contract is backed by a local idempotent Supabase Storage migration file. The migration has not been applied automatically; the connected Supabase project must be verified before production or founder QA.

## Upload Validation Contract

Allowed file types:

- JPEG
- PNG
- WebP

Validation must cover:

- MIME type
- extension and MIME consistency
- empty file
- maximum file size
- minimum useful dimensions
- corrupt image handling before persistence

The Phase 2.7 implementation validates MIME type, extension, file size, image dimensions, and corrupt image data before storage persistence. Derivative generation remains future work.

## Professional Profile Preview

The Professional Profile preview must be a private representation of canonical Professional Identity.

It may display:

- professional photo
- name
- professional title
- location
- career goal
- summary
- skills
- education
- experience
- projects
- achievements
- certificates
- licences
- languages
- availability
- work authorization
- portfolio and professional links

It must not become a second profile data source, social network, public search surface, feed, follower system, or LinkedIn clone.

## CV Template Photo Contract

`DocumentTemplateMetadata` now includes `photoCapability`.

Each CV template declares:

- `photoMode`: `none`, `optional`, or `recommended`
- supported crop/aspect modes
- fallback layout when no authorized photo is available

Rules:

- photo-disabled templates never render the image
- optional templates use the photo only when the user has enabled CV usage
- no template owns an independent photo upload
- no missing-photo frame is rendered
- photo-free layouts must remain premium and correctly aligned

## Gate Status

This phase now includes the core upload implementation, but the production gate remains blocked until:

- the `professional-photos` private storage bucket exists in the connected Supabase project
- owner-scoped storage policies are applied and verified
- server-authorized upload, replace, remove, retry, signed preview, and metadata persistence pass authenticated QA
- account-switching and cross-user access tests pass
- authenticated founder QA confirms persistence across refresh, logout/login, and browser reopen
