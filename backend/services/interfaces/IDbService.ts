export interface IDbService {
  connect(): Promise<void> | void;

  saveDB(
    standardLocalhost: string,
    standardPort: number,
    user: string,
    password: string,
    database: string
  ): Promise<void> | void;

  isConfigured(): boolean;
}
export default IDbService;
