# PATHZY Export Standard

PATHZY is the editor.

PDF is the final published document.

The CV model is the single source of truth for structured CV data. Editor data, live preview, saved drafts, and PDF export must all read from the same CV model. Template choices may change design, spacing, color, and typography, but must not change the user's underlying CV data.

## Core Rules

- The live preview and exported PDF must match.
- Exported documents must never contain internal PATHZY guidance, editor instructions, debug text, template descriptions, placeholders, or product notes.
- Empty sections must be hidden from preview and PDF.
- Empty headings must not appear.
- Full name must map only to the CV name area.
- Target role must map only to the role/headline area.
- Users must be able to type normal spaces in names, roles, companies, skills, and section content.
- Trim and cleanup may happen on save/export, not while the user is typing.
- Long CVs must paginate across A4 pages without cutting text, overlapping sections, or shrinking text until unreadable.
- Headings should stay with their first content item whenever possible.
- Job, project, and education items should stay together whenever possible.
- PDF is the normal user export format for professional documents.
- DOCX and text export must not appear in the normal user export flow.

## Product Quality Bar

Premium visual quality is required, not optional.

Every exported CV must look recruiter-ready:

- Professional typography.
- Consistent margins.
- Clear section hierarchy.
- Appropriate spacing.
- Strong but restrained accent color.
- No placeholder content.
- No internal PATHZY wording.
- No broken downloads.
- No blank pages.
- No clipped, hidden, or overlapping content.

## Acceptance Standard

A CV export is acceptable only when:

1. The user can generate a CV.
2. The user can edit all main sections.
3. The user can add optional sections.
4. The user can save the draft.
5. The saved draft reloads after leaving and returning.
6. The preview still loads the saved draft.
7. A long CV creates additional A4 pages.
8. The PDF downloads all pages.
9. The PDF matches the preview.
10. The PDF is complete, beautiful, and recruiter-ready.
11. The PDF contains no internal PATHZY wording or editor instructions.
