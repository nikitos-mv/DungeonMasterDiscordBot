import {SequelizeOptions} from "sequelize-typescript";
import {PlayerOptions, PlayerProgressbarOptions} from "discord-player";

export default interface Config
{
    token: string;
    colors: ConfigColors;
    database: ConfigDataBase;
    guild: ConfigGuild;
    developmentMode: boolean;
    player: PlayerOptions;
    playerProgressBar: PlayerProgressbarOptions;
    playerQueue: ConfigPlayerQueue;
    fagots: ConfigFagots;
}

interface ConfigColors
{
    error: string;
    warning: string;
    success: string;
    default: string;
}

interface ConfigDataBase
{
    dbname: string;
    username: string;
    password: string;
    options: SequelizeOptions
}

interface ConfigGuild
{
    cooldown: number;
    locale: string;
    prefix: string;
}

interface ConfigPlayerQueue
{
    perPage: number;
}

interface ConfigFagots
{
    competitionProbability: number;
    maxDelay: number;
    perDay: number;
    perPage: number;
    stopPhrases: string[];
}