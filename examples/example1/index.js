/**
 * Script Loader usage
 */
const scriptLoader = new ScriptLoader({
  useLogger: true,
  // path: "./",
  statics: ["static1", "static2", "other1", "other2"],
  dynamics: ["dynamic1"],
  main: "main",
})

scriptLoader.init();