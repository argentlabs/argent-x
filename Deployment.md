Deployment
=== 

We automated some parts of the release process to make things easier. This file lists the nessisary steps to release the latest version of the application:

1. Run dependabot updates (Insights > Dependency graph > Last checked ... > Check now (for every package)
2. Go through the QA process in Notion
3. Run `npx lerna version` to create branch and tag and push it automatically
4. Create PR to merge your changes to develop
5. Wait for pipeline to create release containing the extension zip, and if the automatic npm publish failed, do it manually (ask Gerald)
6. Edit release to contain a bit more than just the auto generated notes and maybe a proper title
7. Submit to Chrome Web Store (ask Julien)
