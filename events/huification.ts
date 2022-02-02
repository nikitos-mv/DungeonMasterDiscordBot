import {Message} from "discord.js";

import Bot from "../bot";
import GuildOptionHelper from "../helpers/GuildOptionHelper";

module.exports = {
    name: 'message',
    async execute(bot: Bot, message: Message)
    {
        const huification = await (new GuildOptionHelper(bot, message.guild)).get('huification');

        if (
            !huification
            || message.author.bot
            || Math.random() >= bot.config.misc.huificationProbability
        )
        {
            return;
        }

        const words = message.content.split(' ');
        const content = words[words.length - 1];
        const contentLc = content.toLowerCase();
        const channel = message.channel;

        if (
            content.length < 5
            || contentLc.slice(0, 3).match(/.*[^а-я]+.*/)
            || content.match(/^-*$/)
            || contentLc.startsWith('ху')
        )
        {
            return;
        }

        let postfix = contentLc;
        let i = 0
        for (; i < postfix.length; i++)
        {
            console.log('ёэоеаяуюыи'.split('').includes(postfix[i]))
            if ('ёэоеаяуюыи'.split('').includes(postfix[i]))
            {
                break;
            }
        }
        postfix = postfix.slice(i);

        const rules = new Map;
        rules.set('о', 'ё');
        rules.set('а', 'я');
        rules.set('у', 'ю');
        rules.set('ы', 'и');
        rules.set('э', 'е');

        let huificated = '';
        if (!postfix.length)
        {
            huificated = 'Хуе' + contentLc.slice(2);
        }
        else if (rules.has(postfix[0]))
        {
            huificated = 'Ху' + rules.get(postfix[0]) + postfix.slice(1);
        }
        else
        {
            huificated = 'Ху' + postfix;
        }

        if (huificated.length)
        {
            await channel.send(huificated);
        }
    }
}