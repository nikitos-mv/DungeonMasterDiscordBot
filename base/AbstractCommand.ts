import {Collection, DMChannel, Message, PermissionResolvable, Permissions} from "discord.js";

import Bot from "../bot";

import CommandInfo from "../types/CommandInfo";
import ErrorMessage from "../errors/ErrorMessage";
import GuildOptionHelper from "../helpers/GuildOptionHelper";

export default abstract class AbstractCommand
{
    protected readonly bot: Bot;

    public readonly name: string;
    public readonly aliases?: string[];
    public readonly group: string;

    public readonly developmentOnly: boolean;
    public readonly guildOnly: boolean;
    public readonly dmOnly: boolean;
    public readonly ownerOnly: boolean;

    public readonly sudoOnly: boolean;

    public readonly userPermissions?: string[];
    public readonly botPermissions?: string[];

    public readonly hidden: boolean;

    public readonly cooldown?: number;

    public readonly commandOptions?: string[];
    public readonly requiredOptions?: string[];

    protected message: Message;
    protected args: string[];
    protected options: Collection<string, null|string|boolean>;
    protected sudo: boolean;

    protected constructor(
        bot: Bot,
        info: CommandInfo
    )
    {
        this.bot = bot;

        this.validateInfo(info);

        this.name = info.name;
        this.aliases = info.aliases || [];
        this.group = info.group;

        this.developmentOnly = Boolean(info.developmentOnly);
        this.guildOnly = Boolean(info.guildOnly);
        this.dmOnly = Boolean(info.dmOnly);
        this.ownerOnly = Boolean(info.ownerOnly);

        this.userPermissions = info.userPermissions || [];
        this.botPermissions = (info.botPermissions || [])
            .concat(['SEND_MESSAGES', 'EMBED_LINKS']);

        this.sudoOnly = Boolean(info.sudoOnly);

        this.hidden = Boolean(info.hidden);

        this.cooldown = info.cooldown;

        this.commandOptions = info.commandOptions || [];
        this.requiredOptions = info.requiredOptions || [];
        for (const requiredOption of this.requiredOptions)
        {
            if (!(Object.keys(this.commandOptions).includes(requiredOption)))
            {
                this.commandOptions[requiredOption] = null;
            }
        }
    }

    public setup(
        message: Message,
        args: string[] = [],
        options: Collection<string, any> = new Collection(),
        sudo: boolean = false
    )
    {
        const bot = this.bot;
        const commandOptions = this.commandOptions;

        const missingOptions = [];
        for (const requiredOption of this.requiredOptions)
        {
            if (!options.has(requiredOption))
            {
                missingOptions.push(requiredOption);
            }
        }
        if (missingOptions.length)
        {
            throw new ErrorMessage(bot, message.channel, 'error.missing_options_x', {
                options: missingOptions.join(', ')
            });
        }

        for (const option of options.keys())
        {
            if (!commandOptions.includes(option))
            {
                options.delete(option);
            }
        }

        this.message = message;
        this.args = args;
        this.options = options;
        this.sudo = sudo;
    }

    public abstract execute();

    public async assertCanExecute()
    {
        const bot = this.bot;
        const message = this.message;
        const channel = message.channel;

        const cooldown = await (new GuildOptionHelper(bot, message.guild)).get('cooldown');
        const cooldownAmount = (this.cooldown !== undefined ? this.cooldown : cooldown) * 1000;
        if (cooldownAmount)
        {
            if (!bot.cooldowns.has(this.name))
            {
                bot.cooldowns.set(this.name, new Collection());
            }

            const now = Date.now();
            const timestamps = bot.cooldowns.get(this.name);

            if (timestamps.has(message.author.id))
            {
                const expirationTime = timestamps.get(message.author.id) + cooldownAmount;

                if (now < expirationTime)
                {
                    const timeLeft = (expirationTime - now) / 1000;

                    throw new ErrorMessage(bot, channel, 'error.cooldown', {
                        time: timeLeft.toFixed(2),
                        command: this.name
                    })
                }
            }

            timestamps.set(message.author.id, now);

            setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);
        }

        if (this.developmentOnly && !bot.config.developmentMode)
        {
            throw new ErrorMessage(bot, channel, 'error.command_only_available_in_development_mode');
        }

        if ((this.guildOnly || this.ownerOnly) && !message.guild)
        {
            throw new ErrorMessage(bot, channel, 'error.command_only_available_in_guild');
        }

