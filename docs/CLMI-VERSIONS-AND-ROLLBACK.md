# CLMI versions and rollback

Owner-approved names, 10 September 2026. Repository: https://github.com/clmitv02-webdesign/clmi-website. Production: https://www.christloveministriesinternational.org.

| Version | Design | Permanent source tag | Dedicated Vercel copy |
|---|---|---|---|
| V1.0 | Original production design before the September refresh | [v1.0](https://github.com/clmitv02-webdesign/clmi-website/tree/v1.0), source8e8d7a65672e0f6bd2bd55631f7bcc01fb5219eb | [V1.0 backup](https://clmi-site-60vzvl6l7-clmi.vercel.app) |
| V1.1 | Refreshed website live immediately before V2.0 | [v1.1](https://github.com/clmitv02-webdesign/clmi-website/tree/v1.1), source718d3cb11e9a3d4cb1bc1f8dce76917ab48646ca | [V1.1 backup](https://clmi-site-7ntjwhn21-clmi.vercel.app) |
| V2.0 | Welcome, reversible Bishop portrait reveal, subtle pointer glass, continuous side particles, full sticky translucent header | v2.0 (created with the release commit) | Production deployment recorded after publishing |

## Backup evidence

V1.0 copy source commitffc087b9d71ea09cf005fa6191670bad0a955089 on codex/releases/v1.0 has the identical Git tree9302ed69100b1768d8e434bd7af651e23c9f3a3b as the original. V1.1 copy commitc49d98f363164ffa0071260eead3effacdd53542 on codex/releases/v1.1 has the identical treed03df45cc4e4664dac5809d252efefb7b73fa055 as the previous live release. Vercel GitHub deployment statuses6361085348 and6361087272 both reported success before the V2.0 production push. Backup URLs require Vercel sign-in; direct rendered-content comparison of those protected copies was not available.

Before publishing V2.0, the public V1.1 domain matched archived source on39/39 HTML routes;433/433 referenced local URLs responded successfully. Both source tags and named backup branches were verified on the church remote.

Local recovery archives: /Users/ob/Documents/Claude/clmi-site-backups/versioned-release-20260910-ZGrA5s. Keep these plus the remote tags. Do not delete or force-move the version tags or release branches.

## Easiest rollback

Tell the agent: **Restore CLMI V1.0**, **Restore CLMI V1.1**, or **Restore CLMI V2.0**. Restore only on explicit owner instruction.

With a signed-in Vercel account, open the relevant original production deployment and choose Instant Rollback:

- V1.0: https://vercel.com/clmi/clmi-site/GaaqSV7VPS93Aa2j5XHwFQuPJWgr
- V1.1: https://vercel.com/clmi/clmi-site/GExuicGpwd8ePBzLnr5XzDGbDJ3F
- V2.0: deployment link added after publishing.

## Durable fallback if a Vercel deployment expires

The source tags can rebuild the exact version via the existing GitHub-to-Vercel connection. This adds a new commit on production without deleting history or touching the local working files. Example for V1.1 (replace v1.1 with the requested tag):

```sh
git fetch church main --tags
restore_commit=$(git commit-tree 'v1.1^{tree}' -p church/main -m 'Restore CLMI V1.1 at owner request')
git push church "$restore_commit:refs/heads/main"
```

Never force-push. If another production change races the restore, the push should fail; inspect before retrying. Wait for Vercel success and verify public HTML/assets against the chosen tag's public directory. Do not send email or submit website forms as QA.

Vercel CLI was unauthorized and browser login was unavailable during this release. Retention settings/runtime logs were not inspected or changed. Vercel copies may be subject to its [retention policy](https://vercel.com/docs/deployment-retention); source tags and local archives are the durable rebuild fallback. A future rebuild may use a newer platform runtime; content is preserved, but successful future hosting cannot be guaranteed in perpetuity.
