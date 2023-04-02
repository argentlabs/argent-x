# Deployment

We automated some parts of the release process to make things easier. This file lists the necessary steps to release the latest version of the application:

- Check and ensure the previous release branch `release/vX.Y.Z` was merged into `main`
- Check and ensure `main` was back-merged into `develop`
- Check and ensure you are working in the latest `develop` branch
- Run `pnpm run version` - this will:
  - update the `version` in each `package.json` and `manifest.json`
  - create branch `release/vX.Y.Z`
  - create tag `vX.Y.Z`
  - push the branch and tag automatically
- Pushing a tag triggers a release build action in GitHub
- Wait for pipeline to create release containing the extension zip
- If the automatic npm publish failed, do it manually (ask Gerald)
- Create GitHub pull request to merge the new branch `release/vX.Y.Z` into `main`
- Create GitHub pull request to back-merge `main` into `develop`
- Edit release to contain a bit more than just the auto generated notes and maybe a proper title
- Submit to Chrome Web Store (ask Ismael)
