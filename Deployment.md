Deployment
=== 

We automated some parts of the release process to make things easier. This file lists the nessisary steps to release the latest version of the application:

1. run npx lerna version to create tag and push it automatically
2. wait for pipeline to create release and add the extension zip automatically
3. edit release to contain a bit more than just the auto generated notes and maybe a proper title
4. submit to chrome web store
5. (if needed) release npm package manually (should be automated next)

### Todos:

- [x] automate manifest.json bumping using [Lifecycle Scripts](https://github.com/lerna/lerna/blob/main/commands/version/README.md#lifecycle-scripts)
- [ ] automate npm release
