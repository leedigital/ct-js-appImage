/**
 * Copyright 2022 araujo921
 * 
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * 
 * http://www.apache.org/licenses/LICENSE-2.0
 * 
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

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