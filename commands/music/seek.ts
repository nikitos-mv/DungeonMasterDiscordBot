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
                name: 'seek',
                aliases: ['перейти'],
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

        const track = player.nowPlaying(message);

        const timecode = this.args[0];
        const specifiedTime = this.timeToMilliseconds(timecode);
        const timeEnd = track.durationMS;

        const regex = /^(\d+)(:\d+)*$/;
        const isValid = regex.test(timecode);

        if (!isValid || specifiedTime > timeEnd)
        {
            throw new ErrorMessage(bot, channel, 'error.invalid_value');
        }

        await player.seek(message, specifiedTime);
    }

    private timeToMilliseconds(time)
    {
        const times = (n, t) => {
            let tn = 1;
            for (let i = 0; i < t; i++) {
                tn *= n;
            }

            return t <= 0 ? 1000 : tn * 1000;
        };

        return time
            .split(':')
            .reverse()
            .map((m, i) => parseInt(m) * times(60, i))
            .reduce((a, c) => a + c, 0);
    }
}