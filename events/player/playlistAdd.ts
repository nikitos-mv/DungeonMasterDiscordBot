import {Message} from "discord.js";

import Bot from "../../bot";

import {Queue} from "discord-player";


module.exports = {
    name: 'playlistAdd',
    once: true,
    async execute(bot: Bot, message: Message, queue: Queue, playlist)
    {
        await message.channel.send(
            bot.embedMessage(
                bot.t('music.playlist_x_added_to_queue', {
                    title: playlist.title,
                    channel: playlist.channel.name,
                    url: playlist.url
                })
            )
        );
    }
};