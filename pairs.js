import axios from 'axios'

/**

    * @dev : Get stakes (days)

*/

export async function getPairsDaysInfo(startTimestamp, days, year, token0, token1)
{
  let findPairQuery = 
  `{
    pairs(where:{name_in:["${token0}-` + `${token1}"]})
    {
      id
    }
  }
  `
    
    try
    {
      const findPair = await axios({
        url: 'https://api.thegraph.com/subgraphs/name/limenal/sushi-swap-ohm',
        method: 'post',
        data: {
          query: findPairQuery
        }
      })
      let id = findPair.data.data.pairs[0].id
      let pairName
      if(id !== undefined)
      {
        pairName = token0 + '-' + token1
      }
      else
      {
        pairName = token1 + '-' + token0
      }
      let query = `
      {	
          pairYears(first: 3 where:{name:"${pairName}"}){
            dayPair(first:365, orderBy:timestamp)
            {
                  token1Price
                  token1PriceLow
                  token1PriceOpen
                  token1PriceHigh
                  timestamp
                  volumeToken0In
                  volumeToken0Out
                  volumeToken1In
                  volumeToken1Out
              }
          }
        }
      
      `
      const pairData = await axios({
          url: 'https://api.thegraph.com/subgraphs/name/limenal/sushi-swap-ohm',
          method: 'post',
          data: {
            query: query
          }
      }) 
      const pair = pairData.data.data.pairYears
      let data = []
      let pairs = []
      for(let c = 0; c < pair.length; ++c)
      {
        for(let i = 0; i < pair[c].dayPair.length; ++i)
        {
            let obj = {}
            obj.token1PriceClose = pair[c].dayPair[i].token1Price
            obj.token1PriceLow = pair[c].dayPair[i].token1PriceLow
            obj.token1PriceOpen = pair[c].dayPair[i].token1PriceOpen
            obj.token1PriceHigh = pair[c].dayPair[i].token1PriceHigh
            obj.timestamp = pair[c].dayPair[i].timestamp
            obj.volumeToken1In = pair[c].dayPair[i].volumeToken1In
            obj.volumeToken1Out = pair[c].dayPair[i].volumeToken1Out
            pairs.push(obj)
        }
      }
      
      for(let i = 0; i < days-1; ++i)
      {
        let beginTimestamp = startTimestamp + i * 86400
        let endTimestamp = startTimestamp + (i+1) * 86400
      
        let obj = {
          beginTimestamp: beginTimestamp,
          endTimestamp: endTimestamp,
          token1PriceOpen: 0,
          token1PriceClose: 0,
          token1PriceHigh: 0,
          token1PriceLow: 0,
          volumeToken1In: 0,
          volumeToken1Out: 0,
        }
        for(let j = 0; j < pairs.length; ++j)
        {
          
          if(beginTimestamp <= pairs[j].timestamp && pairs[j].timestamp < endTimestamp)
          {
            obj.token1PriceOpen = pairs[j].token1PriceOpen
            obj.token1PriceClose = pairs[j].token1PriceClose
            obj.token1PriceHigh = pairs[j].token1PriceHigh
            obj.token1PriceLow = pairs[j].token1PriceLow
            obj.volumeToken1In = pairs[j].volumeToken1In
            obj.volumeToken1Out = pairs[j].volumeToken1Out
          }
        }
        data.push(obj)
      }
      
      return data
    }
    catch(err)
    {
        console.log(err)
    }
}

