/**
 * (C) 2020. This code is under MIT license.
 * You can get a copy of the license with this software.
 * For more information please see https://opensource.org/licenses/MIT
 */

import { XMLParser } from 'fast-xml-parser';
import * as fs from "fs";
import * as path from "path";

const LAYERTEMPLATE =
  "Layer mylayer{{index}};\n" +
  "mylayer{{index}}.id = {{layerid}};\n" +
  'mylayer{{index}}.name = "{{name}}";\n' +
  "u16 mapdata{{index}}[{{numData}}]={{data}};\n" +
  "mylayer{{index}}.data = mapdata{{index}};\n" +
  "mylayer{{index}}.numData = {{numData}};\n" +
  "layers[{{index}}] = mylayer{{index}};\n";

const OBJECTTEMPLATE =
  "ObjectGroup myobjectgroup{{index}};\n" +
  "myobjectgroup{{index}}.id={{objectgropupid}};\n" +
  'myobjectgroup{{index}}.name="{{objectgroupname}}";\n' +
  "myobjectgroup{{index}}.numObjects={{nobjs}};\n" +
  "objectgroups[{{index}}]=myobjectgroup{{index}};\n" +
  "Object myobjects{{index}}[{{nobjs}}];\n";

const OBJSTEMPLATE =
  "Object myobject{{index}};\n" +
  "myobject{{index}}.id={{objid}};\n" +
  "myobject{{index}}.x={{objx}};\n" +
  "myobject{{index}}.y={{objy}};\n" +
  "myobject{{index}}.width={{objwidth}};\n" +
  "myobject{{index}}.height={{objheight}};\n";

export abstract class TiledParser {
  public abstract parseFile(file: string): TMX;
}

/**
 * Class tmxParser: this class reads a TMX File and parse it into a C Header File.
 *
 * @copyright 2020
 *
 * @author Victor Suarez <zerasul@gmail.com>
 */
export class TmxXMLParser extends TiledParser {
  /**
   * Parse a TMX file and return the TMX information
   * @param file tmx file path
   *
   * @returns TMX Object Information
   */
  public parseFile(file: string): TMX {
    let content = fs.readFileSync(file).toLocaleString();
    let json = new XMLParser({
      ignoreAttributes: false}).parse(content);
    //GetMapName
    let start = file.lastIndexOf(path.sep) + 1;
    let filename = file.substr(start, file.lastIndexOf(".") - start);
    let tmx = new TMXXmlFile();
    tmx.map = json;
    tmx.file = filename;

    return tmx;
  }
}

