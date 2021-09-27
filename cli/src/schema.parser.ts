import {Schema} from "./schema";
import {
    ClassDeclaration,
    ConstructorDeclarationStructure,
    MethodDeclaration,
    MethodDeclarationStructure,
    Scope,
    SourceFile
} from "ts-morph";
import {SchemaNotFoundError} from "./errors/schema-not-found.error";
import {TooMuchSchemaError} from "./errors/too-much-schema.error";
import {Configuration} from "./configuration";
import * as path from "path";

export class SchemaParser {

    constructor(private config: Configuration) {

    }

    public parse(file: SourceFile): Promise<Schema> {
        return new Promise((resolve, reject) => {
            const fileName: string = file.getBaseNameWithoutExtension();
            const classes: ClassDeclaration[] = file.getClasses().filter(SchemaParser.isSchemaClass);
            const schema: Schema = {
                sourceFile: file,
                path: file.getFilePath(),
                fileName: fileName,
                moduleName: '',
                className: '',
                isReadonly: false
            };
            let method: MethodDeclaration | undefined;

            if (classes.length > 1) {
                reject(new TooMuchSchemaError(path.relative(this.config.schemas, schema.path), file.getClasses()));
                return;
            }
            schema.cd = classes[0];
            if (!schema.cd) {
                reject(new SchemaNotFoundError(path.relative(this.config.schemas, schema.path)));
                return;
            }
            schema.moduleName = SchemaParser.camelize(schema.cd.getName());
            schema.className = schema.cd.getName();
            schema.isReadonly = <any>schema.cd.getDecorator('Schema').getArguments()[0].getText();
            schema.jsDocs = schema.cd.getJsDocs();
            schema.cd.rename(`${schema.className}Bridge`);

            schema.imports = file.getImportDeclarations().filter(id => {
                return id.getModuleSpecifierValue() !== 'electron-bridge-cli';
            }).map(id => {
                return id.getStructure();
            });
            if (schema.cd.getConstructors().length === 1) {
                schema.ctor = <ConstructorDeclarationStructure>schema.cd.getConstructors()[0].getStructure();
            }
            schema.privateInterfaces = file.getInterfaces().filter(id => {
                return !id.isExported();
            }).map(id => {
                return id.getStructure();
            });
            schema.privateClasses = file.getClasses().filter(cd => {
                return !cd.isExported();
            }).map(cd => {
                return cd.getStructure();
            });
            schema.publicClasses = file.getClasses().filter(cd => {
                return cd.isExported() && cd.getDecorator('Schema') === undefined;
            }).map(cd => {
                return cd.getStructure();
            });
            schema.publicInterfaces = file.getInterfaces().filter(id => {
                return id.isExported();
            }).map(id => {
                return id.getStructure();
            });
            schema.publicTypes = file.getTypeAliases().filter(tad => {
                return tad.isExported();
            }).map(tad => {
                return tad.getStructure();
            });

            method = schema.cd.getMethod('register');
            schema.registerMethod = (method) ? <MethodDeclarationStructure>method.getStructure() : undefined;
            method = schema.cd.getMethod('release');
            schema.releaseMethod = (method) ? <MethodDeclarationStructure>method.getStructure() : undefined;
            schema.publicMethods = schema.cd.getMethods().filter((method: MethodDeclaration) => {
                return method.getScope() === Scope.Public &&
                       method.getName() !== 'register' &&
                       method.getName() !== 'release' &&
                       method.getDecorator('EventListener') === undefined;
            }).map(method => <MethodDeclarationStructure>method.getStructure());
            schema.publicEvents = schema.cd.getMethods().filter((method: MethodDeclaration) => {
                return method.getScope() === Scope.Public &&
                       method.getName() !== 'register' &&
                       method.getName() !== 'release' &&
                       method.getDecorator('EventListener') !== undefined;
            }).map(method => <MethodDeclarationStructure>method.getStructure());
            schema.privateMethods = schema.cd.getMethods().filter((method: MethodDeclaration) => {
                return method.getScope() !== Scope.Public &&
                       method.getName() !== 'register' &&
                       method.getName() !== 'release' &&
                       method.getDecorator('EventListener') === undefined;
            }).map(method => <MethodDeclarationStructure>method.getStructure());

            resolve(schema);
        });
    }

    private static isSchemaClass(cd: ClassDeclaration): boolean {
        return cd.isExported() && cd.getDecorator('Schema') !== undefined;
    }

    private static camelize(str: string): string {
        return str.replace(/(?:^\w|[A-Z]|\b\w|\s+)/g, (match, index) => {
            if (+match === 0) return '';
            return index === 0 ? match.toLowerCase() : match.toUpperCase();
        });
    }

}
