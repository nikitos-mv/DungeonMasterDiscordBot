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
                name: 'deletequote',
                aliases: ['delete-quote', 'удалитьцитату', 'удалить-цитату'],
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

        const quoteId = typeof options.get('id') === 'string' ? Number(options.get('id')) : Number(this.args[0]);
        if (!isNaN(quoteId) && typeof quoteId === 'number')
        {
            const quote = await Quote.getById(quoteId);

            if (!quote)
            {
                throw new ErrorMessage(bot, channel, 'error.not_found');
            }

            if (quote.add_user_id !== message.author.id && !this.sudo)
            {
                throw new ErrorMessage(bot, channel, 'error.no_permissions');
            }

            await quote.destroy();

            await channel.send(
                bot.embedSuccess(
                    bot.t('quote.quote_x_was_deleted', {
                        id: quoteId
                    })
                )
            );
        }
        else
        {
            throw new ErrorMessage(bot, channel, 'error.invalid_id');
        }
    }
}