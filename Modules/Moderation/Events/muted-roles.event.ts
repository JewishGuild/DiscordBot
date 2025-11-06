import { Client, ClientEvents, GuildMember } from "discord.js";
import { BaseEvent } from "../../Base/Events/base.event.js";
import { RestrictionRoles } from "../Config/restriction.config.js";

class MutedRolesEvent extends BaseEvent<"guildMemberUpdate"> {
  constructor() {
    super("guildMemberUpdate", true);
  }

  public async execute(client: Client<true>, ...args: ClientEvents["guildMemberUpdate"]): Promise<void> {
    const [, newMember] = args;
    const hasMutedRole = newMember.roles.cache.has(RestrictionRoles.Muted);
    const blockedRoles = this.getNonMutedRolesIds(newMember);

    if (hasMutedRole && blockedRoles.length) {
      for (const id of blockedRoles) {
        try {
          await newMember.roles.remove(id, "Muted users cannot take self-assign roles");
        } catch {}
      }
    }
  }

  private getNonMutedRolesIds(member: GuildMember) {
    return [...member.roles.cache.keys()].filter((id) => id !== RestrictionRoles.Muted && id !== RestrictionRoles.MuteAppeal);
  }
}

export const mutedRolesEvent = new MutedRolesEvent();
