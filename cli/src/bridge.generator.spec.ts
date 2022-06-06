import {CliHelper, Parameter} from '../test/cli.helper';
import {
    ClassDeclaration,
    InterfaceDeclarationStructure,
    MethodDeclaration,
    ParameterDeclaration,
    Scope,
    SourceFile
} from 'ts-morph';
import {Schema} from './schema';

let helper: CliHelper;
let file: SourceFile;
let schema: Schema;
let bridge: SourceFile;
let cd: ClassDeclaration;

beforeAll(() => {
    helper = new CliHelper();
    file = helper.getSourceFile('my-bridge.ts');
    schema = helper.parser.parse(file);
    bridge = helper.bridgeGenerator.generate(schema);
    cd = <ClassDeclaration>bridge.getClass(`${schema.className}Bridge`);
});

function expectStatementsFromIndex(method: MethodDeclaration, expectStatements: string[], index: number): number {
    let offset: number = 0;

    method.getStatements().filter((statement, i) => {
        return i >= index && i + index < expectStatements.length;
    }).forEach((statement) => {
        const lineFeed: string = helper.getLineFeed();
        const lines: string[] = statement.getFullText().trim().split(lineFeed);

        lines.forEach((line, j) => {
            expect(line.trim()).toEqual(expectStatements[offset + j]);
        });
        offset += lines.length;
    });
    return offset;
}

function expectPrivateMethod(name: string, parameters: Parameter[], returnType: string, statements: string[], isStatic: boolean = false): void {
    const method: MethodDeclaration | undefined = cd.getMethod(name);

    expect(method).toBeDefined();
    if (!method) return;
    expect(method.getScope()).toEqual(Scope.Private);
    expect(method.isStatic()).toEqual(isStatic);

    parameters.forEach(parameter => {
        const pd: ParameterDeclaration | undefined = method.getParameter(parameter.name);

        expect(pd).toBeDefined();
        if (!pd) return;
        if (!parameter.type) return;
        expect(pd.getTypeNode()!.getFullText().trim()).toEqual(parameter.type);
    });

    expect(method.getReturnType().getText().trim()).toEqual(returnType);
    expectStatementsFromIndex(method, statements, 0);
}

describe(`when generating a bridge class`, () => {

    test(`given a valid schema then create an exported class which implements Bridge interface.`, () => {
        expect(cd).toBeDefined();
        expect(cd.isExported()).toBeTruthy();

        const ids: InterfaceDeclarationStructure = cd.extractInterface('Bridge');

        expect(ids).toBeDefined();
    });

    test(`given a schema then create a bridge with register / release methods.`, () => {
        expect(cd.getMethod('register')).toBeDefined();
        expect(cd.getMethod('release')).toBeDefined();
    });

    test(`given a schema which overrides register / release methods then copy methods' statements as-this at the beginning.`, () => {
        const register: MethodDeclaration = <MethodDeclaration>cd.getMethod('register');
        const release: MethodDeclaration = <MethodDeclaration>cd.getMethod('release');
        const registerStatements: string[] = [
            `this.emailClient.on('sent', this.emitSent.bind(this));`,
            `this.emailClient.on('not-sent', this.emitNotSent.bind(this));`,
            `this.emailClient.on('ping', this.emitPing.bind(this));`
        ];
        const releaseStatements: string[] = [
            `this.emailClient.off('sent', this.emitSent.bind(this));`,
            `this.emailClient.off('not-sent', this.emitNotSent.bind(this));`,
            `this.emailClient.off('ping', this.emitPing.bind(this));`
        ];

        expectStatementsFromIndex(register, registerStatements, 0);
        expectStatementsFromIndex(release, releaseStatements, 0);
    });

    test(`given a schema with public methods then add IPC handler per method in register() and release().`, () => {
        const register: MethodDeclaration = <MethodDeclaration>cd.getMethod('register');
        const release: MethodDeclaration = <MethodDeclaration>cd.getMethod('release');
        const registerStatements: string[] = [
            `ipcMain.handle('eb.myBridge.getVersion', async () => {`,
            `return '1.0.0';`,
            `});`,
            `ipcMain.handle('eb.myBridge.getPath', async (_: IpcMainInvokeEvent, to: string) => {`,
            'return `${this.path}/${to}`;',
            `});`,
            `ipcMain.handle('eb.myBridge.sendEmail', (_: IpcMainInvokeEvent, to: string, subject: string, body: string) => {`,
            `const email: string = MyBridgeBridge.buildEmail({`,
            `from: 'electron-bridge-cli@functional.test',`,
            `to: 'grogu@farfaraway.starwars',`,
            `subject: subject,`,
            `body: body`,
            `});`,
            `this.emailClient.process(email);`,
            `});`,
        ];
        const releaseStatements: string[] = [
            `ipcMain.removeHandler('eb.myBridge.getVersion');`,
            `ipcMain.removeHandler('eb.myBridge.getPath');`,
            `ipcMain.removeHandler('eb.myBridge.sendEmail');`
        ];

        let length: number = expectStatementsFromIndex(register, registerStatements, 3);

        expect(length).toEqual(registerStatements.length);

        expectStatementsFromIndex(release, releaseStatements, 3);
        expect(release.getStatements().length).toEqual(3 + releaseStatements.length);
    });

    test(`given a schema with private methods then copy them as-this.`, () => {
        expectPrivateMethod('emitSent', [
            {name: 'at', type: 'Date'},
            {name: 'to', type: 'string'}
        ], 'void', [
            `this.win.webContents.send('eb.myBridge.sent', <EmailSentEvent>{at: at, to: to});`
        ]);
        expectPrivateMethod('emitNotSent', [
            {name: 'at', type: 'Date'},
            {name: 'to', type: 'string'},
            {name: 'error', type: 'string'}
        ], 'void', [
            `this.win.webContents.send('eb.myBridge.not-sent', <EmailNotSentEvent>{at: at, to: to, error: error});`
        ]);
        expectPrivateMethod('emitPing', [], 'void', [
            `this.win.webContents.send('eb.myBridge.ping');`
        ]);
        expectPrivateMethod('buildEmail', [{name: 'data', type: 'SmtpEmail'}], 'string', [
            'return `telnet smtp.----.---- 25',
            'HELO client',
            'MAIL FROM: <${data.from}>',
            'RCPT TO: <${data.to}>',
            'DATA',
            'Subject: ${data.subject}',
            '',
            '${data.body}',
            '.',
            'QUIT`;'
        ], true);
    });

    test(`given a schema with non exported classes then copy them as-this and ignore exported one.`, () => {
        expect(bridge.getClass('NotToBeCopiedInApi')).toBeDefined();

        expect(bridge.getClass('ToBeCopiedInApi')).toBeUndefined();
    });

    test(`given a schema with non exported interfaces then copy them as-this and ignore exported one.`, () => {
        expect(bridge.getInterface('SmtpEmail')).toBeDefined();

        expect(bridge.getInterface('EmailSentEvent')).toBeUndefined();
        expect(bridge.getInterface('EmailNotSentEvent')).toBeUndefined();
    });

    test(`given a schema with non exported types then copy them as-this and ignore exported one.`, () => {
        expect(bridge.getTypeAlias('NotMyType')).toBeDefined();

        expect(bridge.getTypeAlias('MyType')).toBeUndefined();
    });

});
