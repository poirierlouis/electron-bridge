#!/usr/bin/env node

import * as yargs from 'yargs';
import * as fs from "fs";
import * as path from "path";
import {Project, SourceFile} from "ts-morph";
import {Configuration} from "./configuration";
import {SchemaParser} from "./schema.parser";
import {ApiGenerator} from "./api.generator";
import {Schema} from "./schema";
import {AbstractError} from "./errors/abstract.error";
import {ModuleGenerator} from "./module.generator";
import {BridgeGenerator} from "./bridge.generator";
import {SchemaFiles} from "./schema.files";
import {Logger, LogLevel} from "./logger";

interface GenerateArguments {

    config: string;

}

export class ElectronBridgeCli {

    private readonly config: Configuration;
    private project!: Project;
    private parser!: SchemaParser;

    private apiGenerator!: ApiGenerator;
    private moduleGenerator!: ModuleGenerator;
    private bridgeGenerator!: BridgeGenerator;

    constructor() {
        this.config = {
            base: '.',
            tsconfig: 'tsconfig.json',
            schemas: 'schemas/',
            output: 'src/bridge/',
            main: false,
            verbose: false
        };
    }

    public generate(argv: GenerateArguments): number {
        let schemas: Schema[];
        let files: SchemaFiles[];

        Logger.info(`<electron-bridge-cli version="1.0.0">`)
              .indent();

        this.readConfiguration(argv.config);
        this.prepareProject();

        schemas = this.parseSchemas();
        files = this.generateSchemas(schemas);
        this.writeSchemas(files);

        Logger.unindent().info(`</project>`)
              .unindent().info(`</electron-bridge-cli>`);
        return 0;
    }

    private parseSchemas(): Schema[] {
        const files: SourceFile[] = this.project.getSourceFiles();

        Logger.info(`<parser files="${files.length}">`);
        Logger.indent();
        const schemas: Schema[] = files.map(file => {
            try {
                const schema: Schema = this.parser.parse(file);
                if (this.config.verbose) {
                    const fileName: string = path.relative(this.config.schemas, file.getFilePath());

                    Logger.log(`<parsed file="${fileName}" lines="${file.getEndLineNumber()}" />`);
                }
                return schema;
            } catch (error) {
                this.logError(error, file);
                return null;
            }
        }).filter(schema => {
            return schema !== null;
        }).map(schema => <Schema>schema);

        if (schemas.length === files.length) {
            Logger.info(`<result message="Detected all files as schemas (${schemas.length})." />`);
        } else {
            Logger.info();
            Logger.warn(`<result message="Detected only ${schemas.length} valid schemas." />`);
        }
        Logger.unindent().info(`</parser>`);
        return schemas;
    }

    private generateSchemas(schemas: Schema[]): SchemaFiles[] {
        let files: SchemaFiles[];

        Logger.info(``)
              .info(`<generator>`)
              .indent();
        files = schemas.map(schema => {
            const schemaFiles: SchemaFiles = {
                fileName: schema.fileName,
                sourceFile: schema.sourceFile,
                apiFile: null,
                moduleFile: null,
                bridgeFile: null
            };

            try {
                schemaFiles.apiFile = this.apiGenerator.generate(schema);
                schemaFiles.moduleFile = this.moduleGenerator.generate(schema);
                schemaFiles.bridgeFile = this.bridgeGenerator.generate(schema);
            } catch (error) {
                this.logError(error, schema.sourceFile);
                return null;
            }
            if (this.config.verbose) {
                const fileName: string = path.relative(this.config.schemas, schema.sourceFile.getFilePath());
                let lines: number = 0;
                let roi: number;

                lines += schemaFiles.apiFile.getEndLineNumber();
                lines += schemaFiles.moduleFile.getEndLineNumber();
                lines += schemaFiles.bridgeFile.getEndLineNumber();
                roi = 100 - Math.round((schema.sourceFile.getEndLineNumber() / lines) * 100);
                Logger.log(`<generated file="${fileName}" total-lines="${lines}" roi="${roi} %" />`);
            }
            return schemaFiles;
        });

        const size: number = schemas.length;

        files = files.filter(schema => schema !== null);

        const schemasLines: number = schemas.map(schema => schema.sourceFile.getEndLineNumber())
                                            .reduce((previous, current) => previous + current);
        const filesLines: number = files.map(schema => {
            return schema.apiFile.getEndLineNumber() +
                   schema.moduleFile.getEndLineNumber() +
                   schema.bridgeFile.getEndLineNumber();
        }).reduce((previous, current) => previous + current);
        const roi: number = 100 - Math.round(schemasLines / filesLines * 100);

        if (schemas.length === size) {
            if (this.config.verbose) {
                Logger.info();
            }
            Logger.info(`<result message="Generated all bridge files with success." roi="${roi} %" total-lines="${schemasLines} / ${filesLines}" />`);
        } else {
            Logger.info();
            Logger.warn(`<result message="Generated only ${schemas.length} / ${size} bridge files." roi="${roi} %" total-lines="${schemasLines} / ${filesLines}" />`);
        }
        Logger.unindent().info(`</generator>`);
        return files;
    }

