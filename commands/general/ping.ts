import AbstractCommand from "../../base/AbstractCommand";

import {MessageEmbed} from "discord.js";

import Bot from "../../bot";

import CommandInfo from "../../types/CommandInfo";

module.exports = class extends AbstractCommand
{
    constructor(bot: Bot)
    {
        super(
            bot,
            <CommandInfo>{
                name: 'ping',
                aliases: ['пинг'],
                group: 'general'
            }
        );
    }

    async execute()
    {
        const bot = this.bot;
        const message = this.message;

        const ping = Date.now() - message.createdTimestamp;
        const apiPing = Math.round(bot.ws.ping);

        const embed = new MessageEmbed()
            .setColor(bot.config.colors.default)
            .setTitle(bot.t('ping.pong'))
            .addFields(
                {
                    name: bot.t('ping.ping'),
                    value: bot.t('x_ms', {
                        ms: ping
                    }),
                    inline: true
                },
                {
                    name: bot.t('ping.api_ping'),
                    value: bot.t('x_ms', {
                        ms: apiPing
                    }),
                    inline: true
                }
            );

        return await message.channel.send(embed);
    }
}