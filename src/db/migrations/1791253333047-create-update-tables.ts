import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateUpdateTables1791253333047 implements MigrationInterface {
    name = 'CreateUpdateTables1791253333047'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "persons" ADD "middle_name" character varying(100)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "persons" DROP COLUMN "middle_name"`);
    }

}
