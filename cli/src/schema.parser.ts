import {Schema} from "./schema";
import {
    ClassDeclaration,
    ConstructorDeclarationStructure,
    MethodDeclaration,
    MethodDeclarationStructure,
    ParameterDeclaration,
    Scope,
    SourceFile
} from "ts-morph";
import {SchemaNotFoundError} from "./errors/schema-not-found.error";
import {TooMuchSchemaError} from "./errors/too-much-schema.error";
import {Configuration} from "./configuration";
import * as path from "path";
import {CallbackNotFoundError} from "./errors/callback-not-found.error";
import {TooMuchParametersError} from "./errors/too-much-parameters.error";
import {ParameterNotFoundError} from "./errors/parameter-not-found.error";

export class SchemaParser {

    constructor(private config: Configuration) {

    }

    public parse(file: SourceFile): Schema {
        const fileName: string = file.getBaseNameWithoutExtension();
        const filePath: string = path.relative(this.config.schemas, file.getFilePath());
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
            throw new TooMuchSchemaError(filePath, file.getClasses());
        }
        schema.cd = classes[0];
        if (!schema.cd) {
            throw new SchemaNotFoundError(filePath);
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
        schema.privateInterfaces = file.getInterfaces().filter(id => !id.isExported()).map(id => id.getStructure());
        schema.privateClasses = file.getClasses().filter(cd => !cd.isExported()).map(cd => cd.getStructure());
        schema.privateTypes = file.getTypeAliases().filter(tad => !tad.isExported()).map(tad => tad.getStructure());

        schema.publicClasses = file.getClasses().filter(cd => {
            return cd.isExported() && cd.getDecorator('Schema') === undefined;
        }).map(cd => {
            return cd.getStructure();
        });
        schema.publicInterfaces = file.getInterfaces().filter(id => id.isExported()).map(id => id.getStructure());
        schema.publicTypes = file.getTypeAliases().filter(tad => tad.isExported()).map(tad => tad.getStructure());

        method = schema.cd.getMethod('register');
        schema.registerMethod = (method) ? <MethodDeclarationStructure>method.getStructure() : undefined;
        method = schema.cd.getMethod('release');
        schema.releaseMethod = (method) ? <MethodDeclarationStructure>method.getStructure() : undefined;
        schema.publicMethods = schema.cd.getMethods().filter(SchemaParser.isPublicMethod)
            .map(method => <MethodDeclarationStructure>method.getStructure());
        schema.eventListeners = schema.cd.getMethods().filter(SchemaParser.isEventListener)
            .map(method => SchemaParser.parseEventListener(method, filePath));
        schema.privateMethods = schema.cd.getMethods().filter((method: MethodDeclaration) => {
            return method.getScope() !== Scope.Public &&
                   method.getName() !== 'register' &&
                   method.getName() !== 'release' &&
                   method.getDecorator('EventListener') === undefined;
        }).map(method => <MethodDeclarationStructure>method.getStructure());

        return schema;
    }

    private static parseEventListener(method: MethodDeclaration, filePath: string): MethodDeclarationStructure {
        const structure: MethodDeclarationStructure = <MethodDeclarationStructure>method.getStructure();

        if (!structure.parameters || structure.parameters.length === 0) {
            throw new ParameterNotFoundError(filePath, structure.name);
        }
        if (structure.parameters.length > 1) {
            throw new TooMuchParametersError(filePath, structure.name);
        }
        const parameter: ParameterDeclaration = method.getParameters()[0];

        if (!parameter.getType().isAnonymous() && parameter.getType().getText() !== 'Function') {
            throw new CallbackNotFoundError(filePath, structure.name);
        }
        return structure;
    }

    private static isPublicMethod(method: MethodDeclaration): boolean {
        return method.getScope() === Scope.Public &&
               method.getName() !== 'register' &&
               method.getName() !== 'release' &&
               method.getDecorator('EventListener') === undefined;
    }

    private static isEventListener(method: MethodDeclaration): boolean {
        return method.getScope() === Scope.Public &&
               method.getName() !== 'register' &&
               method.getName() !== 'release' &&
               method.getDecorator('EventListener') !== undefined;
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
