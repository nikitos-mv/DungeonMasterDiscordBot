import {Collection, Guild} from "discord.js";

import Bot from "../bot";

import GuildOption from "../models/GuildOption";

export default class GuildOptionHelper
{
    protected bot: Bot;
    protected guild?: Guild;
    protected guildOptions: Collection<string, any>;

    public constructor(bot: Bot, guild?: Guild)
    {
        this.bot = bot;
        this.guild = guild;
        this.guildOptions = bot.guildOptions;
    }

    public async set(key: string, value: any, mergeWithExisting: boolean = true)
    {
        if (!this.guild)
        {
            return;
        }

        let newData = {};
        newData[key] = value;

        return await this.bulkSet(newData, mergeWithExisting);
    }

    public async bulkSet(data, mergeWithExisting = true)
    {
        const guild = this.guild;

        if (!guild) return;

        let newData = data;

        if (mergeWithExisting)
        {
            const existing = await GuildOption.getOptions(guild);
            if (existing)
            {
                newData = Object.assign(existing.data, newData);
            }
        }

        const options = await GuildOption.setOptions(guild, newData);

        if (options)
        {
            this.guildOptions.set(guild.id, options[0].data);
        }

        return options;
    }

    public async get(key, fetch = false)
    {
        const data = await this.getAll(fetch);

        return data[key];
    }

    public async getAll(fetch = false)
    {
        const bot = this.bot;
        const guild = this.guild;

        let data = {...bot.config.guild};

        if (guild)
        {
            if (fetch || !this.guildOptions.has(guild.id))
            {
                await this.updateOptionCache();
            }

            data = Object.assign(data, this.guildOptions.get(guild.id));
        }

        return data;
    }

    public getDefault(key): any
    {
        return this.bot.config.guild[key] || null;
    }

    public async updateOptionCache()
    {
        const guild = this.guild;

        if (!guild)
        {
            return;
        }

        const options = await GuildOption.getOptions(guild);
        if (options)
        {
            this.guildOptions.set(guild.id, options.data);
        }
    }
}