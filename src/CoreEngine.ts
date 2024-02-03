import * as vscode from 'vscode';
import { LINUX, MACOS, WIN32 } from './constants';
import { AppModelDarwin } from './IAppModelDarwin';
import { AppModelLinux } from './IAppModelLinux';
import { AppModelWin32 } from './IAppModelWin32';


export class CoreEngine {

    private internalCoreWin32: AppModelWin32;
    private internalCoreLinux: AppModelLinux;
    private internalCoreMacOs: AppModelDarwin;
    private platform: string;
    //Status Bar Buttons
    private static compileButton:vscode.StatusBarItem|undefined;
    private static compileAndRunButton:vscode.StatusBarItem|undefined;
    private static compileDebugButton:vscode.StatusBarItem|undefined;
    private static cleanButton:vscode.StatusBarItem|undefined;





    public constructor(extensionPath: string) {
        vscode.workspace.onDidChangeConfiguration((e) => {
            if (e.affectsConfiguration("addStatusBarButtons")) {
                //add status bar button to compile
                let statusButtonsAdded:boolean = vscode.workspace.getConfiguration().get("addStatusBarButtons",false);
                if(statusButtonsAdded){
                    this.addStatusBarButtons();
                }else{
         
                    CoreEngine.compileButton?.dispose();
                    CoreEngine.compileAndRunButton?.dispose();
                    CoreEngine.compileDebugButton?.dispose();
                    CoreEngine.cleanButton?.dispose();
                }
            }
        });
        let statusButtonsAdded:boolean = vscode.workspace.getConfiguration().get("addStatusBarButtons",false);
        this.internalCoreWin32 = new AppModelWin32(extensionPath);
        this.internalCoreLinux = new AppModelLinux(extensionPath);
        this.internalCoreMacOs = new AppModelDarwin(extensionPath);
        this.platform = process.platform.toString();
        if(statusButtonsAdded) this.addStatusBarButtons();
        vscode.commands.registerCommand('genesis.compile', () => { this.compile(); });
        vscode.commands.registerCommand('genesis.compileAndRun', () => { this.compileAndRun(); });
        vscode.commands.registerCommand('genesis.compileDebug', () => { this.compile4Debug(); });
        vscode.commands.registerCommand('genesis.clean', () => { this.clean(); });

    }

    private addStatusBarButtons(){
        //Compile status Bar Button
        CoreEngine.compileButton = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 1);
        CoreEngine.compileButton.text = "$(gear) Build";
        CoreEngine.compileButton.tooltip = "Compile Genesis Project";
        CoreEngine.compileButton.command = "genesis.compile";
        CoreEngine.compileButton.show();

        //add status bar button to compile and run
        CoreEngine.compileAndRunButton = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 2);
        CoreEngine.compileAndRunButton.text = "$(play) Play";
        CoreEngine.compileAndRunButton.tooltip = "Compile and Run Genesis Project";
        CoreEngine.compileAndRunButton.color = "statusBarItem.warningBackground";
        CoreEngine.compileAndRunButton.command = "genesis.compileAndRun";
        CoreEngine.compileAndRunButton.show();

        //add status bar to compile for debug
        CoreEngine.compileDebugButton = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 3);
        CoreEngine.compileDebugButton.text = "$(bug) Debug";
        CoreEngine.compileDebugButton.tooltip = "Compile Genesis Project for Debugging";
        CoreEngine.compileDebugButton.color = "statusBarItem.warningBackground";
        CoreEngine.compileDebugButton.command = "genesis.compileDebug";
        CoreEngine.compileDebugButton.show();

        //add status bar button to clean project
        CoreEngine.cleanButton = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 1);
        CoreEngine.cleanButton.text = "$(trashcan) Clean";
        CoreEngine.cleanButton.tooltip = "Clean Genesis Project";
        CoreEngine.cleanButton.command = "genesis.clean";
        CoreEngine.cleanButton.show();
    }
    public compile(): boolean {
        switch (this.platform) {
            case WIN32:
                return this.internalCoreWin32.compileProject(true);
            case LINUX:
                return this.internalCoreLinux.compileProject(true);
            case MACOS:
                return this.internalCoreMacOs.compileProject(true);
            default:
                this.showUndefinedSOError();
                return false;

        }
    }

    private showUndefinedSOError() {
        vscode.window.showErrorMessage("Unsupported Operating System");
    }
    public clean(): boolean {
        switch (this.platform) {
            case WIN32:
                return this.internalCoreWin32.cleanProject();
            case LINUX:
                return this.internalCoreLinux.cleanProject();
            case MACOS:
                return this.internalCoreMacOs.cleanProject();
            default:
                this.showUndefinedSOError();
                return false;
        }
    }

    public create(rootPath: vscode.Uri): vscode.Uri | undefined {
        switch (this.platform) {
            case WIN32:
                return this.internalCoreWin32.createProject(rootPath);
            case LINUX:
                return this.internalCoreLinux.createProject(rootPath);
            case MACOS:
                return this.internalCoreMacOs.createProject(rootPath);
            default:
                this.showUndefinedSOError();
                return undefined;
        }
    }

    public compileAndRun(): boolean {
        switch (this.platform) {
            case WIN32:
                return this.internalCoreWin32.compileAndRunProject();
            case LINUX:
                return this.internalCoreLinux.compileAndRunProject();
            case MACOS:
                return this.internalCoreMacOs.compileAndRunProject();
            default:
                this.showUndefinedSOError();
                return false;
        }
    }

    public run(): boolean {
        switch (this.platform) {
            case WIN32:
                return this.internalCoreWin32.runProject(true);
            case LINUX:
                return this.internalCoreLinux.runProject(true);
            case MACOS:
                return this.internalCoreMacOs.runProject(true);
            default:
                this.showUndefinedSOError();
                return false;
        }
    }

    public compile4Debug(): boolean {
        switch (this.platform) {
            case WIN32:
                return this.internalCoreWin32.compileForDebugging();
            case LINUX:
                return this.internalCoreLinux.compileForDebugging();
            case MACOS:
                return this.internalCoreMacOs.compileForDebugging();
            default:
                this.showUndefinedSOError();
                return false;
        }
    }

    public tmxImport(tmxFilePath: vscode.Uri) {
        this.internalCoreWin32.importTmxFile(tmxFilePath);
    }

    public tmxJsonImport(tmxJsonFilePath: vscode.Uri) {
        this.internalCoreWin32.importJsonTmxFile(tmxJsonFilePath);
    }

    public setRunPath(uri: string) {
        this.internalCoreWin32.setRunPath(uri);
    }

    public deactivate() {
        switch (this.platform) {
            case WIN32:
                this.internalCoreWin32.deactivate();
                break;
            case LINUX:
                this.internalCoreLinux.deactivate();
                break;
            case MACOS:
                this.internalCoreMacOs.deactivate();
                break;
            default:
                this.showUndefinedSOError();
        }
    }

}