import Bot from "../bot";
import FilterList from "discord-player/lib/utils/AudioFilters";

module.exports = {
    name: 'ready',
    once: true,
    async execute(bot: Bot)
    {
        console.log(`Ready! Logged in as ${bot.user.tag}.`);

        await bot.user.setActivity('Your anal');
    }
};