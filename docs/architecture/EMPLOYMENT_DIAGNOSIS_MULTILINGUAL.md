# Employment Diagnosis Multilingual Contract

Diagnosis separates canonical answer codes from presentation labels.

Rules:

- Interface language controls question rendering.
- Canonical answer codes remain unchanged when switching English/French.
- Question titles, prompts, help text, why-we-ask text, and options have English and French labels.
- Missing or regional language values are normalized through the shared language normalizer.
- Document language is not used as the diagnosis answer code language.

Switching language must not reset answers, create a new session, duplicate questions, or alter branch decisions.
