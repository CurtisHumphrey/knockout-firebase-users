(function() {
  requirejs.config({
    paths: {
      knockout: "empty:",
      lodash: "empty:",
      mockfirebase: "empty:",
      firebase: "empty:",
      knockout_firebase: "empty:"
    },
    waitSeconds: 0,
    baseUrl: '/dev',
    shim: {}
  });

}).call(this);
