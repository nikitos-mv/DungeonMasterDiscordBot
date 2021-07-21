import AbstractCommand from "../../base/AbstractCommand";

import {MessageEmbed} from "discord.js";
import {FieldsEmbed} from "discord-paginationembed";

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
                name: 'queue',
                aliases: ['очередь'],
                group: 'music',
                guildOnly: true,
                botPermissions: ['CONNECT', 'SPEAK']
            }
        );
    }

    async execute()
    {
        const bot = this.bot;
        const config = bot.config;
        const player = bot.player;
        const message = this.message;
        const channel = message.channel;

        const queue = player.getQueue(message);

        if (!queue)
        {
            throw new ErrorMessage(bot, channel, 'error.player.queue_is_null');
        }

        const tracks = queue.tracks.map((track, index) => {
            const mTrack = {...track};
            mTrack['_index'] = index;

            return mTrack;
        })

        if (tracks.length === 1)
        {
            const embed = new MessageEmbed()
                .setColor(config.colors.default)
                .setTitle(`${tracks[0].title} | ${tracks[0].author}`)
                .setDescription(player.createProgressBar(message, config.playerProgressBar))
                .setFooter(
                    `${bot.t('music.added_by_x', {
                        member: tracks[0].requestedBy.tag
                    })}`,
                    tracks[0].requestedBy.avatarURL()
                );

            await channel.send(embed);

            return;
        }

        const fieldsEmbed = new FieldsEmbed();

        fieldsEmbed.embed
            .setColor(config.colors.default)
            .setTitle(bot.t('music.queue'))
            .addField(
                bot.t('music.now_playing_x_raw', {
                    title: tracks[0].title,
                    author: tracks[0].author
                }),
                `${player.createProgressBar(message, config.playerProgressBar)}\n
                ${bot.t('music.added_by_x', {
                    member: tracks[0].requestedBy.tag
                })}`
            );

        fieldsEmbed
            .setClientAssets({
                prompt: bot.t('pagination.prompt', {
                    user: '{{user}}'
                })
            })
            .setAuthorizedUsers([message.author.id])
            // @ts-ignore
            .setChannel(channel)
            .setElementsPerPage(config.playerQueue.perPage)
            .setPageIndicator(true, 'textcompact')
            .setArray(tracks[1] ? tracks.slice(1, tracks.length) : [])
            .formatField(
                bot.t('music.total_queue_x', {
                    total: tracks.length
                }),
                // @ts-ignore
                track => `${track._index + 1}. [${track.title} | ${track.author}](${track.url})`
            );

        await fieldsEmbed.build();
    }
}