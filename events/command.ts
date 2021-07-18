import {Message} from "discord.js";

import Bot from "../bot";

import CommandParser from "../helpers/CommandParser";
import GuildOptionHelper from "../helpers/GuildOptionHelper";
import ErrorMessage from "../errors/ErrorMessage";

module.exports = {
    name: 'message',
    async execute(bot: Bot, message: Message)
    {
        if (message.author.bot)
        {
            return;
        }

        const commandParser = new CommandParser(bot, message);
        const parsedData = await commandParser.parse();

        if (!parsedData)
        {
            return;
        }

        const { commandName, args, options, sudo } = parsedData;

        const command = bot.commands.get(commandName)
            || bot.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));

        if (!command)
        {
            return;
        }

        bot.locale.setCurrentLocale(
            await (new GuildOptionHelper(bot, message.guild)).get('locale')
        );

        try
        {
            command.setup(message, args, options, sudo);

            await command.assertCanExecute();

            command.execute();
        }
        catch (error)
        {
            if (error instanceof ErrorMessage)
            {
                return;
            }
        }
    }
};