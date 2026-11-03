# Mexiko Reiseführer

The Mexiko Reiseführer website, built on [EmDash](https://emdashcms.com) (Astro on
Cloudflare Workers, with D1 and R2). It is available in German (default), English and Spanish.

## Development

Requires Node 22.16+.

```bash
npm install
npm run dev                 # http://localhost:4321
```

On a fresh database, open
`http://localhost:4321/_emdash/api/setup/dev-bypass?redirect=/_emdash/admin`.
This applies `seed/seed.json` (schema plus content) and signs you in as a local
dev admin. Then create the contact forms:

```bash
EMDASH_COOKIE="astro-session=..." node scripts/create-contact-forms.mjs
```

To reset local data, delete `.wrangler/state`.

## Deploy (Cloudflare)

1. Create the resources named in `wrangler.jsonc`:
   `npx wrangler d1 create mexiko-reisefuehrer` and
   `npx wrangler r2 bucket create mexiko-reisefuehrer-media`.
2. Set the secrets `EMDASH_ENCRYPTION_KEY` (copy the value from `.env` and keep a backup)
   and `EMDASH_SITE_URL` (the production URL).
3. Connect the final domain **before** the owner registers a passkey, because passkeys only work on the domain they were created on.
4. `npm run deploy`, then run the setup wizard at `/_emdash/admin` (include the sample content).
5. Create an API token in the admin and run
   `EMDASH_URL=https://… EMDASH_TOKEN=… NOTIFY_EMAIL=… node scripts/create-contact-forms.mjs`.
6. Configure an email provider in EmDash so notifications and autoresponders are sent.

See `AGENTS.md` for the structure, the design system and the i18n conventions.
