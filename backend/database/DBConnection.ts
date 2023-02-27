/* eslint-disable class-methods-use-this */
import { createConnection, getConnectionOptions } from 'typeorm';
import fs from 'fs';
import IDbService from '../services/interfaces/IDbService';

export default class DBConnection implements IDbService {
  isConfigured(): boolean {
    return fs.existsSync('./ormconfig.json');
  }

  async connect() {
    await createConnection()
      .then(() => console.log('Connection successful'))
      .catch((error) => console.log(error));
  }

  async saveDB(
    standardLocalhost: string,
    standardPort: number,
    user: string,
    password: string,
    database: string
  ) {
    if (fs.existsSync('./ormconfig.json')) {
      const connectionOptions = await getConnectionOptions();

      Object.assign(connectionOptions, {
        port: standardPort,
        host: standardLocalhost,
        username: user,
        password,
        database,
      });

      this.saveConfigFile(JSON.stringify(connectionOptions, null, 2));
      return;
    }

    const options = {
      type: 'mysql',
      port: standardPort,
      host: standardLocalhost,
      username: user,
      password,
      database,
      entities: ['models/database/**/*.ts'],
      synchronize: true,
    };

    this.saveConfigFile(JSON.stringify(options, null, 2));
  }

  private saveConfigFile(options: string) {
    fs.writeFileSync('./ormconfig.json', options);
  }
}
