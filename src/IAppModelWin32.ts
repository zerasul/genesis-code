import { Uri } from "vscode";
import { AppModel } from "./IAppModel";


export class AppModelWin32 extends AppModel{
    
    public compileProject(newLine: boolean): boolean {
        throw new Error("Method not implemented.");
    }
    public compileAndRunProject(): boolean {
        throw new Error("Method not implemented.");
    }
    public runProject(newLine: boolean): boolean {
        throw new Error("Method not implemented.");
    }
    public compileForDebugging(): boolean {
        throw new Error("Method not implemented.");
    }

    
    public createProject(rootPath: Uri): Uri {
        throw new Error("Method not implemented.");
    }


    public cleanProject(): boolean {
        throw new Error("Method not implemented.");
    }
    

}