export class TmxJsonFileParser extends TmxXMLParser {
  parseFile(file: string) {
    let content = fs.readFileSync(file).toLocaleString();
    let json = JSON.parse(content);
    //GetMapName
    let start = file.lastIndexOf(path.sep) + 1;
    let filename = file.substr(start, file.lastIndexOf(".") - start);
    let tmx = new TMXJsonFile();
    tmx.map = json;
    tmx.file = filename;
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
export abstract class TMX {
  protected _map: any;

  protected _file: string = "";

  abstract get map(): any;
  abstract set map(v: any);
  abstract get file(): string;
  abstract set file(v: string);

  public abstract writeCHeaderFile(
    directoryPath: string,
    templatePath: string
  ): void;
}

export class TMXXmlFile extends TMX {
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

  public writeCHeaderFile(directoryPath: string, templatePath: string) {
    let strfile = fs.readFileSync(templatePath).toLocaleString();
    let currdate = new Date();
    let formatedDate =
      currdate.getFullYear() +
      "-" +
      (currdate.getMonth() + 1) +
      "-" +
      currdate.getDate();
    let n: number = this.getLayerLength();
    strfile = strfile
      .replace(/{{date}}/, formatedDate)
      .replace(/{{file}}/g, this.file)
      .replace(/{{fileMap}}/g, this.file.toUpperCase())
      .replace(/{{width}}/g, this.map["@_width"])
      .replace(/{{height}}/g, this.map["@_height"])
      .replace(/{{tilewidth}}/g, this.map["@_tilewidth"])
      .replace(/{{tileheight}}/g, this.map["@_tileheight"])
      .replace(/{{numLayers}}/g, n.toString());
    let strlayer = "";
    for (let index = 0; index < n; index++) {
      let layer = this.getLayer(index);

      const { csv, numData } = this.getLayerData(layer);
      let curlayer = LAYERTEMPLATE.replace(/{{file}}/g, this.file)
        .replace(/{{layerid}}/g, layer["@_id"])
        .replace(/{{name}}"/g, layer["@_name"])
        .replace(/{{data}}/g, "{" + csv + "}")
        .replace(/{{numData}}/g, numData.toString())
        .replace(/{{index}}/g, index.toString());
      strlayer += curlayer;
    }

    strfile = strfile.replace(/{{LayerInfo}}/g, strlayer);

    let nobjgroups = this.map?.objectgroup?.length ?? 0;

    strfile = strfile.replace(/{{numobjectgroups}}/g, nobjgroups.toString());
    let strobjgroup = "";
    if (nobjgroups > 0) {
      strobjgroup +=
        "ObjectGroup objectgroups[" + nobjgroups.toString() + "];\n";
      for (let index = 0; index < nobjgroups; index++) {
        let nobjs = 1;
        let objgroup = this.map.objectgroup?.[index] ?? this.map.objectgroup;
        let curobjgroup = OBJECTTEMPLATE;
        curobjgroup = curobjgroup
          .replace(/{{index}}/g, index.toString())
          .replace(/{{objectgropupid}}/g, objgroup["@_id"])
          .replace(/{{objectgroupname}}/g, objgroup["@_name"])
          .replace(/{{nobjs}}/g, nobjs.toString());

        for (let index1 = 0; index1 < nobjs; index1++) {
          let obj = objgroup.object?.[index1] ?? objgroup.object;
          let curobj = OBJSTEMPLATE.replace(/{{index}}/g, index.toString())
            .replace(/{{objid}}/g, obj["@_id"])
            .replace(/{{objx}}/g, obj["@_x"])
            .replace(/{{objy}}/g, obj["@_y"])
            .replace(/{{objwidth}}/g, obj["@_width"])
            .replace(/{{objheight}}/g, obj["@_height"]);
          let arrayobj = "myobjectgroup{{index}}.objects=myobjects{{index1}};\n"
            .replace(/{{index}}/g, index.toString())
            .replace(/{{index1}}/g, index1.toString());
          curobj += arrayobj;
          curobjgroup += curobj;
        }
        strobjgroup += curobjgroup;
      }
      strobjgroup += "mapstruct->objectgroups=objectgroups;\n";
    }
    strfile = strfile.replace(/{{ObjectInfo}}/g, strobjgroup);
    fs.writeFileSync(path.join(directoryPath, this.file + "Map.h"), strfile, {
      flag: "w",
    });
  }

  private getLayer(index: number) {
    return this.map.layer?.[index] ?? this.map.layer;
  }
  private getLayerData(layer: any) {
    let csv = "";
    let numData = 1;
    if (layer.data["@_encoding"] === "csv") {
      csv = layer.data["#text"];
      numData = layer.data["#text"].split(",").length;
    } else {
      //Base 64
      if (layer.data["@_encoding"] === "base64") {
        let buff = Buffer.from(layer.data["#text"], "base64");
        for (let bufferIndex = 0; bufferIndex < buff.length; bufferIndex += 4) {
          csv += buff.readUInt32LE(bufferIndex) + ",";
        }
        csv = csv.substring(0, csv.lastIndexOf(",") - 2);
        numData = csv.split(",").length;
      }
    }
    return { csv, numData };
  }
  private getLayerLength(): number {
    return this.map.layer?.length ?? 1;
  }
}

export class TMXJsonFile extends TMX {
  public get map(): any {
    return this._map;
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

  public writeCHeaderFile(directoryPath: string, templatePath: string): void {
    let strfile = fs.readFileSync(templatePath).toLocaleString();
    let currdate = new Date();
    let formatedDate =
      currdate.getFullYear() +
      "-" +
      (currdate.getMonth() + 1) +
      "-" +
      currdate.getDate();
    strfile = strfile
      .replace(/{{date}}/, formatedDate)
      .replace(/{{file}}/g, this.file)
      .replace(/{{fileMap}}/g, this.file.toUpperCase())
      .replace(/{{width}}/g, this.map.width)
      .replace(/{{height}}/g, this.map.height)
      .replace(/{{tilewidth}}/g, this.map.tilewidth)
      .replace(/{{tileheight}}/g, this.map.tileheight)
      .replace(/{{numLayers}}/g, this.map.layers.length.toString());
    let strlayer = "";
    for (let index = 0; index < this.map.layers.length; index++) {
      let layer = this.map.layers[index];

      const { csv, numData } = this.getLayerData(layer);
      let curlayer = LAYERTEMPLATE.replace(/{{file}}/g, this.file)
        .replace(/{{layerid}}/g, layer.id)
        .replace(/{{name}}/g, layer.name)
        .replace(/{{data}}/g, `{${csv ?? ""}}`)
        .replace(/{{numData}}/g, numData.toString())
        .replace(/{{index}}/g, index.toString());
      strlayer += curlayer;
    }

    strfile = strfile
      .replace(/{{LayerInfo}}/g, strlayer)
      .replace(/{{numobjectgroups}}/g, "0")
      .replace(/{{ObjectInfo}}/g, "");

    fs.writeFileSync(path.join(directoryPath, this.file + "Map.h"), strfile, {
      flag: "w",
    });
  }
  private getLayerData(layer: any) {
    let numData = 0;
    let csv: string | null = "";
    if (layer.data === undefined){ return { csv: null, numData };}
    //CSV
    if (layer.encoding === "csv" || layer.encoding === undefined) {
      for (const layerData of layer.data) {
        csv += layerData.toString() + ",";
      }
      csv = csv.substring(0, csv.lastIndexOf(","));
      numData = layer.data.length;
    } else if (layer.encoding === "base64") {
      let buff = Buffer.from(layer.data, "base64");
      for (let bufferIndex = 0; bufferIndex < buff.length; bufferIndex += 4) {
        csv += buff.readUInt32LE(bufferIndex) + ",";
      }
      csv = csv.substring(0, csv.lastIndexOf(",") - 2);
      numData = csv.split(",").length;
    }

    return { csv, numData };
  }
}
