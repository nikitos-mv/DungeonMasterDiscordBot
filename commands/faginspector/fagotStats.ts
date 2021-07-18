import AbstractCommand from "../../base/AbstractCommand";

import Bot from "../../bot";

import CommandInfo from "../../types/CommandInfo";
import Fag from "../../models/Fag";
import ErrorMessage from "../../errors/ErrorMessage";
import {FieldsEmbed} from "discord-paginationembed";

module.exports = class extends AbstractCommand
{
    constructor(bot: Bot)
    {
        super(
            bot,
            <CommandInfo>{
                name: 'fagotstats',
                aliases: ['fagot-stats', 'статистикапидоров', 'статистика-пидоров'],
                group: 'faginspector',
                guildOnly: true,
                commandOptions: ['month', 'year']
            }
        );
    }

    async execute()
    {
        const bot = this.bot;
        const message = this.message;
        const channel = message.channel;
        const guild = message.guild;
        const options = this.options;

        const fieldsEmbed = new FieldsEmbed();

        fieldsEmbed.embed.setColor(bot.config.colors.default);

        const fagotStatsFields = [];
        let fagots: Fag[];

        if (options.has('month'))
        {
            const now = new Date().getTime();
            fagots = await Fag.getFagotsForGuildStatsInRange(guild, (now - 2592000000), now);

            fieldsEmbed.embed
                .setTitle(bot.t('fagots.stats_title.month'))
                .setDescription(bot.t('fagots.stats_description.month'));
        }
        else if (options.has('year'))
        {
            const now = new Date().getTime();
            fagots = await Fag.getFagotsForGuildStatsInRange(guild, (now - 31536000000), now);

            fieldsEmbed.embed
                .setTitle(bot.t('fagots.stats_title.year'))
                .setDescription(bot.t('fagots.stats_description.year'));
        }
        else
        {
            fagots = await Fag.getFagotsForGuildStats(guild);

            fieldsEmbed.embed
                .setTitle(bot.t('fagots.stats_title.all_time'))
                .setDescription(bot.t('fagots.stats_description.all_time'));
        }

        if (!fagots.length)
        {
            throw new ErrorMessage(bot, channel, 'error.not_found');
        }

        for (const fag of fagots)
        {
            const member = guild.members.cache.get(fag.user_id);

            if (!member)
            {
                continue;
            }

            fagotStatsFields.push({
                member: member.toString(),
                count: fag.getDataValue('count')
            });
        }

        fieldsEmbed
            .setClientAssets({
                prompt: bot.t('pagination.prompt', {
                    user: '{{user}}'
                })
            })
            .setAuthorizedUsers([message.author.id])
            // @ts-ignore
            .setChannel(channel)
            .setElementsPerPage(bot.config.fagots.perPage)
            .setPageIndicator(true, 'circle')
            .setArray(fagotStatsFields)
            .formatField(bot.t('fagots.chat_is_proud_of_them'), entry => bot.t('fagots.x_was_fag_y_times', {
                // @ts-ignore
                member: entry.member,
                // @ts-ignore
                count: entry.count
            }));

        await fieldsEmbed.build();
    }
}