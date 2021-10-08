/**
 * (C) 2020. This code is under MIT license.
 * You can get a copy of the license with this software.
 * For more information please see https://opensource.org/licenses/MIT 
 */
import * as vscode from 'vscode';
import * as Path from 'path';
import * as fs from 'fs';
import { TmxXMLParser, TmxJsonFileParser } from './TmxParser';

/**
 * Configuration key for toolchaintype
 */
const TOOLCHAINTYPE = "toolchainType";

/**
 * Configuration key for custom makefile
 */
const MAKEFILE = "custom-makefile";

/**
 * Configuration key for MARSDEV
 */
const MARSDEV_ENV = "MARSDEV";

/**
 * configuration key for GENDEV
 */
const GENDEV_ENV = "GENDEV";

/**
 * configuration key for GDK
 */
const GDK_ENV = "GDK";


/**
 * Use of SGDK or GENDEV toolchains
 */
const SGDK_GENDEV = "sgdk/gendev";

/**
 * Use of MARSDEV toolchain
 */
const MARSDEV = "marsdev";

/**
 *  Use of Docker toolchain
 */
const DOCKER = "docker";
/**
 * DEFAULT MAKEFILE for Windows Systems 
 */
const DEFAULT_WIN_SGDK_MAKEFILE = "%GDK%\\makefile.gen";

/**
 * DEFAULT MAKEFILE for GenDev Systems
 */
const DEFAULT_GENDEV_SGDK_MAKEFILE = "$GENDEV/sgdk/mkfiles/makefile.gen";



/**
 * AppModel class; this class have all the internalFunctionality for use with SGDK tasks.
 */
export class AppModel {


    // Terminal opened for use with SGDK
    terminal: vscode.Terminal;
    statusBar: vscode.StatusBarItem | undefined;
    extensionPath: string;



