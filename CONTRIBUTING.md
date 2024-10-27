# Contributing to MafiaScum Modtools

There's a few guidelines I wish to impose on people contributing to this project simply as a way to keep internal consistency as much as possible.

## Table of Contents

-   [General Overview](#general-overview-of-codebase)
    -   [Folder Layout](#folder-layout)
    -   [Import Restrictions](#import-restrictions)
-   [Pull Requests](#pull-requests)
-   [Styleguide](#styleguides)

## General Overview of Codebase

### General Workflow

<details>
<summary>Adding a new feature</summary>

1. Create a new folder within `/src/features`. Make sure it is descriptive of what the feature is so it is understood at a single glance.

2. Create a `mount.ts` file directly within that folder, example boilerplate for that file is here

```typescript
export default function mountFeature() {
	// Your code here
}
```

3. In `/src/app/content/content.ts` there is a `mountFeatures` function. Import the file you had created, and call that mount function in this one.

4. The feature now gets initialised when the extension does. Check the "first steps with a feature" section or take a peek at a simple features like `/features/quoteHighlighting` to see how you can advance from here.

</details>

<details>
<summary>First steps with a feature</summary>

TBA

</details>

<details>
<summary>Interacting with background scripts</summary>

TBA

</details>

### Folder Layout

All folders referred to are within the `/src` directory.

Restricted folders. Folders that have rules as to where they can import files from.

-   `/app` is the entry point of the codebase, it pieces together all the features.
    -   You should only really need to edit the `/app/content` and `/app/popup` directories.
-   `/features` are filled with subfolders used to segment and wall off features into their own sections.
    -   From a feature folder, you can only import from its own feature folder or from shared folders (not `/app` or `/features`).

Shared folders (can be imported from anywhere) are as follows

-   `/builders` is a utility folder, where builder classes are placed that are used in multiple parts of the codebase.
-   `/components` filled with various components to import, such as react components (buttons etc).
-   `/lib` filled with various utility functions.

### Import Restrictions

I have set up lint rules to enforce the import restrictions. To reiterate the rules:

-   Files in `/app` can import from `/features` and any shared folder
-   Subfolders within `/features` can import from any and all shared folders as well as their own feature subfolder.
-   Shared folders can import only from other shared folders.

If you need a shared folder that does not currently exist, create it and append the folder to `.eslintrc.js` in the settings section.

It is set up like this to make adding features seamless, changing features in any way should never affect other features and this setup enforces that.

## Pull Requests

When sending in a pull request (PR), please make sure that the following are done.

-   Make sure the formatting is all correct (`npm run format`, or use a prettier plugin on your IDE/Editor)
-   Make sure files are linted (`npm run lint`)
-   Make sure that the CI passes
    -   If you think that the CI is failing due to something outside of what you're sending a PR in for, just make a comment of that in the PR.

## Styleguides

-   All javascript/typescript code (`.ts .tsx .js .jsx`) are to be formatted with [Prettier](https://prettier.io/).
-   Prefer the spread operator for arrays (`[...arr]`) and objects (`{...obj}`) instead of `Object.assign()` or `[].concat` respectively.
-   Inline `export` statements where possible
-   Avoid code that does not work on both manifest v2 and v3.
