# Color Identifiers for Visual Studio Code

`Color Identifiers` is a syntax highlighter that gives each identifier a different color, inspired by [Color Identifiers Mode](https://github.com/ankurdave/color-identifiers-mode) for Emacs.

## Features

This extension works for any language that offers semantic highlighting in Visual Studio Code. It uses the language server to determine which words to highlight.

Two themes, `Color Identifiers Dark` and `Color Identifiers Light`, are included. These themes make variables more prominent and language keywords less prominent. `Color Identifiers` is also compatible with any existing theme.

![feature X](images/screenshot_00.png)
![feature X](images/screenshot_01.png)

## Extension Settings

This extension contributes the following settings:

- `colorIdentifiersMode.tokenKinds`: The types of language tokens that should have a color applied (see [official `Semantic Highlight Guide`](https://code.visualstudio.com/api/language-extensions/semantic-highlight-guide#standard-token-types-and-modifiers)).
- `colorIdentifiersMode.paletteMode`: 
  - `automatic` chooses colors that are likely to work well with the active color theme. 
  - `manual` chooses colors from a user-defined list.
- `colorIdentifiersMode.manualColors`: The list of colors used in the manual palette mode.
- `colorIdentifiersMode.ignoredLanguages`: Don't colorize files in these languages.
- `colorIdentifiersMode.method`: 
  - `sequential` assigns colors to identifiers in the order the identifiers appear in the file
  - `hash` uses the variable's name to decide its color.
- `colorIdentifiersMode.ignoredFileSize`: Ignore files larger than this amount of **bytes**.