    /**
     * class constructor
     * @param extensionPath extension Path
     */
    constructor(extensionPath: string) {
        this.terminal = vscode.window.createTerminal('gens-code');
        this.terminal.show();
        this.statusBar = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 1);
        this.statusBar.text = "Genesis Code Ready";
        this.statusBar.show();
        this.extensionPath = extensionPath;
    }

    /**
     * Clean the project calling the SGDK make clean command (using SGDK or GENDEV)
     * @returns true if success or false otherwise
     */
    public cleanProject(): boolean {
        console.log(process.platform.toString());
        let toolchainType = vscode.workspace.getConfiguration().get(TOOLCHAINTYPE);
        let makefile = vscode.workspace.getConfiguration().get(MAKEFILE);

        if (toolchainType === SGDK_GENDEV) {
            if (process.platform.toString() === 'win32') {
                //Windows
                let gdk = vscode.workspace.getConfiguration().get(GDK_ENV);
                if (gdk !== "") {
                    this.terminal.sendText("set GDK=" + gdk, true);
                }
                let cmakefile = (makefile !== "") ? makefile : DEFAULT_WIN_SGDK_MAKEFILE;
                this.terminal.sendText("%GDK%\\bin\\make -f " + cmakefile + " clean\n");

                return true;
            } else if (process.platform.toString() === 'linux') {
                let gendev = vscode.workspace.getConfiguration().get(GENDEV_ENV);
                if (gendev !== "") {
                    this.terminal.sendText("export GENDEV=" + gendev, true);
                }
                //linux
                let cmakefile = (makefile !== "") ? makefile : DEFAULT_GENDEV_SGDK_MAKEFILE;
                this.terminal.sendText("make -f " + cmakefile + " clean\n");
                return true;
            } else if (process.platform.toString() === 'darwin') {
                let gdk = vscode.workspace.getConfiguration().get(GDK_ENV);
                if (gdk !== "") {
                    this.terminal.sendText("set GDK_WIN=" + gdk, true);
                }
                // MacOs using Wine
                //first check if the build.bat file is created
                let currentdir = (vscode.workspace.workspaceFolders !== undefined) ? vscode.workspace.workspaceFolders[0].uri : undefined;
                this.copybuildmacos(currentdir);
                this.terminal.sendText("WINEPREFIX=$GENDEV/wine wine64 cmd /C %cd%\\\\build.bat clean");

                return true;
            } else {
                vscode.window.showWarningMessage("Operating System not yet supported");
                return false;
            }
        } else {
            this.setmardevenv(process.platform.toString());
            let mkfile = (makefile !== "") ? "-f " + makefile : " ";
            this.terminal.sendText("make " + mkfile + " clean");
            return true;
        }

    }
    /**
     * set the MARSDEV environment variable (using configuration info)
     * @param os operating system
     */
    private setmardevenv(os: string) {
        let marsdev = vscode.workspace.getConfiguration().get(MARSDEV_ENV);
        if (os === "win32") {
            this.terminal.sendText("set MARSDEV=" + marsdev, true);
        } else {
            if (os === "linux" || os === "darwin") {
                this.terminal.sendText("export MARSDEV=" + marsdev, true);
            }
        }
    }

    /**
     * copy the current build.bat program for run it with wine.
     * @param rootPath current main path
     */
    private copybuildmacos(rootPath: vscode.Uri | undefined) {
        if (rootPath !== undefined) {
            if (!fs.existsSync(Path.join(rootPath.fsPath, "build.bat"))) {
                let buildbatpath = Path.join(this.extensionPath, "resources", "build.bat");
                let buildcurrentpath = Path.join(rootPath.fsPath, "build.bat");
                fs.copyFileSync(buildbatpath, buildcurrentpath);
            }
        }
    }
    /**
     * Create a new Project for SGDK. Create on a specific folder, three subfolders called _src_, _inc_ and _res_.
     * @param projectPath Root Path for the project
     * @returns Initial Project folder
     */
    public createProject(rootPath: vscode.Uri) {
        let sourcepath = Path.join(rootPath.fsPath, "src");
        if (!fs.existsSync(sourcepath)) {
            fs.mkdirSync(sourcepath);
        }
        let includePath = Path.join(rootPath.fsPath, "inc");
        if (!fs.existsSync(includePath)) {
            fs.mkdirSync(includePath);
            // Added gitkeep files to show it on git repo
            let gitinckeep = Path.join(this.extensionPath, "resources", "gitkeep.template");
            let gitinckeeppath = Path.join(rootPath.fsPath, "inc", ".gitkeep");
            fs.copyFileSync(gitinckeep, gitinckeeppath);
        }
        let resourcePath = Path.join(rootPath.fsPath, "res");
        if (!fs.existsSync(resourcePath)) {
            fs.mkdirSync(resourcePath);
            // Added gitkeep files to show it on git repo
            let gitreskeep = Path.join(this.extensionPath, "resources", "gitkeep.template");
            let gitreskeeppath = Path.join(rootPath.fsPath, "res", ".gitkeep");
            fs.copyFileSync(gitreskeep, gitreskeeppath);
        }
        //Add README.md File
        let readmetemppath = Path.join(this.extensionPath, "resources", "README.md.template");
        let readmemdpath = Path.join(rootPath.fsPath, "README.MD");
        fs.copyFileSync(readmetemppath, readmemdpath);
        //add .gitignorefile
        let ignoretemppath = Path.join(this.extensionPath, "resources", "gitignore.template");
        let ignorepath = Path.join(rootPath.fsPath, ".gitignore");
        fs.copyFileSync(ignoretemppath, ignorepath);
        //add main.c hello world Example
        let mainctemppath = Path.join(this.extensionPath, "resources", "mainc.template");
        let maincpath = Path.join(rootPath.fsPath, "src", "main.c");
        fs.copyFileSync(mainctemppath, maincpath);
        //add launch.json file with debuging configuration.
        let vscodedirpath = Path.join(rootPath.fsPath, ".vscode");
        if (!fs.existsSync(vscodedirpath)) {
            fs.mkdirSync(vscodedirpath);
            this.createlaunchjsonfile(this.extensionPath, vscodedirpath);
        }
        //add Makefile for marsdev toolchain projects
        let makefiletemppath = Path.join(this.extensionPath, "resources", "Makefile.template");
        let toolchainType = vscode.workspace.getConfiguration().get(TOOLCHAINTYPE);
        if (toolchainType === MARSDEV) {
            fs.copyFileSync(makefiletemppath, Path.join(rootPath.fsPath, "Makefile"));
            //add boot directory
            fs.mkdirSync(Path.join(rootPath.fsPath, "boot"));
            fs.copyFileSync(Path.join(this.extensionPath, "resources", "boot", "sega.s.template"), Path.join(rootPath.fsPath, "boot", "sega.s"));
            fs.copyFileSync(Path.join(this.extensionPath, "resources", "boot", "rom_head.c.template"), Path.join(rootPath.fsPath, "boot", "rom_head.c"));
        }
        //add settings.json with the include paths.
        this.createSettingsJsonFile(this.extensionPath, vscodedirpath);
        //add git repository to the project
        this.terminal.sendText("cd \"" + rootPath.fsPath + "\" && git init");
        return rootPath;
    }

    /**
     * Add a launch.json file with the debug task configuration. 
     * 
     * NOTE: on Linux Systems with SGDK/GENDEV toolchain the file is not created.
     * @param extensionPath Extension Folder Path.
     * @param vscodepath .voscodepath folder path.
     */
    private createlaunchjsonfile(extensionPath: string, vscodepath: string) {
        let platform = process.platform.toString();
        let toolchainType = vscode.workspace.getConfiguration().get(TOOLCHAINTYPE);
        if (platform === 'win32') {
            if (toolchainType === SGDK_GENDEV) {
                let sourcefile = Path.join(extensionPath, "resources", "launch.json.windowssgdk.template");
                fs.copyFileSync(sourcefile, Path.join(vscodepath, "launch.json"));
            } else if (toolchainType === MARSDEV) {
                let sourcefile = Path.join(extensionPath, "resources", "launch.json.windowsmarsdev.template");
                fs.copyFileSync(sourcefile, Path.join(vscodepath, "launch.json"));
            }
        } else if (platform === 'linux') {
            if (toolchainType === MARSDEV) {
                let sourcefile = Path.join(extensionPath, "resources", "launch.json.linuxmarsdev.template");
                fs.copyFileSync(sourcefile, Path.join(vscodepath, "launch.json"));
            }
        } else if (platform === 'darwin') {
            if (toolchainType === MARSDEV) {
                let sourcefile = Path.join(extensionPath, "resources", "launch.json.linuxmarsdev.template");
                fs.copyFileSync(sourcefile, Path.join(vscodepath, "launch.json"));
            } else if (toolchainType === SGDK_GENDEV) {
                let sourcefile = Path.join(extensionPath, "resources", "launch.json.macossgdk.template");
                fs.copyFileSync(sourcefile, Path.join(vscodepath, "launch.json"));
            }
        }
    }

    private createSettingsJsonFile(extensionPath: string, vscodepath: string) {
        let platform = process.platform.toString();
        let toolchainType = vscode.workspace.getConfiguration().get(TOOLCHAINTYPE);
        if (platform === 'win32') {
            if (toolchainType === MARSDEV) {
                let sourcefile = Path.join(extensionPath, "resources", "ccppsettings.windowsmarsdev.template");
                fs.copyFileSync(sourcefile, Path.join(vscodepath, "settings.json"));
            } else if (toolchainType === SGDK_GENDEV) {
                let sourcefile = Path.join(extensionPath, "resources", "ccppsettings.windowssgdk.template");
                fs.copyFileSync(sourcefile, Path.join(vscodepath, "settings.json"));
            }
        } else if (platform === 'linux') {
            if (toolchainType === MARSDEV) {
                let sourcefile = Path.join(extensionPath, "resources", "ccppsettings.linuxmarsdev.template");
                fs.copyFileSync(sourcefile, Path.join(vscodepath, "settings.json"));
            } else if (toolchainType === SGDK_GENDEV) {
                let sourcefile = Path.join(extensionPath, "resources", "ccppsettings.linuxgendev.template");
                fs.copyFileSync(sourcefile, Path.join(vscodepath, "settings.json"));
            }
        } else if (platform === 'darwin') {
            if (toolchainType === MARSDEV) {
                let sourcefile = Path.join(extensionPath, "resources", "ccppsettings.linuxmarsdev.template");
                fs.copyFileSync(sourcefile, Path.join(vscodepath, "settings.json"));
            } else if (toolchainType === SGDK_GENDEV) {
                let sourcefile = Path.join(extensionPath, "resources", "ccppsettings.macossgdk.template");
                fs.copyFileSync(sourcefile, Path.join(vscodepath, "settings.json"));
            }
        }
    }

    /**
     * Run the compile command on windows systems
     * @param newline add a newline at the end of the command.
     */
    private compileWindowsProject(newline: boolean = true): boolean {
        let toolchainType = vscode.workspace.getConfiguration().get(TOOLCHAINTYPE);
        let makefile = vscode.workspace.getConfiguration().get(MAKEFILE);
        let gdk = vscode.workspace.getConfiguration().get(GDK_ENV);

        if (toolchainType === SGDK_GENDEV) {
            let cmakefile = (makefile !== "") ? makefile : DEFAULT_WIN_SGDK_MAKEFILE;
            if (gdk !== "") {
                this.terminal.sendText("set GDK=" + gdk, true);
            }
            this.terminal.sendText("%GDK%\\bin\\make -f " + cmakefile, newline);
        } else if (toolchainType === MARSDEV) {
            this.setmardevenv(process.platform.toString());
            let mkfile = (makefile !== "") ? "-f " + makefile : " ";
            this.terminal.sendText("make " + mkfile + " clean release", newline);
        
        } else if (toolchainType === DOCKER) {
            this.terminal.sendText("docker run --rm -v \"$PWD\":/src -u $(id -u):$(id -g) sgdk", newline);
        }

        return true;
    }

    /**
     * Run the compile command on Linux systems
     * @param newline add a newline at the end of the command.
     */
    private compileLinuxProject(newline: boolean = true): boolean {
        let toolchainType = vscode.workspace.getConfiguration().get(TOOLCHAINTYPE);
        let makefile = vscode.workspace.getConfiguration().get(MAKEFILE);
        if (toolchainType === SGDK_GENDEV) {
            let gendev = vscode.workspace.getConfiguration().get(GENDEV_ENV);
            if (gendev !== "") {
                this.terminal.sendText("export GENDEV=" + gendev, true);
            }
            let cmakefile = (makefile !== "") ? makefile : DEFAULT_GENDEV_SGDK_MAKEFILE;
            this.terminal.sendText("make -f " + cmakefile, newline);
        } else if (toolchainType === MARSDEV) {
            this.setmardevenv(process.platform.toString());
            let mkfile = (makefile !== "") ? "-f " + makefile : " ";
            this.terminal.sendText("make " + mkfile + " clean release", newline);
        
        } else if (toolchainType === DOCKER) {
            this.terminal.sendText("docker run --rm -v \"$PWD\":/src -u $(id -u):$(id -g) sgdk", newline);
        }

        return true;
    }
   
    /**
     * Compile the project on MacOs and using wine
     * @param newline adds a new line when sending text to the terminal
     */
    private compileMacOsProject(newline: boolean = true): boolean {
        let toolchainType = vscode.workspace.getConfiguration().get(TOOLCHAINTYPE);
        let makefile = vscode.workspace.getConfiguration().get(MAKEFILE);
        if (toolchainType === SGDK_GENDEV) {
            // MacOs using Wine
            //first check if the build.bat file is created
            let currentdir = (vscode.workspace.workspaceFolders !== undefined) ? vscode.workspace.workspaceFolders[0].uri : undefined;
            this.copybuildmacos(currentdir);
            this.terminal.sendText("WINEPREFIX=$GENDEV/wine wine64 cmd /C %cd%\\\\build.bat release", newline);
        } else if (toolchainType === MARSDEV) {
            this.setmardevenv(process.platform.toString());
            let mkfile = (makefile !== "") ? "-f " + makefile : " ";
            this.terminal.sendText("make " + mkfile + " clean release", newline);
        } else if (toolchainType === DOCKER) {
            this.terminal.sendText("docker run --rm -v \"$PWD\":/src -u $(id -u):$(id -g) sgdk", newline);
        }

        return true;
    }

    /**
     * Compile the project. It call to make with the SGDK makefile.gen file.
     *  @returns true if the project runs properly or false otherwise.
     */
    public compileProject(newline: boolean = true): boolean {
        let platform = process.platform.toString();
        if (platform === 'win32') {
            return this.compileWindowsProject(newline);
        } else if (platform === 'linux') {
            return this.compileLinuxProject(newline);
        } else if (platform === 'darwin') {
            return this.compileMacOsProject(newline);
        } else {
            vscode.window.showWarningMessage("Operating System not yet supported");
            return false;
        }
    }
    
    /**
     * Compiles the project and run using the current emulator command path.
     * In this case, the emulator is not running in background.
     */
    private compileAndRunMacosProject(): boolean {
        let toolchainType = vscode.workspace.getConfiguration().get(TOOLCHAINTYPE);
        let makefile = vscode.workspace.getConfiguration().get(MAKEFILE);
        if (toolchainType === SGDK_GENDEV) {
            let currentdir = (vscode.workspace.workspaceFolders !== undefined) ? vscode.workspace.workspaceFolders[0].uri : undefined;
            this.copybuildmacos(currentdir);
            this.terminal.sendText("WINEPREFIX=$GENDEV/wine wine64 cmd /C %cd%\\\\build.bat release", false);
        } else if (toolchainType === MARSDEV) {
            this.setmardevenv(process.platform.toString());
            let mkfile = (makefile !== "") ? "-f " + makefile : " ";
            this.terminal.sendText("make " + mkfile + " clean release", false);
        } 
        this.terminal.sendText(" && ", false);
        let genspath = vscode.workspace.getConfiguration().get("gens.path");
        let currentromfile = (toolchainType === SGDK_GENDEV) ? "\"$(pwd)/out/rom.bin\"" : "\"$(pwd)/out.bin\"";
        this.terminal.sendText(genspath + " " + currentromfile, true);
        return true;
    }

    /**
     * Compiles and run the current project.
     * NOTE: In darwin (MACOs) the emulator is running in foreground.
     */
    public compileAndRunProject(): boolean {
        if (process.platform.toString() === 'darwin') {
            return this.compileAndRunMacosProject();
        }
        Promise.resolve(this.compileProject(false)).then(res => {
            if (res) {
                this.terminal.sendText(" && ", false);
                this.runProject();
            } else {
                vscode.window.showWarningMessage("An error ocurred while Compile & Run");
            }
        });
        return true;
    }

    /**
     * Sets the current gens emulator bash command and update the configuration
     * @param uri the new gens emulator command to be updated.
     * @returns true if the configuration has been updated.
     */
    public setRunPath(uri: string): boolean {
        vscode.workspace.getConfiguration().update("gens.path", uri, vscode.ConfigurationTarget.Global).then(
            r => {
                vscode.window.showInformationMessage("Updated gens command path Configuration");
            });
        return true;
    }

    /**
     * Runs the current project  using the gens command configuration and the rom.bin file path.
     * Before execute this method, the project must be compiled.
     * @returns true if the emulator runs properly
     */
    public runProject(newline: boolean = true): boolean {

        let currentPath = (vscode.workspace.workspaceFolders !== undefined) ? vscode.workspace.workspaceFolders[0].uri : undefined;
        let toolchainType = vscode.workspace.getConfiguration().get("toolchainType");
        let currentRomFile = (toolchainType === MARSDEV) ? "out.bin" : Path.join("out", "rom.bin");
        let rompath = (currentPath !== undefined) ? Path.join(currentPath.fsPath, currentRomFile) : undefined;

        let genspath = vscode.workspace.getConfiguration().get("gens.path");

        let command = genspath + " \"" + rompath+"\"";
        let platfm = process.platform.toString();
        if (platfm === 'win32') {
            //Run command on background in cmd
            command = 'START /B ' + command;
        } else if (platfm === 'linux' || platfm === 'darwin') {
            //for linux and mac run the command with &
            command = command + ' &';
        } else {
            return false;
        }
        this.terminal.sendText(command, newline);

        return true;
    }

    public deactivate() {
        this.terminal.dispose();

    }
    /**
     * Compile the project with debug options creating the symbols table.
     */
    public compileForDebugging() {
        let platform = process.platform.toString();
        let makefile = vscode.workspace.getConfiguration().get(MAKEFILE);
        let toolchainType = vscode.workspace.getConfiguration().get(TOOLCHAINTYPE);
        if (platform === 'win32') {
            if(toolchainType === SGDK_GENDEV){
                let gdk = vscode.workspace.getConfiguration().get(GDK_ENV);
                let cmakefile = (makefile !== "") ? makefile : DEFAULT_WIN_SGDK_MAKEFILE;
                if (gdk !== "") {
                    this.terminal.sendText("set GDK=" + gdk, true);
                }
                this.terminal.sendText("%GDK%\\bin\\make -f " + cmakefile + " debug");
            }else if(toolchainType === MARSDEV){
                this.setmardevenv(process.platform.toString());
                let mkfile = (makefile !== "") ? "-f " + makefile + " " : "";
                this.terminal.sendText("make " + mkfile + " clean debug");
            }
        } else if (platform === 'linux') {
            this.compile4DebugLinux();
        } else if (platform === 'darwin') {
            this.compile4DebugMacOs();
        } else {
            vscode.window.showWarningMessage("Operating System not yet supported");
        }
    }

    /**
     * Call the compile command with debug options on MacOs Systems.
     */
    private compile4DebugMacOs() {
        let toolchainType = vscode.workspace.getConfiguration().get(TOOLCHAINTYPE);
        let makefile = vscode.workspace.getConfiguration().get(MAKEFILE);
        if (toolchainType === SGDK_GENDEV) {
            let currentdir = (vscode.workspace.workspaceFolders !== undefined) ? vscode.workspace.workspaceFolders[0].uri : undefined;
            this.copybuildmacos(currentdir);
            this.terminal.sendText("WINEPREFIX=$GENDEV/wine wine64 cmd /C %cd%\\\\build.bat debug");
        } else if (toolchainType === MARSDEV) {
            this.setmardevenv(process.platform.toString());
            let mkfile = (makefile !== "") ? "-f " + makefile + " " : "";
            this.terminal.sendText("make " + mkfile + " clean debug");
        }
    }

    /**
     * Call the compile command with debug options on Linux Systems.
     * 
     * NOTE: This command its not working on SGDK/GENDEV toolchains, only MARSDEV toolchain its compatible.
     */
    private compile4DebugLinux() {
        let toolchainType = vscode.workspace.getConfiguration().get(TOOLCHAINTYPE);
        let makefile = vscode.workspace.getConfiguration().get(MAKEFILE);
        if (toolchainType === SGDK_GENDEV) {
            vscode.window.showWarningMessage("Toolchain SGDK/GENDEV can't compile for Debugging. Change to Marsdev on configuration.");
        } else if (toolchainType === MARSDEV) {
            this.setmardevenv(process.platform.toString());
            let mkfile = (makefile !== "") ? "-f" + makefile + " " : "";
            this.terminal.sendText("make " + mkfile + "clean debug");
        }

    }

    public importTmxFile(tmxFilePath: vscode.Uri) {
        let parser = new TmxXMLParser();
        let tmx = parser.parseFile(tmxFilePath.fsPath);
        let currentdir = (vscode.workspace.workspaceFolders !== undefined) ? vscode.workspace.workspaceFolders[0].uri : undefined;
        if (currentdir !== undefined) {
            tmx.writeCHeaderFile(Path.join(currentdir.fsPath, "res"), Path.join(this.extensionPath, "resources", "headerfile.h.template"));
        }
    }

    public importJsonTmxFile(tmxJsonFilePath: vscode.Uri) {
        let parser = new TmxJsonFileParser();
        let tmx = parser.parseFile(tmxJsonFilePath.fsPath);
        let currentdir = (vscode.workspace.workspaceFolders !== undefined) ? vscode.workspace.workspaceFolders[0].uri : undefined;
        if (currentdir !== undefined) {
            tmx.writeCHeaderFile(Path.join(currentdir.fsPath, "res"), Path.join(this.extensionPath, "resources", "headerfile.h.template"));
        }
    }
}