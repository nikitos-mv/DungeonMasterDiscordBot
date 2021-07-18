import AbstractCommand from "../../base/AbstractCommand";

import Bot from "../../bot";

import CommandInfo from "../../types/CommandInfo";

module.exports = class extends AbstractCommand
{
    constructor(bot: Bot)
    {
        super(
            bot,
            <CommandInfo>{
                name: 'stop',
                aliases: ['стоп'],
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

        if (bot.player.stop(message))
        {
            await message.channel.send(
                bot.embedSuccess(
                    bot.t('music.queue_was_cleared')
                )
            );
        }
    }
}