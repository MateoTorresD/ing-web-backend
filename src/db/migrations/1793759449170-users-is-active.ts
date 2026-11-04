import { MigrationInterface, QueryRunner } from "typeorm";

export class UsersIsActive1793759449170 implements MigrationInterface {
    name = 'UsersIsActive1793759449170'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."uq_users_email_active"`);
        await queryRunner.query(`DROP INDEX "public"."uq_users_username_active"`);
        await queryRunner.query(`ALTER TABLE "users" RENAME COLUMN "deleted_at" TO "is_active"`);
        await queryRunner.query(`ALTER TABLE "persons" DROP COLUMN "deleted_at"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "is_active"`);
        await queryRunner.query(`ALTER TABLE "users" ADD "is_active" boolean NOT NULL DEFAULT true`);
        await queryRunner.query(`CREATE UNIQUE INDEX "uq_users_email" ON "users"  ("email") `);
        await queryRunner.query(`CREATE UNIQUE INDEX "uq_users_username" ON "users"  ("username") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."uq_users_username"`);
        await queryRunner.query(`DROP INDEX "public"."uq_users_email"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "is_active"`);
        await queryRunner.query(`ALTER TABLE "users" ADD "is_active" TIMESTAMP WITH TIME ZONE`);
        await queryRunner.query(`ALTER TABLE "persons" ADD "deleted_at" TIMESTAMP WITH TIME ZONE`);
        await queryRunner.query(`ALTER TABLE "users" RENAME COLUMN "is_active" TO "deleted_at"`);
        await queryRunner.query(`CREATE UNIQUE INDEX "uq_users_username_active" ON "users" USING btree ("username") WHERE (deleted_at IS NULL)`);
        await queryRunner.query(`CREATE UNIQUE INDEX "uq_users_email_active" ON "users" USING btree ("email") WHERE (deleted_at IS NULL)`);
    }

}
