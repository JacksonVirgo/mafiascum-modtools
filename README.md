# Mafia Engine Browser Extension

This is primarily made for MafiaScum, but is labeled Mafia Engine as that's my overarching project name for all mafia-related projects.

### Prerequisites

-   [Node.js v22.9 or higher](https://nodejs.org/)

### Installation

1. Clone the repository

```sh
git clone https://github.com/JacksonVirgo/mafiascum-modtools.git
cd mafiascum-modtools
```

2. Install dependencies

```sh
npm i
```

3. Check out [CONTRIBUTING.md](CONTRIBUTING.md) for information about the codebase and how to effectively contribute.

### Compiling

This project is set up to compile to both v2 and v3 browser extensions, please don't use permissions/features that do not work in both.

-   Release build (slower)

```bash
npm run build
```

-   Development build (watches for changes so it can recompile automatically)

```bash
npm run dev
```

### Linting and Formatting

There are CI rules to ensure that the repository is in a state where it's typesafe, linted and formatted correctly. Please use the `npm run lint` command to make sure it's linted correctly.

### Build Location

It should create a `/dist` folder with the compiled extensions for both manifest v2 and v3. You can then load it into your browsers depending on which version the browser supports.

Generally Chrome-based browsers will use v3 whereas Firefox will use v2. If you're not sure, try v3 followed by v2.
