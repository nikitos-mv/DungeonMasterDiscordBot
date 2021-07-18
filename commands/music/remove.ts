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
                name: 'remove',
                aliases: ['удалить'],
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

        const trackId = parseInt(this.args[0])-1;

        const track = bot.player.remove(message, trackId);
        if (track)
        {
            return message.channel.send(
                bot.embedSuccess(
                    bot.t('music.x_removed_from_queue', {
                        title: track.title,
                        author: track.author,
                        url: track.url
                    })
                )
            );
        }
    }
}