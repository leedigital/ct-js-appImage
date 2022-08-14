const { LOG } = require("./Log");

/**
 * 
 */
class ProgressLog {

    #interval;
    #chars = [ '\\', '|', '/', '-', '|' ];
    #charOffset = 0;

    constructor () {

    }

    start(delay = 100) {
        if (!this.#interval) {
            this.#interval = setInterval(() => {
                this.#charOffset = (++this.#charOffset) % this.#chars.length;
                LOG.info(this.#chars[ this.#charOffset ], { x: -1, y: 0 });
            }, delay);
        }
    }

    stop() {
        if (this.#interval) {
            clearInterval(this.#interval);
            this.#interval = null;
        }
    }

}

exports.PROGRESS_LOG = new ProgressLog;