import {Message} from "discord.js";

import Bot from "../../bot";

import {Queue, Track} from "discord-player";


module.exports = {
    name: 'trackAdd',
    once: true,
    async execute(bot: Bot, message: Message, queue: Queue, track: Track)
    {
        if (!queue.tracks.length)
        {
            return;
        }

        await message.channel.send(
            bot.embedMessage(
                bot.t('music.x_added_to_queue', {
                    title: track.title,
                    author: track.author,
                    url: track.url
                })
            )
        );
    }
};