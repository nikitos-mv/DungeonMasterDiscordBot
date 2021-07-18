import {GuildMember} from "discord.js";

import Bot from "../bot";

import GuildOptionHelper from "../helpers/GuildOptionHelper";

module.exports = {
    name: 'guildMemberRemove',
    async execute(bot: Bot, member: GuildMember)
    {
        const channel = member.guild.systemChannel;

        if (!channel)
        {
            return;
        }

        bot.locale.setCurrentLocale(
            await (new GuildOptionHelper(bot, member.guild)).get('locale')
        );

        const parting = bot.t('parting');

        if (!parting.length)
        {
            return;
        }

        return await channel.send(parting);
    }
};