import {Column, Default, PrimaryKey, Table, Model, DataType} from 'sequelize-typescript';
import {GuildMember, User} from "discord.js";
import FagPointLog from "./FagPointLog";
import BetLog from "./BetLog";

@Table({
    tableName: 'UserInfo'
})
export default class UserInfo extends Model
{
    @PrimaryKey
    @Column(DataType.STRING(19))
    user_id: string;

    @Default(0)
    @Column(DataType.INTEGER)
    fag_points: number;

    public static async adjustFagPoints(
        user: GuildMember|User,
        amount: number,
        type?: string,
        extra?: {
            bet?: number;
            betWinnableNumbers?: number[];
            betResult?: number;
        }
    )
    {
        const t = await this.sequelize.transaction();

        try
        {
            const record = await this.findOne(
                {
                    where: {
                        user_id: user.id
                    },
                    transaction: t
                }
            );

            if (!record)
            {
                await this.create(
                    {
                        user_id: user.id,
                        fag_points: amount
                    },
                    {
                        transaction: t
                    }
                )
            }
            else
            {
                await this.increment(
                    {
                        fag_points: amount
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
                amount: amount,
                type: type
                },
                {
                    transaction: t
                }
            );

            if (
                type == 'command_bet'
                && extra.bet
                && extra.betWinnableNumbers
                && extra.betResult
            )
            {
                await BetLog.create(
                    {
                        user_id: user.id,
                        guild_id: (user instanceof GuildMember) ? user.guild?.id : '0',
                        bet: extra.bet,
                        winnable_numbers: extra.betWinnableNumbers,
                        result: extra.betResult,
                    },
                    {
                        transaction: t
                    }
                );
            }

            await t.commit();

            return true;
        }
        catch (error)
        {
            await t.rollback();

            console.log(error);

            return false;
        }
    }

    public static getById(userId: string)
    {
        return this.findByPk(userId);
    }
}