import AbstractCommand from "../../base/AbstractCommand";

import {MessageAttachment} from "discord.js";

import Bot from "../../bot";

import CommandInfo from "../../types/CommandInfo";
import ErrorMessage from "../../errors/ErrorMessage";
import Quote from "../../models/Quote";
import QuoteImageHelper from "../../helpers/QuoteImageHelper";

module.exports = class extends AbstractCommand
{
    constructor(bot: Bot)
    {
        super(
            bot,
            <CommandInfo>{
                name: 'quoteimg',
                group: 'quotemanager',
                commandOptions: ['id']
            }
        );
    }

    async execute()
    {
        const bot = this.bot;
        const message = this.message;
        const channel = message.channel;
        const options = this.options;

        let quote: Quote;

        const quoteId = typeof options.get('id') === 'string' ? Number(options.get('id')) : Number(this.args[0]);
        if (!isNaN(quoteId) && typeof quoteId === 'number')
        {
            quote = await Quote.getById(quoteId);

            if (!quote)
            {
                throw new ErrorMessage(bot, channel, 'error.not_found');
            }
        }
        else
        {
            throw new ErrorMessage(bot, channel, 'error.invalid_id');
        }

        const quoteImageHelper = new QuoteImageHelper(bot);
        const quoteImage = await quoteImageHelper.generateImage(quote);

        return await channel.send('', {
            files: [
                // @ts-ignore
                new MessageAttachment(quoteImage, 'quote.png')
            ]
        });
    }
}