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
                name: 'info',
                aliases: ['инфо', 'информация'],
                group: 'general'
            }
        );
    }

    async execute()
    {
        const bot = this.bot;

        let developers = [];
        for (const developer in bot.DEVELOPERS)
        {
            const link = bot.DEVELOPERS[developer];

            if (link)
            {
                developers.push(`[${developer}](${link})`);
            }
            else
            {
                developers.push(`${developer}`);
            }
        }

        let donate = [];
        for (const donateLink in bot.DONATE_LINKS)
        {
            donate.push(`[${donateLink}](${bot.DONATE_LINKS[donateLink]})`);
        }

        const embed = new Discord.MessageEmbed()
            .setColor(bot.config.colors.default)
            .setTitle(`${bot.user.username} | ${bot.VERSION}`)
            .setDescription(bot.t('info.description'))
            .addFields(
                {
                    name: bot.t('info.developers'),
                    value: developers.join('\n'),
                    inline: true
                },
                {
                    name: bot.t('info.donate'),
                    value: donate.join(' | '),
                    inline: true
                },
                {
                    name: bot.t('info.thanks'),
                    value: bot.THANKS.join('\n')
                }
            );

        return await this.message.channel.send(embed);
    }
}