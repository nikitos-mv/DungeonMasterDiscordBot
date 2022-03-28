import {Column, PrimaryKey, Table, Model, DataType, AutoIncrement, Default} from 'sequelize-typescript';
import {Guild, GuildMember, User} from "discord.js";
import {Op} from "sequelize";

@Table
export default class FagPointLog extends Model
{
    @AutoIncrement
    @PrimaryKey
    @Column(DataType.INTEGER)
    fag_point_log_id: number;

    @Column(DataType.STRING(19))
    user_id: number;

    @Default('0')
    @Column(DataType.STRING(19))
    guild_id: string;

    @Column(DataType.INTEGER)
    amount: number;

    @Column(DataType.ENUM('command_fagots', 'command_bet'))
    type: string;

    @Default(new Date().getTime())
    @Column(DataType.INTEGER)
    date: number;

    public static addRecord(user: User, amount: number, type: string, guild?: Guild)
    {
        return this.create({
            user_id: user.id,
            guild_id: guild?.id || '0',
            amount: amount,
            type: type,
        });
    }

    public static getById(fagPointLogId: number)
    {
        return this.findByPk(fagPointLogId);
    }
}