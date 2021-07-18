export default interface CommandInfo
{
    name: string;
    aliases?: string[];
    group: string;

    developmentOnly?: boolean;
    guildOnly?: boolean;
    dmOnly?: boolean;
    ownerOnly?: boolean;

    userPermissions?: string[];
    botPermissions?: string[];

    sudoOnly?: boolean;

    hidden?: boolean;

    cooldown?: number;

    commandOptions?: string[];
    requiredOptions?: string[];
}