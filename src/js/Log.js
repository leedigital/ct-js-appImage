const rl = require("readline");

/**
 * 
 */
class Log {

    #stdout = process.stdout;

    constructor () {

    }

    removeCursor() {
        // remove cursor
        this.write(`\x1b[?25l`);
    }

    /**
     * 
     * @param {String} message 
     * @param {Object} line
     * @param line.x
     * @param line.y 
     * @param line.clear
     */
    info(message, line) {
        this.#log(`${ message }`, line);
    }

    /**
     * 
     * @param {String} message 
     * @param {Object} line
     * @param line.x
     * @param line.y 
     * @param line.clear
     */
    error(message, line) {
        this.#log(`\x1b[31m ${ message } \x1b[0m`, line);
    }

    /**
      * 
      * @param {String} message 
      * @param {Object} line
      * @param line.x
      * @param line.y 
      * @param line.clear
      */
    warn(message) {
        this.#log(`\x1b[33m ${ message } \x1b[0m`, line);
    }

    newLine() {
        this.write(`\n`);
    }

    clearLine() {
        rl.clearLine(this.#stdout);
    }

    write(value) {
        this.#stdout.write(value);
    }

    moveCursor(x = 0, y = 0) {
        rl.moveCursor(this.#stdout, x, y);
    }

    /**
     * 
     * @param {String} message 
     * @param {Object} line
     * @param line.x
     * @param line.y
     * @param line.clear
     */
    #log(message, line = { x: 0, y: 0, clear: true }) {
        if (line.clear) {
            this.clearLine();
        }
        // this.moveCursor(line.x, line.y);
        this.#stdout.write(`\x1b[?25l${ message }\x1b[0m`);
        this.moveCursor(line.x, line.y);
    }

}

exports.LOG = new Log;