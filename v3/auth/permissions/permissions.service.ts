import { AbilityBuilder, createMongoAbility, MongoAbility, MongoQuery } from '@casl/ability';

import { UnauthorizedException } from '@/errors';

import { EAuthRole, EPermissionAction, EPermissionSubject, TMongoAbility } from '../types/permissions';

import permissions from './permissions.config';

export class PermissionsService {
  private ability?: MongoAbility;

  private can: (action: EPermissionAction, subject: EPermissionSubject) => void;
  private build: () => MongoAbility;

  private role: EAuthRole | null = null;

  constructor(role: EAuthRole) {
    const { can, build } = new AbilityBuilder(createMongoAbility<TMongoAbility, MongoQuery>);
    this.can = can;
    this.build = build;

    this.defineAbilitiesForRole(role);
  }

  public defineAbilitiesForRole(role: EAuthRole) {
    this.reset();
    this.role = role;
    this.addPermissionsForRole(role);

    this.ability = this.build();
    return this.ability;
  }

  public getRole() {
    return this.role;
  }

  public checkCan(action: EPermissionAction, subject: EPermissionSubject) {
    return this.ability?.can(action, subject) ?? false;
  }

  public checkCanOrThrow(action: EPermissionAction, subject: EPermissionSubject) {
    const allowed = this.checkCan(action, subject);
    if (!allowed) throw new UnauthorizedException();
    return allowed;
  }

  private addPermissionsForRole(role: EAuthRole) {
    const rolePermissions = permissions[role];

    let subject: EPermissionSubject;
    for (subject in rolePermissions) {
      const actions = rolePermissions[subject];
      if (!actions) continue;

      let action: EPermissionAction;
      for (action in actions) {
        if (!actions[action]) continue;
        this.can(action, subject);
      }
    }
  }

  private reset() {
    const { can, build } = new AbilityBuilder(createMongoAbility<TMongoAbility, MongoQuery>);
    this.can = can;
    this.build = build;
    this.ability = undefined;
    this.role = null;
  }
}
