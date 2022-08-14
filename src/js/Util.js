const path = require("path");
const os = require("os");
const { app } = require("electron/main");
const { LOG } = require("./Log");

class Util {

    static getWorkFolder() {
        const folder = path.dirname(require.main.filename);
        return path.resolve(
            this.isDevMode() ?
                folder :
                path.dirname(process.env.APPIMAGE)
        );
    }

    static getCacheFolder() {
        return path.join(this.getWorkFolder(), `.cache`);
    };

    static getPlatformArch() {
        return `${ os.platform() }${ (/[^x]+/i).exec(os.arch())[ 0 ] }`;
    };

    static isDevMode() {
        return !app.isPackaged;
    };

    static getCtjsHome() {
        return path.join(this.getCacheFolder(), this.getPlatformArch());
    }

    static exit() {
        LOG.info(`\nClosing... bye, ;-)\x1b[0m`);
        // show cursor
        console.log(`\n\x1b[?25h`);
        app.quit();
        // process.kill(process.pid, os.constants.signals.SIGKILL);
    };

    /**
     * 
     * @param {Error} error 
     */
    static error(error) {
        LOG.error(`Error: \x1b[1;33m[${ error.stack }]\x1b[0m\n`);
        // LOG.error(`Error: \x1b[33m\xb1[1m[${ error.message }]\x1b[0m\n`);
    };
}

exports.Util = Util;