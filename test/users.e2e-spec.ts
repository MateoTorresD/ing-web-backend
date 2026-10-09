import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { UsersService } from './../src/users/users.service';

/**
 * Requiere una base de datos con las migraciones aplicadas.
 * Usa una BD de pruebas: los usuarios creados quedan en soft delete.
 */
const bodyOf = <T>(res: { body: unknown }): T => res.body as T;

interface UserBody {
  uuid: string;
  username: string;
  email: string;
  person: { firstName: string; lastName: string };
}

describe('Auth + Users (e2e)', () => {
  let app: INestApplication<App>;
  let token: string;
  const suffix = Date.now().toString(36);
  const credentials = {
    firstName: 'E2e',
    lastName: 'Tester',
    username: `e2e_${suffix}`,
    email: `e2e_${suffix}@example.com`,
    password: 'Passw0rd!123',
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();

    // Sin endpoint de registro: el usuario inicial se crea por el servicio.
    await app.get(UsersService).create(credentials);
  });

  afterAll(async () => {
    await app.close();
  });

  describe('login (ruta pública)', () => {
    it('POST /auth/login rechaza credenciales incorrectas', () => {
      return request(app.getHttpServer())
        .post('/api/auth/login')
        .send({ identifier: credentials.username, password: 'incorrecta' })
        .expect(401);
    });

    it('POST /auth/login devuelve accessToken', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({
          identifier: credentials.username,
          password: credentials.password,
        });
      expect([200, 201]).toContain(res.status);
      const { accessToken } = bodyOf<{ accessToken: string }>(res);
      expect(accessToken).toEqual(expect.any(String));
      token = accessToken;
    });
  });

  describe('rutas protegidas sin token', () => {
    it.each([
      ['GET', '/api/users'],
      ['POST', '/api/users'],
      ['GET', '/api/users/5f3d1c2e-8a0b-4c6e-9d3a-1b2c3d4e5f60'],
      ['PATCH', '/api/users/5f3d1c2e-8a0b-4c6e-9d3a-1b2c3d4e5f60'],
      ['DELETE', '/api/users/5f3d1c2e-8a0b-4c6e-9d3a-1b2c3d4e5f60'],
    ])('%s %s responde 401', (method, url) => {
      const server = app.getHttpServer();
      const call = {
        GET: () => request(server).get(url),
        POST: () => request(server).post(url),
        PATCH: () => request(server).patch(url),
        DELETE: () => request(server).delete(url),
      }[method as 'GET' | 'POST' | 'PATCH' | 'DELETE'];
      return call().expect(401);
    });

    it('rechaza un token inválido', () => {
      return request(app.getHttpServer())
        .get('/api/users')
        .set('Authorization', 'Bearer abc.def.ghi')
        .expect(401);
    });
  });

  describe('CRUD de usuarios con token', () => {
    let createdUuid: string;
    const newUser = {
      firstName: 'Crud',
      lastName: 'Target',
      username: `crud_${suffix}`,
      email: `crud_${suffix}@example.com`,
      password: 'Passw0rd!123',
    };
    const auth = () => ({ Authorization: `Bearer ${token}` });

    it('POST /users crea un usuario (sin exponer la contraseña)', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/users')
        .set(auth())
        .send(newUser)
        .expect(201);
      const created = bodyOf<UserBody>(res);
      expect(created.username).toBe(newUser.username);
      expect(res.body).not.toHaveProperty('passwordHash');
      expect(res.body).not.toHaveProperty('password');
      createdUuid = created.uuid;
    });

    it('POST /users responde 409 si el username/email ya existe', () => {
      return request(app.getHttpServer())
        .post('/api/users')
        .set(auth())
        .send(newUser)
        .expect(409);
    });

    it('POST /users valida el cuerpo (400)', () => {
      return request(app.getHttpServer())
        .post('/api/users')
        .set(auth())
        .send({ ...newUser, email: 'no-es-email' })
        .expect(400);
    });

    it('GET /users devuelve lista paginada', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/users?page=1&limit=5')
        .set(auth())
        .expect(200);
      const page = bodyOf<{ data: unknown[]; meta: object }>(res);
      expect(Array.isArray(page.data)).toBe(true);
      expect(page.meta).toMatchObject({ page: 1, limit: 5 });
      expect(JSON.stringify(res.body)).not.toContain('passwordHash');
    });

    it('GET /users/:uuid devuelve el usuario', async () => {
      const res = await request(app.getHttpServer())
        .get(`/api/users/${createdUuid}`)
        .set(auth())
        .expect(200);
      expect(bodyOf<UserBody>(res).email).toBe(newUser.email);
    });

    it('GET /users/:uuid con uuid inválido responde 400', () => {
      return request(app.getHttpServer())
        .get('/api/users/no-es-uuid')
        .set(auth())
        .expect(400);
    });

    it('PATCH /users/:uuid actualiza campos', async () => {
      const res = await request(app.getHttpServer())
        .patch(`/api/users/${createdUuid}`)
        .set(auth())
        .send({ firstName: 'Editado' })
        .expect(200);
      expect(bodyOf<UserBody>(res).person.firstName).toBe('Editado');
    });

    it('PATCH /users/:uuid no permite cambiar la contraseña', () => {
      return request(app.getHttpServer())
        .patch(`/api/users/${createdUuid}`)
        .set(auth())
        .send({ password: 'OtraClave123!' })
        .expect(400);
    });

    it('DELETE /users/:uuid hace soft delete (204) y luego 404', async () => {
      await request(app.getHttpServer())
        .delete(`/api/users/${createdUuid}`)
        .set(auth())
        .expect(204);
      await request(app.getHttpServer())
        .get(`/api/users/${createdUuid}`)
        .set(auth())
        .expect(404);
    });

    it('libera username/email tras el soft delete', () => {
      return request(app.getHttpServer())
        .post('/api/users')
        .set(auth())
        .send(newUser)
        .expect(201);
    });
  });
});
