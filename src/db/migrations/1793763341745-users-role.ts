import { MigrationInterface, QueryRunner } from "typeorm";

export class UsersRole1793763341745 implements MigrationInterface {
    name = 'UsersRole1793763341745'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ADD "role_uuid" uuid NOT NULL`);
        await queryRunner.query(`CREATE INDEX "IDX_b925bcec35ac48b9393685253d" ON "users"  ("role_uuid") `);
        await queryRunner.query(`ALTER TABLE "users" ADD CONSTRAINT "FK_b925bcec35ac48b9393685253d6" FOREIGN KEY ("role_uuid") REFERENCES "roles"("uuid") ON DELETE RESTRICT ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT "FK_b925bcec35ac48b9393685253d6"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_b925bcec35ac48b9393685253d"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "role_uuid"`);
    }

}
