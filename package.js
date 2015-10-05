Package.describe({
  name: 'dispatch:scrollview',
  version: '0.0.2',
  summary: 'Fast infinite scrollview'
});

Package.onUse(function (api) {
  api.versionsFrom('1.2');

  api.use([
    // core
    'jquery',
    'reactive-var',
    'templating',
    'tracker',
    'underscore',

    // atmosphere
    'dispatch:kernel@0.0.3',
    'dispatch:events-pan@0.0.4',
    'dispatch:interpolator@0.0.2'
  ], 'web');

  api.addFiles([
    'scrollposition.js',
    'template-sequence.js',
    'scrollview.js',
    'scrollview.api.js'
  ], 'web');

  api.export('ScrollView');
  api.export('TemplateSequence');
  api.export('ScrollPosition');
});

Package.onTest(function (api) {
  api.use('dispatch:scrollview', ['client']);

  api.use('test-helpers', 'client');
  api.use(['tinytest', 'underscore', 'ejson', 'ordered-dict',
           'random', 'tracker', 'templating']);

  // TemplateSequence
  api.add_files('tests/template-sequence.html', 'client');
  api.add_files('tests/template-sequence.0.js', 'client');
  api.add_files('tests/template-sequence.1.js', 'client');
  api.add_files('tests/template-sequence.2.js', 'client');

  // ScrollPosition
  api.add_files('tests/scroll-position.js', 'client');
});
