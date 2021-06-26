const scriptObject = new ScriptObject({
  statics: ['static', 'static1'],
  dynamics: ['dynamic', 'dynamic1'],
  main: 'index'
})

const scriptLoader = new ScriptLoader({
  useLogger: true,
  path: './'
})

scriptLoader.init(scriptObject)