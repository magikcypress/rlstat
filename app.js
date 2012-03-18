var express = require('express');
var http = require('http');
var fs = require('fs');
var diskstats = require('./diskstats');
var cpustats = require('./cpustats');
var spawn = require("child_process").spawn;
var statio = spawn("dstat", ["-r", "--noheaders", "--nocolor"]);
var statcpu = spawn("dstat", ["--cpu", "--noheaders", "--nocolor"]);
var statbp = spawn("dstat", ["--tcp", "-n", "--noheaders", "--nocolor"]);
var dateclock = spawn("dstat", ["-t", "--noheaders", "--nocolor"]);
var app = express.createServer();

app.configure('development', function() {
    app.use(express.logger());
    app.use(express.errorHandler({
        dumpExceptions: true,
        showStack: true,
    }));
});

app.configure('production', function() {
    app.use(express.logger());
    app.use(express.errorHandler());
    app.use(express.bodyParser());
    app.use(express.methodOverride());
    app.use(express.cookiesParser());
    app.use(express.session({secret: 'secret', key: 'express.sid'}));
    app.use(function (req, res) {
        res.end('<h2>Hello, your session id is ' + req.sessionID + '</h2>');
    });
});

app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.set('view options', {layout: true});
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(__dirname + '/public')); 

app.listen(4000);
console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);

// Routes
app.get('/', function(req, res){
    res.render('root', {
    title: 'Diskstats'
    , sessionId: req.sessionID
    });
});

app.get('/cpustat', function(req, res){
    res.render('cpustat', {
    title: 'CPUstats'
    , sessionId: req.sessionID
    });
});

app.get('/about', function(req, res){
    res.render('about', {
    title: 'About'
    , sessionId: req.sessionID
    });
});

// var parseCookie = require('connect').utils.parseCookie;
var sio = require('socket.io').listen(app);
sio.configure('production', function(){
  sio.enable('browser client etag');
  sio.set('log level', 1);

  sio.set('transports', [
    'websocket'
  , 'flashsocket'
  , 'htmlfile'
  , 'xhr-polling'
  , 'jsonp-polling'
  ]);
});

sio.configure('development', function(){
  sio.set('transports', ['websocket']);
});

var data = [];
var room = sio.of('/http').on('connection', function (socket) {
    socket.on('message', function (evt) {
            var data;
            try {
                data = JSON.parse(evt);
            } catch (e) {
                console.error("[Socket.IO] Unable to parse message: " + e);
            }
            if (data) 
            {
                if (data.sensor == "diskstats") {
                socket.emit('diskstats',
                    JSON.stringify({
                        sensor: data.sensor,
                        disk: data.disk,
                        data: diskstats.linux_get_diskstats([ data.disk ])}) );
                } else if (data.sensor == "cpustats") {
                socket.emit('cpustats',
                    JSON.stringify({
                        sensor: data.sensor,
                        cpu: data.cpu,
                        data: cpustats.linux_get_cpustats([ data.cpu ])}) );
                } else {
                    console.log("[Socket.IO] received json data: "+data);
                }
            }
    });

    statio.stdout.on('data', function (data) {
       var statio_live = data.toString()
       socket.emit('statiotitle', { statiotitle : 'Stat IO' });
       socket.emit('statio', { statio: statio_live });
    });

    statcpu.stdout.on('data', function (data) {
       var statcpu_live = data.toString()
       socket.emit('statcputitle', { statcputitle : 'Stat cpu' });
       socket.emit('statcpu', { statcpu: statcpu_live });
    });

    statbp.stdout.on('data', function (data) {
       var statbp_live = data.toString()
       socket.emit('statbptitle', { statbptitle : 'Stat BP' });
       socket.emit('statbp', { statbp: statbp_live });
    });

    dateclock.stdout.on('data', function (data) {
       var dateclock_live = data.toString()
       socket.emit('dateclocktitle', { dateclocktitle : 'Date' });
       socket.emit('dateclock', { dateclock: dateclock_live });
    });

    socket.on('disconnect', function() {
        room.emit('info', {
          message: 'user disconnected. connected'
        });
    });
});

app.get('/404', function(req, res){
      throw new NotFound;
});

app.get('/500', function(req, res){
      throw new Error('keyboard cat!');
});

function isEmpty(column) {
  return column !== "" && column !== undefined
}

