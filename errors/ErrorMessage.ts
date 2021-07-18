import {TextChannel, DMChannel, NewsChannel, User} from "discord.js";

import Bot from "../bot";

export default class ErrorMessage extends Error
{
    public constructor(
        bot: Bot,
        channel: TextChannel | DMChannel | NewsChannel | User,
        message: string,
        params: object = {}
    ) {
        super(message);

        channel.send(bot.embedError(bot.t(message, params)));
    }
}
