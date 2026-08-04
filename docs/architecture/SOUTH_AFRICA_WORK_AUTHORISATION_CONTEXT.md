# South Africa Work-Authorisation Context

Implemented in:

`lib/employment-intelligence/country/adapters/south-africa/work-authorisation-context.ts`

Canonical states:

- CITIZEN
- PERMANENT_RESIDENT
- VALID_WORK_AUTHORISATION
- AUTHORISATION_RESTRICTED
- AUTHORISATION_EXPIRED
- AUTHORISATION_PENDING
- NO_AUTHORISATION_CONFIRMED
- UNKNOWN
- USER_DECLINED

Rules:

- Nationality is not work authorisation.
- User-supplied status remains self-reported unless verified.
- Unknown means uncertainty, not ineligibility.
- Restricted, expired or pending status creates a documentation review need.
- PATHZY does not provide definitive legal advice.
