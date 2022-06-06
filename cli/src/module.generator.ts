import {
    ClassDeclaration,
    CodeBlockWriter,
    Decorator,
    ImportDeclarationStructure,
    ParameterDeclaration,
    Project,
    Scope,
    Signature,
    SourceFile,
    StructureKind
} from 'ts-morph';
import {Schema} from './schema';
import * as path from 'path';
import {Configuration} from './configuration';

export class ModuleGenerator {

    constructor(private project: Project,
        private config: Configuration) {

    }

    public generate(schema: Schema): SourceFile {
        const filePath: string = this.getPath(schema);
        const file: SourceFile = this.project.createSourceFile(filePath, undefined, {overwrite: true});

        file.insertText(0, writer => {
            writer.writeLine(`export const ${schema.className}Module: BridgeModule = {`);
            writer.indent(() => this.generateModule(schema, writer));
            writer.write(`};`);
        });
        this.generateImports(file, schema);
        file.fixUnusedIdentifiers();
        file.fixMissingImports();
        file.organizeImports();
        return file;
    }

    private generateImports(file: SourceFile, schema: Schema): void {
        const imports: ImportDeclarationStructure[] = [];
        const apiImports: any[] = [];

        imports.push({
            kind: StructureKind.ImportDeclaration,
            namedImports: ['ipcRenderer, IpcRendererEvent'],
            moduleSpecifier: 'electron'
        });
        imports.push({
            kind: StructureKind.ImportDeclaration,
            namedImports: ['BridgeModule'],
            moduleSpecifier: (this.config.main) ? './bridge.module' : '@lpfreelance/electron-bridge/preload'
        });
        schema.publicInterfaces
            .filter(is => is.isExported)
            .forEach(is => apiImports.push(is.name));
        schema.publicClasses
            .filter(cd => cd.isExported && cd.decorators.find(d => d.name === 'Schema') === undefined)
            .forEach(cd => apiImports.push(cd.name));
        if (apiImports.length !== 0) {
            imports.push({
                kind: StructureKind.ImportDeclaration,
                namedImports: apiImports,
                moduleSpecifier: `../renderer/${schema.fileName}.api`
            });
        }
        file.addImportDeclarations(imports);
    }

    private generateModule(schema: Schema, writer: CodeBlockWriter): void {
        writer.writeLine(`name: '${schema.moduleName}',`);
        writer.writeLine(`readonly: ${schema.isReadonly},`);
        writer.writeLine(`api: {`);
        writer.indent(() => {
            this.generatePublicMethods(schema, writer);
            this.generateEventsMethods(schema, writer);
        });
        writer.writeLine(`}`);
    }

    private generatePublicMethods(schema: Schema, writer: CodeBlockWriter): void {
        schema.publicMethods.forEach((method, index, array) => {
            let channelName: string = method.name;
            let isAsync: string = (method.isAsync) ? 'async ' : '';
            let parameters: string = method.parameters.map(parameter => `${parameter.name}: ${parameter.type}`).join(', ');
            let values: string = method.parameters.map(parameter => parameter.name).join(', ');

            if (values.length > 0) {
                values = `, ${values}`;
            }
            writer.writeLine(`${method.name}: ${isAsync}(${parameters}) => {`);
            writer.indent(() => {
                if (method.returnType === 'void') {
                    writer.writeLine(`ipcRenderer.invoke('eb.${schema.moduleName}.${channelName}'${values});`);
                } else {
                    writer.writeLine(`return await ipcRenderer.invoke('eb.${schema.moduleName}.${channelName}'${values});`);
                }
            });
            if (index + 1 < array.length || this.hasEvents(schema.cd)) {
                writer.writeLine(`},`);
            } else {
                writer.writeLine(`}`);
            }
        });
    }

    private generateEventsMethods(schema: Schema, writer: CodeBlockWriter): void {
        schema.cd.getMethods().filter(method => {
            return method.getScope() === Scope.Public &&
                method.getName() !== 'register' &&
                method.getName() !== 'release' &&
                method.getDecorator('EventListener') !== undefined;
        }).forEach((method, index, array) => {
            const decorator: Decorator = method.getDecorator('EventListener');
            const methodName: string = method.getName();
            const channelName: string = ModuleGenerator.getEventName(decorator, methodName);
            const parameter: ParameterDeclaration = method.getParameters()[0];
            const {withTypes, withNames}: any = ModuleGenerator.getCallbackSignatureFromParameter(parameter);
            let parameterName: string = parameter.getFullText();
            let valueName: string = parameter.getName();
            let lambdaParameterName: string = '';
            let lambdaValueName: string = '';

            if (withTypes.length > 0) {
                lambdaParameterName = `_: IpcRendererEvent, ${withTypes.map((parameter: any) => parameter.getFullText()).join(',')}`;
                lambdaValueName = `${withNames.map((parameter: any) => parameter.getName()).join(', ')}`;
            }
            writer.writeLine(`${methodName}: (${parameterName}) => {`);
            writer.indent(() => {
                writer.writeLine(`ipcRenderer.on('eb.${schema.moduleName}.${channelName}', (${lambdaParameterName}) => {`);
                writer.indent(() => {
                    writer.writeLine(`${valueName}(${lambdaValueName});`);
                });
                writer.writeLine(`});`);
            });
            if (index + 1 < array.length) {
                writer.writeLine(`},`);
            } else {
                writer.writeLine(`}`);
            }
        });
    }

    private hasEvents(cd: ClassDeclaration): boolean {
        return cd.getMethods().filter(method => {
            return method.getScope() === Scope.Public &&
                method.getName() !== 'register' &&
                method.getName() !== 'release' &&
                method.getDecorator('EventListener') !== undefined;
        }).length > 0;
    }

    private getPath(schema: Schema): string {
        return path.join(this.config.output, 'preload', `${schema.fileName}.module.ts`);
    }

    private static getEventName(decorator: Decorator, orElse: string): string {
        if (decorator.getArguments().length === 0) {
            return orElse;
        }
        return decorator.getArguments()[0].getFullText().replace(/['"]/g, '');
    }

    private static getCallbackSignatureFromParameter(parameter: ParameterDeclaration): any {
        const signatures: Signature[] = parameter.getType().getCallSignatures();

        if (signatures.length !== 1) {
            return {withTypes: '', withNames: ''};
        }
        const signature: Signature = signatures[0];

        return {
            withTypes: signature.getParameters().map(parameter => parameter.getDeclarations()[0]),
            withNames: signature.getParameters()
        };
    }

}
