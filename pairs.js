import axios from 'axios'


export async function getSwaps(startTimestamp, period, numberOfPeriods)
{
  let timestamps = []
  for(let i = 0; i < numberOfPeriods; ++i)
  {
    timestamps.push(startTimestamp + i*period)
  }
  let query = '{'

  let data = []
  for(let i = 0; i < timestamps.length - 1; ++i)
  {
    query += `
      t${timestamps[i]}:stakes(first: 1, where:{timestamp_gte: ${timestamps[i]}, timestamp_lt: ${timestamps[i+1]}})
      {
        amountStaked
        timestamp
      }
    
      `
    if(i % 220 == 0)
    {
      console.log(i)
      // send query then null
      query+= "}"
      const stakeData = await axios({
        url: 'https://api.thegraph.com/subgraphs/name/limenal/olympus-stake',
        method: 'post',
        data: {
          query: query
        }
      })
      let stakes = stakeData.data.data
      // console.log(stakes)
      // console.log(Date())
      console.log(stakes)
      data.concat(stakes)
      query = '{'
    }
    // else
    // {
    //   query += `
    //   t${timestamps[i]}:stakes(first: 1, where:{timestamp_gte: ${timestamps[i]}, timestamp_lt: ${timestamps[i+1]}})
    //   {
    //     amountStaked
    //     timestamp
    //   }
    
    //   `
    // }
  }
  return data
  // for(let i = 0; i < timestamps.length - 1; ++i)
  // {
  //   query += `
  //     t${timestamps[i]}:swaps(first: 1, where:{token0:"SUSHI", token1:"WETH", timestamp_gte: ${timestamps[i]}, timestamp_lt: ${timestamps[i+1]}}, orderBy:price, orderDirection:desc)
  //     {
  //       price
  //       amount0In
  //       amount0Out
  //     }
    
  //   `
  // }
  // query += '}'
  // console.log(pairs)
  
}



