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
                name: 'info',
                aliases: ['инфо', 'информация'],
                group: 'general'
            }
        );
    }

    async execute()
    {
        const bot = this.bot;

        const fields = [];

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

        if (developers.length)
        {
            fields.push({
                name: bot.t('info.developers'),
                value: developers.join('\n'),
                inline: true
            });
        }

        const donate = [];
        for (const donateLink in bot.DONATE_LINKS)
        {
            donate.push(`[${donateLink}](${bot.DONATE_LINKS[donateLink]})`);
        }

        if (donate.length)
        {
            fields.push({
                name: bot.t('info.donate'),
                value: donate.join(' | '),
                inline: true
            });
        }

        if (bot.THANKS.length)
        {
            fields.push({
                name: bot.t('info.thanks'),
                value: bot.THANKS.join('\n')
            });
        }

        let totalMembers = 0;
        for (const guild of bot.guilds.cache)
        {
            totalMembers += (await guild[1].members.fetch()).size;
        }

        fields.push(
            {
                name: bot.t('info.servers'),
                value: bot.guilds.cache.size,
                inline: true
            },
            {
                name: '\u200b',
                value: '\u200b',
                inline: true,
            },
            {
                name: bot.t('info.members'),
                value: totalMembers,
                inline: true
            },
            {
                name: bot.t('info.uptime'),
                value: bot.t('time.x_hours_short', {
                    hours: (process.uptime() / 3600).toFixed(2)
                }),
                inline: true
            },
            {
                name: '\u200b',
                value: '\u200b',
                inline: true,
            },
            {
                name: bot.t('info.ram_usage'),
                value: bot.t('info_units.x_mb', {
                    mb: (process.memoryUsage().rss / 1024 / 1024).toFixed(2)
                }),
                inline: true
            }
        );

        const embed = new MessageEmbed()
            .setColor(bot.config.colors.default)
            .setTitle(`${bot.user.username} | ${bot.VERSION}`)
            .setDescription(bot.t('info.description'))
            .addFields(fields);

        return await this.message.channel.send(embed);
    }
}