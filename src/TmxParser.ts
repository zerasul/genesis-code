/**
 * (C) 2020. This code is under MIT license.
 * You can get a copy of the license with this software.
 * For more information please see https://opensource.org/licenses/MIT 
 */

import * as xmlparser from 'fast-xml-parser';
import * as fs from 'fs';
import * as path from 'path';


const LAYERTEMPLATE = '{{file}}Layer mylayer{{index}};\n\
mylayer{{index}}.id = {{layerid}};\n\
mylayer{{index}}.name = "{{name}}";\n\
u16 mapdata{{index}}[{{numData}}]={{data}};\n\
mylayer{{index}}.data = mapdata{{index}};\n\
mylayer{{index}}.numData = {{numData}};\n\
mapstruct->layers[{{index}}] = mylayer{{index}};\n';

/**
 * Class tmxParser: this class reads a TMX File and parse it into a C Header File.
 * 
 * @copyright 2020
 * 
 * @author Victor Suarez <zerasul@gmail.com>
 */
export class TmxParser {

    /**
     * Parse a TMX file and return the TMX information
     * @param file tmx file path
     * 
     * @returns TMX Object Information
     */
    public static parseTmxFile(file: string): TMX {
        let content = fs.readFileSync(file).toLocaleString();
        let json = xmlparser.parse(content, { ignoreAttributes: false, ignoreNameSpace: true });
        //GetMapName
        let start = file.lastIndexOf(path.sep) + 1;
        let filename = file.substr(start, file.lastIndexOf(".") - start);
        let tmx = this.parseJSON(json);
        tmx.file = filename;
        return tmx;
    }

    /**
     * Parse a json with the TMX information
     * @param json json object with the TMX information
     * 
     * @returns TMX object information 
     */
    public static parseJSON(json: any): TMX {
        let tmx = new TMX();
        tmx.map = json;

        return tmx;
    }

}

/**
 * Class TMX: TMX format information
 * 
 * @copyright 2020
 * 
 * @author Victor Suarez <zerasul@gmail.com>
 */
export class TMX {
    private _map: any;

    private _file: string = '';


    public get map(): any {
        return this._map.map;
    }

    public set map(v: any) {
        this._map = v;
    }


    public get file(): string {
        return this._file;
    }


    public set file(v: string) {
        this._file = v;
    }


    public writeHeaderFile(directoryPath: string, templatePath: string) {
        let strfile = fs.readFileSync(templatePath).toLocaleString();
        let currdate = new Date();
        let formatedDate = currdate.getFullYear() + "-" + (currdate.getMonth() + 1) + "-" + currdate.getDate();
        strfile = strfile.replace(new RegExp("{{date}}"), formatedDate);
        strfile = strfile.replace(new RegExp("{{file}}", 'g'), this.file);
        strfile = strfile.replace(new RegExp("{{fileMap}}", 'g'), this.file.toUpperCase());
        strfile = strfile.replace(new RegExp("{{width}}", 'g'), this.map['@_width']);
        strfile = strfile.replace(new RegExp("{{height}}", 'g'), this.map['@_height']);
        strfile = strfile.replace(new RegExp("{{tilewidth}}", 'g'), this.map['@_tilewidth']);
        strfile = strfile.replace(new RegExp("{{tileheight}}", 'g'), this.map['@_tileheight']);
        let n: number = 1;
        if (this.map.layer.constructor === Array) {
            n = this.map.layer.length;

        }
        strfile = strfile.replace(new RegExp("{{numLayers}}", 'g'), n.toString());
        let strlayer = '';
        for (let index = 0; index < n; index++) {
            let layer = this.map.layer;
            if (layer.constructor === Array) {
                layer = this.map.layer[index];
            }


            let curlayer = LAYERTEMPLATE;
            curlayer = curlayer.replace(new RegExp("{{file}}", 'g'), this.file);
            curlayer = curlayer.replace(new RegExp("{{layerid}}", 'g'), layer['@_id']);
            curlayer = curlayer.replace(new RegExp("{{name}}", 'g'), layer['@_name']);
            let numData = 1;
            let csv = '';
            if (layer.data['@_encoding'] === 'csv') {
                csv = layer.data['#text'];
                numData = layer.data['#text'].split(",").length;
            } else {
                //Base 64
                if (layer.data['@_encoding'] === 'base64') {
                    let buff = new Buffer(layer.data['#text'], 'base64');
                    for (let index = 0; index < buff.length; index += 4) {
                        csv += buff.readUInt32LE(index) + ",";
                    }
                    csv = csv.substring(0, csv.lastIndexOf(",") - 2);
                    numData = csv.split(",").length;
                }
            }
            curlayer = curlayer.replace(new RegExp("{{data}}", 'g'), "{" + csv + "}");
            curlayer = curlayer.replace(new RegExp("{{numData}}", 'g'), numData.toString());
            curlayer = curlayer.replace(new RegExp("{{index}}", 'g'), index.toString());
            strlayer += curlayer;
        }

        strfile = strfile.replace(new RegExp("{{LayerInfo}}", 'g'), strlayer);


        fs.writeFileSync(path.join(directoryPath, this.file + "Map.h"), strfile, {
            flag: 'w'
        });
    }
}
