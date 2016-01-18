var platform = require('os').platform();

module.exports = {
  get: function() {
    return new Promise(function(resolve, reject) {
      switch (platform) {
        // OSX
        case 'darwin' :
          require('child_process').exec('system_profiler SPDisplaysDataType | grep Resolution', function(err, stdout) {
            // stdout = Resolution: 1440 x 900
            stdout = stdout.replace(/ /g, '');
            stdout = stdout.replace('Resolution:', '');
            res = stdout.split('x');
            res[0] = parseInt(res[0]);
            res[1] = parseInt(res[1]);
            resolve(res);
          });
          break;

        // OS not supported
        default :
          reject('OS not supported');
          break;
      }
    });
  }
};
