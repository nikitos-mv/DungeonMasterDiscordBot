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
                name: 'prefix',
                aliases: ['префикс'],
                group: 'options',
                guildOnly: true,
                ownerOnly: true,
                commandOptions: ['prefix', 'unset']
            }
        );
    }

    async execute()
    {
        const bot = this.bot;
        const message = this.message;
        const args = this.args;
        const options = this.options;

        const guildOptionHelper = new GuildOptionHelper(bot, message.guild);

        if (!args.length && !options.size)
        {
            return await message.channel.send(
                bot.embedMessage(
                    bot.t('prefix.current_prefix_x', {
                        prefix: await guildOptionHelper.get('prefix')
                    })
                )
            )
        }

        let newPrefix: any;
        if (options.get('unset'))
        {
            newPrefix = guildOptionHelper.getDefault('prefix');
        }
        else
        {
            newPrefix = options.get('prefix') || args.join(' ');

            if (
                typeof newPrefix !== 'string'
                || !/^[^@#]+$/.test(newPrefix)
                || /(?:[\p{M}]{1})([\p{M}])+/usi.test((newPrefix))
            )
            {
                throw new ErrorMessage(bot, message.channel, 'error.invalid_value');
            }
        }

        await guildOptionHelper.set('prefix', newPrefix);
        await message.channel.send(
            bot.embedMessage(
                bot.t('prefix.new_prefix_x', {
                    prefix: newPrefix
                })
            )
        )
    }
}