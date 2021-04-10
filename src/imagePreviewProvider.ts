import { readFileSync } from 'fs';
import * as Path from 'path';
import * as imagesize from 'image-size';
import * as vscode from 'vscode';
var palette = require('get-rgba-palette');
var pixels = require('get-image-pixels');



export class ImagePreviewDocument extends vscode.Disposable implements vscode.CustomDocument{

    constructor(uri: vscode.Uri){
        super(ImagePreviewDocument._disposable);
        this.uri=uri;
        this.filename=Path.basename(this.uri.fsPath);
        this.imagedata=readFileSync(uri.fsPath);
        this.imagedatab64= ImagePreviewDocument.convertB64(this.imagedata);
        let imagesizes = imagesize.imageSize(this.imagedata);
        this.width=imagesizes.width;
        this.height=imagesizes.height;
        
    }

    uri: vscode.Uri;
    width: number|undefined;
    height: number|undefined;
    imagedatab64:any;
    imagedata:Buffer;
    filename:String;

    private static _disposable(){
        
    }

    private static convertB64(imagedata:Buffer){
        
        let base64String=imagedata.toString('base64');
        return base64String;
    }
    dispose(){
        super.dispose();
    }
    
}

export class ImagePreviewProvider implements vscode.CustomReadonlyEditorProvider<ImagePreviewDocument>{

    extensionContext:vscode.ExtensionContext;

    constructor(context:vscode.ExtensionContext){
        this.extensionContext=context;
    }
    openCustomDocument(uri: vscode.Uri, openContext: vscode.CustomDocumentOpenContext, token: vscode.CancellationToken): ImagePreviewDocument | Thenable<ImagePreviewDocument> {
        
        return new ImagePreviewDocument(uri);
    }
    resolveCustomEditor(document: ImagePreviewDocument, webviewPanel: vscode.WebviewPanel, token: vscode.CancellationToken): void | Thenable<void> {
        let imageuri="data:image/png;base64 ,"+document.imagedatab64;
        let width = document.width;
        let height = document.height;
        let tilesw = (document.width!==undefined)?document.width/8:0;
        let tilesh = (document.height!==undefined)?document.height/8:0;
        let filename= document.filename;
        let htmltemplate= readFileSync(Path.join(this.extensionContext.extensionPath , "resources","imageviewer.html")).toLocaleString();
        
        htmltemplate=htmltemplate.replace(new RegExp("{{filename}}", 'g'), ""+filename);
        htmltemplate=htmltemplate.replace(new RegExp("{{imageuri}}", 'g'),imageuri);
        htmltemplate=htmltemplate.replace(new RegExp("{{width}}", 'g'), String(width));
        htmltemplate=htmltemplate.replace(new RegExp("{{height}}", 'g'),String(height));
        htmltemplate=htmltemplate.replace(new RegExp("{{tilesw}}", 'g'),String(tilesw));
        htmltemplate=htmltemplate.replace(new RegExp("{{tilesh}}", 'g'),String(tilesh));
        
        webviewPanel.webview.html=htmltemplate;
    }
}