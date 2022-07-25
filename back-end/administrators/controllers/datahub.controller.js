const fs = require("fs");
const config = require("../../common/config/env.config");
const param_config = require("../../common/config/params.config");
const http = require("http");
const querystring = require("querystring");
const edgeSDK = require("wisepaas-datahub-edge-nodejs-sdk");
var request = require("request");
const internal = require("stream");
const { Interface } = require("readline");
const _ = require("lodash");
const parseString = require("xml2js").parseString;

const headers = {
  Accept: "*/*",
  "Accept-Language": "en-US,en;q=0.9,es;q=0.8",
  Connection: "keep-alive",
  "Content-Type": "application/x-www-form-urlencoded",
  DNT: "1",
  Origin: "https://www.netflix.com",
  Referer: "https://www.netflix.com/browse/my-list",
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/75.0.3770.100 Safari/537.36",
  "X-Netflix.browserName": "Chrome",
  "X-Netflix.browserVersion": "75",
  "X-Netflix.clientType": "akira",
  "X-Netflix.esnPrefix": "NFCDCH-02-",
  "X-Netflix.osFullName": "Windows 10",
  "X-Netflix.osName": "Windows",
  "X-Netflix.osVersion": "10.0",
  "X-Netflix.playerThroughput": "58194",
  "X-Netflix.uiVersion": "v73fa49e3",
  "cache-control": "no-cache",
  Cookie: "",
};

const deviceCount = 1;
const analogTagNum = 3;
const textTagNum = 3;
// const arrayTagNum = 3;
// const arrayTagSize = 10;
// const discreteTagNum = 3;

let rawdata = fs.readFileSync("datahub_config.json");
let datahub_config_default = JSON.parse(rawdata);

let options = {
  connectType: edgeSDK.constant.connectType.MQTT,
  MQTT: {
    hostName: "rabbitmq-001-pub.hz.wise-paas.com.cn",
    port: 1883,
    username: "Goy2waYPAGQP:jPy9GbpKRVeY",
    password: "A3nkFKlj3Iu0MVn3vdZR",
    protocolType: edgeSDK.constant.protocol.TCP,
  },
  useSecure: false,
  autoReconnect: true,
  reconnectInterval: 1000,
  nodeId: "scada_sGrDhJvhEKv9", // getting from datahub portal
  scadaId: "scada_sGrDhJvhEKv9",
  type: edgeSDK.constant.edgeType.Gateway, // Choice your edge is Gateway or Device, Default is Gateway
  // deviceId: 'Device1', // If type is Device, DeviceId must be filled
  heartbeat: 60000, // default is 60 seconds,
  dataRecover: true, // need to recover data or not when disconnected
  ovpnPath: "", // set the path of your .ovpn file, only for linux
};
var sendTimer = {};
var edgeConfig = {};
var edgeAgent = new edgeSDK.EdgeAgent(options);
var api_data = [];

exports.getConfigDatahub = async (req, res) => {
  try {
    let rawdata = fs.readFileSync("datahub_config.json");
    let data = JSON.parse(rawdata);

    return res.status(200).send({ config: data });
  } catch (error) {
    console.log(error);
    return res.status(400).send(error);
  }
};

/*
json req:
{
  "hostName":"rabbitmq-001-pub.hz.wise-paas.com.cn",
  "port":1883,
  "username":"Goy2waYPAGQP:PWyP8K5Jwoy7",
  "password":"6Kjv1mi7d2rISXU6yPxO",
  "protocolType":"TCP",
  "nodeId":"scada_YtTJMC8MUlrm",
  "scadaId":"scada_YtTJMC8MUlrm"
}
 */
