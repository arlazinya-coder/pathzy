# PATHZY Elite Document Engine Contract

This contract keeps the Elite Cover Letter work compatible with the separate Elite CV Engine work.

## Shared Applicant Profile Data

All professional documents should read applicant facts from the same profile-shaped adapter:

- full name
- email
- phone
- city
- country
- LinkedIn
- career goal
- education
- field of study
- verified skills
- verified projects
- verified certifications

Document engines may transform wording, but they must not invent employers, years, qualifications, certificates, metrics, licences, or achievements.

## Document Toolbar Interface

Every professional document page should expose the same action pattern:

- Generate
- Improve Content
- Preview Designs
- Select Design
- Save Version
- Download PDF
- Back to My Professional Profile
- Back to My Employment Journey

Membership affects locked actions only. It must not route users to a different implementation.

## Template Registry Interface

Each document type owns its template list while following the same metadata shape:

- name
- bestFor
- ATS compatibility when relevant
- thumbnail label
- accent
- recommended signals

Template switching must never erase user content.

## PDF Renderer Interface

The published PDF must be generated from the same document data model used by the preview.

Export rules:

- PDF only in the user flow
- A4 page size
- no placeholders
- no internal PATHZY guidance
- no browser controls
- no blank pages
- clean filename

## Saved Version Interface

All generated documents must save into `public.user_documents` with:

- `document_type`
- `document_title`
- `template_name`
- `content_json`
- `content_text`
- `status`
- `version_number`
- `last_downloaded_at`

The Elite Cover Letter system stores its model at `content_json.eliteCoverLetterData`.