export async function getPairsHoursInfo(startTimestamp, days, year, token0, token1)
{
  let findPairQuery = 
  `{
    pairs(where:{name_in:["${token0}-` + `${token1}"]})
    {
      id
    }
  }
  `

  
  try
  {
    const findPair = await axios({
      url: 'https://api.thegraph.com/subgraphs/name/limenal/sushi-swap-ohm',
      method: 'post',
      data: {
        query: findPairQuery
      }
    })
    let id = findPair.data.data.pairs[0].id
    let pairName
    if(id !== undefined)
    {
      pairName = token0 + '-' + token1
    }
    else
    {
      pairName = token1 + '-' + token0
    }
    let query = `
    {	
      pairYears(first: 1 where:{id:"${pairName}` + `${year}pair"}){
        dayPair(first:365, orderBy:timestamp)
        {
          hourPair(first:24 orderBy:timestamp)
          {
            token1Price
            token1PriceLow
            token1PriceOpen
            token1PriceHigh
            timestamp
            volumeToken0In
            volumeToken0Out
            volumeToken1In
            volumeToken1Out
          }
        }
      }
    }
    `

    const pairData = await axios({
      url: 'https://api.thegraph.com/subgraphs/name/limenal/sushi-swap-ohm',
      method: 'post',
      data: {
        query: query
      }
    }) 
    const pair = pairData.data.data.pairYears
    let data = []
    let pairs = []
    for(let c = 0; c < pair.length; ++c)
    {
      for(let i = 0; i < pair[c].dayPair.length; ++i)
      {
        for(let j = 0; j < pair[c].dayPair[i].hourPair.length; ++j)
        {
          let obj = {}
          obj.token1PriceClose = pair[c].dayPair[i].hourPair[j].token1Price
          obj.token1PriceLow = pair[c].dayPair[i].hourPair[j].token1PriceLow
          obj.token1PriceOpen = pair[c].dayPair[i].hourPair[j].token1PriceOpen
          obj.token1PriceHigh = pair[c].dayPair[i].hourPair[j].token1PriceHigh
          obj.timestamp = pair[c].dayPair[i].hourPair[j].timestamp
          obj.volumeToken1In = pair[c].dayPair[i].hourPair[j].volumeToken1In
          obj.volumeToken1Out = pair[c].dayPair[i].hourPair[j].volumeToken1Out
          pairs.push(obj)
        }
      }
    }
    for(let i = 0; i < 24*days; ++i)
    {
      let beginTimestamp = startTimestamp + i * 3600
      let endTimestamp = startTimestamp + (i+1) * 3600
      let obj = {
        beginTimestamp: beginTimestamp,
        endTimestamp: endTimestamp,
        token1PriceOpen: 0,
        token1PriceClose: 0,
        token1PriceHigh: 0,
        token1PriceLow: 0,
        volumeToken1In: 0,
        volumeToken1Out: 0,
      }
      for(let j = 0; j < pairs.length; ++j)
        {
          
          if(beginTimestamp <= pairs[j].timestamp && pairs[j].timestamp < endTimestamp)
          {
            obj.token1PriceOpen = pairs[j].token1PriceOpen
            obj.token1PriceClose = pairs[j].token1PriceClose
            obj.token1PriceHigh = pairs[j].token1PriceHigh
            obj.token1PriceLow = pairs[j].token1PriceLow
            obj.volumeToken1In = pairs[j].volumeToken1In
            obj.volumeToken1Out = pairs[j].volumeToken1Out
          }
          
        }

        data.push(obj)
    }
    return data;
  }
  catch(err)
  {

  }
}

