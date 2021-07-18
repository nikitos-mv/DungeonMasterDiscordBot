import AbstractCommand from "../../base/AbstractCommand";

import Bot from "../../bot";

import CommandInfo from "../../types/CommandInfo";
import Fag from "../../models/Fag";
import ErrorMessage from "../../errors/ErrorMessage";

module.exports = class extends AbstractCommand
{
    constructor(bot: Bot)
    {
        super(
            bot,
            <CommandInfo>{
                name: 'fagots',
                aliases: ['пидоры'],
                group: 'faginspector',
                guildOnly: true
            }
        );
    }

    async execute()
    {
        const bot = this.bot;
        const config = bot.config;
        const message = this.message;
        const channel = message.channel;
        const guild = message.guild;

        const now = new Date().getTime();
        const fagots = await Fag.getFagotsForGuildInRange(guild, (now - 86400000), now);

        if (fagots.count >= config.fagots.perDay)
        {
            const fagotMentions = [];
            for (const fag of fagots.rows)
            {
                const member = guild.members.cache.get(fag.user_id);

                if (!member || fagotMentions.includes(member.toString()))
                {
                    continue;
                }

                fagotMentions.push(member.toString());
            }

            if (fagotMentions.length)
            {
                await channel.send(
                    bot.embedMessage(
                        bot.t('fagots.todays_fagots_already_found', {
                            fagotMentions: fagotMentions.join(', ')
                        })
                    )
                );

                return;

            }
        }

        await this.randomDelay();

        const avoidMessages = (await channel.messages.fetch({
            'after': message.id
        })).filter(message => config.fagots.stopPhrases.includes(
            config.fagots.stopPhrases.find(stopPhrase => stopPhrase.toLowerCase() === message.content.toLowerCase())
        ));

        const avoidUsers = [];
        for (const message of avoidMessages.values())
        {
            if (!avoidUsers.includes(message.author.id))
            {
                avoidUsers.push(message.author.id)
            }
        }

        const fag = guild.members.cache
            .filter(member => !member.user.bot && !avoidUsers.includes(member.id))
            .random();

        if (!fag)
        {
            throw new ErrorMessage(bot, channel, 'error.fagots.not_found')
        }

        await Fag.addFag(guild, fag);

        await channel.send(bot.t('fagots.search.start'));
        await this.randomDelay();
        await channel.send(bot.t('fagots.search.middle'))
        await this.randomDelay();
        await channel.send(bot.t('fagots.search.finish'))
        await this.randomDelay();
        await channel.send(fag.toString());

        if (Math.random() < config.fagots.competitionProbability)
        {
            const secondFag = guild.members.cache
                .filter(member => !member.user.bot && !avoidUsers.includes(member.id) && member.id !== fag.id)
                .random();

            if (!secondFag)
            {
                return;
            }

            await Fag.addFag(guild, secondFag);

            await this.randomDelay();
            await channel.send(bot.t('fagots.search.competition'))
            await this.randomDelay();
            await channel.send(
                bot.t('fagots.second_fag_x', {
                    fag: secondFag.toString()
                })
            );
        }
    }

    private randomDelay() {
        return new Promise(resolve => {
            setTimeout(resolve, Math.random()*this.bot.config.fagots.maxDelay);
        });
    }
}
