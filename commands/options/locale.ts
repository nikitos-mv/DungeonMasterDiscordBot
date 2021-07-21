import * as Discord from "discord.js";

import AbstractCommand from "../../base/AbstractCommand";

import Bot from "../../bot";

import CommandInfo from "../../types/CommandInfo";
import ErrorMessage from "../../errors/ErrorMessage";
import GuildOptionHelper from "../../helpers/GuildOptionHelper";

module.exports = class extends AbstractCommand
{
    constructor(bot: Bot)
    {
        super(
            bot,
            <CommandInfo>{
                name: 'locale',
                aliases: ['language', 'язык'],
                group: 'options',
                guildOnly: true,
                ownerOnly: true,
                commandOptions: ['locale', 'unset']
            }
        );
    }

    async execute()
    {
        const bot = this.bot;
        const message = this.message;
        const channel = message.channel;
        const args = this.args;
        const options = this.options;

        if (bot.locales.length === 1)
        {
            throw new ErrorMessage(bot, channel, 'error.no_permissions');
        }

        const guildOptionHelper = new GuildOptionHelper(bot, message.guild);

        if (!args.length && !options.size)
        {
            const fields = [
                {
                    name: bot.t('locale.current_locale'),
                    value: await guildOptionHelper.get('locale')
                },
                {
                    name: bot.t('locale.available_locales'),
                    value: bot.locales.join(', ')
                }
            ];

            const embed = new Discord.MessageEmbed()
                .setColor(bot.config.colors.default)
                .addFields(fields);

            return await channel.send(embed);
        }

        let newLocale: string;
        if (options.get('unset'))
        {
            newLocale = guildOptionHelper.getDefault('locale');
        }
        else
        {
            newLocale = String(options.get('locale') || args[0]);

            if (!bot.locale.hasDict(newLocale))
            {
                throw new ErrorMessage(bot, channel, 'error.invalid_value');
            }
        }

        await guildOptionHelper.set('locale', newLocale);
        await channel.send(
            bot.embedMessage(
                bot.t('locale.new_locale_x', {
                    locale: newLocale
                })
            )
        )
    }
}