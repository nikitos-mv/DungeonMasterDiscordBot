import AbstractCommand from "../../base/AbstractCommand";

import {MessageEmbed, User} from "discord.js";

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
                name: 'quote',
                aliases: ['цитата'],
                group: 'quotemanager',
                commandOptions: ['id', 'last']
            }
        );
    }

    async execute()
    {
        const bot = this.bot;
        const config = bot.config;
        const message = this.message;
        const channel = message.channel;
        const options = this.options;

        let quote: Quote;

        const quoteId = typeof options.get('id') === 'string' ? Number(options.get('id')) : Number(this.args[0]);
        if (!isNaN(quoteId) && typeof quoteId === 'number' && quoteId > 0)
        {
            quote = await Quote.getById(quoteId);

            if (!quote)
            {
                throw new ErrorMessage(bot, channel, 'error.not_found');
            }
        }
        else if (options.has('id') || this.args[0])
        {
            throw new ErrorMessage(bot, channel, 'error.invalid_id');
        }

        if (!quote && options.get('last'))
        {
            quote = await Quote.getLast();
        }

        if (!quote)
        {
            quote = await Quote.getRandom();
        }

        if (!quote)
        {
            throw new ErrorMessage(bot, channel, 'error.not_found');
        }

        let author: User|void;
        let addedBy: User|void;
        if (quote.user_id !== '0')
        {
            author = await bot.users.fetch(quote.user_id).catch(error => {});
        }
        if (quote.add_user_id !== '0')
        {
            addedBy = await bot.users.fetch(quote.add_user_id).catch(error => {});
        }

        const quoteText =
            `${bot.snippet(quote.text, config.quote.maxLength, false)}
            ${quote.date? '\n_' + bot.locale.date(quote.date) + '_' : ''}`;

        const embed = new MessageEmbed()
            .setColor(config.colors.default)
            .setAuthor(
                bot.t(
                    'quote.embed_title', {
                        author: author ? author.tag : quote.author,
                        id: quote.quote_id
                    }
                ),
                author ? author.displayAvatarURL(): null
            )
            .setDescription(quoteText)
            .setFooter(
                bot.t('quote.added_by_x', {
                    member: addedBy ? addedBy.tag : quote.add_username
                }),
                addedBy ? addedBy.displayAvatarURL() : null
            );

        if (quote.add_date)
        {
            embed.setTimestamp(quote.add_date)
        }

        return await channel.send(embed);
    }
}