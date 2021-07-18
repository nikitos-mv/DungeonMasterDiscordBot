import {Collection, Message} from "discord.js";

import Bot from "../bot";

import GuildOptionHelper from "./GuildOptionHelper";

export default class CommandParser
{
    protected bot: Bot;
    protected message: Message;

    public constructor(bot: Bot, message: Message)
    {
        this.bot = bot;
        this.message = message;
    }

    public async parse()
    {
        const message = this.message;
        const content = message.content;

        const guildOptionHelper = new GuildOptionHelper(this.bot, message.guild);
        const prefix = await guildOptionHelper.get('prefix');

        if (!content.startsWith(prefix))
        {
            return;
        }

        const match = content.match(
            new RegExp(`^\\${prefix}((?<sudo>sudo) )?(?<command>\\S+) ?(?<other>.*)?`, 's')
        );

        if (!match)
        {
            return;
        }

        const args = [];
        const options: Collection<string, any> = new Collection();

        let other = match.groups.other?.trim();
        if (other)
        {
            const optionsMatch = Array.from(
                other.matchAll(
                    new RegExp(` ?--(?<name>[\\w+_-]+)(?:=(?<value>(?:"(?:\\\\.|[^\\\\"])*"|\\S+)))?`, 'gs')
                )
            );

            if (optionsMatch)
            {
                for (const option of optionsMatch)
                {
                    options.set(
                        option.groups.name.toLowerCase(),
                        option.groups.value?.replaceAll(new RegExp(`(^"|"$)`, 'g'), '')
                            .replaceAll('\\"', '"')
                        || true
                    );

                    other = other.replace(new RegExp(`${option[0]}( |$)`, 'g'), ' ');
                }
            }

            if (other.length)
            {
                Array.prototype.push
                    .apply(args, other.trim().split(/ +/));
            }
        }

        return {
            commandName: match.groups.command.toLowerCase(),
            args: args,
            options: options,
            sudo: !!match.groups.sudo
        };
    }
}