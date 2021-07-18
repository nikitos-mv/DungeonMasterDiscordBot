import * as Discord from "discord.js";

import AbstractCommand from "../../base/AbstractCommand";

import Bot from "../../bot";
import CommandInfo from "../../types/CommandInfo";
import ErrorMessage from "../../errors/ErrorMessage";

module.exports = class extends AbstractCommand
{
    constructor(bot: Bot)
    {
        super(
            bot,
            <CommandInfo>{
                name: 'saydel',
                aliases: ['скажи-и-удали', 'скажииудали'],
                group: 'fun',
                commandOptions: ['content', 'channel']
            }
        );
    }

    async execute()
    {
        const bot = this.bot;
        const message = this.message;
        const options = this.options;

        await message.delete();

        const content = String(options.get('content') || this.args.join(' '));

        if (!content)
        {
            throw new ErrorMessage(bot, message.channel, 'error.invalid_content');
        }

        const channelId = options.get('channel');
        if (typeof channelId === 'string')
        {
            const channelMatch = (channelId || "").match(Discord.MessageMentions.CHANNELS_PATTERN);
            if (!channelMatch)
            {
                throw new ErrorMessage(bot, message.channel, 'error.invalid_channel');
            }

            const channel = await message.guild.channels.cache
                .get(<Discord.Snowflake>channelMatch[0]
                    .replace(/\D/g,''));
            if (
                !channel
                || !channel.isText()
                || !channel.permissionsFor(message.author)
                    .has('SEND_MESSAGES')
            )
            {
                throw new ErrorMessage(bot, message.channel, 'error.no_permissions');
            }

            if (
                !channel.permissionsFor(message.guild.me)
                    .has('VIEW_CHANNEL')
                || !channel.permissionsFor(message.guild.me)
                    .has('SEND_MESSAGES')
            )
            {
                if (
                    !channel.permissionsFor(message.guild.me)
                        .has('VIEW_CHANNEL')
                    || !channel.permissionsFor(message.guild.me)
                        .has('SEND_MESSAGES')
                )
                {
                    throw new ErrorMessage(bot, message.channel, 'error.no_bot_permissions_to_execute_command_x', {
                        command: this.name
                    });
                }
            }

            return await channel.send(content);
        }

        return await message.channel.send(content);
    }
}