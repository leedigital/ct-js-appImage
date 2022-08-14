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