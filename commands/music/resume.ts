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
                name: 'resume',
                aliases: ['продолжить'],
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

        // Bug: https://discord-player.js.org/docs/main/master/faq/pause_resume
        if (
            player.resume(message)
            && player.pause(message)
            && player.resume(message)
        )
        {
            await message.channel.send(
                bot.embedSuccess(
                    bot.t('music.playback_resumed')
                )
            );
        }
    }
}