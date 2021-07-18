import {GuildMember} from "discord.js";

import Bot from "../bot";

import GuildOptionHelper from "../helpers/GuildOptionHelper";

module.exports = {
    name: 'guildMemberAdd',
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

        const greeting = bot.t('greeting');

        if (!greeting.length)
        {
            return;
        }

        return await channel.send(greeting);
    }
};