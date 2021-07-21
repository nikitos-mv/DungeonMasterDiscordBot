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
                name: 'volume',
                aliases: ['громкость'],
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
        const channel = message.channel;

        const volume = Number(this.args[0]);

        if (isNaN(volume) || volume < 0 || volume > 200)
        {
            throw new ErrorMessage(bot, channel, 'error.invalid_value');
        }

        if (bot.player.setVolume(message, volume))
        {
            await channel.send(
                bot.embedSuccess(
                    bot.t('music.volume_x', {
                        volume: volume.toString()
                    })
                )
            );
        }
    }
}