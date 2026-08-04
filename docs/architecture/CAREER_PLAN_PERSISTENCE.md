# Career Plan Persistence

Table: `employment_career_plans`.

Career Plans are persisted as derived records tied to:

- user
- Employment Intelligence profile
- action recommendation set
- input snapshot hash
- Career Plan engine version

Progress is calculated from Action History and stored as `progress_json`.

Only one Career Plan is current for a user and intelligence profile.
