# Mafia Engine Browser Extension

This is primarily made for MafiaScum, but is labeled Mafia Engine as that's my overarching project name for all mafia-related projects.

## Setup

Follow these steps to set up and run the project locally. If these steps aren't up to date, please let me know and I will fix them.

### Prerequisites

Make sure you have the following installed on your machine:

-   [Node.js](https://nodejs.org/)
-   Run `npm install` to install all the dependencies

### Compiling

As this project uses Typescript and SCSS, it requires compilation to be used, to do so perform the following command

```bash
npm run build
```

If you wish to run this in production, restarting automatically when a change has been made use

```bash
npm run dev
```

### Linting and Formatting

There are CI rules to ensure that the repository is in a state where it's typesafe, linted and formatted correctly. Please use the `npm run lint` command to make sure it's linted correctly.

### Build Location

It should create a `/dist` folder with the compiled extensions for both manifest v2 and v3. You can then load it into your browsers depending on which version the browser supports.

Generally Chrome-based browsers will use v3 whereas Firefox will use v2. If you're not sure, try v3 followed by v2.
