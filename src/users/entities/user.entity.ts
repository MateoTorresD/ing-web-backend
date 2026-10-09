import {
  Column,
  Entity,
  Index,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { BaseAuditEntity } from '../../common/entities/base-audit.entity';
import { RefreshToken } from '../../auth/entities/refresh-token.entity';
import { Person } from '../../persons/entities/person.entity';

@Entity({ name: 'users' })
@Index('uq_users_username_active', ['username'], {
  unique: true,
  where: '"deleted_at" IS NULL',
})
@Index('uq_users_email_active', ['email'], {
  unique: true,
  where: '"deleted_at" IS NULL',
})
export class User extends BaseAuditEntity {
  @PrimaryGeneratedColumn('uuid')
  uuid: string;

  @OneToOne(() => Person, (person) => person.user, {
    nullable: false,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'person_uuid' })
  person: Person;

  @Column({ name: 'person_uuid', type: 'uuid', unique: true })
  personUuid: string;

  @Column({ type: 'citext' })
  username: string;

  @Column({ type: 'citext' })
  email: string;

  @Column({
    name: 'password_hash',
    type: 'varchar',
    length: 255,
    select: false,
  })
  passwordHash: string;

  @OneToMany(() => RefreshToken, (token) => token.user)
  refreshTokens?: RefreshToken[];
}
