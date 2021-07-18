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
                name: 'clearqueue',
                aliases: ['clear-queue', 'очиститьочередь', 'очистить-очередь'],
                group: 'music',
                guildOnly: true,
                botPermissions: ['CONNECT', 'SPEAK']
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

        if (player.clearQueue(message))
        {
            await channel.send(
                bot.embedSuccess(
                    bot.t('music.queue_was_cleared')
                )
            );
        }
    }
}