exports.connectDatahub = async (req, res) => {
  try {
    console.log("connect");
    let datahub = { ...{}, ...req.body };
    console.log(datahub);
    // writeJsonFile('datahub_config.json', {nodeId: datahub.NodeId,credentialKey:datahub.CredentialKey,apiUrl :datahub.ApiUrl});
    //writeConfigFile(datahub);
    options = {
      connectType: edgeSDK.constant.connectType.MQTT,
      MQTT: {
        hostName: datahub.hostName,
        port: datahub.port,
        username: datahub.username,
        password: datahub.password,
        protocolType: edgeSDK.constant.protocol.TCP,
      },
      useSecure: false,
      autoReconnect: true,
      reconnectInterval: 1000,
      nodeId: datahub.nodeId, // getting from datahub portal
      scadaId: datahub.scadaId,
      type: edgeSDK.constant.edgeType.Gateway, // Choice your edge is Gateway or Device, Default is Gateway
      // deviceId: 'Device1', // If type is Device, DeviceId must be filled
      heartbeat: 60000, // default is 60 seconds,
      dataRecover: true, // need to recover data or not when disconnected
      ovpnPath: "", // set the path of your .ovpn file, only for linux
    };

    edgeAgent = new edgeSDK.EdgeAgent(options);
    edgeAgent.connect();
    edgeAgent.events.on("connected", () => {
      console.log("Connect success !");
      edgeConfig = prepareConfig();
      edgeAgent
        .uploadConfig(edgeSDK.constant.actionType.create, edgeConfig)
        .then(
          (res) => {
            // when mqtt disconnect happened, and automatically reconnect
            // clear interval to prevent duplicate time interval call
            clearInterval(sendTimer);
            sendTimer = setInterval(sendDataInterval, 3000);
            sendData();
          },
          (error) => {
            console.log("upload config error");
            console.log(error);
          }
        );
    });
    // edgeAgent.events.on('disconnected', () => {
    //     console.log('Disconnected... ');

    edgeAgent = new edgeSDK.EdgeAgent(options);
    edgeAgent.connect();
    edgeAgent.events.on("connected", () => {
      console.log("Connect success !");
      edgeConfig = datahubService.prepareConfig();
      console.log(edgeConfig);
      console.log(edgeConfig.Scada.TextTagList);
      console.log(edgeConfig.Scada.AnalogTagList);

      edgeAgent
        .uploadConfig(edgeSDK.constant.actionType.create, edgeConfig)
        .then(
          (res) => {
            // when mqtt disconnect happened, and automatically reconnect
            // clear interval to prevent duplicate time interval call
            console.log(res);
            // clearInterval(sendTimer);
            // sendTimer = setInterval(sendData, 3000);
            // sendData();
          },
          (error) => {
            console.log("upload config error");
            console.log(error);
          }
        );
    });
    edgeAgent.events.on("disconnected", () => {
      console.log("Disconnected... ");
    });
    edgeAgent.events.on("messageReceived", (msg) => {
      switch (msg.type) {
        case edgeSDK.constant.messageType.writeValue:
          for (let device of msg.message.deviceList) {
            console.log("DeviceId: " + device.id);
            for (let tag of device.tagList) {
              console.log("TagName: " + tag.name + ", Value: " + tag.value);
            }
          }
          break;
        case edgeSDK.constant.messageType.configAck:
          console.log("Upload Config Result: " + msg.message);
          break;
          break;
        case edgeSDK.constant.messageType.configAck:
          console.log("Upload Config Result: " + msg.message);
          break;
      }
    });

    return res.status(200).send({ message: "ok" });
  } catch (error) {
    console.log(error);
    return res.status(400).send(error);
  }
};

exports.disconnectDatahub = async (req, res) => {
  try {
    if (edgeAgent != null) edgeAgent.disconnect();
    console.log("Disconnected... ");
    // edgeAgent.events.on('disconnected', () => {
    //     console.log('Disconnected... ');

    // });

    return res.status(200).send({ message: "disconnected" });
    //return res.status(200).send({ message: "error" });
  } catch (error) {
    console.log(error);
    return res.status(400).send(error);
  }
};

exports.sendDataAPIToDatahub = async (req, res) => {
  try {
  } catch (error) {
    console.log(error);
    res.status(400).send({ message: "Datahub not exists" });
  }
};

/*
{
  "baseUrl":"http://14.225.244.63:8083/VendingInterface.asmx/SUNGRP_getInstant?",
  "sNoList":"20698013,20697912",
  "sTime":"2022-06-28 00:00:00"
}
*/

exports.getDailyData = async (req, res) => {
  try {
    let body = { ...{}, ...req.body };
    let url =
      body.baseUrl + "?sNoList=" + body.sNoList + "&" + "sDate=" + body.sDate;
    let get_token_options = {
      json: true,
      url: url,
      method: "GET",
      headers: headers,
    };

    request(get_token_options, (error, response, body) => {
      if (!error && response.statusCode == 200) {
        parseString(
          convertXMLtoDocumentElementJson(body),
          { ignoreAttrs: true, explicitArray: false },
          (err, result) => {
            if (err) {
              return res.status(400).send(err);
            }
            return res
              .status(200)
              .send(_.get(result, "DocumentElement.dtResult", []));
          }
        );
      }
    });
  } catch (error) {
    return res.status(400).send(error);
  }
};

exports.getMeterParameters = async (req, res) => {
  try {
    let body = { ...{}, ...req.body };
    let url =
      body.baseUrl + "?sNoList=" + body.sNoList + "&" + "sTime=" + body.sTime;
    let get_token_options = {
      json: true,
      url: url,
      method: "GET",
      headers: headers,
    };

    request(get_token_options, (error, response, body) => {
      if (!error && response.statusCode == 200) {
        parseString(
          convertXMLtoDocumentElementJson(body),
          { ignoreAttrs: true, explicitArray: false },
          (err, result) => {
            if (err) {
              return res.status(400).send(err);
            }
            return res
              .status(200)
              .send(_.get(result, "DocumentElement.dtResult", []));
          }
        );
      }
    });
  } catch (error) {
    return res.status(400).send(error);
  }
};

