import {getPairsInfoDays, getPairsInfoHours, getPairsInfoMinutes, getPairsInfoNHours, getPairsInfoNDays, getPairsInfoNMinutes} from './pairs.js'

async function main()
{
    // const pair = await getSwaps(1621390383, 60, 222)
    let pair = await getPairsInfoNMinutes(1635724800, 1635897600 , 'OHM', 'DAI', 60)
    for(let i = 0; i < pair.length; ++i)
    {
        if(pair[i].volumeToken1In != 0)
        {
            console.log(pair[i])

        }

        
    }
    // console.log(pair[pair.length - 1])
    console.log(pair.length)
}

main()