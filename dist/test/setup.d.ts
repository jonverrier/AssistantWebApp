/**
 * Test setup configuration that provides a DOM environment for running tests.
 */
import sinon from 'sinon';
declare const sandbox: sinon.SinonSandbox;
declare const axiosPostStub: sinon.SinonStub<[url: string, data?: unknown, config?: import("axios").AxiosRequestConfig<unknown> | undefined], Promise<unknown>>;
export { sandbox, axiosPostStub };
//# sourceMappingURL=setup.d.ts.map