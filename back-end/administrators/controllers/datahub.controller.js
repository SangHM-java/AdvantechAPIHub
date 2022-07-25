// const DatahubModel = require('../models/datahub.model');
// const crypto = require('crypto');
// const Utils = require("../../libs/Utils");
// const Validator = require("../../libs/Validator");
// var moment = require('moment');
// const { v4: uuidv4 } = require('uuid');
// const fs = require('fs');
// const uploadPath = require('../../common/config/env.config.js').upload_path;
const fs = require('fs');
const config = require('../../common/config/env.config');
const param_config = require('../../common/config/params.config');
const http = require('http');
const querystring = require('querystring');
const edgeSDK = require('wisepaas-datahub-edge-nodejs-sdk');
const parser = require('xml2json');
var request = require('request');
const internal = require('stream');
const { Interface } = require('readline');

// GET parameters
const parameters = {
    MA_DIEMDO: "S1.01_AN",
    TU_NGAY: "8/22/2021 6:41:12",
    DEN_NGAY: "8/24/2021 6:41:12",
    TOKEN: config.token
}

const headers = {
    'Accept': '*/*',
    'Accept-Language': 'en-US,en;q=0.9,es;q=0.8',
    'Connection': 'keep-alive',
    'Content-Type': 'application/x-www-form-urlencoded',
    'DNT': '1',
    'Origin': 'https://www.netflix.com',
    'Referer': 'https://www.netflix.com/browse/my-list',
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/75.0.3770.100 Safari/537.36',
    'X-Netflix.browserName': 'Chrome',
    'X-Netflix.browserVersion': '75',
    'X-Netflix.clientType': 'akira',
    'X-Netflix.esnPrefix': 'NFCDCH-02-',
    'X-Netflix.osFullName': 'Windows 10',
    'X-Netflix.osName': 'Windows',
    'X-Netflix.osVersion': '10.0',
    'X-Netflix.playerThroughput': '58194',
    'X-Netflix.uiVersion': 'v73fa49e3',
    'cache-control': 'no-cache',
    'Cookie': ''
};

const deviceCount = 1;
const analogTagNum = 3;
const textTagNum = 3;
// const arrayTagNum = 3;
// const arrayTagSize = 10;
// const discreteTagNum = 3;

let rawdata = fs.readFileSync('datahub_config.json');
let datahub_config_default = JSON.parse(rawdata);

