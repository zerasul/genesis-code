import * as vscode from 'vscode';
import { LINUX, MACOS, WIN32 } from './constants';
import { AppModelDarwin } from './IAppModelDarwin';
import { AppModelLinux } from './IAppModelLinux';
import { AppModelWin32 } from './IAppModelWin32';


export class CoreEngine{

    private internalCoreWin32:AppModelWin32;
    private internalCoreLinux: AppModelLinux;
    private internalCoreMacOs: AppModelDarwin;
    private platform: string;

    
    public constructor(extensionPath: string){
        let statusBar = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 1);
        statusBar.text = "Genesis Code Ready";
        statusBar.show();
        this.internalCoreWin32=new AppModelWin32(extensionPath);
        this.internalCoreLinux=new AppModelLinux(extensionPath);
        this.internalCoreMacOs=new AppModelDarwin(extensionPath);
        this.platform=process.platform.toString();
    }

    public compile():boolean{
        switch(this.platform){
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

    private showUndefinedSOError(){
        vscode.window.showErrorMessage("Unsupported Operating System");
    }
    public clean():boolean{
        switch(this.platform){
            case WIN32:
                return  this.internalCoreWin32.cleanProject();
            case LINUX:
                return this.internalCoreLinux.cleanProject();
            case MACOS:
                return this.internalCoreMacOs.cleanProject();
            default:
                this.showUndefinedSOError();
                return false;
        }
    }

    public create(rootPath:vscode.Uri): vscode.Uri| undefined{
        switch(this.platform){
            case WIN32:
                return  this.internalCoreWin32.createProject(rootPath);
            case LINUX:
                return this.internalCoreLinux.createProject(rootPath);
            case MACOS:
                return this.internalCoreMacOs.createProject(rootPath);
            default:
                this.showUndefinedSOError();
                return undefined;
        }
    }

    public compileAndRun():boolean{
        switch(this.platform){
            case WIN32:
                return  this.internalCoreWin32.compileAndRunProject();
            case LINUX:
                return this.internalCoreLinux.compileAndRunProject();
            case MACOS:
                return this.internalCoreMacOs.compileAndRunProject();
            default:
                this.showUndefinedSOError();
                return false;
        }
    }

    public run():boolean{
        switch(this.platform){
            case WIN32:
                return  this.internalCoreWin32.runProject(true);
            case LINUX:
                return this.internalCoreLinux.runProject(true);
            case MACOS:
                return this.internalCoreMacOs.runProject(true);
            default:
                this.showUndefinedSOError();
                return false;
        }
    }

    public compile4Debug():boolean{
        switch(this.platform){
            case WIN32:
                return  this.internalCoreWin32.compileForDebugging();
            case LINUX:
                return this.internalCoreLinux.compileForDebugging();
            case MACOS:
                return this.internalCoreMacOs.compileForDebugging();
            default:
                this.showUndefinedSOError();
                return false;
        }
    }

    public tmxImport(tmxFilePath:vscode.Uri){
        this.internalCoreWin32.importTmxFile(tmxFilePath);
    }

    public tmxJsonImport(tmxJsonFilePath:vscode.Uri){
        this.internalCoreWin32.importJsonTmxFile(tmxJsonFilePath);
    }

    public setRunPath(uri:string){
        this.internalCoreWin32.setRunPath(uri);
    }

    public deactivate(){
        switch(this.platform){
            case WIN32:
                this.internalCoreWin32.deactivate();
            case LINUX:
                this.internalCoreLinux.deactivate();    
            case MACOS:
                this.internalCoreMacOs.deactivate();
            default:
                this.showUndefinedSOError();
        }  
    }

}