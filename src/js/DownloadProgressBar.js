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

const { LOG } = require("./Log");

class DownloadProgressBar {

    #slot = 1;

    #slotValue = 0;

    /**
     * 
     * @param {Number} size 
     */
    start(size = 100) {
        LOG.removeCursor();
        size = Math.floor(size > 100 ? 100 : size);
        this.#slotValue = 100 / size;
        LOG.write(`[`);
        for (let i = 0; i < size; i++) {
            LOG.write(`-`);
        }
        LOG.write(`]\n`);
        LOG.moveCursor(1, -1);
    }

    /**
     * 
     * @param {Number} value 
     */
    update(value) {
        if (value >= this.#slotValue * this.#slot) {
            LOG.write(`=`);
            this.#slot++;
        }
    }

}

exports.DOWNLOAD_PROGRESS_BAR = new DownloadProgressBar;