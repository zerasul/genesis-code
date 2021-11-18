import { AppModel } from "./IAppModel";
import { AppModelWin32 } from "./IAppModelWin32";

export class AppModelBuilder{

    extensionPath:string;


    public constructor(){
        this.extensionPath="";
    }

    public setExtensionPath(extensionPath:string):AppModelBuilder{
        this.extensionPath=extensionPath;
        return this;
    }

    public build():AppModel{
        let os = process.platform.toString();

        switch(os){
            case 'win32':
                return new AppModelWin32(this.extensionPath);
            default:
                throw new Error("Unsupported Opperating System");
        }
    }
}