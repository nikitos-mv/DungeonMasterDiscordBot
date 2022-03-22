import Bot from "../bot";

export default abstract class AbstractUpgrade
{
    protected readonly bot: Bot;

    public constructor(bot: Bot)
    {
        this.bot = bot;
    }

    public abstract execute();
}