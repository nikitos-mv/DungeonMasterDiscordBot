import nodeHtmlToImage from "node-html-to-image";

import escapeHtml from "escape-html";

import Bot from "../bot";

import Quote from "../models/Quote";
import {Buffer} from "buffer";

import * as fs from "fs";
import * as path from "path";

export default class QuoteImageHelper
{
    protected bot: Bot;

    public constructor(bot: Bot)
    {
        this.bot = bot;
    }

    public generateImage(quote: Quote)
    {
        if (quote.user_id !== '0')
        {
            return this.generateMessageImage(quote);
        }
        else
        {
            return this.generateAnonymousImage(quote);
        }
    }

    protected async generateAnonymousImage(quote: Quote)
    {
        const template = await fs.readFileSync(path.join(this.bot.rootDir, '/data/quotes/anonymous.html'));

        return nodeHtmlToImage({
            html: String(template),
            content: {
                username: quote.author,
                timestamp: quote.date ? this.bot.locale.date(quote.date) : null,
                text: this.prepareQuoteText(quote.text)
            },
            transparent: true,
            selector: '.quote-container',
            puppeteerArgs: {
                args: ['--no-sandbox']
            }
        });
    }

    protected async generateMessageImage(quote: Quote)
    {
        const template = await fs.readFileSync(path.join(this.bot.rootDir, '/data/quotes/message.html'));

        const author = await this.bot.users.fetch(quote.user_id).catch(error => {});

        return nodeHtmlToImage({
            html: String(template),
            content: {
                avatar: author ? author.displayAvatarURL() : this.getDefaultAvatarDataUrl(),
                username: author ? author.tag : quote.author,
                timestamp: quote.date ? this.bot.locale.date(quote.date) : null,
                text: this.prepareQuoteText(quote.text)
            },
            transparent: true,
            selector: '.message-container',
            puppeteerArgs: {
                args: ['--no-sandbox']
            }
        });
    }

    protected getDefaultAvatarDataUrl()
    {
        const image = fs.readFileSync(path.join(this.bot.rootDir, '/data/images/discord-avatar.png'));
        const base64Image = Buffer.from(image).toString('base64');

        return `data:image/jpeg;base64,${base64Image}`
    }

    protected prepareQuoteText(text: string)
    {
        text = escapeHtml(text);
        text = this.formatText(text);
        text = this.replaceEmojiToImages(text);

        return text;
    }

    protected formatText(text: string)
    {
        text = text.replace(
            /```(\w+)?\n?(.*)```/gms,
            (match, language, code) => `<code>${this.escapeFormattingForCode(code)}</code>`
        );
        text = text.replace(
            /`([^`+].*[^`+])`/gms,
            (match, code) => `<code class="inline">${this.escapeFormattingForCode(code)}</code>`
        );
        text = text.replace(
            /\*\*([^*?].*?[^*?])\*\*/gms,
            '<strong>$1</strong>'
        );
        text = text.replace(
            /([^*])\*([^*?].*?[^*?])\*([^*])/gms,
            '$1<em style="font-style: italic;">$2</em>$3'
        );
        text = text.replace(
            /__(.*)__/gms,
            '<u>$1</u>'
        );
        text = text.replace(
            /~~(.*)~~/gms,
            '<s>$1</s>'
        );

        return text;
    }

    protected replaceEmojiToImages(text: string)
    {
        let jumboable = false;

        if (!text.match(/[^&lt;:.+?:\d+&gt;]/))
        {
            jumboable = true;
        }

        return text.replace(/&lt;:.+?:(\d+)&gt;/g, (match, snowflake) => {
            const emojiUrl = this.bot.emojis.resolve(snowflake)?.url;

            return emojiUrl ? `<img class="emoji ${jumboable ? 'jumboable': ''}" src="${emojiUrl}" />` : '';
        });
    }

    protected escapeFormattingForCode(text: string)
    {
        const replacements = {
            '*': '&ast;',
            '_': '&lowbar;',
            '~': '&tilde;',
            '\`': '&grave;'
        };

        for (let key in replacements)
        {
            text = text.replaceAll(key, replacements[key]);
        }

        return text;
    }
}