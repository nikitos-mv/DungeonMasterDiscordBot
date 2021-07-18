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
                name: 'shuffle',
                aliases: ['перемешать'],
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

        if (bot.player.shuffle(message))
        {
            await message.channel.send(
                bot.embedSuccess(
                    bot.t('music.queue_was_shuffled')
                )
            );
        }
    }
}