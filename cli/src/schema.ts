import {
    ClassDeclaration,
    ClassDeclarationStructure,
    ConstructorDeclarationStructure,
    ImportDeclarationStructure,
    InterfaceDeclarationStructure,
    JSDoc,
    MethodDeclarationStructure,
    SourceFile,
    TypeAliasDeclarationStructure
} from "ts-morph";

export interface Schema {

    sourceFile: SourceFile;

    path: string;
    fileName: string;
    moduleName: string;
    className: string;
    isReadonly: boolean;

    imports?: ImportDeclarationStructure[];
    cd?: ClassDeclaration;
    ctor?: ConstructorDeclarationStructure | undefined;
    jsDocs?: JSDoc[];
    privateInterfaces?: InterfaceDeclarationStructure[];
    privateClasses?: ClassDeclarationStructure[];
    publicClasses?: ClassDeclarationStructure[];
    publicInterfaces?: InterfaceDeclarationStructure[];
    publicTypes?: TypeAliasDeclarationStructure[];

    registerMethod?: MethodDeclarationStructure | undefined;
    releaseMethod?: MethodDeclarationStructure | undefined;
    publicMethods?: MethodDeclarationStructure[];
    publicEvents?: MethodDeclarationStructure[];
    privateMethods?: MethodDeclarationStructure[];

}
