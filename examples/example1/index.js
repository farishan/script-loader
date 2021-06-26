/**
 * Script Loader usage
 */
const scriptObject = new ScriptObject({
  statics: ["static1", "static2", "other1", "other2"],
  dynamics: ["dynamic1"],
  main: "main",
});

const scriptLoader = new ScriptLoader({
  useLogger: true,
  path: "./",
});

scriptLoader.init(scriptObject);
