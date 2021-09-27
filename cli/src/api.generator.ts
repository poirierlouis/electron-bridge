import {
    ClassDeclarationStructure,
    InterfaceDeclarationStructure,
    MethodSignatureStructure,
    Project,
    SourceFile,
    StructureKind,
    TypeAliasDeclarationStructure
} from "ts-morph";
import {Schema} from "./schema";
import * as path from "path";
import {Configuration} from "./configuration";

export class ApiGenerator {

    constructor(private project: Project,
                private config: Configuration) {

    }

    public async generate(schema: Schema): Promise<SourceFile> {
        const filePath: string = this.getPath(schema);
        const file: SourceFile = this.project.createSourceFile(filePath, undefined, {overwrite: true});

        schema.publicTypes.forEach((tads: TypeAliasDeclarationStructure) => {
            file.addTypeAlias(tads);
        });
        schema.publicInterfaces.forEach((ids: InterfaceDeclarationStructure) => {
            file.addInterface(ids);
        });
        schema.publicClasses.forEach((cds: ClassDeclarationStructure) => {
            file.addClass(cds);
        });
        // Add a dummy import removed by `organizeImports()`.
        // Avoid an error due to tree declaration error when adding JsDocs.
        // Known issue: https://github.com/dsherret/ts-morph/issues/613
        file.addImportDeclaration({
            kind: StructureKind.ImportDeclaration,
            namedImports: ['SourceFile'],
            moduleSpecifier: 'ts-morph'
        });
        file.addInterface({
            kind: StructureKind.Interface,
            isExported: true,
            name: `${schema.className}Api`,
            methods: this.generateMethods(schema),
            docs: schema.jsDocs.map(jsDoc => jsDoc.getStructure())
        });
        file.fixUnusedIdentifiers();
        file.fixMissingImports();
        file.organizeImports();
        return file;
    }

    private generateMethods(schema: Schema): MethodSignatureStructure[] {
        return [...schema.publicMethods, ...schema.publicEvents].map(method => {
            return <MethodSignatureStructure>{
                kind: StructureKind.MethodSignature,
                name: method.name,
                parameters: method.parameters,
                returnType: method.returnType,
                docs: method.docs
            };
        });
    }

    private getPath(schema: Schema): string {
        return path.join(this.config.output, 'renderer', `${schema.fileName}.api.ts`);
    }

}
