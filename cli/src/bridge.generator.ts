import {
    CodeBlockWriter,
    ConstructorDeclarationStructure,
    ImportDeclarationStructure,
    MethodDeclarationStructure,
    Project,
    Scope,
    SourceFile,
    StatementStructures,
    StructureKind,
    VariableDeclarationStructure,
    WriterFunction
} from "ts-morph";
import {Schema} from "./schema";
import * as path from "path";
import {Configuration} from "./configuration";

export class BridgeGenerator {

    constructor(private project: Project,
                private config: Configuration) {

    }

    public generate(schema: Schema): SourceFile {
        const filePath: string = this.getPath(schema);
        const file: SourceFile = this.project.createSourceFile(filePath, undefined, {overwrite: true});

        file.addImportDeclarations(this.generateImports(schema));
        file.addInterfaces(schema.privateInterfaces);
        file.addClasses(schema.privateClasses);
        file.addTypeAliases(schema.privateTypes);
        file.addClass({
            kind: StructureKind.Class,
            isExported: true,
            name: `${schema.className}Bridge`,
            implements: ['Bridge'],
            ctors: this.generateConstructor(schema),
            methods: [
                this.generateRegister(schema),
                this.generateRelease(schema),
                ...schema.privateMethods
            ],
            getAccessors: schema.cd.getGetAccessors().map(accessor => accessor.getStructure()),
            setAccessors: schema.cd.getSetAccessors().map(accessor => accessor.getStructure()),
            decorators: [],
            properties: schema.cd.getProperties().map(property => property.getStructure()),
            typeParameters: schema.cd.getTypeParameters().map(typeParameter => typeParameter.getStructure())
        });
        file.fixUnusedIdentifiers();
        file.fixMissingImports();
        file.organizeImports();
        return file;
    }

    private generateImports(schema: Schema): ImportDeclarationStructure[] {
        const imports: ImportDeclarationStructure[] = [];

        imports.push(...schema.imports);
        imports.push({
            kind: StructureKind.ImportDeclaration,
            namedImports: ['Bridge'],
            moduleSpecifier: (this.config.main) ? './bridge' : 'electron-bridge/main'
        });
        imports.push({
            kind: StructureKind.ImportDeclaration,
            namedImports: ['ipcMain', 'IpcMainInvokeEvent'],
            moduleSpecifier: 'electron'
        });
        return imports;
    }

    private generateConstructor(schema: Schema): ConstructorDeclarationStructure[] {
        if (!schema.ctor) {
            return [];
        }
        return [schema.ctor];
    }

    private generateRegister(schema: Schema): MethodDeclarationStructure {
        return {
            kind: StructureKind.Method,
            scope: Scope.Public,
            name: 'register',
            returnType: 'void',
            statements: (writer) => {
                this.generateRegisterOverride(schema, writer);
                this.generateRegisterHandlers(schema, writer);
            }
        };
    }

    private generateRegisterOverride(schema: Schema, writer: CodeBlockWriter): void {
        if (!schema.registerMethod) {
            return;
        }
        this.writeStatements(writer, schema.registerMethod.statements);
    }

    private generateRegisterHandlers(schema: Schema, writer: CodeBlockWriter): void {
        schema.publicMethods.forEach((method: MethodDeclarationStructure) => {
            let parameters: string = '';
            let isAsync: string = '';

            if (method.isAsync) {
                isAsync = 'async ';
            }
            if (method.parameters.length !== 0) {
                parameters = '_: IpcMainInvokeEvent, ' + method.parameters.map(parameter => `${parameter.name}: ${parameter.type}`).join(', ');
            }
            writer.write(`ipcMain.handle('eb.${schema.moduleName}.${method.name}', ${isAsync}(${parameters}) => {`);
            writer.indent(() => {
                this.writeStatements(writer, method.statements);
            });
            writer.writeLine('});');
        });
    }

    private generateRelease(schema: Schema): MethodDeclarationStructure {
        return {
            kind: StructureKind.Method,
            scope: Scope.Public,
            name: 'release',
            returnType: 'void',
            statements: (writer) => {
                this.generateReleaseOverride(schema, writer);
                this.generateReleaseHandlers(schema, writer);
            }
        };
    }

    private generateReleaseOverride(schema: Schema, writer: CodeBlockWriter): void {
        if (!schema.releaseMethod) {
            return;
        }
        this.writeStatements(writer, schema.releaseMethod.statements);
    }

    private generateReleaseHandlers(schema: Schema, writer: CodeBlockWriter): void {
        schema.publicMethods.forEach((method: MethodDeclarationStructure) => {
            writer.writeLine(`ipcMain.removeHandler('eb.${schema.moduleName}.${method.name}');`);
        });
    }

    private writeStatements(writer: CodeBlockWriter, statements: any): void {
        if (!(statements instanceof Array)) {
            this.writeStatement(writer, statements);
            return;
        }
        (statements as Array<string | WriterFunction | StatementStructures>).forEach(statement => this.writeStatement(writer, statement));
    }

    private writeStatement(writer: CodeBlockWriter, statement: any): void {
        if (typeof statement === 'function') {
            statement(writer);
        } else if (typeof statement === 'string') {
            writer.writeLine(<string>statement);
        } else if (statement.kind === StructureKind.VariableStatement) {
            statement.declarations.forEach((declaration: VariableDeclarationStructure) => {
                const value: string = (declaration.initializer) ? ` = ${declaration.initializer}` : '';
                let type: string = '';

                if (declaration.type) {
                    type = (declaration.hasExclamationToken) ? '!: ' : ': ';
                    type += <string>declaration.type;
                }
                writer.writeLine(`${statement.declarationKind} ${declaration.name}${type}${value};`);
            });
        }
    }

    private getPath(schema: Schema): string {
        return path.join(this.config.output, 'main', `${schema.fileName}.bridge.ts`);
    }

}
