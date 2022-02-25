Deployment
=== 

We automated some parts of the release process to make things easier. This file lists the nessisary steps to release the latest version of the application:

1. Run dependabot updates (Insights > Dependency graph > Last checked ... > Check now (for every package)
2. Go through the QA process in Notion
3. [THIS IS BROKEN] Run `npx lerna version` to create tag and push it automatically
4. Wait for pipeline to create release containing the extension zip, and if the automatic npm publish failed, do it manually (ask Gerald)
5. Edit release to contain a bit more than just the auto generated notes and maybe a proper title
6. Submit to Chrome Web Store (ask Julien)