/**

    * @dev : Get pairs (days)

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
          pairYears(first: 5 where:{name:"${pairName}"}){
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
      console.log(query)
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

export async function getPairsHoursInfo(startTimestamp, endTime, token0, token1)
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
      pairYears(first: 5 where:{name:"${pairName}"}){
        dayPair(first:365, orderBy:timestamp where:{timestamp_gte: ${startTimestamp}, timestamp_lte:${endTime} })
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
    console.log(Date())
    const pairData = await axios({
      url: 'https://api.thegraph.com/subgraphs/name/limenal/sushi-swap-ohm',
      method: 'post',
      data: {
        query: query
      }
    }) 
    console.log(Date())
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
    let beginTimestamp = startTimestamp
    let endTimestamp = startTimestamp + 3600
    let startIndexingTimestamp = 0
    for(let j = 0; j < pairs.length; ++j)
    {
      if(endTimestamp >= endTime)
      {
        break;
      }
      else if(beginTimestamp <= Number(pairs[j].timestamp) && Number(pairs[j].timestamp) <= endTimestamp)
      {
        let obj = {
          beginTimestamp: beginTimestamp,
          endTimestamp: endTimestamp,
          token1PriceOpen: pairs[j].token1PriceOpen,
          token1PriceClose: pairs[j].token1PriceClose,
          token1PriceHigh: pairs[j].token1PriceHigh,
          token1PriceLow: pairs[j].token1PriceLow,
          volumeToken1In: pairs[j].volumeToken1In,
          volumeToken1Out: pairs[j].volumeToken1Out,
          timestamp: pairs[j].timestamp
        }
        
        beginTimestamp += 3600
        endTimestamp += 3600

        if(startIndexingTimestamp === 0)
        {
          startIndexingTimestamp = pairs[j].timestamp
        }
        data.push(obj)  
      }
      else
      {
        while(!(beginTimestamp <= Number(pairs[j].timestamp) && Number(pairs[j].timestamp) <= endTimestamp))
        {
          if(beginTimestamp >= pairs[j].timestamp)
          {
            break;
          }
          let obj = {
            beginTimestamp: beginTimestamp,
            endTimestamp: endTimestamp,
            token1PriceOpen: 0,
            token1PriceClose: 0,
            token1PriceHigh: 0,
            token1PriceLow: 0,
            volumeToken1In: 0,
            volumeToken1Out:0,
          }
          
          data.push(obj)
          
          beginTimestamp += 3600
          endTimestamp += 3600
        }
        if(beginTimestamp <= Number(pairs[j].timestamp) && Number(pairs[j].timestamp) <= endTimestamp)
        {
          let objTmp = {
            beginTimestamp: beginTimestamp,
            endTimestamp: endTimestamp,
            token1PriceOpen: pairs[j].token1PriceOpen,
            token1PriceClose: pairs[j].token1PriceClose,
            token1PriceHigh: pairs[j].token1PriceHigh,
            token1PriceLow: pairs[j].token1PriceLow,
            volumeToken1In: pairs[j].volumeToken1In,
            volumeToken1Out: pairs[j].volumeToken1Out,
            timestamp: pairs[j].timestamp
          }
          beginTimestamp += 3600
          endTimestamp += 3600
          
          data.push(objTmp)  
        }
      }
    }
    console.log(Date())
    return data;
  }
  catch(err)
  {

  }
}

export async function getPairsMinuteInfo(startTimestamp, endTime, token0, token1)
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
      url: 'https://api.thegraph.com/subgraphs/id/QmbmwkWCQtWnHFkESGW2zt6GT6yBFLm7N3dnRf5eG8df2W',
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
    pairYears(first: 1 where:{name:"${pairName}"}){
      dayPair(first:365, orderBy:timestamp where:{timestamp_gte: ${startTimestamp}, timestamp_lte:${endTime} } )
      {
        hourPair(first:24)
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
  
    console.log(Date())
    const pairData = await axios({
      url: 'https://api.thegraph.com/subgraphs/id/QmbmwkWCQtWnHFkESGW2zt6GT6yBFLm7N3dnRf5eG8df2W',
      method: 'post',
      data: {
        query: query
      }
    })
    console.log(Date())
    
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
    // // 
    let beginTimestamp = startTimestamp
    let endTimestamp = startTimestamp + 60
    let startIndexingTimestamp = 0
    for(let j = 0; j < pairs.length; ++j)
    {
      if(endTimestamp >= endTime)
      {
        break;
      }
      else if(beginTimestamp <= Number(pairs[j].timestamp) && Number(pairs[j].timestamp) <= endTimestamp)
      {
        let obj = {
          beginTimestamp: beginTimestamp,
          endTimestamp: endTimestamp,
          token1PriceOpen: pairs[j].token1PriceOpen,
          token1PriceClose: pairs[j].token1PriceClose,
          token1PriceHigh: pairs[j].token1PriceHigh,
          token1PriceLow: pairs[j].token1PriceLow,
          volumeToken1In: pairs[j].volumeToken1In,
          volumeToken1Out: pairs[j].volumeToken1Out,
          timestamp: pairs[j].timestamp
        }
        
        beginTimestamp += 60
        endTimestamp += 60

        if(startIndexingTimestamp === 0)
        {
          startIndexingTimestamp = pairs[j].timestamp
        }
        data.push(obj)  
      }
      else
      {
        while(!(beginTimestamp <= Number(pairs[j].timestamp) && Number(pairs[j].timestamp) <= endTimestamp))
        {
          if(beginTimestamp >= pairs[j].timestamp)
          {
            break;
          }
          let obj = {
            beginTimestamp: beginTimestamp,
            endTimestamp: endTimestamp,
            token1PriceOpen: 0,
            token1PriceClose: 0,
            token1PriceHigh: 0,
            token1PriceLow: 0,
            volumeToken1In: 0,
            volumeToken1Out:0,
          }
          
          data.push(obj)
          
          beginTimestamp += 60
          endTimestamp += 60
        }
        if(beginTimestamp <= Number(pairs[j].timestamp) && Number(pairs[j].timestamp) <= endTimestamp)
        {
          let objTmp = {
            beginTimestamp: beginTimestamp,
            endTimestamp: endTimestamp,
            token1PriceOpen: pairs[j].token1PriceOpen,
            token1PriceClose: pairs[j].token1PriceClose,
            token1PriceHigh: pairs[j].token1PriceHigh,
            token1PriceLow: pairs[j].token1PriceLow,
            volumeToken1In: pairs[j].volumeToken1In,
            volumeToken1Out: pairs[j].volumeToken1Out,
            timestamp: pairs[j].timestamp
          }
          beginTimestamp += 60
          endTimestamp += 60
          
          data.push(objTmp)  
        }
      }
    }
      // data.push(obj)
    // }
    console.log(Date())
    return data;
  }
  catch(err)
  {
    console.log(err)
  }
}