        if (this.dmOnly && message.guild)
        {
            throw new ErrorMessage(bot, channel, 'error.command_only_available_in_dm');
        }

        if (message.guild)
        {
            this.assertBotHasPermissions();
            this.assertUserHasPermissions();
        }
    }

    public assertBotHasPermissions()
    {
        const message = this.message;
        const channel = message.channel;

        if (channel instanceof DMChannel)
        {
            return;
        }

        const bot = this.bot;
        const botPermissions = channel.permissionsFor(message.guild.me);

        if (botPermissions && !botPermissions.has(<PermissionResolvable>this.botPermissions))
        {
            const errorMessage =
                `${bot.t('error.no_bot_permissions_to_execute_command_x', {
                    command: this.name
                })}\n
                **${bot.t('permission.required_permissions')}**
                ${this.botPermissions.map(function(permission) 
                {
                    return bot.t(`permission.${permission}`);
                }).join('\n')}`;

            if (botPermissions.has(['SEND_MESSAGES', 'EMBED_LINKS']))
            {
                throw new ErrorMessage(bot, channel, errorMessage);
            }
            else
            {
                throw new ErrorMessage(bot, message.author, errorMessage);
            }
        }
    }

    public assertUserHasPermissions()
    {
        const bot = this.bot;
        const message = this.message;
        const channel = message.channel;

        if (this.sudo && !bot.SUDOERS.includes(Number(message.author.id)))
        {
            throw new ErrorMessage(bot, channel, 'error.not_in_sudoers');
        }

        if ((this.sudoOnly && !this.sudo))
        {
            throw new ErrorMessage(bot, channel, 'error.no_user_permissions_to_execute_command_x', {
                command: this.name
            });
        }

        if (this.sudo)
        {
            return;
        }

        if (channel instanceof DMChannel)
        {
            return;
        }

        if (this.ownerOnly && message.member.id !== message.guild.owner.id)
        {
            throw new ErrorMessage(bot, channel, 'error.command_only_available_to_owner');
        }

        const userPermissions = channel.permissionsFor(message.author);

        if (userPermissions && !userPermissions.has(<PermissionResolvable>this.userPermissions))
        {
            const errorMessage =
                `${bot.t('error.no_user_permissions_to_execute_command_x', {
                    command: this.name
                })}\n
                **${bot.t('permission.required_permissions')}**
                ${this.userPermissions.map(function(permission)
                {
                    return bot.t(`permission.${permission}`);
                }).join('\n')}`;

                throw new ErrorMessage(bot, channel, errorMessage);
        }
    }

    public validateInfo(info)
    {
        const errors = [];

        if (!this.bot) errors.push('A client must be specified');
        if (typeof info !== 'object') errors.push('Command info must be an Object');

        if (errors.length)
        {
            throw new TypeError(`The command info contains the following errors: ${errors.join(', ')}.`);
        }

        if (typeof info.name !== 'string') errors.push('Command name must be a string');
        if (typeof info.group !== 'string') errors.push('Command group must be a string');
        if (info.aliases && (!Array.isArray(info.aliases) || info.aliases.some(alias => typeof alias !== 'string')))
        {
            errors.push('Command aliases must be an array of strings');
        }
        if (info.userPermissions)
        {
            if (!Array.isArray(info.userPermissions))
            {
                errors.push('Command userPermissions must be an Array of permission key strings');
            }
            else
            {
                for (const permission of info.userPermissions)
                {
                    if (!(permission in Permissions.FLAGS)) errors.push(`Invalid command userPermission: ${permission}`);
                }
            }
        }
        if (info.botPermissions)
        {
            if (!Array.isArray(info.botPermissions))
            {
                errors.push('Command botPermissions must be an Array of permission key strings');
            }
            else
            {
                for (const permission of info.botPermissions)
                {
                    if (!(permission in Permissions.FLAGS)) errors.push(`Invalid command botPermissions: ${permission}`);
                }
            }
        }
        if (info.cooldown && typeof info.cooldown !== 'number') errors.push('Command cooldown must be a number');

        if (info.commandFlags)
        {
            if (!Array.isArray(info.commandFlags))
            {
                errors.push('Command commandFlags must be an Array of strings');
            }
        }
        if (info.requiredFlags)
        {
            if (!Array.isArray(info.requiredFlags))
            {
                errors.push('Command requiredFlags must be an Array of strings');
            }
        }

        if (errors.length)
        {
            throw new TypeError(`The command info contains the following errors: ${errors.join(', ')}.`);
        }
    }
}