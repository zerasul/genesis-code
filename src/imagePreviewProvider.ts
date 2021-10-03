import { readFileSync} from 'fs';
import * as Path from 'path';
import * as vscode from 'vscode';
import {ImageColor, ImageReader} from '@zerasul/image-read-helper';


export class ImagePreviewDocument extends vscode.Disposable implements vscode.CustomDocument{

    constructor(uri: vscode.Uri){
        super(ImagePreviewDocument._disposable);
        this.uri=uri;
        this.filename=Path.basename(this.uri.fsPath);
        this.imagedata=readFileSync(uri.fsPath);
        this.imagedatab64= ImagePreviewDocument.convertB64(this.imagedata);
        let imageInfo=ImageReader.read(this.imagedata);

        this.width=imageInfo.width;
        this.height=imageInfo.hegiht;
        this.palette=imageInfo.palette;


    }

    uri: vscode.Uri;
    width: number|undefined;
    height: number|undefined;
    imagedatab64:any;
    imagedata:Buffer;
    filename:string;
    bitmap: any;
    palette: any;

    private static _disposable(){
      return;
    }

    private static convertB64(imagedata:Buffer){
        return imagedata.toString('base64');
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

        htmltemplate=htmltemplate.replace(/{{filename}}/g, ""+filename);
        htmltemplate=htmltemplate.replace(/{{imageuri}}/g,imageuri);
        htmltemplate=htmltemplate.replace(/{{width}}/g, String(width));
        htmltemplate=htmltemplate.replace(/{{height}}/g,String(height));
        htmltemplate=htmltemplate.replace(/{{tilesw}}/g,String(tilesw));
        htmltemplate=htmltemplate.replace(/{{tilesh}}/g,String(tilesh));
        let htmlcolours=this.generateHtmlGrid(document.palette);
        htmltemplate=htmltemplate.replace(/Loading Palette.../g, htmlcolours);

        webviewPanel.webview.html=htmltemplate;
    }




    private generateHtmlGrid(palette:Array<ImageColor>):string{
        let html:string=`<p>${palette.length} Colours</p>`;
        html+="<div class='grid-container'>";
        palette.forEach(element=> {

            let htmlelement=`<div class="grid-element" style="background-color:rgba(${element.r},${element.g},${element.b},${element.a});"></div>`;
            html+=htmlelement;
        });
        html+="</div>";
        return html;
    }

}
