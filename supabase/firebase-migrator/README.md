# Firebase data migration tool

Usage:

1. Run `pnpm install`
2. Generated firebase [service account](https://console.firebase.google.com/u/0/project/_/settings/serviceaccounts) and save in a secure place.
3. Generate a user ids map from firebase id to supabase ids. It should be provided as JSON in a following format: `firebaseId>:supabaseId,...`
3. Execute `pnpm start <firebase projectId> <path-to-service-account> <supabaseProjectId> 
