import {BridgeApi, DefaultMainModule} from './typings';

/**
 * A bridge module to be registered using Context Bridge.
 */
export interface BridgeModule {

    /**
     * Name of the module to be exposed in window global variable (e.g window.dialog).
     */
    name: DefaultMainModule | string;

    /**
     * Api endpoint for asynchronous functions. And nothing else to encourage safe encapsulation.
     */
    api: BridgeApi;

    /**
     * true when it only reads stuff from main process, false otherwise.
     * When using a module that is not readonly, you might expose your application to security issues. Ye be warn!
     */
    readonly: boolean;

}
