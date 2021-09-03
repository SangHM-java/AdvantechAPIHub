const fs = require('fs')
const util = require('util')
const writeFile = util.promisify(fs.writeFile)
const readFile = util.promisify(fs.readFile)

exports.send = (statusCode, body) => {
  return {
    statusCode: statusCode,
    body: body,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    },
  };
};

exports.convertFile = (data) => {
  let base64Data = data.replace(/^data:.+;base64,/, '');
  base64Data = Buffer.from(base64Data, 'base64');
  return base64Data;
}

exports.writeFileContent = async (path, data) => {  
  let base64Data = data.replace(/^data:.+;base64,/, '');
  base64Data = Buffer.from(base64Data, 'base64');
  await writeFile(path, base64Data);
  return true;
} 