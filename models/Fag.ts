import {Guild, GuildMember} from "discord.js";

import {AutoIncrement, Column, Default, PrimaryKey, Table, Model, DataType} from 'sequelize-typescript';
import {Op, col, fn} from "sequelize";

@Table
export default class Fag extends Model
{
    @AutoIncrement
    @PrimaryKey
    @Column(DataType.INTEGER)
    fag_id: number;

    @Column(DataType.STRING(19))
    guild_id: string;

    @Column(DataType.STRING(19))
    user_id: string;

    @Default(new Date().getTime())
    @Column(DataType.INTEGER)
    date: number;

    public static addFag(guild: Guild, user: GuildMember)
    {
        return this.create({
            guild_id: guild.id,
            user_id: user.id
        });
    }

    public static getFagotsForGuild(guild: Guild)
    {
        return this.findAndCountAll({
            where: {
                guild_id: guild.id
            }
        });
    }

    public static getFagotsForGuildInRange(guild: Guild, startDate: number, endDate: number)
    {
        if (startDate > endDate)
        {
            throw new Error('The start date must be less than the end date.');
        }

        return this.findAndCountAll({
            where: {
                guild_id: guild.id,
                date: {
                    [Op.between]: [startDate, endDate]
                }
            }
        });
    }

    public static getFagotsForGuildStats(guild: Guild)
    {
        return this.findAll({
            where: {
                guild_id: guild.id
            },
            attributes: [
                'user_id',
                [fn('COUNT', col('user_id')), 'count']
            ],
            group: 'user_id',
            order: [
                [fn('COUNT', col('user_id')), 'DESC']
            ]
        });
    }

    public static getFagotsForGuildStatsInRange(guild: Guild, startDate: number, endDate: number)
    {
        if (startDate > endDate)
        {
            throw new Error('The start date must be less than the end date.');
        }

        return this.findAll({
            where: {
                guild_id: guild.id,
                date: {
                    [Op.between]: [startDate, endDate]
                }
            },
            attributes: [
                'user_id',
                [fn('COUNT', col('user_id')), 'count']
            ],
            group: 'user_id',
            order: [
                [fn('COUNT', col('user_id')), 'DESC']
            ]
        });
    }
}