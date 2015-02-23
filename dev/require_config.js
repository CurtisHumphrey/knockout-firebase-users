(function() {
  requirejs.config({
    paths: {
      knockout: "../bower_components/knockout/dist/knockout.debug",
      lodash: "../bower_components/lodash/lodash.min",
      mockfirebase: "../bower_components/mockfirebase/browser/mockfirebase",
      fire_value: "../dist/fire_value",
      fire_value_by_ref: "../dist/fire_value_by_ref",
      fire_model: "../dist/fire_model",
      fire_model_by_ref: "../dist/fire_model_by_ref",
      fire_list: "../dist/fire_list"
    },
    waitSeconds: 0,
    baseUrl: '/dev',
    shim: {}
  });

}).call(this);
