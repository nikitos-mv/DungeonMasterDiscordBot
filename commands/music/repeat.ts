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
                name: 'repeat',
                aliases: ['повтор', 'репит'],
                group: 'music',
                guildOnly: true,
                botPermissions: ['CONNECT', 'SPEAK'],
                commandOptions: ['enable', 'disable']
            }
        );
    }

    async execute()
    {
        const bot = this.bot;
        const player = bot.player;
        const message = this.message;
        const channel = message.channel;
        const args = this.args;
        const options = this.options;

        if (!player.isPlaying(message))
        {
            throw new ErrorMessage(bot, channel, 'error.player.not_playing');
        }

        const enabled = args[0].length ? args[0] !== '0' : options.has('enable') || !options.has('disable');

        bot.player.setRepeatMode(message, enabled);

        if (enabled)
        {
            await channel.send(
                bot.embedSuccess(
                    bot.t('music.repeat_enabled')
                )
            );
        }
        else
        {
            await channel.send(
                bot.embedSuccess(
                    bot.t('music.repeat_disabled')
                )
            );
        }
    }
}