import {SchemaParser} from '../src/schema.parser';
import {Configuration} from '../src/configuration';
import {FormatCodeSettings, NewLineKind, Project, SourceFile} from 'ts-morph';
import * as path from 'path';
import {ApiGenerator} from '../src/api.generator';
import {ModuleGenerator} from '../src/module.generator';
import {BridgeGenerator} from '../src/bridge.generator';

export interface Parameter {

    name: string;
    type?: string;

}

export class CliHelper {

    public readonly config: Configuration;
    public readonly format: FormatCodeSettings;
    public readonly parser: SchemaParser;
    public readonly apiGenerator: ApiGenerator;
    public readonly moduleGenerator: ModuleGenerator;
    public readonly bridgeGenerator: BridgeGenerator;

    private readonly project: Project;

    constructor(config?: Partial<Configuration>) {
        this.config = Object.assign({}, {
            base: 'test/',
            main: false,
            output: 'src/bridge/',
            schemas: 'schemas/',
            tsconfig: 'tsconfig.json',
            verbose: false
        }, config);
        this.format = {
            convertTabsToSpaces: true,
            trimTrailingWhitespace: true,
            placeOpenBraceOnNewLineForControlBlocks: false,
            placeOpenBraceOnNewLineForFunctions: false,
            insertSpaceAfterOpeningAndBeforeClosingJsxExpressionBraces: false,
            insertSpaceAfterOpeningAndBeforeClosingEmptyBraces: false,
            insertSpaceAfterOpeningAndBeforeClosingNonemptyBraces: false,
            insertSpaceAfterOpeningAndBeforeClosingNonemptyBrackets: false,
            insertSpaceAfterOpeningAndBeforeClosingNonemptyParenthesis: false,
            insertSpaceAfterOpeningAndBeforeClosingTemplateStringBraces: false
        };
        this.parser = new SchemaParser(this.config);
        this.project = new Project({
            tsConfigFilePath: this.config.tsconfig,
            skipAddingFilesFromTsConfig: true,
            skipFileDependencyResolution: true
        });
        this.project.addSourceFilesAtPaths(path.join(this.config.base, this.config.schemas, '**', '*.ts'));
        this.apiGenerator = new ApiGenerator(this.project, this.config, this.format);
        this.moduleGenerator = new ModuleGenerator(this.project, this.config, this.format);
        this.bridgeGenerator = new BridgeGenerator(this.project, this.config, this.format);
    }

    public getPath(fileName: string): string {
        return path.posix.join(__dirname, this.config.schemas, fileName);
    }

    public getSourceFile(fileName: string): SourceFile {
        return <SourceFile>this.project.getSourceFile(fileName);
    }

    public getLineFeed(): string {
        const newLine: NewLineKind = this.project.compilerOptions.get().newLine;

        return (newLine === NewLineKind.CarriageReturnLineFeed) ? '\r\n' : '\n';
    }

}
