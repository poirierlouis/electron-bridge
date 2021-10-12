import {CliHelper} from "../test/cli.helper";
import {InterfaceDeclaration, JSDoc, MethodSignature, ParameterDeclaration, SourceFile, TypeNode} from "ts-morph";
import {Schema} from "./schema";

let helper: CliHelper;
let file: SourceFile;
let schema: Schema;
let api: SourceFile;
let id: InterfaceDeclaration;

beforeAll(() => {
    helper = new CliHelper();
    file = helper.getSourceFile('my-bridge.ts');
    schema = helper.parser.parse(file);
    api = helper.apiGenerator.generate(schema);
    id = <InterfaceDeclaration>api.getInterface(`${schema.className}Api`);
});

function expectSignature(id: InterfaceDeclaration,
                         name: string,
                         returnType: string,
                         parameters: {name: string, type: string}[] = []): MethodSignature | undefined {
    const signature: MethodSignature | undefined = id.getMethod(name);

    expect(signature).toBeDefined();
    if (!signature) return;
    expect(signature.getParameters()).toHaveLength(parameters.length);

    const returnTypeNode: TypeNode | undefined = signature.getReturnTypeNode();

    expect(returnTypeNode).toBeDefined();
    if (!returnTypeNode) return;
    expect(returnTypeNode.getFullText().trim()).toEqual(returnType);

    if (!parameters) {
        return signature;
    }
    parameters.forEach(parameter => {
        const pd: ParameterDeclaration | undefined = signature.getParameter(parameter.name);

        expect(pd).toBeDefined();
        if (!pd) return;
        expect(pd.getTypeNode()?.getFullText().trim()).toEqual(parameter.type);
    });
    return signature;
}

function stringifyJsDocs(jsDocs: JSDoc[]): string {
    return jsDocs.map(jsDoc => jsDoc.getFullText()).reduce((previous, current) => previous + current);
}

describe(`when generating an api interface`, () => {

    test(`given a valid schema then create an exported interface.`, () => {
        expect(id).toBeDefined();
        expect(id.isExported()).toBeTruthy();
    });

    test(`given a schema with JsDoc at class level then copy JsDoc as-this at interface level.`, () => {
        const jsDocs: JSDoc[] = id.getJsDocs();
        const doc: string = stringifyJsDocs(jsDocs);

        expect(doc).toEqual(`/**
 * A simple bridge with minimal reproduction of supported features.
 */`);

    });

    test(`given a schema with register() / release() overridden then ignore signatures.`, () => {
        expect(id.getMethod('register')).toBeUndefined();
        expect(id.getMethod('release')).toBeUndefined();
    });

    test(`given a schema with public methods then declare signatures as-this.`, () => {
        expectSignature(id, 'getVersion', 'Promise<string>');
        expectSignature(id, 'getPath', 'Promise<string>', [{name: 'to', type: 'string'}]);
        const signature: MethodSignature | undefined = expectSignature(id, 'sendEmail', 'void', [
            {name: 'to', type: 'string'},
            {name: 'subject', type: 'string'},
            {name: 'body', type: 'string'}
        ]);

        expect(signature).toBeDefined();
        if (!signature) {
            return;
        }
        const jsDocs: JSDoc[] = signature.getJsDocs();
        const doc: string = stringifyJsDocs(jsDocs);

        expect(doc).toEqual(`/**
     * Ask main process to send an email ASAP without waiting / blocking.
     *
     * @param to whom to send your email.
     * @param subject of your email.
     * @param body of your email.
     */`);
    });

    test(`given a schema with event listeners then declare signatures as-this.`, () => {
        let signature: MethodSignature;

        expectSignature(id, 'onEmailNotSent', 'void',
            [{name: 'listener', type: '(event: EmailNotSentEvent) => void'}]);
        signature = <MethodSignature>expectSignature(id, 'onEmailSent', 'void',
            [{name: 'listener', type: '(event: EmailSentEvent) => void'}]);

        const jsDocs: JSDoc[] = signature.getJsDocs();
        const doc: string = stringifyJsDocs(jsDocs);

        expect(doc).toEqual(`/**
     * Callback each time an email is sent.
     *
     * @param listener user's callback which receive information of email sent.
     */`);
    });

    test(`given a schema with private methods then ignore signatures.`, () => {
        expect(id.getMethod('emitSent')).toBeUndefined();
        expect(id.getMethod('buildEmail')).toBeUndefined();
    });

    test(`given a schema with exported interfaces then copy them as-this and ignore non exported one.`, () => {
        // TODO: test interface statements and JsDoc nodes.

        expect(api.getInterface('EmailSentEvent')).toBeDefined();
        expect(api.getInterface('EmailNotSentEvent')).toBeDefined();

        expect(api.getInterface('SmtpEmail')).toBeUndefined();
    });

    test(`given a schema with exported classes then copy them as-this and ignore non exported one.`, () => {
        // TODO: test interface statements and JsDoc nodes.

        expect(api.getClass('ToBeCopiedInApi')).toBeDefined();

        expect(api.getClass('NotToBeCopiedInApi')).toBeUndefined();
    });

    test(`given a schema with exported types then copy them as-this and ignore non exported one.`, () => {
        // TODO: test JsDoc nodes.

        expect(api.getTypeAlias('MyType')).toBeDefined();

        expect(api.getTypeAlias('NotMyType')).toBeUndefined();
    });

});