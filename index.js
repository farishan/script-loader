"use strict";

/**
 * JavaScript File Loader - for loading `.js` file into `.html` file.
 *
 * @param {Object} options - Options for the script loader
 * @param {Boolean} options.useLogger - Log toggler
 * @param {string} options.path - Script directory path. e.g. "./" or "./scripts/"
 */
function ScriptLoader(options = {}) {
  const { useLogger, path } = options;

  this.name = "[SCRIPT-LOADER]";
  this.slug = "script-loader";

  this.useLogger = useLogger === undefined ? false : useLogger;
  this.logWindow;
  this.scriptDirectoryPath = path ? path : "./";
  this.mainContainer = document.createElement("div");
  this.staticContainer = document.createElement("div");
  this.dynamicContainer = document.createElement("div");
  this.startTime = null;
  this.endTime = null;

  /**
   * Initialize the Script Loader
   * @param {ScriptObject} scriptObject - An object containing script types and names. Please use Script Object Factory.
   * @todo Validate `scriptObject` before use
   */
  this.init = (scriptObject) => {
    this.startTime = Date.now();

    if (this.useLogger) {
      this.log("init", false, scriptObject);
    }

    this.setupScriptContainers();
    this.load(scriptObject);
  };

  this.setupScriptContainers = () => {
    this.mainContainer.style.position = "absolute";
    this.mainContainer.id = `${this.slug}_main-container`;

    this.staticContainer.id = this.slug + "_" + "static-scripts-container";
    this.mainContainer.appendChild(this.staticContainer);
    this.dynamicContainer.id = this.slug + "_" + "dynamic-scripts-container";
    this.mainContainer.appendChild(this.dynamicContainer);

    document.body.innerHTML += '<!-- Loaded with Script Loader -->\n'
    document.body.appendChild(this.mainContainer);
  };

  this.load = (scriptObject) => {
    // loading static scripts.
    if (this.useLogger) this.log("Start loading scripts...", true);

    const promises = []

    // Load static scripts
    if (scriptObject.statics && scriptObject.statics.length > 0) {
      const promise1 = this.loadScripts(true, scriptObject.statics).then(() => {
        // Scripts loaded.

        if (this.useLogger) {
          this.log(`static scripts loaded`, true);
        }
      });

      promises.push(promise1)
    }

    // Load initial dynamic scripts
    if (scriptObject.dynamics && scriptObject.dynamics.length > 0) {
      const promise2 = this.loadScripts(false, scriptObject.dynamics).then(() => {
        // Scripts loaded.

        if (this.useLogger) {
          this.log(`dynamic scripts loaded`, true);
        }
      });

      promises.push(promise2)
    }

    return Promise.all(promises).then(() => {
      // Load connector script after all scripts loaded.
      if (scriptObject.main) {
        // finally, loading main script.
        this.loadScript(true, scriptObject.main).then(() => {
          this.finish();
        });
      }
    })
  };

  /**
   * Load multiple script
   *
   * @param {Boolean} isStatic - If its static, will be loaded to static container.
   * @param {string[]} scripts - A list of script name without extension.
   * @returns {Promise} Promise object containing script loading process information.
   * @example
   * // loading `main.js` and `static1.js` into static script container.
   * loadScripts(true, ["main", "static1"])
   */
  this.loadScripts = (isStatic, scripts) => {
    return new Promise((resolve, reject) => {
      var counter = 0;

      var loadLoop = () => {
        if (scripts[counter]) {
          this.loadScript(isStatic, scripts[counter])
            .then(() => {
              if (this.useLogger) {
                this.log("progress", false, {
                  value: counter + 1,
                  total: scripts.length,
                });
              }

              counter++;
              if (counter >= scripts.length) {
                // All scripts loaded.
                if (this.useLogger) console.groupEnd("Load Progress");
                resolve();
              } else {
                loadLoop();
              }
            })
            .catch((err) => reject(err));
        } else {
          resolve();
        }
      };

      if (this.useLogger) console.groupCollapsed("Load Progress");
      loadLoop();
    });
  };

  /**
   * Load single script
   *
   * @param {Boolean} isStatic - If its static, will be loaded to static container.
   * @param {string} name - Script name without extension.
   * @returns {Promise} Promise object containing script loading process information.
   * @example
   * // loading `forest-area.js` into dynamic script container.
   * loadScript(false, "forest-area")
   */
  this.loadScript = (isStatic, name) => {
    let startTime = Date.now(),
      endTime,
      totalTime;

    if (this.useLogger) {
      this.log(
        `Loading ${isStatic ? "static" : "dynamic"} script named <strong>${name}</strong>...`,
        true
      );
    }

    return new Promise((resolve, reject) => {
      var script = document.createElement("script");
      script.src = this.scriptDirectoryPath + name + ".js";
      script.onload = () => {
        endTime = Date.now();
        totalTime = (endTime - startTime) / 1000;

        const message = `*${name} script loaded in ${totalTime}s.`;

        if (this.useLogger) {
          this.log(message, true);
        }

        resolve({
          isSuccess: true,
          time: totalTime,
          payload: {
            message,
          },
        });
      };
      script.onerror = function (err) {
        endTime = Date.now();
        totalTime = (endTime - startTime) / 1000;

        console.error(err);
        reject({
          isSuccess: false,
          time: totalTime,
          payload: err,
        });
      };

      if (isStatic) {
        this.staticContainer.appendChild(script);
      } else {
        this.dynamicContainer.appendChild(script);
      }
    });
  };

  this.finish = () => {
    this.endTime = Date.now();

    if (this.useLogger) {
      const totalTime = (this.endTime - this.startTime) / 1000;
      this.log("finish", false, totalTime);
    }
  };

  this.log = (message, useBreak, payload) => {
    if (message === "init") {
      console.group(this.name);
      console.table(payload);

      // Setup log window
      const logWindowTitle = this.name + " Log Window";
      this.logWindow = document.createElement("div");
      this.logWindow.title = logWindowTitle;
      this.logWindow.id = this.slug + "_" + "log-window";
      this.logWindow.setAttribute(
        "style",
        "box-sizing:border-box;color:#222;font-size:0.8em;border:1px solid;padding:0.5rem;max-height:584px;overflow-y:auto;"
      );
      this.logWindow.innerHTML += `${logWindowTitle}<hr>`;
      this.logWindow.innerHTML +=
        "Script Object : <pre style='border:1px solid;padding:5px;'><code>" +
        JSON.stringify(scriptObject, "", 2) +
        "</code></pre>";

      // Render log window
      this.mainContainer.appendChild(this.logWindow);
    } else if (message === "progress") {
      const progress = (payload.value / payload.total) * 100;
      console.log(`Progress: ${progress} %`);

      const messageHtml = `
        <div>
          <label style="display:none">Loading progress:</label>
          <progress value="${payload.value}" max="${payload.total}"> ${progress}% </progress>
        </div>
      `;
      this.logWindow.innerHTML += messageHtml;
    } else if (message === "finish") {
      const message = `Total load time: ${payload} seconds`;
      console.log(message);

      this.logWindow.innerHTML += `<p>Total load time: <strong>${payload}</strong> seconds</p>`;
      console.groupEnd(this.name);
    } else {
      console.log(message);
      this.logWindow.innerHTML += message + (useBreak ? "<br/>" : "");
    }
  };

  this.reset = () => {
    this.dynamicContainer.innerHTML = "";
  };

  return this;
}

/**
 * Script Object Factory
 *
 * @param {Object} scriptsByType - An object containing script type properties and its values.
 * @param {string[]} scriptsByType.statics - A list of script names without extension, that will loaded and always in the document.
 * @param {string[]} scriptsByType.dynamics - _(Optional)_ A list of script names without extension, that only loaded in specific scenario, will be deleted if not needed.
 * @param {string} scriptsByType.main - A name of script without extension. Special static script. Connector of all scripts. Always loaded last.
 */
function ScriptObject(scriptsByType) {
  const { statics = Array, dynamics = Array, main = String } = scriptsByType;

  this.statics = statics;
  this.dynamics = dynamics;
  this.main = main;

  return this;
}

// Usage: see ./examples