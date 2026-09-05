# Production release and rollback — 6 September 2026

OB explicitly authorized backing up the currently live design before publishing the approved local refresh.

## Preserved previous design

- Original production source: `8e8d7a65672e0f6bd2bd55631f7bcc01fb5219eb`.
- Original Vercel deployment: `https://clmi-site-ob4l9ruo7-clmi.vercel.app`.
- Original deployment dashboard: `https://vercel.com/clmi/clmi-site/GaaqSV7VPS93Aa2j5XHwFQuPJWgr`.
- Separate GitHub backup branch: `codex/backup-production-2026-09-06` on `clmitv02-webdesign/clmi-website`.
- Backup commit: `f5fd9b2676112643e1de309e21e5766cebc6776a`. Its file tree is identical to original production; only commit metadata changed to trigger a separate Vercel backup deployment.
- Backup deployment dashboard: `https://vercel.com/clmi/clmi-site/A68cL4sShdDcYiLjXGyJLnFEj1CN`.
- Local source archive: `/Users/ob/Documents/Claude/clmi-site-backups/clmi-production-before-refresh-2026-09-06-010946`.
- Before publishing, all 39 original production HTML routes matched the archived source byte for byte; all 380 absolute local references extracted from that HTML responded successfully.

## Restore only if OB requests it

In the Vercel `clmi / clmi-site` project, open the original production deployment above and use **Instant Rollback**. This points production back to the previous deployment without rebuilding. With authenticated CLI access, the corresponding command is:

```sh
vercel rollback https://clmi-site-ob4l9ruo7-clmi.vercel.app
```

Alternatively, restore the backup file tree in a separate clean checkout, make a new commit on the current production branch, and push to `church/main`. Do not force-push or reset the user's working tree. Retain this backup branch and both old-design Vercel deployments. A deployment may be subject to the account's retention policy; the remote source branch and local source archive allow rebuilding later if necessary.

After rollback, verify the public domain against the archived source:

```sh
node tools/verify-deployment.mjs https://www.christloveministriesinternational.org /Users/ob/Documents/Claude/clmi-site-backups/clmi-production-before-refresh-2026-09-06-010946/public
```

## Deployment mechanism and limits

The Vercel CLI reported unauthorized. Deployment uses the existing GitHub-to-Vercel integration, not a new project or hosting service. No credentials were changed. No email, contact/newsletter submission, payment, DNS change, or external message is part of verification. Vercel runtime logs, account retention settings, monitoring and log drains cannot be inspected with the current CLI session.
