import AbstractCommand from "../../base/AbstractCommand";

import Bot from "../../bot";

import CommandInfo from "../../types/CommandInfo";
import ErrorMessage from "../../errors/ErrorMessage";
import GuildOptionHelper from "../../helpers/GuildOptionHelper";
import {isNumber} from "util";

module.exports = class extends AbstractCommand
{
    constructor(bot: Bot)
    {
        super(
            bot,
            <CommandInfo>{
                name: 'cooldown',
                aliases: ['кулдаун'],
                group: 'options',
                guildOnly: true,
                ownerOnly: true,
                commandOptions: ['cooldown', 'unset']
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
                    bot.t('cooldown.current_cooldown_x', {
                        cooldown: await guildOptionHelper.get('cooldown')
                    })
                )
            )
        }

        let newCooldown = 0;
        if (options.get('unset'))
        {
            newCooldown = guildOptionHelper.getDefault('cooldown');
        }
        else
        {
            newCooldown = Number(options.get('cooldown') || args[0]);

            if (isNaN(newCooldown) || newCooldown < 0)
            {
                throw new ErrorMessage(bot, message.channel, 'error.invalid_value');
            }
        }

        await guildOptionHelper.set('cooldown', newCooldown);
        await message.channel.send(
            bot.embedMessage(
                bot.t('cooldown.new_cooldown_x', {
                    cooldown: newCooldown.toString()
                })
            )
        )
    }
}