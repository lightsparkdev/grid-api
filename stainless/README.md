# stlc workspace

This directory is the [stlc](https://github.com/stainless/stlc) workspace that generates the Kotlin SDK in [`lightsparkdev/grid-kotlin-sdk`](https://github.com/lightsparkdev/grid-kotlin-sdk).

It holds no config of its own. `workspace.json` points at the bundled spec, `../openapi.yaml`, and at the Stainless config, `../.stainless/stainless.yml`. Change SDK generation in that config file.

## Build the Kotlin SDK

Gradle 8.12, which the SDK pins, does not run on JDK 26, so use JDK 21:

```bash
export JAVA_HOME=/opt/homebrew/opt/openjdk@21/libexec/openjdk.jdk/Contents/Home
cd stainless
stlc build --branch <sdk-branch> --trunk-branch main --targets kotlin --push \
  --commit "<conventional commit message>"
stlc test --targets kotlin
```

The SDK repo clones into `stainless/sdks/grid-kotlin-sdk`. Its `main` requires a pull request, so build onto a branch and open a pull request from it. Merge that pull request with **Create a merge commit**. Squash and rebase create new commits, and stlc's custom-code tracking can't follow them.

## Custom code

`custom-code/kotlin/` records the hand-written code that stlc reapplies on every build, such as `CurrencyUtils` and `WebhookUtils`. Commit only the file whose `branch` is `main`. Files for other branches are only needed while that branch builds.

After an SDK pull request merges, point the `main` tracking file at the new SDK `main`, check that the next build has nothing to change, and commit it:

```bash
stlc repair --force --targets kotlin --branch main
stlc build --branch main --trunk-branch main --targets kotlin --dry-run
```
