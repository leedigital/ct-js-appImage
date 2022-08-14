const { app } = require("electron");
const { LOG } = require("./src/js/Log");
const { ctjs } = require("./src/js/Ct");
const { jsonDataHandler, run } = require("./src/js/script");
const { Version } = require("./src/js/Version");
const { Util } = require("./src/js/Util");
const { PROGRESS_LOG } = require("./src/js/ProgressLog");


app.whenReady().then(() => {
    process.on("SIGINT", () => {
        ctjs.kill();
        Util.exit();
    });
    process.on("SIGTERM", (signal) => {
        ctjs.kill();
        Util.exit();
    });
    // process.on("SIGKILL", kill);
    try {
        ctjs.check4Updates().then(
            (data) => {
                Version.remoteJsonFile = JSON.parse(data);
                jsonDataHandler(data).then(
                    data => {
                        run(ctjs);
                    },
                    error => {
                        Util.error(error);
                    }
                );
            },
            (error) => {
                // LOG.error(error);
                // no internet connection ????
                // okay, let's looking for version file
                try {
                    if (!Version.exists) {
                        throw error;
                    }
                    run(ctjs);
                } catch (error) {
                    LOG.error(`\nNo internet connection and no local installation found. There's not much to do ... :-(\n`);
                    Util.exit();
                }
            }
        );
    } catch (err) {
        Util.error(error);
    }
});
