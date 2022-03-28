import {Column, PrimaryKey, Table, Model, DataType, AutoIncrement, Default, Max} from 'sequelize-typescript';
import {Guild, GuildMember, User} from "discord.js";
import {Op} from "sequelize";

@Table
export default class BetLog extends Model
{
    @AutoIncrement
    @PrimaryKey
    @Column(DataType.INTEGER)
    bet_log_id: number;

    @Column(DataType.STRING(19))
    user_id: number;

    @Default('0')
    @Column(DataType.STRING(19))
    guild_id: string;

    @Max(6)
    @Column(DataType.INTEGER)
    bet: number;

    @Column(DataType.ARRAY(DataType.INTEGER))
    winnable_numbers: string;

    @Max(6)
    @Column(DataType.INTEGER)
    result: number;

    @Default(new Date().getTime())
    @Column(DataType.INTEGER)
    date: number;

    public static addRecord(
        user: User,
        bet: number,
        winnableNumbers: number[],
        result: number,
        guild?: Guild
    )
    {
        return this.create({
            user_id: user.id,
            guild_id: guild?.id || '0',
            bet: bet,
            winnable_numbers: winnableNumbers,
            result: result,
        });
    }

    public static getBetsForUserInRange(user: GuildMember|User, startDate: number, endDate: number)
    {
        if (startDate > endDate)
        {
            throw new Error('The start date must be less than the end date.');
        }

        return this.findAndCountAll({
            where: {
                user_id: user.id,
                date: {
                    [Op.between]: [startDate, endDate]
                }
            }
        });
    }

    public static getById(betLogId: number)
    {
        return this.findByPk(betLogId);
    }
}