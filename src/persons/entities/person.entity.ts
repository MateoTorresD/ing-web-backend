import { BaseAuditEntity } from '../../common/entities/base-audit.entity';
import { User } from '../../users/entities/user.entity';
import { Column, Entity, OneToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'persons' })
export class Person extends BaseAuditEntity {
  @PrimaryGeneratedColumn('uuid')
  uuid: string;

  @Column({ name: 'first_name', type: 'varchar', length: 100 })
  firstName: string;

  @Column({ name: 'middle_name', type: 'varchar', length: 100, nullable: true })
  middleName: string | null;

  @Column({ name: 'last_name', type: 'varchar', length: 100 })
  lastName: string;

  @OneToOne(() => User, (user) => user.person)
  user?: User;
}
