import Bot from "../bot";

module.exports = {
    name: 'ready',
    once: true,
    async execute(bot: Bot)
    {
        console.log(`Ready! Logged in as ${bot.user.tag}.`);

        await bot.user.setActivity('Your anal');
    }
};