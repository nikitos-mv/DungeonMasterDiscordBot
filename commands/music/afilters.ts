import AbstractCommand from "../../base/AbstractCommand";

import Bot from "../../bot";

import CommandInfo from "../../types/CommandInfo";
import ErrorMessage from "../../errors/ErrorMessage";

const audioFilters = require('../../data/audioFilters.json');

module.exports = class extends AbstractCommand
{
    constructor(bot: Bot)
    {
        super(
            bot,
            <CommandInfo>{
                name: 'afilters',
                aliases: ['афильтры'],
                group: 'music',
                guildOnly: true,
                botPermissions: ['CONNECT', 'SPEAK'],
                commandOptions: ['disable'].concat(Object.keys(audioFilters))
            }
        );
    }

    async execute()
    {
        const bot = this.bot;
        const player = bot.player;
        const message = this.message;
        const channel = message.channel;

        if (!player.isPlaying(message))
        {
            throw new ErrorMessage(bot, channel, 'error.player.not_playing');
        }

        const options = this.options;

        if (!options.size)
        {
            const currentFilters = player
                .getQueue(message)
                .getFiltersEnabled();

            if (!currentFilters.length)
            {
                await channel.send(
                    bot.embedMessage(
                        bot.t('music.no_filters')
                    )
                );

                return;
            }

            await channel.send(
                bot.embedMessage(
                    bot.t('music.current_filters_x', {
                        filters: currentFilters
                            .map(filter => audioFilters[filter])
                            .join(', ')
                    })
                )
            );

            return;
        }

        if (options.has('disable'))
        {
            const disabledFilters = {};

            for (const filter of Object.keys(audioFilters))
            {
                disabledFilters[filter] = false;
            }

            await player.setFilters(message, disabledFilters);
            await channel.send(
                bot.embedSuccess(
                    bot.t('music.all_filters_disabled')
                )
            );

            return;
        }

        const filters = {};

        for (const option of options.keys())
        {
            const filterToUpdate = Object.keys(audioFilters)
                .find(filter => filter.toLowerCase() === option.toLowerCase())

            if (!filterToUpdate)
            {
                continue;
            }

            filters[filterToUpdate] = options.get(option) !== '0';
        }

        if (!Object.keys(filters).length)
        {
            throw new ErrorMessage(bot, channel, 'error.player.invalid_filters');
        }

        await player.setFilters(message, filters);
        await channel.send(
            bot.embedSuccess(
                bot.t('music.following_filters_applied', {
                    filters: Object.keys(filters)
                        .map(filter => audioFilters[filter])
                        .join(', ')
                })
            )
        );
    }
}