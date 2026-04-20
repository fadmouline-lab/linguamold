# Shipping Checklist

1. Commit current work — All 54 modified files from the localization overhaul need to be committed to the branch.
2. Run seed migrations — Apply migrations/999_seed.sql (and supporting migrations 020–022 for app_strings) to populate: languages, language pairs, the 197 UI strings, placement test module, sample exercises, and module shells 4–30.
3. Verify the app boots end-to-end — With seed data in place, test that onboarding, the adventure path, and the lesson engine all load correctly against the live Supabase project.
4. Deploy edge functions — calculate-streak and update-leaderboard (Deno source is ready in edge-functions/) need to be deployed to Supabase.
5. Create a SuperAdmin user — Register a user, then manually set role = 'superadmin' in user_profiles so the content editor is accessible.
6. Expand curriculum content — Seed data only covers 3 modules with sample exercises. Use the Admin panel to build out full lessons (8–10 exercises each) for the remaining 27 module shells.
7. Generate and upload audio — content-generation/ has LLM prompts and scripts ready for ElevenLabs TTS batch generation. Audio files need to go into the Supabase audio storage bucket.
8. EAS build and app store submission — The code is ready; this is the final step to ship.
