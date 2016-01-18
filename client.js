var Client = require('electron-rpc/client');
var client = new Client();

var els = {
  update: document.getElementById('update'),
  interval: document.getElementById('interval'),
  query: document.getElementById('query'),
  info: document.getElementById('info'),
  exit: document.getElementById('exit')
};

client.on('show', function(err, conf) {
  els.interval.val = conf.interval;

  if (conf.query !== null) {
    els.query.value = conf.query;
  }
});

els.update.addEventListener('click', function(e) {
  client.request('wallpaperUpdate', {}, function(err, data) {
    console.log(data);
  });
});

els.interval.addEventListener('change', function(e) {
  // value is in seconds
  var value = e.target.value;
  client.request('setInterval', value * 1000);
});

els.query.addEventListener('keyup', function(e) {
  var value = e.target.value;
  if (value === '') { value = null; }
  client.request('setQuery', value);
});

els.info.addEventListener('click', function(e) {
  client.request('info');
});

document.getElementById('exit').addEventListener('click', function(e) {
  client.request('exit');
});