let options = {
    connectType: edgeSDK.constant.connectType.MQTT,
    MQTT: {
        hostName: "rabbitmq-001-pub.hz.wise-paas.com.cn",
        port: 1883,
        username: "Goy2waYPAGQP:jPy9GbpKRVeY",
        password: "A3nkFKlj3Iu0MVn3vdZR",
        protocolType: edgeSDK.constant.protocol.TCP
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
    ovpnPath: '' // set the path of your .ovpn file, only for linux
};
var sendTimer = {};
var edgeConfig = {};
var edgeAgent = new edgeSDK.EdgeAgent(options);
var api_data = [];

exports.getConfigDatahub = async (req, res) => {
    try {

        let rawdata = fs.readFileSync('datahub_config.json');
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
        writeConfigFile(datahub);
        options = {
            connectType: edgeSDK.constant.connectType.MQTT,
            MQTT: {
                hostName: datahub.hostName,
                port: datahub.port,
                username: datahub.username,
                password: datahub.password,
                protocolType: edgeSDK.constant.protocol.TCP
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
            ovpnPath: '' // set the path of your .ovpn file, only for linux
        };



        edgeAgent = new edgeSDK.EdgeAgent(options);
        edgeAgent.connect();
        edgeAgent.events.on('connected', () => {
            console.log('Connect success !');
            edgeConfig = prepareConfig();
            console.log(edgeConfig);
            console.log(edgeConfig.Scada.TextTagList);
            console.log(edgeConfig.Scada.AnalogTagList);

            edgeAgent.uploadConfig(edgeSDK.constant.actionType.create, edgeConfig).then((res) => {
                // when mqtt disconnect happened, and automatically reconnect
                // clear interval to prevent duplicate time interval call
                console.log(res);
                clearInterval(sendTimer);
                sendTimer = setInterval(sendData, 3000);
                sendData();
            }, error => {
                console.log('upload config error');
                console.log(error);
            });

        });
        edgeAgent.events.on('disconnected', () => {
            console.log('Disconnected... ');

        });
        edgeAgent.events.on('messageReceived', (msg) => {
            switch (msg.type) {
                case edgeSDK.constant.messageType.writeValue:
                    for (let device of msg.message.deviceList) {
                        console.log('DeviceId: ' + device.id);
                        for (let tag of device.tagList) {
                            console.log('TagName: ' + tag.name + ', Value: ' + tag.value);
                        }
                    }
                    break;
                case edgeSDK.constant.messageType.configAck:
                    console.log('Upload Config Result: ' + msg.message);
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
        console.log('Disconnected... ');
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

exports.getTokenFromAPI = async (req, res) => {

    try {
        console.log("getTokenFromAPI");

        const get_token_options = {
            json: true,
            url: 'http://smart.cpc.vn/etl/api/login?USER_NAME=chaunm&PASSWORD=chaunm123',
            method: 'GET',
            headers: headers,
            //body: dataString
        };

        request(get_token_options, (error, response, body) => {
            if (!error && response.statusCode == 200) {

                res.status(200).send({ TOKEN: body.data.data.TOKEN });
            }
        });


    } catch (error) {
        console.log(error);
        res.status(400).send({ message: "Datahub not exists" });
    }

};

exports.sendDataAPIToDatahub = async (req, res) => {

    try {
        console.log("sendDataAPIToDatahub");
        let get_token_options = {
            json: true,
            url: 'http://smart.cpc.vn/etl/api/login?USER_NAME=chaunm&PASSWORD=chaunm123',
            method: 'GET',
            headers: headers,
            //body: dataString
        };
        let TOKEN = "";

        request(get_token_options, (error, response, body) => {
            if (!error && response.statusCode == 200) {
                TOKEN = body.data.TOKEN;
                //res.status(200).send({TOKEN : body.data.data.TOKEN});
                // const get_request_args = querystring.stringify(parameters);
                let get_request_args = "MA_DIEMDO=S1.01_AN&TU_NGAY=8/22/2021 6:41:12&DEN_NGAY=8/24/2021 6:41:12&TOKEN=" + TOKEN;

                let get_data_options = {
                    json: true,
                    url: 'https://smart.cpc.vn/etl/api/getAllInfoMeter?TOKEN=' + TOKEN,
                    method: 'GET',
                    headers: headers,
                    //body: dataString
                };


                request(get_data_options, (error, response, body) => {
                    if (!error && response.statusCode == 200) {
                        api_data = body.data;
                        let data = new edgeSDK.EdgeData();
                        //let datahub_data = api_data[0];
                        let edgeConfig = new edgeSDK.EdgeConfig();
                        let textTagList = [];

                        let limit = api_data.length;
                        console.log(api_data.length);
                        //>= 10 ? 10 : api_data.length
                        for (let i = 0; i < limit; i++) {
                            let datahub_data = api_data[i];

                            for (const property2 in datahub_data) {
                                if (datahub_data[property2] != null && datahub_data[property2] != "null") {
                                    let TTag = new edgeSDK.Tag();

                                    TTag.deviceId = 'Device' + i;
                                    TTag.tagName = param_config[property2] != null ? param_config[property2].Tagname : property2;
                                    TTag.value = "" + datahub_data[property2];
                                    data.tagList.push(TTag);
                                }

                            }

                            let TTaga = new edgeSDK.Tag();
                            let a = Math.atanh(Math.acos(datahub_data["COSPHI_PHASE_A"])) * datahub_data["ACTIVE_POWER_PHASE_A"];
                            let b = Math.atanh(Math.acos(datahub_data["COSPHI_PHASE_B"])) * datahub_data["ACTIVE_POWER_PHASE_B"];
                            let c = Math.atanh(Math.acos(datahub_data["COSPHI_PHASE_C"])) * datahub_data["ACTIVE_POWER_PHASE_C"]

                            TTaga.deviceId = 'Device' + i;
                            TTaga.tagName = "Qa";
                            TTaga.value = a;
                            data.tagList.push(TTaga);

                            let TTagb = new edgeSDK.Tag();

                            TTagb.deviceId = 'Device' + i;
                            TTagb.tagName = "Qb";
                            TTagb.value = b;
                            data.tagList.push(TTagb);

                            let TTagc = new edgeSDK.Tag();

                            TTagc.deviceId = 'Device' + i;
                            TTagc.tagName = "Qc";
                            TTagc.value = c;
                            data.tagList.push(TTagc);

                            let TTagCoshphi = new edgeSDK.Tag();
                            let average = datahub_data["COSPCHI_PHASE_A"] != 0
                                && datahub_data["COSPHI_PHASE_B"] != 0
                                && datahub_data["COSPHI_PHASE_C"] != 0
                                && datahub_data["COSPHI_PHASE_A"] != null
                                && datahub_data["COSPHI_PHASE_B"] != null
                                && datahub_data["COSPHI_PHASE_C"] != null ? 3 : 1;
                            TTagCoshphi.deviceId = 'Device' + i;
                            TTagCoshphi.tagName = "Coshphi";
                            TTagCoshphi.value = (datahub_data["COSPHI_PHASE_A"] + datahub_data["COSPHI_PHASE_B"] + datahub_data["COSPHI_PHASE_C"]) / average;
                            data.tagList.push(TTagCoshphi);

                            console.log(average);
                            console.log("KQ");
                            console.log(datahub_data["COSPHI_PHASE_A"]);
                            console.log(Math.cosh(datahub_data["COSPHI_PHASE_A"]));
                            console.log(a, b, c);
                            console.log((a + b + c) / average);
                        }

                        for (let i = 0; i < limit; i++) {
                            let datahub_data = api_data[i];

                            let ScadaConfig = new edgeSDK.ScadaConfig();
                            ScadaConfig.id = 'Device' + i;
                            ScadaConfig.name = datahub_data["MA_DIEMDO"];
                            ScadaConfig.type = 'Smart Device';
                            ScadaConfig.description = datahub_data["MA_DIEMDO"];

                            for (const property1 in datahub_data) {
                                let textTagConfig = new edgeSDK.TextTagConfig();
                                textTagConfig.Name = param_config[property1] != null ? param_config[property1].Tagname : property1;
                                textTagConfig.Description = param_config[property1] != null ? param_config[property1].Tagname : property1;
                                textTagList.push(textTagConfig);
                            }

                            let textTagConfiga = new edgeSDK.TextTagConfig();
                            textTagConfiga.name = "Qa";
                            textTagConfiga.description = "Qa";
                            textTagList.push(textTagConfiga);

                            let textTagConfigb = new edgeSDK.TextTagConfig();
                            textTagConfigb.name = "Qb";
                            textTagConfigb.description = "Qb";
                            textTagList.push(textTagConfigb);

                            let textTagConfigc = new edgeSDK.TextTagConfig();
                            textTagConfigc.name = "Qc";
                            textTagConfigc.description = "Qc";
                            textTagList.push(textTagConfigc);

                            let textTagConfigCoshphi = new edgeSDK.TextTagConfig();
                            textTagConfigCoshphi.name = "Coshphi";
                            textTagConfigCoshphi.description = "Coshphi";
                            textTagList.push(textTagConfigCoshphi);

                            ScadaConfig.textTagList = textTagList;

                            edgeConfig.node.deviceList.push(ScadaConfig);
                        }

                        edgeAgent.uploadConfig(edgeSDK.constant.actionType.create, edgeConfig).then((res2) => {
                        edgeAgent.sendData(data);
                        console.log(res2);
                        res.status(200).send({ message: res2, deviceList: edgeConfig.node.deviceList });
                        }, error => {
                            console.log('upload config error');
                            console.log(error);
                        });



                    }
                });
            }
        });





    } catch (error) {
        console.log(error);
        res.status(400).send({ message: "Datahub not exists" });
    }

};

var list_meter_parameters = [];
var list_meter_config = {};
function getObjKeys(obj, value) {
    return Object.keys(obj).filter(key => obj[key] === value);
}
/*
{
  "baseUrl":"http://14.225.244.63:8083/VendingInterface.asmx/SUNGRP_getInstant?",
  "sNoList":"20698013,20697912",
  "sTime":"2022-06-28 00:00:00"
}
*/

exports.getMeterParameters = async (req, res) => {
    try {
        console.log("getMeterParameters");
        let body = { ...{}, ...req.body };
        let url = body.baseUrl + "sNoList=" + body.sNoList + "&" + "sTime=" + body.sTime;
        console.log(url);
        let get_token_options = {
            json: true,
            url: url,
            method: 'GET',
            headers: headers,
        };


        request(get_token_options, (error, response, body) => {
            data = parser.toJson(body, { object: true });
            console.log(data);
            list_meter_config = data["xs:schema"];
            console.log(list_meter_config);
            return res.status(200).send(list_meter_parameters);
        });
    } catch (error) {
        console.log(error);
        return res.status(400).send(error);
    }

};

exports.insert = async (req, res) => {
    try {
        console.log("insert");
    } catch (error) {
        return res.status(400).send(error);
    }

};

exports.update = async (req, res) => {
    try {
        console.log("insert");
    } catch (error) {
        return res.status(400).send(error);
    }

};

exports.list = async (req, res) => {
    const { website } = req.query;
    try {
        console.log("insert");
        return res.status(201).send({ message: "oke" });
    } catch (error) {
        return res.status(400).send(error);
    }

};

exports.home = async (req, res) => {
    const { website } = req.query;
    try {
        return res.status(201).send({ message: "Server side" });
    } catch (error) {
        return res.status(400).send(error);
    }

};

exports.getById = async (req, res) => {

    try {
        console.log("insert");
    } catch (error) {
        res.status(400).send({ message: "Datahub not exists" });
    }

};

exports.removeById = (req, res) => {
    console.log("insert");
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
        { name: "NGAYGIO", type: "string" }
    ]
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
    edgeConfig.Scada.BackupDeviceId =0;

    for (let i = 0; i < tagList.length; i++) {
        if (tagList[i].type == "string") {
            let textTagConfig = new edgeSDK.TextTagConfig();
            textTagConfig.Name = tagList[i].name;
            textTagConfig.Description = tagList[i].name;
            textTagList.push(textTagConfig);
        } else {
            let analogTagConfig = new edgeSDK.AnalogTagConfig();
            analogTagConfig.Name = tagList[i].name;
            analogTagConfig.Description = tagList[i].name;
            analogTagList.push(analogTagConfig);
        }
    }
    
    edgeConfig.Scada.AnalogTagList = analogTagList;
    edgeConfig.Scada.TextTagList = textTagList;

    //edgeConfig.node.deviceList.push(edgeConfig.Scada);

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
        { name: "NGAYGIO", type: "string" }
    ]
    for (let i = 0; i < tagList.length; i++) {
        if(tagList[i].type == "string"){
            let TTag = new edgeSDK.Tag();
            TTag.DeviceId = options.nodeId;
            TTag.TagName = tagList[i].name;
            TTag.Value = '20698013';
            data.TagList.push(TTag);
        }else{
            let ATag = new edgeSDK.Tag();
            ATag.DeviceId = options.nodeId;
            ATag.TagName = tagList[i].name;
            ATag.Value = {
                "0": Math.floor(Math.random() * 100) + 1,
                "1": Math.floor(Math.random() * 100) + 1
            };
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

    fs.writeFile("datahub_config.json", jsonContent, 'utf8', function (err) {
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
        device.id = 'Device' + i;
        device.status = edgeSDK.constant.status.online;
        devieStatus.deviceList.push(device);
    }
    edgeAgent.sendDeviceStatus(devieStatus);
}

function deleteScadaConfig() {
    let edgeConfig = new edgeSDK.EdgeConfig();
    for (let i = 1; i <= deviceCount; i++) {
        let ScadaConfig = new edgeSDK.ScadaConfig();
        ScadaConfig.id = 'Device' + i;
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
        ScadaConfig.id = 'Device' + i;
        ScadaConfig.name = 'Device ' + i;
        ScadaConfig.type = 'Smart Device';
        ScadaConfig.description = 'Device ' + i;
        for (let j = 1; j <= analogTagNum; j++) {
            let analogTagConfig = new edgeSDK.AnalogTagConfig();
            analogTagConfig.name = 'ATag' + j;
            analogTagList.push(analogTagConfig);
        }
        for (let j = 1; j <= discreteTagNum; j++) {
            let discreteTagConfig = new edgeSDK.DiscreteTagConfig();
            discreteTagConfig.name = 'DTag' + j;
            discreteTagList.push(discreteTagConfig);
        }
        for (let j = 1; j <= textTagNum; j++) {
            let textTagConfig = new edgeSDK.TextTagConfig();
            textTagConfig.Name = 'TTag' + j;
            textTagList.push(textTagConfig);
        }
        for (let j = 1; j <= arrayTagNum; j++) {
            let arrayTag = new edgeSDK.AnalogTagConfig();
            arrayTag.name = 'ArrayTag' + j;
            analogTagList.push(arrayTag);
        }
        ScadaConfig.analogTagList = analogTagList;
        ScadaConfig.discreteTagList = discreteTagList;
        ScadaConfig.textTagList = textTagList;

        edgeConfig.node.deviceList.push(ScadaConfig);
    }

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


