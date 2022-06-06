import {DecoratorStructure, MethodDeclarationStructure, SourceFile} from 'ts-morph';
import {CliHelper} from '../test/cli.helper';
import {TooMuchSchemaError} from './errors/too-much-schema.error';
import {SchemaNotFoundError} from './errors/schema-not-found.error';
import {Schema} from './schema';
import {ParameterNotFoundError} from './errors/parameter-not-found.error';
import {TooMuchParametersError} from './errors/too-much-parameters.error';
import {CallbackNotFoundError} from './errors/callback-not-found.error';

let helper: CliHelper;

beforeAll(() => {
    helper = new CliHelper();
});

function expectEventListener(eventListener: MethodDeclarationStructure, name: string, eventName: string): void {
    expect(eventListener.name).toEqual(name);
    expect(eventListener.decorators).toHaveLength(1);
    if (!eventListener.decorators) return;

    const decorator: DecoratorStructure = <DecoratorStructure>eventListener.decorators[0];

    expect(decorator.name).toEqual('EventListener');
    expect(decorator.arguments).toEqual([`'${eventName}'`]);
}

describe(`when parsing`, () => {

    describe(`Tests @Schema(readonly) decorator usage and unity.`, () => {

        test('given a file with multiple schema decorators then throw TooMuchSchemaError.', () => {
            const file: SourceFile = helper.getSourceFile('too-much-schema.ts');

            expect(() => helper.parser.parse(file)).toThrow(TooMuchSchemaError);
        });

        test('given a file without schema decorator then throw SchemaNotFoundError.', () => {
            const file: SourceFile = helper.getSourceFile('schema-not-found.ts');

            expect(() => helper.parser.parse(file)).toThrow(SchemaNotFoundError);
        });

    });

    describe(`Tests @EventListener(eventName) decorator usage.`, () => {

        test('given a schema with an event listener without a parameter then throw ParameterNotFoundError.', () => {
            const file: SourceFile = helper.getSourceFile('parameter-not-found.ts');

            expect(() => helper.parser.parse(file)).toThrow(ParameterNotFoundError);
        });

        test('given a schema with an event listener with more than one parameter then throw TooMuchParametersError.', () => {
            const file: SourceFile = helper.getSourceFile('too-much-parameters.ts');

            expect(() => helper.parser.parse(file)).toThrow(TooMuchParametersError);
        });

        test('given a schema with an event listener without a callback signature type then throw CallbackNotFoundError.', () => {
            const file: SourceFile = helper.getSourceFile('callback-not-found.ts');

            expect(() => helper.parser.parse(file)).toThrow(CallbackNotFoundError);
        });

        test('given a schema with event listeners then returns a schema interface with required information.', () => {
            const file: SourceFile = helper.getSourceFile('valid.ts');
            let schema: Schema | undefined;

            expect(() => schema = helper.parser.parse(file)).not.toThrow();
            expect(schema).toBeDefined();
            if (!schema) return;

            expect(schema.eventListeners).toHaveLength(3);
            if (!schema.eventListeners) return;

            expectEventListener(schema.eventListeners[0], 'onValid', 'valid');
            expectEventListener(schema.eventListeners[1], 'onValidWithArrowFunction', 'valid-arrow');
            expectEventListener(schema.eventListeners[2], 'onValidWithArrowFunctionWithArguments', 'valid-arrow-args');
        });

    });

    describe(`Tests schema information.`, () => {

        test('given a valid schema then returns a schema interface with required information.', () => {
            const file: SourceFile = helper.getSourceFile('my-bridge.ts');
            let schema: Schema;

            schema = helper.parser.parse(file);
            expect(schema.sourceFile).toBe(file);
            expect(schema.path).not.toBeNull();
            expect(schema.fileName).toBe('my-bridge');
            expect(schema.moduleName).toBe('myBridge');
            expect(schema.className).toBe('MyBridge');
            expect(schema.isReadonly).toBeTruthy();
        });

    });

});
