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
var request = require('request');

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
const discreteTagNum = 3;
const textTagNum = 3;
const arrayTagNum = 3;
const arrayTagSize = 10;

let rawdata = fs.readFileSync('datahub_config.json');
let datahub_config_default = JSON.parse(rawdata);

var options = {
    connectType: edgeSDK.constant.connectType.DCCS,
    DCCS: {
        credentialKey: datahub_config_default.CredentialKey,
        APIUrl: datahub_config_default.ApiUrl
    },
    // MQTT: {
    //   hostName: '127.0.0.1',
    //   port: 1883,
    //   username: 'admin',
    //   password: 'admin',
    //   protocolType: edgeSDK.constant.protocol.TCP
    // },
    useSecure: false,
    autoReconnect: true,
    reconnectInterval: 1000,
    nodeId: datahub_config_default.NodeId, // getting from datahub portal
    type: edgeSDK.constant.edgeType.Gateway, // Choice your edge is Gateway or Device, Default is Gateway
    // deviceId: 'Device1', // If type is Device, DeviceId must be filled
    heartbeat: 60000, // default is 60 seconds,
    dataRecover: true, // need to recover data or not when disconnected
    ovpnPath: '' // set the path of your .ovpn file, only for linux
};
var sendTimer = {};
var edgeConfig = {};
var edgeAgent = new edgeSDK.EdgeAgent(options);

var api_data = []

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

exports.getDataFromAPI = async (req, res) => {

    try {

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
                        res.status(200).send({ data: body });
                    }
                });
            }
        });




    } catch (error) {
        console.log(error);
        res.status(400).send({ message: "Datahub not exists" });
    }

};

