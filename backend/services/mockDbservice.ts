/* eslint-disable import/no-mutable-exports */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable class-methods-use-this */
/* eslint-disable-next-line @typescript-eslint/no-empty-function */

import IDbService from './interfaces/IDbService';

let testConfigured = true;

export default class MockDB implements IDbService {
  async connect() {}

  async saveDB(
    _standardLocalhost: string,
    _standardPort: number,
    _user: string,
    _password: string,
    _database: string
  ) {}

  isConfigured() {
    return testConfigured;
  }

  setConfigValue(isConfig: boolean) {
    testConfigured = isConfig;
  }
}

export { testConfigured };
