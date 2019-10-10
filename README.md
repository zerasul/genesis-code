# Genesis-code Extension

[![Build Status](https://dev.azure.com/zerasul/genesis-code/_apis/build/status/zerasul.genesis-code?branchName=master)](https://dev.azure.com/zerasul/genesis-code/_build/latest?definitionId=1&branchName=master) [![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=genesis-code-project&metric=alert_status)](https://sonarcloud.io/dashboard?id=genesis-code-project)

Genesis-Code is a Visual Studio Code Extension for Sega Genesis/ Mega Drive development. This extension is created for use with the [SGDK](https://github.com/Stephane-D/SGDK)/[GENDEV](https://github.com/kubilus1/gendev) projects for create homebrew games for the Sega 16 bits console.

For more information, see [Genesis Code Documentation Web Page](https://zerasul.github.io/genesis-code-docs/)

## Features

With this extension, you can use easily a few commands for help you create awesome games. This extension adds the following commands:

* Compile command: compile the program and generate the Rom file.
* Run command: You can use an emulator like Gens to run and test your game.
* Clean command: Clean the programs build folder (calls makefile with clean).
* Compile & Run command: first compile and later run the rom.bin file in an emulator.
* Create project: Select a folder and create a Hello World project ready for compile and run.
* Set Gens Command: Update the configuration and adds the command path to run Gens Emulator.

![vscodegif](vscodegif.gif)

## Requirements

To use this extension you need to install SGDK(windows) or GENDEV(linux) projects on your system and configure the GDK or GENDEV enviroment variables.

## Extension Settings

You can set the [Gens Emulator](http://www.gens.me/) command to call it directly from the Genesis Code Extension (Run Command).

You can set it via command , or using the settings configuration.

![Genesiscodeconfiguration](genscodesettings.png)

## Known Issues

Currently we donot support MacOs due to the [GENDEV-MACOS](https://github.com/SONIC3D/gendev-macos) project is discontinued.

## Release Notes

### 1.0.0

Initial Release:

* Added Compile command.
* Added Run command.
* Added Clean command.
* Added Compile & Run command.
* Added Create Project command.
* Added Set Gens Emulator Command.

-----------------------------------------------------------------------------------------------------------


**Enjoy!**
