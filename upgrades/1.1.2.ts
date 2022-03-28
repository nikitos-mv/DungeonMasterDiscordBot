import AbstractUpgrade from "../base/AbstractUpgrade";
import Fag from "../models/Fag";
import {col, fn} from "sequelize";
import UserInfo from "../models/UserInfo";
import FagPointLog from "../models/FagPointLog";

export default class extends AbstractUpgrade
{
    public async execute()
    {
        await this.rebuildUserFagPoints();
    }

    protected async rebuildUserFagPoints()
    {
        const fagots = await Fag.findAll({
            attributes: [
                'user_id',
                [fn('COUNT', col('user_id')), 'fag_points']
            ],
            group: 'user_id',
            raw: true
        });

        const t = await UserInfo.sequelize.transaction();

        try
        {
            for (const fagot of fagots)
            {
                await UserInfo.create(
                    {
                        user_id: fagot.user_id,
                        // @ts-ignore
                        fag_points: fagot.fag_points
                    },
                    {
                        transaction: t
                    }
                );

                await FagPointLog.create(
                    {
                        user_id: fagot.user_id,
                        guild_id: '0',
                        // @ts-ignore
                        amount: fagot.fag_points,
                        type: 'command_fagots'
                    },
                    {
                        transaction: t
                    }
                );
            }

            await t.commit();
        }
        catch (error)
        {
            await t.rollback();
        }
    }
}