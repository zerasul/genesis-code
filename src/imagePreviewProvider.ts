import { readFileSync } from 'fs';
import * as imagesize from 'image-size';
import * as vscode from 'vscode';

export class ImagePreviewDocument extends vscode.Disposable implements vscode.CustomDocument{

    constructor(uri: vscode.Uri){
        super(ImagePreviewDocument._disposable);
        this.uri=uri;
        
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

    openCustomDocument(uri: vscode.Uri, openContext: vscode.CustomDocumentOpenContext, token: vscode.CancellationToken): ImagePreviewDocument | Thenable<ImagePreviewDocument> {
        
        return new ImagePreviewDocument(uri);
    }
    resolveCustomEditor(document: ImagePreviewDocument, webviewPanel: vscode.WebviewPanel, token: vscode.CancellationToken): void | Thenable<void> {
        let imageuri="data:image/png;base64 ,"+document.imagedatab64;
        let width = document.width;
        let height = document.height;
        let tilesw = (document.width!==undefined)?document.width/8:0;
        let tilesh = (document.height!==undefined)?document.height/8:0;

        webviewPanel.webview.html=`<html><head></head><body>
        <h1>fondo2.png</h1>
        <div id="image">
        <img src="${imageuri}" alt="image" />
        </div>
        <div>
        <div id="details">
        <h2>Image Details</h2>
        <ul>
            <li><strong>Width: </strong>${width} Pixels</li>
            <li><strong>Height: </strong>${height} Pixels</li>
            <li><strong>Tiles Width: </strong>${tilesw} Tiles</li>
            <li><strong>Tiles Height: </strong>${tilesh} Tiles</li>
        </ul>
        </div><div id="palette"><h2>Image Palette</h2></div>
        </div>
        </body></html>`;
    }
}