const convertXMLtoDocumentElementJson = (xmlstring) => {
  let stringData = xmlstring.toString();
  const firstIndexOfDocument = stringData.indexOf("<DocumentElement>");
  const lastIndexOfDocument = stringData.indexOf("</DocumentElement>");
  stringData = stringData.substring(
    firstIndexOfDocument,
    lastIndexOfDocument + 18
  );
  return stringData;
};

function prepareConfig() {
  let edgeConfig = new edgeSDK.EdgeConfig();
  let tagList = [
    { name: "MA_DIEMDO", type: "string" },
    { name: "SO_CTO", type: "string" },
    { name: "IMPORT_KWH", type: "decimal" },
    { name: "EXPORT_KWH", type: "decimal" },
    { name: "IMPORT_VAR", type: "decimal" },
    { name: "EXPORT_VAR", type: "decimal" },
    { name: "Ia", type: "decimal" },
    { name: "Ib", type: "decimal" },
    { name: "Ic", type: "decimal" },
    { name: "Ua", type: "decimal" },
    { name: "Ub", type: "decimal" },
    { name: "Uc", type: "decimal" },
    { name: "Cosphi", type: "decimal" },
    { name: "NGAYGIO", type: "string" },
  ];
  let analogTagList = [];
  let textTagList = [];

  edgeConfig.Scada = new edgeSDK.ScadaConfig();
  // {
  //     Id = options.nodeId;
  //     Name = options.nodeId;
  //     Description = "descrp";
  //     PortNumber = 1;
  //     HeartBeat = 60;
  //     BackupDeviceId =0;
  // };
  edgeConfig.Scada.Id = options.nodeId;
  edgeConfig.Scada.Name = options.nodeId;
  edgeConfig.Scada.Description = "descrp";
  edgeConfig.Scada.PortNumber = 1;
  edgeConfig.Scada.DeviceType = 0;
  edgeConfig.Scada.HeartBeat = 60;
  edgeConfig.Scada.BackupDeviceId = 0;

  for (let i = 0; i < tagList.length; i++) {
    if (tagList[i].type == "string") {
      let textTagConfig = new edgeSDK.TextTagConfig();
      textTagConfig.Name = "20698013" + tagList[i].name;
      textTagConfig.Description = tagList[i].name;
      textTagList.push(textTagConfig);
    } else {
      let analogTagConfig = new edgeSDK.AnalogTagConfig();
      analogTagConfig.Name = "20698013" + tagList[i].name;
      analogTagConfig.Description = tagList[i].name;
      analogTagList.push(analogTagConfig);
    }
  }

  edgeConfig.Scada.AnalogTagList = analogTagList;
  edgeConfig.Scada.TextTagList = textTagList;

  //edgeConfig.node.deviceList.push(edgeConfig.Scada);

  edgeConfig.node.deviceList.push(deviceConfig);
  return edgeConfig;
}
function sendData() {
  if (Object.keys(edgeConfig).length === 0) {
    return;
  }
  let data = prepareData();
  //console.log(data);
  edgeAgent.sendData(data);
}
function prepareData() {
  let data = new edgeSDK.EdgeData();
  let tagList = [
    { name: "MA_DIEMDO", type: "string" },
    { name: "SO_CTO", type: "string" },
    { name: "IMPORT_KWH", type: "decimal" },
    { name: "EXPORT_KWH", type: "decimal" },
    { name: "IMPORT_VAR", type: "decimal" },
    { name: "EXPORT_VAR", type: "decimal" },
    { name: "Ia", type: "decimal" },
    { name: "Ib", type: "decimal" },
    { name: "Ic", type: "decimal" },
    { name: "Ua", type: "decimal" },
    { name: "Ub", type: "decimal" },
    { name: "Uc", type: "decimal" },
    { name: "Cosphi", type: "decimal" },
    { name: "NGAYGIO", type: "string" },
  ];
  for (let i = 0; i < tagList.length; i++) {
    if (tagList[i].type == "string") {
      let TTag = new edgeSDK.Tag();
      TTag.DeviceId = options.nodeId;
      TTag.TagName = "20698013_" + tagList[i].name;
      TTag.Value = "20698013";
      data.TagList.push(TTag);
    } else {
      let ATag = new edgeSDK.Tag();
      ATag.DeviceId = options.nodeId;
      ATag.TagName = "20698013_" + tagList[i].name;
      ATag.Value = Math.floor(Math.random() * 100) + 1;
      // {
      //     "0": Math.floor(Math.random() * 100) + 1,
      //     "1": Math.floor(Math.random() * 100) + 1
      // }
      data.TagList.push(ATag);
    }
  }

  //console.log(data);
  return data;
}

