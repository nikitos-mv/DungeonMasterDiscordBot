import {Message} from "discord.js";

import Bot from "../../bot";

import ErrorMessage from "../../errors/ErrorMessage";

module.exports = {
    name: 'noResults',
    once: true,
    async execute(bot: Bot, message: Message, query: string)
    {
        throw new ErrorMessage(bot, message.channel, 'error.player.no_results', {
            query: query
        })
    }
};