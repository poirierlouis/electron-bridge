import {CliHelper} from "../test/cli.helper";
import {
    ArrowFunction,
    CallSignatureDeclaration,
    Expression, MethodDeclaration,
    ObjectLiteralExpression,
    ParameterDeclaration,
    PropertyAssignment,
    Signature,
    SourceFile,
    Statement,
    SyntaxKind,
    VariableDeclaration
} from "ts-morph";
import {Schema} from "./schema";

let helper: CliHelper;
let file: SourceFile;
let schema: Schema;
let module: SourceFile;
let properties: ObjectLiteralExpression;

beforeAll(() => {
    helper = new CliHelper();
    file = helper.getSourceFile('my-bridge.ts');
    schema = helper.parser.parse(file);
    module = helper.moduleGenerator.generate(schema);
});

/**
 * Expect a lambda with given name, with async keyword or not and with optional parameters to be present
 * in object. Expect lambda's statement to register an IPC channel with 'invoke'.
 *
 * @param object expression containing api endpoints.
 * @param name of the lambda to expect.
 * @param isAsync true if lambda is expected to be asynchronous, false otherwise.
 * @param parameters if lambda signature is expected to contains parameters, empty otherwise.
 */
function expectInvoker(object: ObjectLiteralExpression,
                       name: string,
                       isAsync: boolean,
                       parameters: {name: string, type?: string}[] = []): void {
    const property: PropertyAssignment | undefined = <PropertyAssignment | undefined>object.getProperty(name);

    expect(property).toBeDefined();
    if (!property) return;

    const expression: Expression | undefined = property.getInitializer();

    expect(expression).toBeDefined();
    if (!expression) return;
    expect(expression.getKind()).toBe(SyntaxKind.ArrowFunction);

    const lambda: ArrowFunction = <ArrowFunction>expression;

    if (isAsync) {
        expect(lambda.isAsync()).toBeTruthy();
    } else {
        expect(lambda.isAsync()).toBeFalsy();
    }
    parameters.forEach(parameter => {
        const pd: ParameterDeclaration | undefined = lambda.getParameter(parameter.name);

        expect(pd).toBeDefined();
        if (!pd) return;
        if (!parameter.type) return;
        expect(pd.getTypeNode()!.getFullText().trim()).toEqual(parameter.type);
    })

    const statements: Statement[] = lambda.getStatements();

    expect(statements).toHaveLength(1);
    let endStatement: string = '';

    if (parameters.length > 0) {
        endStatement = ', ';
    }
    parameters.forEach((parameter, i) => {
        endStatement += `${parameter.name}`;
        if (i + 1 < parameters.length) {
            endStatement += ', ';
        }
    })
    endStatement += ');';
    if (isAsync) {
        expect(statements[0].getFullText().trim())
            .toEqual(`return await ipcRenderer.invoke('eb.myBridge.${name}'${endStatement}`);
    } else {
        expect(statements[0].getFullText().trim())
            .toEqual(`ipcRenderer.invoke('eb.myBridge.${name}'${endStatement}`);
    }
}

function expectListener(object: ObjectLiteralExpression,
                       name: string,
                       eventName: string,
                       documentation?: string,
                       parameters: {name: string, type?: string}[] = []): void {
    const property: PropertyAssignment | undefined = <PropertyAssignment | undefined>object.getProperty(name);

    expect(property).toBeDefined();
    if (!property) return;

    const expression: Expression | undefined = property.getInitializer();

    expect(expression).toBeDefined();
    if (!expression) return;
    expect(expression.getKind()).toBe(SyntaxKind.ArrowFunction);

    const lambda: ArrowFunction = <ArrowFunction>expression;

    expect(lambda.getParameters()).toHaveLength(1);

    const parameter: ParameterDeclaration = lambda.getParameters()[0];

    if (parameters.length > 0) {
        const signatures: Signature[] = parameter.getType().getCallSignatures();

        expect(signatures).toHaveLength(1);

        const method: MethodDeclaration = <MethodDeclaration>signatures[0].getDeclaration();

        expect(method.getParameters()).toHaveLength(parameters.length);

        parameters.forEach((parameter, i) => {
            const pd: ParameterDeclaration = method.getParameters()[i];

            expect(pd).toBeDefined();
            if (!pd) return;

            expect(pd.getName()).toEqual(parameter.name);

            if (!parameter.type) return;

            expect(pd.getTypeNode()?.getFullText().trim()).toEqual(parameter.type);
        })
    }

    const statements: Statement[] = lambda.getStatements();

    expect(statements).toHaveLength(1);
    let statement: string = '';
    let argsStatement: string = '';
    let valuesStatement: string = '';

    if (parameters.length > 0) {
        argsStatement += '_:IpcRendererEvent,';
    }
    parameters.forEach((parameter, i) => {
        argsStatement += parameter.name;
        valuesStatement += parameter.name;
        if (parameter.type) {
            argsStatement += `:${parameter.type}`;
        }
        if (i + 1 < parameters.length) {
            argsStatement += ',';
            valuesStatement += ', ';
        }
    })
    statement = `ipcRenderer.on('eb.myBridge.${eventName}',(${argsStatement})=>{`;
    statement += `${parameter.getName()}(${valuesStatement});`;
    statement += `});`;
    expect(statements[0].getFullText().trim().replace(/[\r\n \t]*/g, '')).toEqual(statement);
}

describe(`when generating a module object`, () => {

    test(`given a valid schema then create an exported BridgeModule interface.`, () => {
        const vd: VariableDeclaration | undefined = module.getVariableDeclaration('MyBridgeModule');

        expect(vd).toBeDefined();
        if (!vd) return;
        expect(vd.getTypeNode()!.getText()).toEqual('BridgeModule');

        const object: ObjectLiteralExpression | undefined = vd.getLastChild();

        expect(object).toBeDefined();
        if (!object) return;
        expect(object.getKind()).toBe(SyntaxKind.ObjectLiteralExpression);

        let name: PropertyAssignment | undefined = <PropertyAssignment>object.getProperty('name');
        let readonly: PropertyAssignment | undefined = <PropertyAssignment>object.getProperty('readonly');
        let api: PropertyAssignment | undefined = <PropertyAssignment>object.getProperty('api');

        expect(name).toBeDefined();
        expect(readonly).toBeDefined();
        expect(api).toBeDefined();

        expect(name.getInitializer()!.getFullText().trim()).toEqual(`'myBridge'`);
        expect(readonly.getInitializer()!.getFullText()).toBeTruthy();
        expect(api.getInitializer()!.getFullText()).toBeDefined();
        properties = <ObjectLiteralExpression>api.getInitializer();
    });

    test(`given a schema with public methods then add IPC invoker per method.`, () => {
        expectInvoker(properties, 'getVersion', true);
        expectInvoker(properties, 'getPath', true, [{name: 'to', type: 'string'}]);
        expectInvoker(properties, 'sendEmail', false, [
            {name: 'to', type: 'string'},
            {name: 'subject', type: 'string'},
            {name: 'body', type: 'string'}
        ]);
    });

    test(`given a schema with event listeners then add IPC listener per method.`, () => {
        expectListener(properties, 'onEmailSent', 'sent', `/**
     * Callback each time an email is sent.
     *
     * @param listener user's callback which receive information of email sent.
     */`, [{name: 'event', type: 'EmailSentEvent'}]);
        expectListener(properties, 'onEmailNotSent', 'not-sent', undefined,
            [{name: 'event', type: 'EmailNotSentEvent'}]);
        expectListener(properties, 'onPing', 'ping');
    });

});