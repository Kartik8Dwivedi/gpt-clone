// logger.js
import chalk from 'chalk';

class Logger {
  _logWithColor(colorFn, label, ...args) {
    const timestamp = new Date().toISOString();
    const coloredLabel = colorFn(`[${label}]`);
    console.log(`${chalk.gray(timestamp)} ${coloredLabel}`, ...args);
  }

  info(...args) {
    this._logWithColor(chalk.blue, 'INFO', ...args);
  }

  error(...args) {
    this._logWithColor(chalk.red, 'ERROR', ...args);
  }

  success(...args) {
    this._logWithColor(chalk.green, 'SUCCESS', ...args);
  }

  warn(...args) {
    this._logWithColor(chalk.yellow, 'WARN', ...args);
  }

  log(...args) {
    this._logWithColor(chalk.white, 'LOG', ...args);
  }
}

export default new Logger();
