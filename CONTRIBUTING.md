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

There are a few important sections to a feature.

-   The entrypoint `mount.ts`
-   The `/background` folder

The `mount.ts` file is used to initialise the feature. Any file within this feature folder _must_ be a content script (aka running on the site itself). If you're mounting react, you can also use `mount.tsx` as the mounting file name

Any script you wish to run in a background process must be both within a `/background` subfolder.

When manipulating the DOM, you are welcome to use vanilla JS but I recommend using jQuery as it is available within the repository.

```typescript
// features/newfeature/mount.ts
import $ from 'jquery';
```

ReactJS is also available if you want to inject HTML into the page, and don't wish to do this directly in jQuery/vanilla JS

React must be in a `.tsx` file, and you must import React in every file you're using any react code.

To inject a react component into the page with jQuery, use the helper function I have made in `/lib/react` as shown below. You only have to use this function when using jQuery to import, you don't have to use it when using a react component in another react component.

```typescript
// features/newfeature/mount.tsx
import React from 'react';
import $ from 'jquery';
import { renderReact } from '../../lib/react';

// This function is called on initialisation
export default function mountNewFeature() {
	// Append the new component to the page body
	$('body').append(renderReact(<ReactComponent />));
}

function ReactComponent() {
	return (
		<div>
			<span>This is a component</span>
		</div>
	);
}
```

</details>

<details>
<summary>Interacting with background scripts</summary>

Background scripts are within the `/background` folder in a feature. You cannot call these functions directly, as they do not run on the same process as content scripts.

But don't stress! I've created a simple builder to set these scripts up in both processes and an easy way to call them. The builder is in `/src/builders/background.ts`.

In your features `/background` folder, you may have a file with the following:

```typescript
// features/newfeature/background/ping.ts
import { BackgroundScript } from '../../../builders/background';
import { z } from 'zod';

export const pingBackgroundScript = new BackgroundScript('pingBackgroundScript')
	// Define what you need to call the function
	.input(
		z.object({
			message: z.string(),
		}),
	)
	// Define what the function returns
	.output(
		z.object({
			message: z.string(),
		}),
	)
	// Define what the function does
	.onQuery(async ({ message }) => {
		// This runs on a background process
		console.log(message);
		return {
			message,
		};
	});
```

As you can see, I use zod for validation. You can read more about zod schemas [here](https://zod.dev/?id=basic-usage). They're painfull simple, so don't worry!

On the consumers end, you can import that builder and run `x.query()`. Under the hood, it sends a request to the background and waits for the response to send back to you. All the complexity is hidden from you.

Make sure you're not calling any functions from `/background` outside of that folder except these types of queries.

```typescript
// features/newfeature/consumer.ts
import { pingBackgroundScript } from './background/ping.ts';

async function exampleFunction() {
	const response = await pingBackgroundScript.query({
		message: 'Hello world!',
	});

	console.log(response);

	/* 
    RESPONSE:
    {
        message: 'Hello world!'
    }
    */
}
```

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
