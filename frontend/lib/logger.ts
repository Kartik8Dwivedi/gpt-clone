import chalk from 'chalk';

class Logger {
  private _logWithColor(colorFn: chalk.Chalk, label: string, ...args: any[]) {
    const timestamp = new Date().toISOString();
    const coloredLabel = colorFn(`[${label}]`);
    console.log(`${chalk.gray(timestamp)} ${coloredLabel}`, ...args);
  }

  info(...args: any[]) {
    this._logWithColor(chalk.blue, 'INFO', ...args);
  }

  error(...args: any[]) {
    this._logWithColor(chalk.red, 'ERROR', ...args);
  }

  success(...args: any[]) {
    this._logWithColor(chalk.green, 'SUCCESS', ...args);
  }

  warn(...args: any[]) {
    this._logWithColor(chalk.yellow, 'WARN', ...args);
  }

  log(...args: any[]) {
    this._logWithColor(chalk.white, 'LOG', ...args);
  }
}

export default new Logger();
