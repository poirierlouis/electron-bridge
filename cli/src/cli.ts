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
        try {
            this.readConfiguration(argv.config);
            this.prepareProject();
        } catch (error) {
            Logger.error(JSON.stringify(error));
            return 1;
        }
        this.generateSchemas();
        return 0;
    }

    private generateSchemas(): void {
        const files: SourceFile[] = this.project.getSourceFiles();

        Logger.info(`<parser files="${files.length}">`);
        Logger.indent();
        const parserPromises: Promise<Schema | null>[] = files.map(file => {
            return this.parser.parse(file).catch((error) => this.logError(error, file));
        });
        let totalSchema: number = 0;

        Promise.all(parserPromises).then(schemas => {
            const schemasPromises: Promise<SchemaFiles | null>[] = schemas.filter(schema => schema !== null)
                                                                          .map(schema => <Schema>schema)
                                                                          .map(schema => {
                return Promise.all([
                    this.apiGenerator.generate(schema),
                    this.moduleGenerator.generate(schema),
                    this.bridgeGenerator.generate(schema)
                ]).then(([apiFile, moduleFile, bridgeFile]) => {
                    return <SchemaFiles>{
                        apiFile: apiFile,
                        moduleFile: moduleFile,
                        bridgeFile: bridgeFile
                    };
                }).catch((error) => this.logError(error, schema.sourceFile));
            });
            totalSchema = schemasPromises.length;

            if (totalSchema === files.length) {
                Logger.info(`<result message="Detected all files as schemas (${totalSchema})." />`);
            } else {
                Logger.warn(`<result message="Detected only ${totalSchema} valid schemas." />`);
            }
            return Promise.all(schemasPromises);
        }).then(files => {
            Logger.unindent()
                  .info(`</parser>`)
                  .info(``)
                  .info(`<generator>`)
                  .indent();
            const promises = files.filter(files => files !== null)
                                  .map(files => <SchemaFiles>files)
                                  .map(files => {
                const schemaFile: SourceFile[] = [files.apiFile, files.moduleFile, files.bridgeFile];
                const promises: Promise<void>[] = schemaFile.map(file => {
                    const fileName: string = path.relative(this.config.output, file.getFilePath());

                    return file.save()
                               .then(() => {
                                   if (!this.config.verbose) {
                                       return;
                                   }
                                   Logger.info(`<generated file="${fileName}" />`);
                               })
                               .catch(error => {
                                   Logger.error(`<error type="unknown" file="${fileName}" message="${error}" />`);
                               });
                });

                return Promise.all(promises);
             });

            return Promise.all(promises);
        }).then(saves => {
            if (totalSchema === saves.length) {
                Logger.info(`<result message="Generated all bridge files with success." />`);
            } else {
                Logger.warn(`<result message="Generated only ${saves.length} / ${totalSchema} bridge files." />`);
            }
            Logger.unindent().info(`</generator>`);
            Logger.unindent().info(`</project>`);
            if (this.config.verbose) {
                Logger.unindent().info(`</electron-bridge-cli>`);
            }
        });
    }

    private logError(error: any, file: SourceFile): null {
        if (error instanceof AbstractError) {
            Logger.warn(error.message);
        } else {
            Logger.error(`<error type="unknown" file="${path.relative(this.config.schemas, file.getFilePath())}" message="${error}" />`);
        }
        return null;
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
        Logger.info(`<project path="${globPath}">`);
        Logger.indent();
        this.parser = new SchemaParser(this.config);
        this.apiGenerator = new ApiGenerator(this.project, this.config);
        this.moduleGenerator = new ModuleGenerator(this.project, this.config);
        this.bridgeGenerator = new BridgeGenerator(this.project, this.config);
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
            Logger.info(`<electron-bridge-cli version="1.0.0">`)
                  .indent()
                  .log(`<config base="${this.config.base}" tsconfig="${this.config.tsconfig}" schemas="${this.config.schemas}" output="${this.config.output}" main="${this.config.main}" verbose="true" />`)

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
