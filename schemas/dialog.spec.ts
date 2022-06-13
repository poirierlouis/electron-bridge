import {dialog} from 'electron';
import {Dialog} from './dialog';

jest.mock('electron', () => ({
    BrowserWindow: jest.fn().mockImplementation(),
    dialog: {
        showOpenDialog: jest.fn(),
        showSaveDialog: jest.fn(),
        showMessageBox: jest.fn(),
        showErrorBox: jest.fn()
    }
}));

describe(Dialog, () => {
    let schema: Dialog;

    beforeEach(() => {
        schema = new Dialog();
    });

    describe('Lifecycle', () => {
        it('should not implement register()', () => {
            // @ts-ignore
            expect(schema.register).toBeUndefined();
        });

        it('should not implement release()', () => {
            // @ts-ignore
            expect(schema.release).toBeUndefined();
        });
    });

    describe('Bridge calls', () => {
        it('should call dialog.showOpenDialog with options', async () => {
            await schema.showOpenDialog({filters: [{name: 'JSON', extensions: ['json']}]});

            expect(dialog.showOpenDialog).toHaveBeenCalledWith({filters: [{name: 'JSON', extensions: ['json']}]});
        });

        it('should call dialog.showSaveDialog with options', async () => {
            await schema.showSaveDialog({title: 'Dialog Title', defaultPath: '/home/grogu/'});

            expect(dialog.showSaveDialog).toHaveBeenCalledWith({title: 'Dialog Title', defaultPath: '/home/grogu/'});
        });

        it('should call dialog.showMessageBox with options', async () => {
            await schema.showMessageBox({title: 'Dialog Title', message: 'May the force be with you.'});

            expect(dialog.showMessageBox).toHaveBeenCalledWith({
                title: 'Dialog Title',
                message: 'May the force be with you.'
            });
        });

        it('should call dialog.showErrorBox with options', () => {
            schema.showErrorBox('Error Title', 'Be mindful young padawan.');

            expect(dialog.showErrorBox).toHaveBeenCalledWith('Error Title', 'Be mindful young padawan.');
        });
    });
});
