import AbstractCommand from "../../base/AbstractCommand";

import {FieldsEmbed} from "discord-paginationembed";

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
                name: 'quotes',
                aliases: ['цитаты'],
                group: 'quotemanager',
                cooldown: 5
            }
        );
    }

    async execute()
    {
        const bot = this.bot;
        const config = bot.config;
        const message = this.message;
        const channel = message.channel;

        const quotes = await Quote.findAndCountAll();

        if (!quotes.count)
        {
            throw new ErrorMessage(bot, channel, 'error.not_found');
        }

        const fieldsEmbed = new FieldsEmbed();

        fieldsEmbed.embed
            .setColor(config.colors.default)
            .setTitle(bot.t('quote.quote_list'))
            .setDescription(bot.t('quote.quote_list_description'));

        fieldsEmbed
            .setClientAssets({
                prompt: bot.t('pagination.prompt', {
                    user: '{{user}}'
                })
            })
            .setAuthorizedUsers([message.author.id])
            // @ts-ignore
            .setChannel(channel)
            .setElementsPerPage(config.quote.perPage)
            .setPageIndicator(true, 'textcompact')
            .setArray(quotes.rows)
            .formatField(
                bot.t('quote.total_quotes_x', {
                    total: quotes.count
                }),
                // @ts-ignore
                quote => `${quote.quote_id}. ${bot.snippet(quote.text, config.quote.snippetLength)}`
            );

        await fieldsEmbed.build();
    }
}
