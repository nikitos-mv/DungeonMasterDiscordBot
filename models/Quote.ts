import {Guild, Message} from "discord.js";

import {AutoIncrement, Default, Column, PrimaryKey, Table, Model, DataType} from 'sequelize-typescript';

@Table
export default class Quote extends Model
{
    @AutoIncrement
    @PrimaryKey
    @Column(DataType.INTEGER)
    quote_id: number;

    @Default('0')
    @Column(DataType.STRING(19))
    user_id: string;

    @Column(DataType.STRING(128))
    author: string;

    @Column(DataType.TEXT)
    text: string;

    @Default(new Date().getTime())
    @Column(DataType.INTEGER)
    date: number;

    @Default('0')
    @Column(DataType.STRING(19))
    add_user_id: string;

    @Default('')
    @Column(DataType.STRING(32))
    add_username: string;

    @Default(new Date().getTime())
    @Column(DataType.INTEGER)
    add_date: number;

    @Default('0')
    @Column(DataType.STRING(19))
    guild_id: string;

    public static addQuote(
        userId: string,
        author: string,
        text: string,
        date: number,
        addUserId: string,
        addUsername: string,
        addDate: number,
        guild?: Guild
    )
    {
        return this.create({
            user_id: userId,
            author: author,
            text: text,
            date: date,
            add_user_id: addUserId,
            add_username: addUsername,
            addDate: addDate,
            guild_id: guild ? guild.id : 0
        });
    }

    public static addFromMessages(sourceMessage: Message, adderMessage: Message)
    {
        return this.addQuote(
            sourceMessage.author.id,
            sourceMessage.author.tag,
            sourceMessage.content,
            sourceMessage.createdAt.getTime(),
            adderMessage.author.id,
            adderMessage.author.tag,
            adderMessage.createdAt.getTime(),
            sourceMessage.guild
        );
    }

    public static addAnonymous(
        text: string,
        author: string,
        date?: number,
        addUserId?: string,
        addUsername?: string,
        addDate?: number
    )
    {
        return this.addQuote(
            '0', author,
            text, date,
            addUserId, addUsername,
            addDate
        );
    }

    public static getById(quoteId: number)
    {
        return this.findByPk(quoteId);
    }

    public static getRandom()
    {
        return this.findOne({
            order: this.sequelize.random()
        });
    }

    public static getLast()
    {
        return this.findOne({
            order: [
                ['add_date', 'DESC']
            ]
        });
    }
}