    private writeSchemas(schemas: SchemaFiles[]): void {
        schemas.forEach(files => {
            try {
                files.apiFile.saveSync();
                files.moduleFile.saveSync();
                files.bridgeFile.saveSync();
            } catch (error) {
                Logger.error(`<error type="unknown" file="${files.fileName}" message="${error}" />`);
            }
        });
    }

    private logError(error: any, file: SourceFile): void {
        if (error instanceof AbstractError) {
            Logger.warn(error.message);
        } else {
            Logger.error(`<error type="unknown" file="${path.relative(this.config.schemas, file.getFilePath())}" message="${error}" />`);
        }
    }

    private prepareProject(): void {
        const globPath: string = path.join(this.config.schemas, '/**', '/*.ts');

        this.project = new Project({
            tsConfigFilePath: this.config.tsconfig,
            skipAddingFilesFromTsConfig: true,
            skipFileDependencyResolution: true
        });
        this.project.addSourceFilesAtPaths(globPath);
        //this.project.resolveSourceFileDependencies();
        this.parser = new SchemaParser(this.config);
        this.apiGenerator = new ApiGenerator(this.project, this.config);
        this.moduleGenerator = new ModuleGenerator(this.project, this.config);
        this.bridgeGenerator = new BridgeGenerator(this.project, this.config);
        Logger.info(`<project path="${globPath}">`);
        Logger.indent();
    }

    private readConfiguration(path: string): void {
        const file: string = fs.readFileSync(path, {encoding: 'utf8', flag: 'r'});
        const data: Configuration = JSON.parse(file);

        this.config.base = (data.base) ? data.base : '.';
        this.config.tsconfig = ElectronBridgeCli.resolvePath(this.config.base, data.tsconfig, 'tsconfig.json');
        this.config.schemas = ElectronBridgeCli.resolvePath(this.config.base, data.schemas, 'schemas/');
        this.config.output = ElectronBridgeCli.resolvePath(this.config.base, data.output, 'src/bridge/');
        this.config.main = (data.main) ? data.main : false;
        this.config.verbose = (data.verbose) ? data.verbose : false;
        Logger.withLevel((this.config.verbose) ? LogLevel.LOG : LogLevel.INFO);
        if (this.config.verbose) {
            Logger.log(`<config base="${this.config.base}" tsconfig="${this.config.tsconfig}" schemas="${this.config.schemas}" output="${this.config.output}" main="${this.config.main}" verbose="true" />`);
            Logger.log();
        }
    }

    private static resolvePath(base: string, value: string | undefined, defaultPath: string): string {
        const p: string = (value) ? value : defaultPath;

        return path.join(base, p);
    }

}

const cli: ElectronBridgeCli = new ElectronBridgeCli();

yargs.scriptName('eb')
     .usage('$0 <cmd> [args]')
     .command('generate <config>',
         'Generate electron-bridge modules from schemas.', (yargs) => {
         yargs.positional('config', {
             type: 'string',
             default: 'bridge.config.json',
             describe: 'Path to the configuration file.'
         })
     }, cli.generate.bind(cli))
     .help()
     .argv;
