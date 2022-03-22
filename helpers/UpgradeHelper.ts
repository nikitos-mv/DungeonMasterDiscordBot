import Bot from "../bot";

import AbstractUpgrade from "../base/AbstractUpgrade";

import path from "path";
import semver from "semver";
import Registry from "../models/Registry";
import fs from "fs";

export default class UpgradeHelper
{
    protected bot: Bot;

    protected version: string;
    protected installedVersion: string;

    public constructor(bot: Bot)
    {
        this.bot = bot;
    }

    public async init()
    {
        this.version = require(path.join(this.bot.rootDir, 'package.json')).version;
        const registryVersion = await Registry.get('version');
        this.installedVersion = registryVersion ? String(registryVersion.value) : '0.0.0';
    }

    public async upgradeIfNeeded()
    {
        if (!this.hasUpgrade())
        {
            console.log('Up to date!');

            return;
        }

        console.log('Upgrading...');
        await this.upgrade();
    }

    protected async upgrade()
    {
        if (!this.hasUpgrade())
        {
            return;
        }

        const upgradeFiles = await this.getNeededUpgradeFiles();
        for (const version in upgradeFiles)
        {
            const upgradeClass = require(upgradeFiles[version]).default;
            await (new upgradeClass).execute();
            this.installedVersion = version;
            await Registry.set('version', version);
        }

        // The upgrade class for the latest version may not exist, so just set the latest version as installed.
        this.installedVersion = this.version;
        await Registry.set('version', this.version);
    }

    protected hasUpgrade()
    {
        return semver.gt(this.version, this.installedVersion);
    }

    protected getUpgradeFiles()
    {
        const upgradeFileList = {};

        const upgradeFiles = fs.readdirSync(path.join(this.bot.rootDir, 'upgrades'))
            .filter(file => file.endsWith('.ts'));

        for (const upgradeFile of upgradeFiles)
        {
            const upgradeFilePath = path.join(this.bot.rootDir, 'upgrades', upgradeFile);

            if (!(require(upgradeFilePath).default.prototype instanceof AbstractUpgrade))
            {
                continue;
            }

            const version = semver.valid(semver.coerce(path.basename(upgradeFile)));
            if (version)
            {
                upgradeFileList[version] = upgradeFilePath;
            }
        }

        return upgradeFileList;
    }

    protected async getNeededUpgradeFiles()
    {
        const upgradeFileList = {};

        const upgradeFiles = this.getUpgradeFiles();

        for (const version in upgradeFiles)
        {
            if (
                semver.gt(version, this.installedVersion)
                && semver.lte(version, this.version)
            )
            {
                upgradeFileList[version] = upgradeFiles[version];
            }
        }

        return upgradeFileList;
    }
}