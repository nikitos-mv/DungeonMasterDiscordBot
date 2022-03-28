import {Guild, GuildMember} from "discord.js";

import {AutoIncrement, Column, Default, PrimaryKey, Table, Model, DataType} from 'sequelize-typescript';
import {Op, col, fn} from "sequelize";
import UserInfo from "./UserInfo";
import FagPointLog from "./FagPointLog";

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

    public static async addFag(guild: Guild, user: GuildMember)
    {
        const t = await this.sequelize.transaction();

        try
        {
            await this.create(
                {
                    guild_id: guild.id,
                    user_id: user.id
                },
                {
                    transaction: t
                }
            );

            const record = await UserInfo.findOne(
                {
                    where: {
                        user_id: user.id
                    },
                    transaction: t
                }
            );

            if (!record)
            {
                await UserInfo.create(
                    {
                        user_id: user.id,
                        fag_points: 1
                    },
                    {
                        transaction: t
                    }
                )
            }
            else
            {
                await UserInfo.increment(
                    {
                        fag_points: 1
                    },
                    {
                        where: {
                            user_id: user.id
                        },
                        transaction: t
                    }
                );
            }

            await FagPointLog.create(
                {
                    user_id: user.id,
                    guild_id: (user instanceof GuildMember) ? user.guild?.id : '0',
                    amount: 1,
                    type: 'command_fagots'
                },
                {
                    transaction: t
                }
            );

            await t.commit();
        }
        catch (error)
        {
            await t.rollback();

            console.log(error);

            return false;
        }
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