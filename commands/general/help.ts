import AbstractCommand from "../../base/AbstractCommand";

import * as Discord from "discord.js";

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
                name: 'help',
                aliases: ['помощь', 'хелп'],
                group: 'general'
            }
        );
    }

    async execute()
    {
        const bot = this.bot;
        const colors = bot.config.colors;
        const message = this.message;
        const channel = message.channel;
        const args = this.args;

        const guildOptionHelper = new GuildOptionHelper(this.bot, message.guild);
        const prefix = await guildOptionHelper.get('prefix');

        const commandGroups = bot.commandGroups;
        const commands = bot.commands;

        if (!args.length)
        {
            const fields = commandGroups
                .filter(group => group.hidden !== undefined ? !group.hidden : true)
                .map(commandGroup => {
                    return {
                        name: bot.t(`command_group_title.${commandGroup.id}`),
                        value: bot.t(`command_group_description.${commandGroup.id}`)
                    };
                });

            const embed = new Discord.MessageEmbed()
                .setColor(colors.default)
                .setTitle(bot.t('command_group_list'))
                .addFields(fields)
                .setFooter(bot.t('command_usage.help', {
                    prefix: prefix
                }));

            return await channel.send(embed);
        }

        const name = args[0].toLowerCase();
        const command = commands.find(
            command => (command.name === name || (command.aliases.includes(name)))
                && (command.hidden !== undefined ? !command.hidden : true)
        );
        const commandGroup = commandGroups.find(
            group => (group.id === name && (group.hidden !== undefined ? !group.hidden : true))
        );

        if (!command && !commandGroup)
        {
            throw new ErrorMessage(bot, channel, 'error.not_found');
        }

        const embed = new Discord.MessageEmbed();

        if (command)
        {
            embed
                .setColor(colors.default)
                .setTitle(command.name)
                .setDescription(bot.t(`command_description_full.${command.name}`))
                .setFooter(bot.t(`command_usage.${command.name}`, {
                    prefix: prefix
                }));

            if (command.aliases.length)
            {
                embed.addField(bot.t('aliases'), command.aliases.join(', '));
            }

            if (command.commandOptions.length)
            {
                embed.addField(
                    bot.t('command_options'),
                    command.commandOptions
                        .map(option => {
                            return `\`${option}\`: ${bot.t(`command_option_description.${command.name}.${option}`)}`;
                        })
                );
            }
        }

        if (commandGroup)
        {
            const groupCommands = commands
                .filter(command => command.group == commandGroup.id)
                .map(command => {
                    return {
                        name: command.name,
                        value: bot.t(`command_description.${command.name}`)
                    }
                });

            embed
                .setColor(colors.default)
                .setTitle(bot.t(`command_group_title.${commandGroup.id}`, {
                    id: commandGroup.id
                }))
                .setDescription(bot.t(`command_group_description.${commandGroup.id}`))
                .addFields(groupCommands);
        }

        return await channel.send(embed);
    }
}