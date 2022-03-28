import AbstractCommand from "../../base/AbstractCommand";

import {Message, MessageEmbed} from "discord.js";

import Bot from "../../bot";

import CommandInfo from "../../types/CommandInfo";
import UserInfo from "../../models/UserInfo";
import BetLog from "../../models/BetLog";

module.exports = class extends AbstractCommand
{
    constructor(bot: Bot)
    {
        super(
            bot,
            <CommandInfo>{
                name: 'bet',
                aliases: ['ставка'],
                group: 'faginspector',
                guildOnly: true
            }
        );
    }

    async execute()
    {
        const bot = this.bot;
        const message = this.message;
        const channel = message.channel;
        const member = message.member;

        const betCooldown = bot.config.fagots.betCooldown;
        const now = new Date().getTime();
        const betResults = await BetLog.getBetsForUserInRange(member, (now - betCooldown * 1000), now);

        if (betResults.count)
        {
            return await channel.send(bot.t('bet.cooldown', {
                cooldownDays: Math.round(betCooldown / 86400),
                remainingDays: Math.round(
                    (betCooldown * 1000 - (now - betResults.rows[betResults.count - 1].date)) / 86400000
                )
            }));
        }

        channel.send(bot.t('bet.initial')).then(() => {
            channel.awaitMessages(
                (response: Message) => member.id == response.member.id,
                {
                max: 1,
                time: 120000
                }
            ).then(async (collected) => {
                const bet = Number(collected.first().content);
                if (![1, 2, 3].includes(bet))
                {
                    await channel.send(bot.t('bet.wrong'));
                }
                else
                {
                    const winnableNumbers = this.winnableNumbers();
                    await channel.send(bot.t('bet.winnable_numbers', {
                        numbers: winnableNumbers.join(', ')
                    }));

                    await this.delay();

                    await channel.send(bot.t('bet.start'));

                    await this.delay();

                    const result = this.randomDiceNumber();
                    await channel.send(bot.t('bet.result', {
                        result
                    }));

                    await this.delay();

                    const isWin = winnableNumbers.includes(result);
                    if (isWin)
                    {
                        await channel.send(bot.t('bet.win'));
                    }
                    else
                    {
                        await channel.send(bot.t('bet.lose'));
                    }
                    await UserInfo.adjustFagPoints(
                        member,
                        isWin ? -bet : bet,
                        'command_bet',
                        {
                            bet: bet,
                            betWinnableNumbers: winnableNumbers,
                            betResult: result
                        }
                    )
                }
            }).catch(() => {});
        })
    }

    private delay() {
        return new Promise(resolve => {
            setTimeout(resolve, Math.random()*this.bot.config.fagots.maxDelay);
        });
    }

    private randomDiceNumber()
    {
        return Math.round(Math.random() * 5 + 1);
    }

    private winnableNumbers()
    {
        const winnableNumbers = [];

        do
        {
            const number = this.randomDiceNumber();
            if (!winnableNumbers.includes(number))
            {
                winnableNumbers.push(number);
            }
        }
        while (winnableNumbers.length < 3)

        return winnableNumbers;
    }
}