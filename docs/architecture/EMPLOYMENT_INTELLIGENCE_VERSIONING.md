# Employment Intelligence Versioning

Persisted versions distinguish:

- Professional Identity snapshot version
- Employment Diagnosis version
- country context version
- intelligence engine version
- action engine version
- Career Plan engine version
- action history state revision through timestamps

The canonical input hash is deterministic and excludes presentation-only language, theme and UI preference fields.

Same input versions and same engine versions skip unnecessary recompute unless forced.
