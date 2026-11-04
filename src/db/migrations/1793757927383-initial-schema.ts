import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1793757927383 implements MigrationInterface {
  name = 'InitialSchema1793757927383';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS citext`);
    await queryRunner.query(
      `CREATE TABLE "persons" ("created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "uuid" uuid NOT NULL DEFAULT uuid_generate_v4(), "first_name" character varying(100) NOT NULL, "middle_name" character varying(100), "last_name" character varying(100) NOT NULL, CONSTRAINT "PK_df86913f6de25e60e6346dcf87a" PRIMARY KEY ("uuid"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "users" ("created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "uuid" uuid NOT NULL DEFAULT uuid_generate_v4(), "person_uuid" uuid NOT NULL, "username" citext NOT NULL, "email" citext NOT NULL, "password_hash" character varying(255) NOT NULL, CONSTRAINT "REL_a27b0700f7d618e2d2139353be" UNIQUE ("person_uuid"), CONSTRAINT "PK_951b8f1dfc94ac1d0301a14b7e1" PRIMARY KEY ("uuid"))`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "uq_users_email_active" ON "users"  ("email") WHERE "deleted_at" IS NULL`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "uq_users_username_active" ON "users"  ("username") WHERE "deleted_at" IS NULL`,
    );
    await queryRunner.query(
      `CREATE TABLE "refresh_tokens" ("uuid" uuid NOT NULL DEFAULT uuid_generate_v4(), "user_uuid" uuid NOT NULL, "token_hash" character(64) NOT NULL, "family_uuid" uuid NOT NULL, "expires_at" TIMESTAMP WITH TIME ZONE NOT NULL, "revoked_at" TIMESTAMP WITH TIME ZONE, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_fe3de112a4f7fd559c1d5795099" PRIMARY KEY ("uuid"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_3915b0c1f048695de436e49dc3" ON "refresh_tokens"  ("user_uuid") `,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_a7838d2ba25be1342091b6695f" ON "refresh_tokens"  ("token_hash") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_b8f6336742d0f081e2a55e0f94" ON "refresh_tokens"  ("family_uuid") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_ba3bd69c8ad1e799c0256e9e50" ON "refresh_tokens"  ("expires_at") `,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ADD CONSTRAINT "FK_a27b0700f7d618e2d2139353be5" FOREIGN KEY ("person_uuid") REFERENCES "persons"("uuid") ON DELETE RESTRICT ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "refresh_tokens" ADD CONSTRAINT "FK_3915b0c1f048695de436e49dc33" FOREIGN KEY ("user_uuid") REFERENCES "users"("uuid") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "refresh_tokens" DROP CONSTRAINT "FK_3915b0c1f048695de436e49dc33"`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" DROP CONSTRAINT "FK_a27b0700f7d618e2d2139353be5"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_ba3bd69c8ad1e799c0256e9e50"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_b8f6336742d0f081e2a55e0f94"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_a7838d2ba25be1342091b6695f"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_3915b0c1f048695de436e49dc3"`,
    );
    await queryRunner.query(`DROP TABLE "refresh_tokens"`);
    await queryRunner.query(`DROP INDEX "public"."uq_users_username_active"`);
    await queryRunner.query(`DROP INDEX "public"."uq_users_email_active"`);
    await queryRunner.query(`DROP TABLE "users"`);
    await queryRunner.query(`DROP TABLE "persons"`);
  }
}
