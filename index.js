import {getPairsDaysInfo, getPairsHoursInfo, getPairsMinuteInfo} from './pairs.js'

async function main()
{
    const pair = await getPairsDaysInfo(1628655757, 365, 2021, 'OHM', 'DAI')
    for(let i = 0; i < pair.length; ++i)
    {
        if(pair[i].token1PriceClose != 0)  
        {
            console.log(pair[i])

        }
        
    }
}

main()