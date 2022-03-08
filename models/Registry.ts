import {Column, PrimaryKey, Table, Model, DataType} from 'sequelize-typescript';

@Table
export default class Registry extends Model
{
    @PrimaryKey
    @Column(DataType.TEXT)
    key: string;

    @Column(DataType.BLOB)
    value: object;

    public static set(key: string, value: any)
    {
        return this.upsert({key, value});
    }

    public static get(key: string)
    {
        return this.findByPk(key);
    }
}