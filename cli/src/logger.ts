import chalk from "chalk";

export enum LogLevel {
    DEBUG,
    LOG,
    INFO,
    WARN,
    ERROR,
    NONE
}

export class Logger {

    private static singleton: Logger = new Logger();

    private readonly reTagNonClosing: RegExp = new RegExp(/(?<begin><[^/][\w-]*)(?<attrs>.*?)(?<end>\/?>)/);
    private readonly reTagClosing: RegExp = new RegExp(/<\/[\w-]*>/);
    private readonly reTagAttributes: RegExp = new RegExp(/\s(?<name>[\w-]*)(?<value>=".*?")|\s(?<empty>[\w-]*)/g);

    private level: LogLevel = LogLevel.INFO;
    private indentLevel: number = 0;
    
    private constructor() {
        this.level = LogLevel.INFO;
        this.indentLevel = 0;
    }

    public indent(): Logger {
        this.indentLevel++;
        return this;
    }

    public unindent(): Logger {
        if (this.indentLevel === 0) {
            return this;
        }
        this.indentLevel--;
        return this;
    }

    public withLevel(level: LogLevel): Logger {
        this.level = level;
        return this;
    }

    public debug(...data: string[]): Logger {
        if (this.level > LogLevel.DEBUG) {
            return this;
        }
        console.debug(this.getIndentation(), ...data);
        return this;
    }

    public log(...data: string[]): Logger {
        if (this.level > LogLevel.LOG) {
            return this;
        }
        console.log(this.getIndentation(), this.colorify(chalk.cyan, data.join('')));
        return this;
    }

    public info(...data: string[]): Logger {
        if (this.level > LogLevel.INFO) {
            return this;
        }
        console.info(this.getIndentation(), this.colorify(chalk.blueBright, data.join('')));
        return this;
    }

    public warn(...data: string[]): Logger {
        if (this.level > LogLevel.WARN) {
            return this;
        }
        console.warn(this.getIndentation(), this.colorify(chalk.bold.yellow, data.join('')));
        return this;
    }

    public error(...data: string[]): Logger {
        if (this.level > LogLevel.ERROR) {
            return this;
        }
        console.error(this.getIndentation(), this.colorify(chalk.bold.red, data.join('')));
        return this;
    }

    public static indent(): Logger {
        return Logger.singleton.indent();
    }

    public static unindent(): Logger {
        return Logger.singleton.unindent();
    }

    public static withLevel(level: LogLevel): Logger {
        return Logger.singleton.withLevel(level);
    }

    public static debug(...data: string[]): Logger {
        return Logger.singleton.debug(...data);
    }

    public static log(...data: string[]): Logger {
        return Logger.singleton.log(...data);
    }

    public static info(...data: string[]): Logger {
        return Logger.singleton.info(...data);
    }

    public static warn(...data: string[]): Logger {
        return Logger.singleton.warn(...data);
    }

    public static error(...data: string[]): Logger {
        return Logger.singleton.error(...data);
    }

    private colorify(color: any, data: string): string {
        let result: string = data;
        let matchTag: RegExpMatchArray | null;
        let matchAttribute: RegExpExecArray | null;

        if (data.match(this.reTagClosing)) {
            result = color(data);
        } else if ((matchTag = data.match(this.reTagNonClosing)) !== null) {
            result = color(matchTag[1]);
            matchTag[2] = matchTag[2].trimEnd();
            while ((matchAttribute = this.reTagAttributes.exec(matchTag[2])) !== null) {
                result += ' ';
                if (matchAttribute.groups.empty) {
                    result += chalk.white(matchAttribute.groups.empty);
                } else {
                    result += chalk.white(matchAttribute.groups.name);
                    result += chalk.green(matchAttribute.groups.value);
                }
            }
            if (matchTag[3][0] === '/') {
                result += ' ';
            }
            result += color(matchTag[3]);
        }
        return result;
    }

    private getIndentation(): string {
        let indentation: string = '';

        for (let i = 0; i < this.indentLevel; i++) {
            indentation += '  ';
        }
        return indentation;
    }

}
