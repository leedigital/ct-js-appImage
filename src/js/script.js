const { https } = require("follow-redirects");
const { LOG } = require("./Log");
const { PROGRESS_LOG } = require("./ProgressLog");
const { IncomingMessage } = require("http");
const unzipper = require("unzipper");
const fs = require("fs");
const path = require("path");
const { DOWNLOAD_PROGRESS_BAR } = require("./DownloadProgressBar");
const { Version } = require("./Version");
const { Util } = require("./Util");

const lineConfig = { x: -1, y: 0, clear: true };

/**
 * 
 * @param {String} url 
 * @returns 
 */
exports.doGetRequest = function (url) {
    return new Promise((resolve, reject) => {
        const urlObject = new URL(url);
        const options = {
            hostname: urlObject.hostname,
            port: urlObject.port,
            path: `${ urlObject.pathname }?${ urlObject.search }`,
            method: "GET",
            headers: {
                "User-Agent": "ct-js"
            },
        };
        const request = https.request(options, response => {
            if (response.statusCode === 200) {
                resolve(response);
            } else {
                LOG.info(`\nServer responded with \x1b[1;31m${ response.statusMessage }\x1b[0m\n`);
                PROGRESS_LOG.stop();
            }
        });
        request.on("error", (err) => {
            Util.error(err);
            LOG.newLine();
            reject(err);
        });
        request.end();
    });
};

const downloadFile = function (resolve, reject) {
    const url = Version.file.downloadedFrom;
    LOG.info(`Download remote version \x1b[1;32m${ Version.remoteVersion }\x1b[0m `);
    LOG.info(`for \x1b[1;32m${ Version.file.platformArch }\x1b[0m\n`, lineConfig);
    LOG.info(`from \x1b[1;32m${ url }\x1b[0m\n`);
    exports.doGetRequest(url).then(
        /**
         * 
         * @param {IncomingMessage} response 
         */
        (response) => {
            PROGRESS_LOG.stop();
            // const contentType = response.headers[ "content-type" ];
            const contentLength = Number.parseInt(response.headers[ "content-length" ]);
            // const contentDisposition = response.headers[ "content-disposition" ];
            // const filename = contentDisposition
            //     .replace(' ', '')
            //     .split(';')[ 1 ]
            //     .split('=')[ 1 ];
            LOG.info(`Downloading \x1b[1;31m${ Version.zipFileName }\x1b[0m ...\n`);
            const filePath = Version.zipFilePath;// = path.join(Util.getCacheFolder(), `.${ filename }`);
            response.pipe(fs.createWriteStream(filePath));
            let bytesRead = 0;
            DOWNLOAD_PROGRESS_BAR.start(31);
            response.on("data", (chunk) => {
                bytesRead += chunk.length;
                const value = Math.round(bytesRead / contentLength * 100).toPrecision(2);
                DOWNLOAD_PROGRESS_BAR.update(value);
            });
            response.on("end", () => {
                LOG.newLine();
                LOG.info(`Download is complete ...\n`);
                extractFiles(resolve, reject);
            });
            response.on("error", (err) => {
                reject(err);
            });
            // resolve();
        }
    );
};

const extractFiles = function (resolve, reject) {
    try {
        const filePath = Version.zipFilePath;
        PROGRESS_LOG.start();
        const linux = Util.getCtjsHome();
        if (fs.existsSync(linux)) {
            if (Version.exists) {
                LOG.info(`Removing the previous installation of ct.js ...\n`);
            } else {
                LOG.info(`\x1b[1;31mCorrupted data in installation folder ... ???\x1b[0m\n`);
                LOG.info(`\x1b[1;33mLet's remove them ...\x1b[0m\n`);
            }
            try {
                fs.rmSync(linux, { recursive: true });
            } catch (error) {
                Util.error(error);
            }
        }
        LOG.info(`Extracting files from \x1b[1;31m${ Version.zipFileName }\x1b[0m ...\n`);
        fs.createReadStream(filePath)
            .pipe(unzipper.Extract({ path: Util.getCacheFolder() }).on("close", () => {
                try {
                    LOG.info(`Removing temporary files ...\n`);
                    fs.rmSync(filePath);
                } catch (error) {
                    Util.error(error);
                }
                Version.save();
                resolve();
            }).on("error", () => {
                reject(`There was an error extracting the files`);
            }));
    } catch (error) {
        reject(error);
    }
};

exports.jsonDataHandler = function (data) {
    return new Promise((resolve, reject) => {
        try {
            let download = false;
            const remoteJson = JSON.parse(data);
            Version.remoteVersion = (/[^v]+/gi.exec(remoteJson.tag_name))[ 0 ];
            const cache = Util.getCacheFolder();
            // console.log(cache, isDev);
            if (!Version.existsHomeFolder) {
                fs.mkdirSync(cache, { recursive: true });
            }
            if (!Version.exists) {
                download = true;
                Version.file.version = Version.remoteVersion;
            } else {
                if (Version.file.version !== Version.remoteVersion) {
                    download = true;
                }
            }
            if (download) {
                /**
                 * @type {Object[]}
                 */
                const assets = remoteJson.assets;
                const platform_arch = Util.getPlatformArch();
                lineConfig.clear = false;
                const jsonData4Download = assets.find((obj) => obj.browser_download_url.indexOf(platform_arch) !== -1);
                if (jsonData4Download) {
                    const url4Download = jsonData4Download.browser_download_url;
                    Version.file.size = Number.parseInt(jsonData4Download.size);
                    Version.file.platformArch = platform_arch;
                    Version.file.downloadedFrom = url4Download;
                    Version.zipFileName = path.basename(url4Download);
                    LOG.info(`Updating ct.js to \x1b[1;32m${ Version.remoteVersion }\x1b[0m ...\n`);
                    LOG.info(`Checking if version \x1b[1;36m${ Version.remoteVersion }\x1b[0m is cached ...\n`);
                    Version.zipFilePath = `${ path.join(Util.getCacheFolder(), `.${ Version.zipFileName }`) }`;
                    if (fs.existsSync(Version.zipFilePath)) {
                        const stat = fs.statSync(Version.zipFilePath);
                        if (stat.isFile()) {
                            if (stat.size === Version.file.size) {
                                LOG.info(`\x1b[1;36mCached file, let's use it ...\x1b[0m\n`);
                                extractFiles(resolve, reject);
                            } else {
                                LOG.info(`\x1b[1;31mCached file version may be corrupt ... ???\x1b[0m\n`);
                                LOG.info(`\x1b[1;33mLet's download it again ...\x1b[0m\n`);
                                downloadFile(resolve, reject);
                            }
                        }
                    } else {
                        downloadFile(resolve, reject);
                    }
                } else {
                    reject(`\x1b[1;32m${ platform_arch }\x1b[0m platform is not supported`);
                }
            } else {
                resolve();
            }
        } catch (error) {
            reject(error);
        }
    });
};

exports.run = function (ctjs) {
    console.log(`Opening ct-js ...`);
    LOG.info(`Running version \x1b[1;32m${ Version.file.version }\x1b[0m of ct.js ...\n`);
    ctjs.run().then(
        value => {
            ctjs.exit();
        },
        error => {
            LOG.error(error);
            ctjs.exit();
        }
    );
};