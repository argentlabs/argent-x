Deployment
=== 

We automated some parts of the release process to make things easier. This file lists the nessisary steps to release the latest version of the application:

1. Run `npx lerna version` to create tag and push it automatically
2. Wait for pipeline to create release containing the extension zip and publish to npm if needed
3. Edit release to contain a bit more than just the auto generated notes and maybe a proper title
4. Submit to Chrome Web Store
