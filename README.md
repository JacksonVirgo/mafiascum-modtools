# Mafia Engine Browser Extension

This is primarily made for MafiaScum, but is labeled Mafia Engine as that's my overarching project name for all mafia-related projects.

## Build Instructions

Make sure you have NodeJS installed as I use webpack to compile it properly

Run the following commands:

```
npm install
npm run build
```

It should create a `/dist` folder with the compiled extensions for both manifest v2 and v3. You can then load it into your browsers depending on which version the browser supports.

Generally Chrome-based browsers will use v3 whereas Firefox will use v2. If you're not sure, try v3 followed by v2.
