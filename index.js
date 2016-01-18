var path = require('path');
var fs = require('fs');
var crypto = require('crypto');

var wallpaper = require('wallpaper');
var httpreq = require('httpreq');
var tmp = require('tmp');
var dialog = require('dialog');

var Server = require('electron-rpc/server');
var app = new Server();

var conf = require('./config.json');
var resolution = require('./lib/resolution');

var menubar = require('menubar');
var menu = menubar({
  dir: __dirname,
  width: 175,
  height: 320,
  icon: path.join(__dirname, 'images', 'Icon.png'),
  'window-position': 'trayCenter'
});

var res = [1440, 900], // temporary resolution
    timer = null,
    imgObject = tmp.fileSync();

process.on('uncaughtException', function(err) {
  dialog.warn('Uncaught Exception: ' + err.message, err.stack || '');
  menu.app.quit();
});

resolution.get().then(function(data) {
  res = data;
});

// https://source.unsplash.com/1600x900/?forest
var getUrl = function() {
  var url = 'https://source.unsplash.com/' + res[0] + 'x' + res[1];

  if (conf.query !== null) {
    url += '?' + conf.query;
  }

  return url;
};

var wallpaperUpdate = function() {
  httpreq.get(getUrl(), {binary: true}, function(err, res) {
    if (err) {
      dialog.warn('Something have come up and I can\'t complete your request, please try again later.');
      return false;
    }

    imgObject.removeCallback();
    imgObject = tmp.fileSync();
    fs.writeFile(imgObject.name, res.body, function(err) {
      if (err) {
        dialog.warn('Something bad happened and I can\'t recover.');
        return false;
      }

      wallpaper.set(imgObject.name);
    });
  });
};

var updateTimer = function() {
  if (timer !== null) {
    clearTimeout(timer);
  }
  timer = setInterval(wallpaperUpdate, conf.interval);
};

// Start the interval update
updateTimer();

var writeConfToDisk = function() {
  fs.writeFileSync(path.join(__dirname, 'config.json'), JSON.stringify(conf));
};

menu.on('ready', function() {
  menu.on('show', function() {
    app.configure(menu.window.webContents);
    app.send('show', conf);
  });

  app.on('wallpaperUpdate', function(req, next) {
    wallpaperUpdate();
  });

  app.on('setInterval', function(req) {
    conf.interval = req.body;
    updateTimer();
  });

  app.on('setQuery', function(req) {
    conf.query = req.body;
  });

  app.on('info', function() {
    dialog.info('A menubar application that automatically change your wallpaper at the desired interval, uses photos from https://unsplash.com', 'Unsplash Wallpaper');
  });

  app.on('exit', function(req, next) {
    writeConfToDisk();
    menu.app.quit();
  });
});