export async function getPairsMinuteInfo(startTimestamp, days, year, token0, token1)
{
  let findPairQuery = 
  `{
    pairs(where:{name_in:["${token0}-` + `${token1}"]})
    {
      id
    }
  }
  `

  
  try
  {
    const findPair = await axios({
      url: 'https://api.thegraph.com/subgraphs/name/limenal/sushi-swap-ohm',
      method: 'post',
      data: {
        query: findPairQuery
      }
    })
    let id = findPair.data.data.pairs[0].id
    let pairName
    if(id !== undefined)
    {
      pairName = token0 + '-' + token1
    }
    else
    {
      pairName = token1 + '-' + token0
    }

    let query = `
  {	
    pairYears(first: 1 where:{id:"${pairName}` + `${year}pair"}){
      dayPair(first:365, orderBy:timestamp)
      {
        hourPair(first:24 orderBy:timestamp)
        {
          minutePair(first:60 orderBy:timestamp)
          {
            token1Price
            token1PriceLow
            token1PriceOpen
            token1PriceHigh
            timestamp
            volumeToken0In
            volumeToken0Out
            volumeToken1In
            volumeToken1Out
          }
        }
      }
    }
  }
  `

    const pairData = await axios({
      url: 'https://api.thegraph.com/subgraphs/name/limenal/sushi-swap-ohm',
      method: 'post',
      data: {
        query: query
      }
    })
    const pair = pairData.data.data.pairYears
    let data = []
    let pairs = []
    for(let c = 0; c < pair.length; ++c)
    {
      for(let i = 0; i < pair[c].dayPair.length; ++i)
      {
        for(let j = 0; j < pair[c].dayPair[i].hourPair.length; ++j)
        {
          for(let k = 0; k < pair[c].dayPair[i].hourPair[j].minutePair.length; ++k)
          {
            let obj = {}
            obj.token1PriceClose = pair[c].dayPair[i].hourPair[j].minutePair[k].token1Price
            obj.token1PriceLow = pair[c].dayPair[i].hourPair[j].minutePair[k].token1PriceLow
            obj.token1PriceOpen = pair[c].dayPair[i].hourPair[j].minutePair[k].token1PriceOpen
            obj.token1PriceHigh = pair[c].dayPair[i].hourPair[j].minutePair[k].token1PriceHigh
            obj.timestamp = pair[c].dayPair[i].hourPair[j].minutePair[k].timestamp
            obj.volumeToken1In = pair[c].dayPair[i].hourPair[j].minutePair[k].volumeToken1In
            obj.volumeToken1Out = pair[c].dayPair[i].hourPair[j].minutePair[k].volumeToken1Out
            pairs.push(obj)
          }
        }
      }
    }
    // for(let i = 0; i < 60*24*days; ++i)
    // {
    let beginTimestamp = startTimestamp
    let endTimestamp = startTimestamp + 60
    for(let j = 0; j < pairs.length; ++j)
      {
        let obj = {
          beginTimestamp: beginTimestamp,
          endTimestamp: endTimestamp,
          token1PriceOpen: 0,
          token1PriceClose: 0,
          token1PriceHigh: 0,
          token1PriceLow: 0,
          volumeToken1In: 0,
          volumeToken1Out: 0,
        }
        if(pairs[j].timestamp > endTimestamp)
        {
          let c = 1
          while(endTimestamp < pairs[j].timestamp)
          {
            obj = {
              beginTimestamp: beginTimestamp,
              endTimestamp: endTimestamp,
              token1PriceOpen: 0,
              token1PriceClose: 0,
              token1PriceHigh: 0,
              token1PriceLow: 0,
              volumeToken1In: 0,
              volumeToken1Out: 0,
            }
            beginTimestamp = beginTimestamp + (c * 60)
            endTimestamp = endTimestamp + ((c+1) * 60)
            data.push(obj)
            ++c
          }
          obj.beginTimestamp = beginTimestamp
          obj.endTimestamp = endTimestamp
          obj.token1PriceOpen = pairs[j].token1PriceOpen
          obj.token1PriceClose = pairs[j].token1PriceClose
          obj.token1PriceHigh = pairs[j].token1PriceHigh
          obj.token1PriceLow = pairs[j].token1PriceLow
          obj.volumeToken1In = pairs[j].volumeToken1In
          obj.volumeToken1Out = pairs[j].volumeToken1Out
          obj.timestamp = pairs[j].timestamp
          data.push(obj)
        }
        beginTimestamp += 60
        endTimestamp += 60
      }
      // data.push(obj)
    // }
    return data;
  }
  catch(err)
  {
    console.log(err)
  }
}