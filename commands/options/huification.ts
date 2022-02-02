import AbstractCommand from "../../base/AbstractCommand";

import Bot from "../../bot";

import CommandInfo from "../../types/CommandInfo";
import GuildOptionHelper from "../../helpers/GuildOptionHelper";

module.exports = class extends AbstractCommand
{
    constructor(bot: Bot)
    {
        super(
            bot,
            <CommandInfo>{
                name: 'huification',
                aliases: ['хуификация'],
                group: 'options',
                guildOnly: true,
                ownerOnly: true,
                commandOptions: ['enable', 'disable', 'unset']
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

        const guildOptionHelper = new GuildOptionHelper(bot, message.guild);

        if (!args.length && !options.size)
        {
            return await channel.send(
                bot.embedMessage(
                    bot.t('huification.current_huification_state_x', {
                        state: bot.t((await guildOptionHelper.get('huification')) ? 'enabled': 'disabled')
                    })
                )
            )
        }

        let newState: boolean;
        if (options.get('unset'))
        {
            newState = guildOptionHelper.getDefault('huification');
        }
        else
        {
            newState = args[0].length ? args[0] !== '0' : options.has('enable') || !options.has('disable');
        }

        await guildOptionHelper.set('huification', newState);
        await channel.send(
            bot.embedMessage(
                bot.t('huification.new_huification_state_x', {
                    state: bot.t(newState ? 'enabled': 'disabled')
                })
            )
        )
    }
}