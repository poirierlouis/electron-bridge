import {BrowserWindow} from 'electron';
import {EventListener, Schema} from "electron-bridge-cli";

type NotMyType = {version: number, magic: number};

/**
 *
 */
interface SmtpEmail {

    from: string;
    to: string;
    subject?: string;
    body?: string;

}

class NotToBeCopiedInApi {

    functionalTestPurpose: NotMyType;

}

export type MyType = {struct: string, typedef: string};

/**
 * Contains when and to whom last email was successfully sent.
 */
export interface EmailSentEvent {

    at: Date;
    to: string;

}

export interface EmailNotSentEvent {

    at: Date;
    to: string;
    error: string;

}

export class ToBeCopiedInApi {

    unitTestPurpose: MyType;

}

/**
 * A simple bridge with minimal reproduction of supported features.
 */
@Schema(true)
export class MyBridge {

    private used: NotToBeCopiedInApi;

    constructor(private readonly emailClient: any,
                private readonly path: string,
                private readonly win: BrowserWindow) {
        this.used = new NotToBeCopiedInApi();
        this.used.functionalTestPurpose.version = 1;
        this.used.functionalTestPurpose.magic = 42;
    }

    public register(): void {
        this.emailClient.on('sent', this.emitSent.bind(this));
        this.emailClient.on('not-sent', this.emitNotSent.bind(this));
        this.emailClient.on('ping', this.emitPing.bind(this));
    }

    public release(): void {
        this.emailClient.off('sent', this.emitSent.bind(this));
        this.emailClient.off('not-sent', this.emitNotSent.bind(this));
        this.emailClient.off('ping', this.emitPing.bind(this));
    }

    public async getVersion(): Promise<string> {
        return '1.0.0';
    }

    public async getPath(to: string): Promise<string> {
        return `${this.path}/${to}`;
    }

    /**
     * Ask main process to send an email ASAP without waiting / blocking.
     *
     * @param to whom to send your email.
     * @param subject of your email.
     * @param body of your email.
     */
    public sendEmail(to: string, subject: string, body: string): void {
        const email: string = MyBridge.buildEmail({
            from: 'electron-bridge-cli@functional.test',
            to: 'grogu@farfaraway.starwars',
            subject: subject,
            body: body
        });

        this.emailClient.process(email);
    }

    /**
     * Callback each time an email is sent.
     *
     * @param listener user's callback which receive information of email sent.
     */
    @EventListener('sent')
    public onEmailSent(listener: (event: EmailSentEvent) => void): void {

    }

    @EventListener('not-sent')
    public onEmailNotSent(listener: (event: EmailNotSentEvent) => void): void {

    }

    @EventListener('ping')
    public onPing(listener: Function): void {

    }

    private emitSent(at: Date, to: string): void {
        this.win.webContents.send('eb.myBridge.sent', <EmailSentEvent>{at: at, to: to});
    }

    private emitNotSent(at: Date, to: string, error: string): void {
        this.win.webContents.send('eb.myBridge.not-sent', <EmailNotSentEvent>{at: at, to: to, error: error});
    }

    private emitPing(): void {
        this.win.webContents.send('eb.myBridge.ping');
    }

    private static buildEmail(data: SmtpEmail): string {
        return `telnet smtp.----.---- 25
HELO client
MAIL FROM: <${data.from}>
RCPT TO: <${data.to}>
DATA
Subject: ${data.subject}

${data.body}
.
QUIT`;
    }

}