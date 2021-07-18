import AbstractCommand from "../../base/AbstractCommand";

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
                name: 'play',
                aliases: ['плей'],
                group: 'music',
                guildOnly: true,
                botPermissions: ['CONNECT', 'SPEAK']
            }
        );
    }

    async execute()
    {
        const bot = this.bot;
        const message = this.message;

        const query = this.args.join(' ');

        if (!query.length)
        {
            throw new ErrorMessage(bot, message.channel, 'error.player.empty_query')
        }

        await this.bot.player.play(this.message, query, true);
    }
}