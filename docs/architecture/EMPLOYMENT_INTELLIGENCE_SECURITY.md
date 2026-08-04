# Employment Intelligence Security

Security model:

- all tables use RLS
- policies scope reads and writes to `auth.uid() = user_id`
- API derives user ID from Supabase authentication
- client-supplied user IDs are ignored
- service-role keys are not used in client code
- finalization function verifies `auth.uid() = p_user_id`
- action transitions validate registry action codes and allowed state changes

Cross-user access should fail at both API and RLS boundaries.