function writeConfigFile(datahub) {
  //nodeId: datahub.NodeId,credentialKey:datahub.CredentialKey,apiUrl :datahub.ApiUrl
  // json data
  // var jsonData = '{"config":{"nodeId":"' + datahub.NodeId +'","credentialKey":"' + datahub.CredentialKey+ '",apiUrl:"'+ datahub.ApiUrl + '"}}';

  // parse json
  // var jsonObj = JSON.parse(jsonData);
  //console.log(jsonObj);

  // stringify JSON Object
  var jsonContent = JSON.stringify(datahub);
  console.log(jsonContent);

  fs.writeFile("datahub_config.json", jsonContent, "utf8", function (err) {
    if (err) {
      console.log("An error occured while writing JSON Object to File.");
      return console.log(err);
    }

    console.log("JSON file has been saved.");
  });
}
function updateDeviceStatus(numDeviceCount) {
  let devieStatus = new edgeSDK.EdgeDeviceStatus();
  for (let i = 1; i <= numDeviceCount; i++) {
    let device = new edgeSDK.DeviceStatus();
    device.id = "Device" + i;
    device.status = edgeSDK.constant.status.online;
    devieStatus.deviceList.push(device);
  }
  edgeAgent.sendDeviceStatus(devieStatus);
}

function deleteScadaConfig() {
  let edgeConfig = new edgeSDK.EdgeConfig();
  for (let i = 1; i <= deviceCount; i++) {
    let ScadaConfig = new edgeSDK.ScadaConfig();
    ScadaConfig.id = "Device" + i;
    edgeConfig.node.deviceList.push(ScadaConfig);
  }
  return edgeConfig;
}

function deleteTagConfig() {
  let edgeConfig = new edgeSDK.EdgeConfig();
  let analogTagList = [];
  let discreteTagList = [];
  let textTagList = [];

  for (let i = 1; i <= deviceCount; i++) {
    let ScadaConfig = new edgeSDK.ScadaConfig();
    ScadaConfig.id = "Device" + i;
    ScadaConfig.name = "Device " + i;
    ScadaConfig.type = "Smart Device";
    ScadaConfig.description = "Device " + i;
    for (let j = 1; j <= analogTagNum; j++) {
      let analogTagConfig = new edgeSDK.AnalogTagConfig();
      analogTagConfig.name = "ATag" + j;
      analogTagList.push(analogTagConfig);
    }
    for (let j = 1; j <= discreteTagNum; j++) {
      let discreteTagConfig = new edgeSDK.DiscreteTagConfig();
      discreteTagConfig.name = "DTag" + j;
      discreteTagList.push(discreteTagConfig);
    }
    for (let j = 1; j <= textTagNum; j++) {
      let textTagConfig = new edgeSDK.TextTagConfig();
      textTagConfig.Name = "TTag" + j;
      textTagList.push(textTagConfig);
    }
    for (let j = 1; j <= arrayTagNum; j++) {
      let arrayTag = new edgeSDK.AnalogTagConfig();
      arrayTag.name = "ArrayTag" + j;
      analogTagList.push(arrayTag);
    }
    ScadaConfig.analogTagList = analogTagList;
    ScadaConfig.discreteTagList = discreteTagList;
    ScadaConfig.textTagList = textTagList;

    edgeConfig.node.deviceList.push(ScadaConfig);
  }
  for (let j = 1; j <= discreteTagNum; j++) {
    let discreteTagConfig = new edgeSDK.DiscreteTagConfig();
    discreteTagConfig.name = "DTag" + j;
    discreteTagList.push(discreteTagConfig);
  }
  for (let j = 1; j <= textTagNum; j++) {
    let textTagConfig = new edgeSDK.TextTagConfig();
    textTagConfig.name = "TTag" + j;
    textTagList.push(textTagConfig);
  }
  for (let j = 1; j <= arrayTagNum; j++) {
    let arrayTag = new edgeSDK.AnalogTagConfig();
    arrayTag.name = "ArrayTag" + j;
    analogTagList.push(arrayTag);
  }
  deviceConfig.analogTagList = analogTagList;
  deviceConfig.discreteTagList = discreteTagList;
  deviceConfig.textTagList = textTagList;

  edgeConfig.node.deviceList.push(deviceConfig);
  return edgeConfig;
}

function deleteAllConfig() {
  let edgeConfig = new edgeSDK.EdgeConfig();
  return edgeConfig;
}

function callback(error, response, body) {
  if (!error && response.statusCode == 200) {
    console.log(body);
  }
}
