Deployment
=== 

We automated some parts of the release process to make things easier. This file lists the nessisary steps to release the latest version of the application:

1. edit manifest.json in extension package to match the version you want to release and commit (may be automated using Lifecycle Scripts in the near future)
2. run npx lerna version to create tag (match the release you put into manifest.json please) and push it automatically
3. wait for pipeline to create release and add the extension zip automatically
4. edit release to contain a bit more than just the auto generated notes and maybe a proper title
5. submit to chrome web store
6. (if needed) release npm package manually (should be automated next)

### Todos:

- [ ] automate manifest.json bumping using [Lifecycle Scripts](https://github.com/lerna/lerna/blob/main/commands/version/README.md#lifecycle-scripts)
- [ ] automate npm release
