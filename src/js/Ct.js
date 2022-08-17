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

const { PROGRESS_LOG } = require("./ProgressLog");
const { doGetRequest } = require("./script");
const fs = require("fs");
const { LOG } = require("./Log");
const path = require("path");
const { exec } = require("child_process");
const { constants } = require("os");
const { Util } = require("./Util");


class Ctjs {

    #childProcess;

    constructor () {

    }

    get cacheFolder() {
        return Util.getCacheFolder();
    }

    get platformArch() {
        return Util.getPlatformArch();
    }

    get homeFolder() {
        return path.join(this.cacheFolder, this.platformArch);
    }

    get #ctjs() {
        return path.join(this.homeFolder, `/ctjs`);
    }

    run() {
        return new Promise((resolve, reject) => {
            PROGRESS_LOG.stop();
            const ctjs = this.#ctjs;
            fs.access(ctjs, fs.constants.X_OK, (error) => {
                if (error) {
                    exec(`chmod +x ${ ctjs }`)
                        .on("close", (code, signal) => {
                            this.#run(resolve, reject);
                        })
                        .on("error", (err) => {
                            reject(err);
                        });
                } else {
                    this.#run(resolve, reject);
                }
            });
        });
    }

    #run(resolve, reject) {
        this.#childProcess = exec(`cd ${ this.homeFolder } && ./ctjs`, (err, stdout, stderr) => {
        }).on("exit", (code, signal) => {
            resolve({ code, signal });
        }).on("error", (err) => {
            reject(err);
        });
    };

    exit() {
        Util.exit();
    }

    kill() {
        if (this.#childProcess) {
            this.#childProcess.kill(constants.signals.SIGKILL);
        }
    }


    check4Updates() {
        const url = "https://api.github.com:443/repos/ct-js/ct-js/releases/latest";
        LOG.info(`Looking for updates on \x1b[1;32m${ url }\x1b[0m\n`);
        PROGRESS_LOG.start();
        return new Promise((resolve, reject) => {
            doGetRequest(url).then(
                (response) => {
                    const contentType = response.headers[ "content-type" ];
                    const regex = /^(application\/json;)/i;
                    if (regex.test(contentType)) {
                        const chunks = [];
                        response.on('data', (chunk) => {
                            chunks.push(chunk);
                        });
                        response.on("end", () => {
                            resolve(chunks.join(""));
                        });
                    } else {
                        PROGRESS_LOG.stop();
                        reject(`\nContent-Type ${ contentType } is not supported\n`);
                    }
                },
                (err) => {
                    reject(err);
                }
            );
        });
    }


}
exports.ctjs = new Ctjs;