function Profiler(opts) {
  if ( opts.statsd_client ) {
    this.statsd_client = opts.statsd_client;
  }
  this.events = [];
  var now = Date.now();
  var item = { start:1, name: opts.start || '', time:now };
  this.events.push(item);
}

Profiler.prototype.done = function(what) {
  var now = Date.now();
  var item = { name:what, time:now };
  this.events.push(item);
}

Profiler.prototype.end = function() {
  var now = Date.now();
  var item = { time:now, end:1 }
  this.events.push(item);
}

Profiler.prototype.start = function(what) {
  var now = Date.now();
  var item = { time:now, start:1, name:what }
  this.events.push(item);
}

Profiler.prototype.sendStats = function() {
  if ( ! this.statsd_client ) return;
  var tasks = [];
  var prefix = [];
  var prefix_string = '';
  var prevtime = 0;
  for (var i=0; i<this.events.length; ++i) {
    var ev = this.events[i];
    var t = ev.time;
    if ( ev.start ) { // start of a new sub task
      var tname = ev.name;
      tasks.push({ start:t });
      prefix.push(tname);
      prefix_string = prefix.join('.');
    }
    else if ( ev.end ) { // end of a new sub task
      var task = tasks.pop();
      var elapsed = t - task.start;
      this.statsd_client.timing(prefix_string + '.time', elapsed)
      prefix.pop();
      prefix_string = prefix.join('.');
    }
    else {
      var what = ev.name;
      var elapsed = t - prevtime;
      this.statsd_client.timing(prefix_string + '.' + what + '.time', elapsed)
    }
    prevtime = t;
  }
  // In case anything is missing...
  while (task = tasks.pop()) {
      var elapsed = t - task.start;
      this.statsd_client.timing(prefix_string + '.time', elapsed)
      prefix.pop();
      prefix_string = prefix.join('.');
  }
}

Profiler.prototype.toString = function() {
  var sitems = [];
  var t0;
  var prevt;
  var ttime = 0;
  for (var i=0; i<this.events.length; ++i) {
    var ev = this.events[i];
    var t = ev.time;
    if ( ! i ) t0 = t;
    // we're only interested in abs times
    if ( ev.start || ev.end ) continue;
    var el = ev.time - prevt;
    if ( el ) { // skip steps taking no computable time
      sitems.push(ev.name + ':' + el);
      ttime += el;
    }
    prevt = t;
  }
  var s = 'TOT:'+ttime+';'+sitems.join(';');
  return s;
}

module.exports = Profiler;
