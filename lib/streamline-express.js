var lastArgumentName = function(f) {
  var args = f.toString().match(/(function.+\()(.+(?=\)))/)[2].split(",");
  return args[args.length - 1].trim();
};

// This can recognize handler(req, res, next) and
// handler(err, req, res, next) pattern, but
// only if `next` argument is named 'next'.
var wrap = function(handler) {
  var argLength = handler.length;
  var lastArgName = lastArgumentName(handler);

  // handler(req, res)
  // handler(req, res, next)
  // handler(err, req, res, next)
  if (lastArgName === "next" || argLength === 2) return handler;

  if (argLength > 4) {
    // handler(err, req, res, next, _)
    return function(err, req, res, next) {
      handler(err, req, res, next, function(e) {
        if (e) {
          if (err) e.innerError = err;
          return next(e);
        }
      });
    };
  } else if (argLength > 3) {
    // handler(req, res, next, _)
    return function(req, res, next) {
      handler(req, res, next, function(err) {
        if (err) return next(err);
      });
    };
  } else if (argLength > 2) {
    // handler(req, res, _)
    return function(req, res, next) {
      handler(req, res, function(err) {
        if (err) return next(err);
      });
    };
  }
};

var patch = function(app, method) {
  if (!app[method]) return;

  var original = app[method];
  app[method] = function(/* path, [callback...], callback */) {
    // Special 'get' case.
    if (!(method === "get" && arguments.length === 1)) {
      var arg;
      for (var i = 1; i < arguments.length; i++) {
        arg = arguments[i];
        if (Array.isArray(arg)) {
          for (var j = 0; j < arg.length; j++) {
            arg[j] = wrap(arg[j]);
          }
        } else {
          arguments[i] = wrap(arg);
        }
      }
    }
    return original.apply(this, arguments);
  };
};

module.exports = function(app) {
  var methods = require("methods");
  methods.push("all");

  for (var i = 0; i < methods.length; i++) {
    patch(app, methods[i]);
  }

  // Unload 'methods' module after patch.
  delete require.cache["methods"];

  // Patch app.use
  var originalUseFunc = app.use;
  app.use = function(/* [path], callback */) {
    var callback = arguments[arguments.length - 1];
    if (typeof callback === "function") {
      arguments[arguments.length - 1] = wrap(callback);
    }
    return originalUseFunc.apply(this, arguments);
  };

  // Patch app.param
  var originalParamFunc = app.param;
  app.param = function(/* [name], callback */) {
    if (typeof arguments[0] !== "function") {
      var callback = arguments[1];
      if (callback.length > 4) {
        arguments[1] = function(req, res, next, val) {
          callback(req, res, next, val, function(err) {
            if (err) return next(err);
          });
        };
      }
    }
    return originalParamFunc.apply(this, arguments);
  };

  return app;
};
