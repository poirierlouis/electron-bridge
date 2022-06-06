import {SourceFile} from 'ts-morph';

export interface SchemaFiles {

    fileName: string;

    sourceFile: SourceFile;
    apiFile: SourceFile;
    moduleFile: SourceFile;
    bridgeFile: SourceFile;

}
