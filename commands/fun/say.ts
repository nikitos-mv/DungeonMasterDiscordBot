import AbstractCommand from "../../base/AbstractCommand";

import {MessageMentions, Snowflake} from "discord.js";

import Bot from "../../bot";
import CommandInfo from "../../types/CommandInfo";
import ErrorMessage from "../../errors/ErrorMessage";

module.exports = class Say extends AbstractCommand
{
    constructor(bot: Bot)
    {
        super(
            bot,
            <CommandInfo>{
                name: 'say',
                aliases: ['скажи'],
                group: 'fun',
                commandOptions: ['content', 'channel']
            }
        );
    }

    async execute()
    {
        const bot = this.bot;
        const message = this.message;
        const channel = message.channel;
        const options = this.options;

        const content = String(options.get('content') || this.args.join(' '));

        if (!content)
        {
            throw new ErrorMessage(bot, channel, 'error.invalid_content');
        }

        const channelId = options.get('channel');
        if (typeof channelId === 'string')
        {
            const channelMatch = (channelId || "").match(MessageMentions.CHANNELS_PATTERN);
            if (!channelMatch)
            {
                throw new ErrorMessage(bot, channel, 'error.invalid_channel');
            }

            const targetChannel = await message.guild.channels.cache
                .get(<Snowflake>channelMatch[0]
                    .replace(/\D/g,''));
            if (
                !targetChannel
                || !targetChannel.isText()
                || !targetChannel.permissionsFor(message.author)
                    .has('SEND_MESSAGES')
            )
            {
                throw new ErrorMessage(bot, message.channel, 'error.no_permissions');
            }

            if (
                !targetChannel.permissionsFor(message.guild.me)
                    .has('VIEW_CHANNEL')
                || !targetChannel.permissionsFor(message.guild.me)
                    .has('SEND_MESSAGES')
            )
            {
                throw new ErrorMessage(bot, channel, 'error.no_bot_permissions_to_execute_command_x', {
                    command: this.name
                });
            }

            return await targetChannel.send(content);
        }

        return await channel.send(content);
    }
}