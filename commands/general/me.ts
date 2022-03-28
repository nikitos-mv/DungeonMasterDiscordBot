import AbstractCommand from "../../base/AbstractCommand";

import {MessageEmbed} from "discord.js";

import Bot from "../../bot";

import CommandInfo from "../../types/CommandInfo";
import UserInfo from "../../models/UserInfo";

module.exports = class extends AbstractCommand
{
    constructor(bot: Bot)
    {
        super(
            bot,
            <CommandInfo>{
                name: 'me',
                group: 'general'
            }
        );
    }

    async execute()
    {
        const bot = this.bot;
        const message = this.message;
        const member = message.member;

        const userInfo = await UserInfo.getById(member.id);

        const embed = new MessageEmbed()
        .setColor(bot.config.colors.default)
        .setTitle(bot.t('me.your_statistics'))
        .addFields(
            {
                name: bot.t('me.fagot_points'),
                value: userInfo?.fag_points || 0
            }
        );

        return await message.channel.send(embed);
    }
}