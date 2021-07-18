import {Message} from "discord.js";

import Bot from "../../bot";

import {Queue, Track} from "discord-player";


module.exports = {
    name: 'trackStart',
    once: true,
    async execute(bot: Bot, message: Message, track: Track, queue: Queue)
    {
        await message.channel.send(
            bot.embedMessage(
                bot.t('music.now_playing_x', {
                    title: track.title,
                    author: track.author,
                    url: track.url
                })
            )
        );
    }
};