import { MigrationInterface, QueryRunner } from 'typeorm';

export class SeedRoles1793762466834 implements MigrationInterface {
  name = 'SeedRoles1793762466834';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      INSERT INTO "roles" ("name", "description") VALUES
        ('ADMIN',   'Gestiona usuarios, bodegas y vehículos'),
        ('PLANNER', 'Importa pedidos, ejecuta la optimización y aprueba las rutas'),
        ('DRIVER',  'Consulta y ejecuta su hoja de ruta')
      ON CONFLICT ("name") DO NOTHING
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DELETE FROM "roles" WHERE "name" IN ('ADMIN', 'PLANNER', 'DRIVER')`,
    );
  }
}
