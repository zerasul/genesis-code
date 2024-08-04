# Change Log

This is the change Log of Genesis Code. For more information you can see the [Documentation page](https://zerasul.github.io/genesis-code-docs/).

## 1.5.1

* [On Windows Systems, the new projects will be created using Command prompt console as default (no extra configuration needed).](https://github.com/zerasul/genesis-code/pull/1180)
* [Now, when a new project is created, the current GDK or GENDEV configuration will be used for C/C++ include configuration on .vscode/settings.json; if there is no configuration, the environment variable will be used.](https://github.com/zerasul/genesis-code/issues/1198).
* Updated Dependencies.

## 1.5.0

* [Add "Status bar Button" configuration, to add status bar buttons for the more commons commands (no more command palette)](https://github.com/zerasul/genesis-code/issues/1087).
* [Added 4 Status Bar Buttons for _compile_, _compile&Run_, _compile for Debug_ and _clean_](https://github.com/zerasul/genesis-code/pull/951).
* [Updating autocompletion and .res grammar for use with the new XGM2 Driver and SGDK 2.00](https://github.com/zerasul/genesis-code/issues/928).
* Updating dependencies.

## 1.4.2

* [Updating grammar for use SGDK 1.80 with the last documentation.](https://github.com/zerasul/genesis-code/issues/774)
* [Fix Bug when create on Windows a new project the settings are not properly point to SGDK include Folders.](https://github.com/zerasul/genesis-code/issues/809)
* [Fix Multiple Instances of gens.code error.](https://github.com/zerasul/genesis-code/issues/794)
* Updated dependencies.

## 1.4.1

* [Added Support for Dogarasu SGDK Docker Image](https://github.com/zerasul/genesis-code/issues/627).
* [Fixed Bug for run in background Emulator in MacOs](https://github.com/zerasul/genesis-code/issues/52).
* [Fix Gens.code Multiples Instances Error.](https://github.com/zerasul/genesis-code/issues/672).
* [Updated Rescomp Context Help Information for the Last Version of SGDK (Supports 1.70)](https://github.com/zerasul/genesis-code/issues/545).
* Updated Dependencies.

## 1.4.0

* [Added Docker container Support](https://github.com/zerasul/genesis-code/issues/326).
* [Improved Code with a total Refactoring](https://github.com/zerasul/genesis-code/issues/350).
* [SGDK resource files now have regions](https://github.com/zerasul/genesis-code/pull/491)
    * They start with *#region* / *#pragma region*
    * They end with *#endregion* / *#pragma endregion*
* [Fixed some syntax highlighting errors related with numbers](https://github.com/zerasul/genesis-code/pull/491)

## 1.3.3

* [Added SGDK 1.65 Support](https://github.com/zerasul/genesis-code/issues/277).
* [Updating use of Wine for Wine64 (Only MacOs)](https://github.com/zerasul/genesis-code/issues/243)
* [Added Bitmap Viewer for Bmp,Png and JPEG images](https://github.com/zerasul/genesis-code/issues/206).
* Updated Some Dependencies.

## 1.3.2

* [Added SGDK 1.60 support](https://github.com/zerasul/genesis-code/issues/239).
* [Added About genesis Code command](https://github.com/zerasul/genesis-code/issues/207).
* [Fixed a bug when the run command is called and the path of the rom have spaces](https://github.com/zerasul/genesis-code/issues/75).
* [Added comment Syntax Hihghlighting on res files](https://github.com/zerasul/genesis-code/issues/233).
* Updated Some dependencies.

## 1.3.1

* [Fixed a bug with some dependencies (Import TMX format ins't works)](https://github.com/zerasul/genesis-code/issues/216)
* [Fixed some code smells reported by sonar.](https://github.com/zerasul/genesis-code/issues/214)

## 1.3.0

* [Adding configuration for use GDK, GENDEV or MARSDEV alternate environment variables](https://github.com/zerasul/genesis-code/issues/136)
* [Adding configuration for use alternative makefile](https://github.com/zerasul/genesis-code/issues/137)
* [Added import TMX file command](https://github.com/zerasul/genesis-code/issues/132)
* [Added import Json Tmx File command](https://github.com/zerasul/genesis-code/issues/132)
* updated some outdated dependencies and improved code

## 1.2.2

* [Updated for use with SGDK 1.51](https://github.com/zerasul/genesis-code/issues/128)
* [Improved code and fixed some bugs](https://github.com/zerasul/genesis-code/issues/133)
* Updated some outdated Dependencies

## 1.2.1

* [Updated for use with SGDK 1.50](https://github.com/zerasul/genesis-code/issues/122)
* [Added Debuggers Category to Package.json](https://github.com/zerasul/genesis-code/issues/121)
* [Added include path settings on new project creation](https://github.com/zerasul/genesis-code/issues/123)
* [Updated some outdated Dependencies]

## 1.2.0

* [Added Compatibility with MarsDev Toolchain](https://github.com/zerasul/genesis-code/issues/117)
* [Added debug linking configuration](https://github.com/zerasul/genesis-code/issues/66)
* [Added new configuration for Toolchain selection](https://github.com/zerasul/genesis-code/issues/117)
* Updated some outdated dependencies

## 1.1.1

* [Fixed a typo error on main.c file](https://github.com/zerasul/genesis-code/issues/62)
* [Added Autocomplete feature for SGDK Resource Files](https://github.com/zerasul/genesis-code/issues/53)
* Updated some autdated dependencies.

## 1.1.0

* [Added MACOs Support](https://github.com/zerasul/genesis-code/issues/16).
* [Added Syntax HighLigthing for SGDK Resource Files.](https://github.com/zerasul/genesis-code/issues/17).
* Updated some outdated dependencies.

## 1.0.1

* [Fixed Readme.md template Bug](https://github.com/zerasul/genesis-code/issues/18).
* [Fixed an error on create project that donsent track the empty directories](https://github.com/zerasul/genesis-code/issues/18).
* Updated some outdated depencies.

## 1.0.0

Initial release:

* Added Compile command.
* Added Run command.
* Added Clean command.
* Added Compile & Run command.
* Added Create Project command.
* Added Set Gens Emulator Command.
