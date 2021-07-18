import AbstractCommand from "../../base/AbstractCommand";

import Bot from "../../bot";

import CommandInfo from "../../types/CommandInfo";
import {MessageEmbed} from "discord.js";
import ErrorMessage from "../../errors/ErrorMessage";

module.exports = class extends AbstractCommand
{
    constructor(bot: Bot)
    {
        super(
            bot,
            <CommandInfo>{
                name: 'nowplaying',
                aliases: ['now-playing', 'сейчасиграет', 'сейчас-играет'],
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

        if (!player.isPlaying(message))
        {
            throw new ErrorMessage(bot, channel, 'error.player.not_playing');
        }

        const track = player.nowPlaying(message);

        const embed = new MessageEmbed()
            .setColor(config.colors.default)
            .setTitle(`${track.title} | ${track.author}`)
            .setDescription(player.createProgressBar(message, config.playerProgressBar))
            .setFooter(
                `${bot.t('music.added_by_x', {
                    member: track.requestedBy.tag
                })}`,
                track.requestedBy.avatarURL()
            );

        await channel.send(embed);
    }
}