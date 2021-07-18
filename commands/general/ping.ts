import AbstractCommand from "../../base/AbstractCommand";

import * as Discord from "discord.js";

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
        const message = this.message;

        const ping = Date.now() - message.createdTimestamp;
        const apiPing = Math.round(this.bot.ws.ping);

        const embed = new Discord.MessageEmbed()
            .setColor(this.bot.config.colors.default)
            .setTitle(this.bot.t('ping.pong'))
            .addFields(
                {
                    name: this.bot.t('ping.ping'),
                    value: this.bot.t('x_ms', {
                        ms: ping
                    }),
                    inline: true
                },
                {
                    name: this.bot.t('ping.api_ping'),
                    value: this.bot.t('x_ms', {
                        ms: apiPing
                    }),
                    inline: true
                }
            );

        return await message.channel.send(embed);
    }
}