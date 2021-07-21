import AbstractCommand from "../../base/AbstractCommand";

import Bot from "../../bot";

import CommandInfo from "../../types/CommandInfo";

module.exports = class extends AbstractCommand
{
    constructor(bot: Bot)
    {
        super(
            bot,
            <CommandInfo>{
                name: 'leave',
                aliases: ['тікай'],
                group: 'other',
                sudoOnly: true,
                hidden: true
            }
        );
    }

    async execute()
    {
        const message = this.message;

        await message.channel.send(
            this.bot.t('pre_leave_parting')
        );

        await message.guild.leave();
    }
}