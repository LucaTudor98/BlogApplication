import { Client, Falsey, Token, User } from 'oauth2-server';
import bcrypt from 'bcrypt';
import { getRepository } from 'typeorm';
import jwt, { Secret } from 'jsonwebtoken';
import UserDB from '../models/database/userDb';

type MyToken = {
  user: User;
  iat: number;
  exp: number;
};

const SameClient: Client = {
  id: 'application',
  clientSecret: 'secret',
  grants: ['password'],
};

const model = {
  async generateAccessToken(client: Client, user: User): Promise<string> {
    const token = jwt.sign(
      {
        user,
      },
      process.env.TOKEN_SECRET as Secret,
      { expiresIn: '1h' }
    );

    return token;
  },

  async getUser(name: string, password: string): Promise<User | Falsey> {
    const user = await getRepository(UserDB)
      .createQueryBuilder('user')
      .where('user.name = :name', { name })
      .getOneOrFail();

    if (user) {
      const validPass = await bcrypt.compare(password, user.password);

      if (validPass) {
        user.password = '';

        return user;
      }
    }

    return false;
  },

  async getClient(
    clientId: string,
    clientSecret: string
  ): Promise<Falsey | Client> {
    return SameClient;
  },

  async saveToken(
    token: Token,
    client: Client,
    user: User
  ): Promise<Falsey | Token> {
    const newToken: Token = {
      accessToken: token.accessToken,
      client,
      user,
    };

    return newToken;
  },

  async getAccessToken(accessToken: string): Promise<Falsey | Token> {
    const decoded = jwt.verify(
      accessToken,
      process.env.TOKEN_SECRET as string
    ) as MyToken;

    const token: Token = {
      user: decoded.user,
      accessTokenExpiresAt: new Date(decoded.exp * 1000),
      accessToken,
      client: SameClient,
    };

    return token;
  },

  async verifyScope(token: Token, scope: string): Promise<boolean> {
    if (!token.scope) {
      return false;
    }

    const requestedScopes = scope.split(' ');
    const authorizedScopes = (<string>token.scope).split(' ');
    return requestedScopes.every((s) => authorizedScopes.indexOf(s) >= 0);
  },
};

export default model;
