import * as Discord from "discord.js";
import {Player} from "discord-player";

import Localization = require('localizationjs');

import {Sequelize} from "sequelize-typescript";

const config = require('./config.json');

import * as fs from "fs";
import path = require('path');

import AbstractCommand from "./base/AbstractCommand";
import Config from "./types/Config";
import ErrorMessage from "./errors/ErrorMessage";

export default class Bot extends Discord.Client
{
    public readonly VERSION = require('./package.json').version;
    public readonly DEVELOPERS = {
        'NikitOS_MV#5201': 'https://mv-i.ru/'
    };
    public readonly THANKS = [
        'LenaTDDS#2554'
    ];
    public readonly DONATE_LINKS = {
        'Tinkoff': 'https://www.tinkoff.ru/rm/kolesnikov.nikita115/VbrUQ85565/',
        'Qiwi': 'https://qiwi.com/n/NIKIT0S',
        'YooMoney': 'https://yoomoney.ru/to/4100116826437496'
    };
    public readonly SUDOERS = [478001430612017152, 480273589426192384, 529942755728818217];

    public readonly rootDir: string;

    public readonly config: Config;

    public guildOptions: Discord.Collection<string, any>;

    public locale: Localization;
    public locales: string[];

    public player: Player;

    public db: Sequelize;

    public commandGroups: Discord.Collection<string, any>; // TODO: category type?
    public commands: Discord.Collection<string, AbstractCommand>;
    public cooldowns: Discord.Collection<string, Discord.Collection<Discord.Snowflake, number>>;

    public constructor(options?: object)
    {
        super(options);

        this.rootDir = __dirname;

        this.config = this.standardizeConfig(config);

        this.guildOptions = new Discord.Collection();

        this.locale = new Localization({
            defaultLocale: this.config.guild.locale
        })
        this.locales = [];
        this.loadDictionaries();

        this.player = new Player(this, this.config.player);

        this.db = new Sequelize(
            this.config.database.dbname,
            this.config.database.username,
            this.config.database.password,
            Object.assign(
                {
                    define: {
                        charset: 'utf8',
                        collate: 'utf8_general_ci',
                        timestamps: false
                    },
                    logging: false,
                    models: [path.join(__dirname, 'models', '*.ts')]
                },
                this.config.database.options,
            )
        );
        this.db.sync()
            .then(async () => {
                console.log('Database synced.');
            })
            .catch(console.error);

        this.loadEventListeners();

        this.commandGroups = new Discord.Collection();
        this.commands = new Discord.Collection();
        this.cooldowns = new Discord.Collection();
        this.loadCommands();

        this.login(this.config.token);

        process.on('uncaughtException', error => {

            if (error instanceof ErrorMessage)
            {
                return;
            }

            console.error('Caught exception: ' + error);
        });
    }

    protected standardizeConfig(config): Config
    {
        return Object.assign(
            {
                token: '',

                colors: {
                    error: '#F44336',
                    warning: '#F4B400',
                    success: '#4CAF50',
                    default: '#0585B7'
                },

                database: {
                    dbname: '',
                    username: '',
                    password: '',
                    options: {}
                },

                guild: {
                    cooldown: 1,
                    locale: 'ru-RU',
                    prefix: '!'
                },

                developmentMode: false,

                player: {
                    leaveOnEnd: true,
                    leaveOnEndCooldown: 0,
                    leaveOnStop: true,
                    leaveOnEmpty: true,
                    leaveOnEmptyCooldown: 0,
                    autoSelfDeaf: true,
                    enableLive: false,
                    ytdlDownloadOptions: {
                        filter: 'audioonly'
                    },
                    useSafeSearch: false,
                    disableAutoRegister: false,
                    disableArtistSearch: false,
                    fetchBeforeQueued: true,
                    volume: 100
                },

                playerProgressBar: {
                    timecodes: true,
                    queue: false,
                    length: 25,
                    indicator: '•',
                    line: '-'
                },

                playerQueue: {
                    perPage: 5
                },

                fagots: {
                    competitionProbability: 0.05,
                    maxDelay: 3000,
                    perDay: 1,
                    perPage: 10,
                    stopPhrases: [
                        'Чур не я!',
                        'Я — натурал',
                        'Я - натурал',
                        'Я натурал',
                    ]
                }
            },
            config
        );
    }

