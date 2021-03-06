(function() {
  var colors, exec, getBranch, getPass, getRunner, getUser, git, gitContinue, readyCallback;

  exec = require('child_process').exec;

  colors = require('colors');

  readyCallback = null;

  git = module.exports = {
    runner: '',
    branch: '',
    user: '',
    pass: '',
    config: {
      runner: 'concrete.runner',
      branch: 'concrete.branch',
      user: 'concrete.user',
      pass: 'concrete.pass'
    },
    init: function(target, callback) {
      var path;
      readyCallback = callback;
      path = require('path');
      if (target.toString().charAt(0) !== '/') {
        target = process.cwd() + '/' + target;
      }
      process.chdir(target);
      git.target = path.normalize(target + '/.git/');
      git.failure = path.normalize(target + '/.git/hooks/build-failed');
      git.success = path.normalize(target + '/.git/hooks/build-worked');
      return path.exists(git.target, function(exists) {
        if (exists === false) {
          console.log(("'" + target + "' is not a valid Git repo").red);
          process.exit(1);
        }
        getUser();
        getPass();
        getBranch();
        return getRunner();
      });
    },
    pull: function(next) {
      var jobs, out;
      jobs = require('./jobs');
      out = "Pulling '" + git.branch + "' branch";
      return jobs.updateLog(jobs.current, out, function() {
        var _this = this;
        console.log(out.grey);
        return exec('git pull origin ' + git.branch, function(error, stdout, stderr) {
          if (error != null) {
            out = "" + error;
            jobs.updateLog(jobs.current, out);
            return console.log(out.red);
          } else {
            out = "Updated '" + git.branch + "' branch";
            return jobs.updateLog(jobs.current, out, function() {
              console.log(out.grey);
              return next();
            });
          }
        });
      });
    },
    lastCommit: function(callback) {
      var _this = this;
      return exec("git log --pretty=format:'%h:::%s:::%ad' -n 1", function(err, stdo, stderr) {
        var commit, p;
        p = ("" + stdo).replace(/(\n|\r)+$/, '').split(':::');
        commit = {
          sha: p[0],
          message: p[1],
          time: new Date(Date.parse(p[2]))
        };
        return callback(commit);
      });
    },
    addNote: function(sha, message) {
      var _this = this;
      return exec("git notes --ref=ci add -f -m \"" + message + "\" " + sha, function(err, stdo, stderr) {
        return console.log(" " + err + ", " + stdo + ", " + stderr);
      });
    }
  };

  getUser = function() {
    var _this = this;
    return exec('git config --get ' + git.config.user, function(error, stdout, stderr) {
      if (error != null) {
        return git.user = '';
      } else {
        return git.user = stdout.toString().replace(/[\s\r\n]+$/, '');
      }
    });
  };

  getPass = function() {
    var _this = this;
    return exec('git config --get ' + git.config.pass, function(error, stdout, stderr) {
      if (error != null) {
        return git.pass = '';
      } else {
        return git.pass = stdout.toString().replace(/[\s\r\n]+$/, '');
      }
    });
  };

  getBranch = function() {
    var _this = this;
    return exec('git config --get ' + git.config.branch, function(error, stdout, stderr) {
      if (error != null) {
        git.branch = 'master';
        return gitContinue();
      } else {
        git.branch = stdout.toString().replace(/[\s\r\n]+$/, '');
        if (git.branch === '') git.branch = 'master';
        return gitContinue();
      }
    });
  };

  getRunner = function() {
    var _this = this;
    return exec('git config --get ' + git.config.runner, function(error, stdout, stderr) {
      if (error != null) {
        console.log(("Git.getRunner: " + error).red);
        return process.exit(1);
      } else {
        git.runner = stdout.toString().replace(/[\s\r\n]+$/, '');
        if (git.runner === '') git.runner = 'none';
        return gitContinue();
      }
    });
  };

  gitContinue = function() {
    if (git.branch === 'none') {
      git.branch = 'master';
    } else if (git.branch === '') {
      return false;
    }
    if (git.runner === 'none') {
      console.log('Git.gitContinue: You must specify a Git runner'.red);
      process.exit(1);
    } else if (git.runner === '') {
      return false;
    }
    return readyCallback();
  };

}).call(this);
