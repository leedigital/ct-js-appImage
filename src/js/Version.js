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
const fs = require("fs");
const { Util } = require("./Util");

class VersionFile {

    static #file = new class {
        /**
         * @type {String}
         */
        version;

        /**
         * @type {Number}
         */
        size;

        /**
         * @type {String}
         */
        platformArch;

        /**
         * @type {String}
         */
        downloadedFrom;
    };

    /**
     * @type {String}
     */
    static zipFilePath;

    /**
     * @type {String}
     */
    static zipFileName;

    static remoteJsonFile;

    /**
     * @type {String}
     */
    static remoteVersion;

    static {
        const cacheFolder = path.resolve(Util.getCacheFolder(), `.version`);
        try {
            this.#file = JSON.parse(fs.readFileSync(cacheFolder, this.fileOptions));
        } catch (err) {
            // Util.error(err);
            console.log(`Is it the first time we are running ???`);
        }
    }

    static get filePath() {
        return path.join(Util.getCacheFolder(), `.version`);
    }

    static get existsHomeFolder() {
        return fs.existsSync(Util.getCacheFolder());
    }

    static get exists() {
        return fs.existsSync(this.filePath) && fs.statSync(this.filePath).size > 0;
    }

    static get fileOptions() {
        return { encoding: "utf8" };
    }

    static save() {
        try {
            fs.writeFileSync(
                this.filePath,
                `${ JSON.stringify(this.file) }`,
                this.fileOptions
            );
        } catch (err) {
            Util.error(err);
            throw err;
        }
    }

    static get file() {
        return this.#file;
    }

}


exports.Version = VersionFile;