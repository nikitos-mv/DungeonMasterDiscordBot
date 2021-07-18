import {Message} from "discord.js";

import Bot from "../../bot";

import ErrorMessage from "../../errors/ErrorMessage";

module.exports = {
    name: 'error',
    once: true,
    async execute(bot: Bot, error: string, message: Message)
    {
        let errorMessage = 'error.unexpected_error_occurred';

        switch (error)
        {
            case 'LiveVideo':
                errorMessage = 'error.player.live_video';
                break;
            case 'MusicStarting':
                errorMessage = 'error.player.music_starting';
                break;
            case 'NotConnected':
                errorMessage = 'error.player.not_connected';
                break;
            case 'NotPlaying':
                errorMessage = 'error.player.not_playing';
                break;
            case 'ParseError':
                errorMessage = 'error.player.parse_error';
                break;
            case 'UnableToJoin':
                errorMessage = 'error.player.unable_to_join';
                break;
            case 'VideoUnavailable':
                errorMessage = 'error.player.video_unavailable';
                break;
            default:
                errorMessage = error;
                break;
        }

        throw new ErrorMessage(bot, message.channel, errorMessage);
    }
};