var lastArgumentName = function(f) {
  var args = f.toString().match(/(function.+\()(.+(?=\)))/)[2].split(",");
  return args[args.length - 1].trim();
};

var wrap = function(handler) {
  return function(req, res, next) {
    var nextCalled = false;
    var nextFunc = function() {
      nextCalled = true;
      next.apply(null, arguments);
    };

    // This can recognize handler(req, res, next) pattern, but
    // only if `next` argument is called 'next'.
    if (handler.length === 3 && lastArgumentName(handler) !== "next") {
      // function handler(req, res, _) {}
      handler(req, res, function(err) {
        if (err) return next(err);
      });
    } else {
      // function handler(req, res, next, _) {}
      handler(req, res, nextFunc, function(err) {
        if (err) return next(err);
        if (!nextCalled) next();
      });
    }
  };
};

module.exports = function(app) {
  var methods = require("methods");
  methods.push("all");

  var patch = function(method) {
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

  for (var i = 0; i < methods.length; i++) {
    patch(methods[i]);
  }

  // Unload 'methods' module after patch.
  delete require.cache["methods"];
  return app;
};