exports.connectDatahub = async (req, res) => {
    try {
        console.log("connect");
        let datahub = { ...{}, ...req.body };
        console.log(datahub);
        // writeJsonFile('datahub_config.json', {nodeId: datahub.NodeId,credentialKey:datahub.CredentialKey,apiUrl :datahub.ApiUrl});
        writeConfigFile(datahub);
        options = {
            connectType: edgeSDK.constant.connectType.DCCS,
            DCCS: {
                credentialKey: datahub.CredentialKey,
                APIUrl: datahub.ApiUrl
            },
            // MQTT: {
            //   hostName: '127.0.0.1',
            //   port: 1883,
            //   username: 'admin',
            //   password: 'admin',
            //   protocolType: edgeSDK.constant.protocol.TCP
            // },
            useSecure: false,
            autoReconnect: true,
            reconnectInterval: 1000,
            nodeId: datahub.NodeId, // getting from datahub portal
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
            edgeAgent.uploadConfig(edgeSDK.constant.actionType.create, edgeConfig).then((res) => {
                // when mqtt disconnect happened, and automatically reconnect
                // clear interval to prevent duplicate time interval call
                clearInterval(sendTimer);
                sendTimer = setInterval(sendDataInterval, 60000);
                //sendData();
            }, error => {
                console.log('upload config error');
                console.log(error);
            });

        });
        // edgeAgent.events.on('disconnected', () => {
        //     console.log('Disconnected... ');

        // });
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
                                    let TTag = new edgeSDK.EdgeDataTag();

                                    TTag.deviceId = 'Device' + i;
                                    TTag.tagName = param_config[property2] != null ? param_config[property2].Tagname : property2;
                                    TTag.value = "" + datahub_data[property2];
                                    data.tagList.push(TTag);
                                }

                            }
                        }

                        for (let i = 0; i < limit; i++) {
                            let datahub_data = api_data[i];

                            let deviceConfig = new edgeSDK.DeviceConfig();
                            deviceConfig.id = 'Device' + i;
                            deviceConfig.name = datahub_data["MA_DIEMDO"];
                            deviceConfig.type = 'Smart Device';
                            deviceConfig.description = datahub_data["MA_DIEMDO"];

                            for (const property1 in datahub_data) {
                                let textTagConfig = new edgeSDK.TextTagConfig();
                                textTagConfig.name = param_config[property1] != null ? param_config[property1].Tagname : property1;
                                textTagConfig.description = param_config[property1] != null ? param_config[property1].Tagname : property1;
                                textTagList.push(textTagConfig);
                            }

                            deviceConfig.textTagList = textTagList;

                            edgeConfig.node.deviceList.push(deviceConfig);
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

function sendDataInterval() {
    console.log("sendDataAPIToDatahub 30s interval");
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
                                let TTag = new edgeSDK.EdgeDataTag();

                                TTag.deviceId = 'Device' + i;
                                TTag.tagName = param_config[property2] != null ? param_config[property2].Tagname : property2;
                                TTag.value = "" + datahub_data[property2];
                                data.tagList.push(TTag);
                            }

                        }
                    }

                    for (let i = 0; i < limit; i++) {
                        let datahub_data = api_data[i];

                        let deviceConfig = new edgeSDK.DeviceConfig();
                        deviceConfig.id = 'Device' + i;
                        deviceConfig.name = datahub_data["MA_DIEMDO"];
                        deviceConfig.type = 'Smart Device';
                        deviceConfig.description = datahub_data["MA_DIEMDO"];

                        for (const property1 in datahub_data) {
                            let textTagConfig = new edgeSDK.TextTagConfig();
                            // textTagConfig.name = property1;
                            // textTagConfig.description = '' + datahub_data[property1];
                            textTagConfig.name = param_config[property1] != null ? param_config[property1].Tagname : property1;
                            textTagConfig.description = param_config[property1] != null ? param_config[property1].Tagname : property1;
                            textTagList.push(textTagConfig);
                        }

                        deviceConfig.textTagList = textTagList;

                        edgeConfig.node.deviceList.push(deviceConfig);
                    }

                    edgeAgent.uploadConfig(edgeSDK.constant.actionType.create, edgeConfig).then((res2) => {
                        edgeAgent.sendData(data);
                        console.log(res2);
                    }, error => {
                        console.log('upload config error');
                        console.log(error);
                    });



                }
            });
        }
    });
}



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
    let analogTagList = [];
    let discreteTagList = [];
    let textTagList = [];

    for (let i = 1; i <= deviceCount; i++) {
        let deviceConfig = new edgeSDK.DeviceConfig();
        deviceConfig.id = 'Device' + i;
        deviceConfig.name = 'Device' + i;
        deviceConfig.type = 'Smart Device';
        deviceConfig.description = 'Device ' + i;
        for (let j = 1; j <= analogTagNum; j++) {
            let analogTagConfig = new edgeSDK.AnalogTagConfig();
            analogTagConfig.name = 'ATag' + j;
            analogTagConfig.description = 'ATag' + j;
            analogTagList.push(analogTagConfig);
        }
        for (let j = 1; j <= discreteTagNum; j++) {
            let discreteTagConfig = new edgeSDK.DiscreteTagConfig();
            discreteTagConfig.name = 'hominhsang' + j;
            discreteTagConfig.description = 'DTag' + j;
            discreteTagList.push(discreteTagConfig);
        }
        for (let j = 1; j <= textTagNum; j++) {
            let textTagConfig = new edgeSDK.TextTagConfig();
            textTagConfig.name = 'TTag' + j;
            textTagConfig.description = 'TTag' + j;
            textTagList.push(textTagConfig);
        }
        for (let j = 1; j <= arrayTagNum; j++) {
            let arrayTag = new edgeSDK.AnalogTagConfig();
            arrayTag.name = 'ArrayTag' + j;
            arrayTag.description = 'ArrayTag' + j;
            arrayTag.arraySize = 10;
            analogTagList.push(arrayTag);
        }
        deviceConfig.analogTagList = analogTagList;
        deviceConfig.discreteTagList = discreteTagList;
        deviceConfig.textTagList = textTagList;

        edgeConfig.node.deviceList.push(deviceConfig);
    }

    return edgeConfig;
}
function sendData() {
    if (Object.keys(edgeConfig).length === 0) {
        return;
    }
    let data = prepareData();
    console.log(data);
    edgeAgent.sendData(data);
}
function prepareData() {
    let data = new edgeSDK.EdgeData();
    for (let i = 1; i <= deviceCount; i++) {
        for (let j = 1; j <= analogTagNum; j++) {
            let ATag = new edgeSDK.EdgeDataTag();
            ATag.deviceId = 'Device' + i;
            ATag.tagName = 'hominhsang' + j;
            ATag.value = Math.floor(Math.random() * 100) + 1;
            data.tagList.push(ATag);
        }
        for (let j = 1; j <= discreteTagNum; j++) {
            let DTag = new edgeSDK.EdgeDataTag();
            DTag.deviceId = 'Device' + i;
            DTag.tagName = 'DTag' + j;
            DTag.value = j % 2;
            data.tagList.push(DTag);
        }
        for (let j = 1; j <= textTagNum; j++) {
            let TTag = new edgeSDK.EdgeDataTag();
            TTag.deviceId = 'Device' + i;
            TTag.tagName = 'TTag' + j;
            TTag.value = 'TEST' + j.toString();
            data.tagList.push(TTag);
        }
        for (let j = 1; j <= arrayTagNum; j++) {
            let dic = {};
            for (let k = 0; k < arrayTagSize; k++) {
                dic[k.toString()] = Math.floor(Math.random() * 100) + 1;
            }
            let AryTag = new edgeSDK.EdgeDataTag();
            AryTag.deviceId = 'Device' + i;
            AryTag.tagName = 'ArrayTag' + j;
            AryTag.value = dic;
            data.tagList.push(AryTag);
        }
        data.ts = Date.now();
    }

    return data;
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

function deleteDeviceConfig() {
    let edgeConfig = new edgeSDK.EdgeConfig();
    for (let i = 1; i <= deviceCount; i++) {
        let deviceConfig = new edgeSDK.DeviceConfig();
        deviceConfig.id = 'Device' + i;
        edgeConfig.node.deviceList.push(deviceConfig);
    }
    return edgeConfig;
}

function deleteTagConfig() {
    let edgeConfig = new edgeSDK.EdgeConfig();
    let analogTagList = [];
    let discreteTagList = [];
    let textTagList = [];

    for (let i = 1; i <= deviceCount; i++) {
        let deviceConfig = new edgeSDK.DeviceConfig();
        deviceConfig.id = 'Device' + i;
        deviceConfig.name = 'Device ' + i;
        deviceConfig.type = 'Smart Device';
        deviceConfig.description = 'Device ' + i;
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
            textTagConfig.name = 'TTag' + j;
            textTagList.push(textTagConfig);
        }
        for (let j = 1; j <= arrayTagNum; j++) {
            let arrayTag = new edgeSDK.AnalogTagConfig();
            arrayTag.name = 'ArrayTag' + j;
            analogTagList.push(arrayTag);
        }
        deviceConfig.analogTagList = analogTagList;
        deviceConfig.discreteTagList = discreteTagList;
        deviceConfig.textTagList = textTagList;

        edgeConfig.node.deviceList.push(deviceConfig);
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
