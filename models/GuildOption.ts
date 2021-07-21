import {Guild} from "discord.js";

import {Column, PrimaryKey, Table, Model, DataType} from 'sequelize-typescript';

@Table
export default class GuildOption extends Model
{
    @PrimaryKey
    @Column(DataType.STRING(19))
    guild_id: string;

    @Column(DataType.JSON)
    data: object;

    public static setOptions(guild: Guild, data: object)
    {
        return this.upsert({
            guild_id: guild.id,
            data: data
        });
    }

    public static getOptions(guild?: Guild)
    {
        if (!guild)
        {
            return;
        }

        return this.findOne({
            where: {
                guild_id: guild.id
            }
        });
    }
}