    public loadEventListeners(): void
    {
        const eventListeners = fs.readdirSync(path.join(__dirname, 'events'))
            .filter(file => file.endsWith('.ts'));

        for (const eventListenerFile of eventListeners)
        {
            const requirePath = path.join(__dirname, 'events', eventListenerFile);
            delete require.cache[require.resolve(requirePath)];
            const event = require(requirePath);
            if (event.once)
            {
                this.once(event.name, (...args) => event.execute(this, ...args));
            }
            else
            {
                this.on(event.name, (...args) => event.execute(this, ...args));
            }
        }

        const playerEventListeners = fs.readdirSync(path.join(__dirname, 'events/player'))
            .filter(file => file.endsWith('.ts'));

        for (const eventListenerFile of playerEventListeners)
        {
            const requirePath = path.join(__dirname, 'events/player', eventListenerFile);
            delete require.cache[require.resolve(requirePath)];
            const event = require(requirePath);
            this.player.on(event.name, (...args) => event.execute(this, ...args))
        }
    }

    public loadDictionaries(): void
    {
        const dictionaryFiles = fs.readdirSync(path.join(__dirname, 'dictionaries'))
            .filter(file => file.endsWith('.json'));

        for (const dictionaryFile of dictionaryFiles)
        {
            const locale = path.basename(dictionaryFile, path.extname(dictionaryFile));

            const requirePath = path.join(__dirname, 'dictionaries', dictionaryFile);
            delete require.cache[require.resolve(requirePath)];
            const dictionary = require(requirePath);

            this.locale.addDict(locale, dictionary);
            this.locales.push(locale);
        }
    }

    public loadCommands(): void
    {
        const commandFolders = fs.readdirSync(path.join(__dirname, 'commands'));

        for (const commandFolder of commandFolders)
        {
            const commandGroupFiles = fs.readdirSync(path.join(__dirname, 'commands', commandFolder))
                .filter(file => file === 'group_info.ts');

            for (const commandGroupFile of commandGroupFiles)
            {
                const requirePath = path.join(__dirname, 'commands', commandFolder, commandGroupFile);
                delete require.cache[require.resolve(requirePath)];
                const group = require(requirePath);
                this.commandGroups.set(group.id, group);
            }
            this.commandGroups.sort((a, b) => a.order - b.order);

            const commandFiles = fs.readdirSync(path.join(__dirname, 'commands', commandFolder))
                .filter(file => file.endsWith('.ts'));

            for (const commandFile of commandFiles)
            {
                const requirePath = path.join(__dirname, 'commands', commandFolder, commandFile);
                delete require.cache[require.resolve(requirePath)];
                const commandClass = require(requirePath);

                if (commandClass.prototype instanceof AbstractCommand)
                {
                    const command = new commandClass(this);
                    this.commands.set(command.name, command);
                }
            }
        }
    }

    public t(key: string, params?: object): string
    {
        const translation = this.locale.translate(key, params);

        if (Array.isArray(translation))
        {
            return translation[Math.floor(Math.random()*translation.length)];
        }

        return translation;
    }

    public embedSuccess(message)
    {
        return new Discord.MessageEmbed()
            .setColor(this.config.colors.success)
            .setDescription(message);
    }

    public embedError(message)
    {
        return new Discord.MessageEmbed()
            .setColor(this.config.colors.error)
            .setDescription(message);
    }

    public embedMessage(message)
    {
        return new Discord.MessageEmbed()
            .setColor(this.config.colors.default)
            .setDescription(message);
    }
}