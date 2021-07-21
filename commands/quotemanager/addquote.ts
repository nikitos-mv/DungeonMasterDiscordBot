import AbstractCommand from "../../base/AbstractCommand";

import Bot from "../../bot";

import CommandInfo from "../../types/CommandInfo";
import ErrorMessage from "../../errors/ErrorMessage";
import Quote from "../../models/Quote";

module.exports = class extends AbstractCommand
{
    constructor(bot: Bot)
    {
        super(
            bot,
            <CommandInfo>{
                name: 'addquote',
                aliases: ['add-quote', 'добавитьцитату', 'добавить-цитату'],
                group: 'quotemanager',
                commandOptions: ['text', 'author', 'date']
            }
        );
    }

    async execute()
    {
        const bot = this.bot;
        const message = this.message;
        const channel = message.channel;
        const options = this.options;

        const reference = message.reference;
        if (reference)
        {
            const referenceMessage = await channel.messages.fetch(reference.messageID);

            if (!referenceMessage || !referenceMessage.content.length)
            {
                throw new ErrorMessage(bot, channel, 'error.quote.unable_to_create_quote');
            }

            const quote = await Quote.addFromMessages(referenceMessage, message);
            if (quote)
            {
                await channel.send(
                    bot.embedSuccess(
                        bot.t('quote.quote_x_created', {
                            id: quote.quote_id
                        })
                    )
                );
            }

            return;
        }

        if (options.has('text') && options.has('author'))
        {
            const text = options.get('text');

            if (typeof text !== 'string')
            {
                throw new ErrorMessage(bot, channel, 'error.quote.invalid_content');
            }

            const maxLength = bot.config.quote.maxLength;
            if (text.length > maxLength)
            {
                throw new ErrorMessage(bot, channel, 'error.quote.too_long_content_x_max', {
                    max: maxLength
                });
            }

            const author = options.get('author');
            if (typeof author !== 'string')
            {
                throw new ErrorMessage(bot, channel, 'error.quote.invalid_author');
            }
            if (author.length > 128)
            {
                throw new ErrorMessage(bot, channel, 'error.quote.too_long_author_name_x_max', {
                    max: 128
                });
            }

            const date = Date.parse(String(options.get('date')));
            if (options.has('date') && !date)
            {
                throw new ErrorMessage(bot, channel, 'error.quote.invalid_date');
            }

            const quote = await Quote.addAnonymous(
                text, author, date,
                message.author.id, message.author.tag, message.createdAt.getTime()
            );
            if (quote)
            {
                await channel.send(
                    bot.embedSuccess(
                        bot.t('quote.quote_x_created', {
                            id: quote.quote_id
                        })
                    )
                );
            }

            return;
        }

        throw new ErrorMessage(bot, channel, 'error.invalid_command_usage');
    }
}