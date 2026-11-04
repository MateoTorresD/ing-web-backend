import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { BaseAuditEntity } from '../../common/entities/base-audit.entity';
import { RefreshToken } from '../../auth/entities/refresh-token.entity';
import { Person } from '../../persons/entities/person.entity';
import { Role } from '../../roles/entities/role.entity';

@Entity({ name: 'users' })
@Index('uq_users_username', ['username'], { unique: true })
@Index('uq_users_email', ['email'], { unique: true })
export class User extends BaseAuditEntity {
  @PrimaryGeneratedColumn('uuid')
  uuid: string;

  @OneToOne(() => Person, (person) => person.user, {
    nullable: false,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'person_uuid' })
  person: Person;

  @Column({ name: 'person_uuid', type: 'uuid' })
  personUuid: string;

  @ManyToOne(() => Role, { nullable: false, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'role_uuid' })
  role: Role;

  @Index()
  @Column({ name: 'role_uuid', type: 'uuid' })
  roleUuid: string;

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

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @OneToMany(() => RefreshToken, (token) => token.user)
  refreshTokens?: RefreshToken[];
}
