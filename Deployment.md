# Deployment

We automated some parts of the release process to make things easier. This file lists the necessary steps to release the latest version of the application:

## Preparation

- Check and ensure that
  - previous release branch `release/next` was merged into `develop`
  - the branch `release/next` was deleted

## Create the next release branch

- Check and ensure you are working in the latest `develop` branch and that it's up to date with origin
- From `develop` create a new branch `release/next`
  - Every release goes from this branch, it's a limitation of [changesets](https://github.com/changesets/changesets)
- This will cause an action to run in GitHub, but you must now also add a changeset

## Update the extension version

- If you need to change the version displayed in the extension, create a PR merging into `release/next` to update the `"version": "x.x.x",` inside:
  - `packages/extension/manifest/v2.json`
  - `packages/extension/manifest/v3.json`

## Create the release PR

- Need to have an 'intent to release'
- In your local `release/next` branch run `pnpm changeset`
- Use SPACE to select and ENTER to confirm in the wizard;
  - Select the extension package and packages that may show as "changed"
    - This can be the case, if an npm package was marked for release before
  - Choose a minor version bump
  - When prompted Please enter a summary for this change, enter `Release`
  - When finished the wizard will create a file in the `.changeset` folder
  - Commit and push the changes
  - This will cause another action to run in GitHub
  - Check the bootstrap release action
  - On completion this opens a PR called 'Version Packages'

## Add more fixes and features to the next release

- All PR's for the next release should merge into `release/next` until the release is done

## Release Candidate and QA

- All QA testing should happen on Release Candidate `release/next` branch
- Merge after QA is happy and RC is ready to be published

## Make the release

- Merge 'Version Packages' PR
  - This will cause the package version(s) in `release/next` branch to be updated according to the changeset
  - This will create a tag
  - That will cause the release to be built
- Back-merge `release/next` into develop
- Delete `release/next` branch

## Make a Hotfix to the last release

- Create a new `release/next` branch from the last release tag, then follow steps above

## Submit to store

- Submit to Chrome Web Store (ask Ismael or Thomas)
