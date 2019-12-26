import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Class CodeProvider: Provides Code Completion for SGDK Resource Files.
 */
export class CodeProvider{


    /**
     * Singletone Instance
     */
    private static instance: CodeProvider|undefined;

    /**
     * Extension Context
     */
    private extensionPath: string;
    /**
     * CompletionItemList
     */
    private codeCompletionItems: vscode.CompletionList;


    /**
     * get the current code completion Items. if it not loaded previously, create a new codeProvider Instance
     * @param context Extension Context
     */
    public static getCodeProviderInstance(context: vscode.ExtensionContext):vscode.ProviderResult<vscode.CompletionItem[]>{
        
        if(this.instance===undefined){
            this.instance= new CodeProvider(context.extensionPath);
        }

        return this.instance.getCodeProviderItems();
    }
     
    /**
     * Class constructor. Loads the current codeCompletionItems from the codecompletion.json file.
     * @param context Extension context
     */
    constructor(extensionPath: string){
        this.extensionPath=extensionPath;
        //loads the codecompletion from the jsonfile.
        this.codeCompletionItems = this.loadCodeProviderItems();
    }

    /**
     * Load the content of the file 'codecompletion.json' (its on the extension's resource folder); and create a new CompletionList with his information.
     * 
     * @returns the CodeCompletionList with the content of codecompletion.json file
     */
    private loadCodeProviderItems():vscode.CompletionList{
      
       let jsoncodefile= fs.readFileSync(path.join(this.extensionPath,"resources","codecompletion.json"));

       let jsonobj=JSON.parse(jsoncodefile.toString());
       let completionitems = new vscode.CompletionList;
       jsonobj.items.forEach((item: { label: string; text:string; doc:string; kind:string}) => {
           let comitem = new vscode.CompletionItem(item.label);
           comitem.insertText = item.text;
           comitem.kind= this.getcomItemKind(item.kind);
           comitem.documentation= new vscode.MarkdownString(item.doc);
           completionitems.items.push(comitem);
       });

       return completionitems;
    }

    /**
     * Get the CompletionItemKind from the String of the json loaded.
     * @param strKind String with the kind of CodeCompletionItem.
     */
    private getcomItemKind(strKind:string):vscode.CompletionItemKind{

        switch(strKind){
            case "KEYWORD":
                return vscode.CompletionItemKind.Keyword;
            case "PROPERTY":
                return vscode.CompletionItemKind.Property;
            case "VARIABLE":
                return vscode.CompletionItemKind.Variable;
            case "STRUCT":
                return vscode.CompletionItemKind.Struct;
            case "TEXT":
            default:
                return vscode.CompletionItemKind.Text;
        }
    }
    /**
     * get the current completionItemList
     */
    public getCodeProviderItems(): vscode.CompletionItem[] {
        return  this.codeCompletionItems.items;
    }
}