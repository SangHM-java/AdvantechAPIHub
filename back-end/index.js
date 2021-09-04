const config = require('./common/config/env.config.js');

const express = require('express');
const app = express();
const bodyParser = require('body-parser');

// const AuthorizationRouter = require('./authorization/routes.config');
const AdministratorRouter = require('./administrators/routes.config');
const fs = require('fs');
const path = require('path');

app.use(function (req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Allow-Methods', 'GET,HEAD,PUT,PATCH,POST,DELETE');
    res.header('Access-Control-Expose-Headers', 'Content-Length');
    res.header('Access-Control-Allow-Headers', 'Accept, Authorization, Content-Type, X-Requested-With, Range');
    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    } else {
        return next();
    }
});

app.use(bodyParser.json());
app.use(bodyParser.json({
    limit: '50mb'
}));

app.use(bodyParser.urlencoded({
    limit: '50mb',
    parameterLimit: 100000,
    extended: true
}));

// AuthorizationRouter.routesConfig(app);
AdministratorRouter.routesConfig(app);

// var dir = path.join(__dirname, 'uploads');
// var mime = {
//     txt: 'text/plain',
//     gif: 'image/gif',
//     jpg: 'image/jpeg',
//     png: 'image/png',
//     svg: 'image/svg+xml',
// };

app.get('*', function (req, res) {
    // var file = path.join(dir, req.path.replace(/\/$/, '/index.html'));
    // if (file.indexOf(dir + path.sep) !== 0) {
    //     return res.status(403).end('Forbidden');
    // }
    // var type = mime[path.extname(file).slice(1)] || 'text/plain';
    // var s = fs.createReadStream(file);
    // s.on('open', function () {
    //     res.set('Content-Type', type);
    //     s.pipe(res);
    // });
    // s.on('error', function () {
    //     res.set('Content-Type', 'text/plain');
    //     res.status(404).end('Not found');
    // });
});

app.listen(config.port, function () {
    console.log('app listening at port %s', config.port);
});
