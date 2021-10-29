# sushi-swap-ohm

## Install

    $ git clone https://github.com/limenal/sushi-swap-ohm
    $ cd sushi-swap-ohm
    $ npm install
    
## Running the project

    $ node index.js
## getPairsNHoursInfo() function

    Note that functions for N minutes or N days can also be implemented. After fetching data we need to iterate all time intervals like that:
    
    for(let beginTimestamp = startTimestamp, endTimestamp = startTimestamp + N * timeInterval; beginTimestamp < endTime; beginTimestamp += N*timeInterval, endTimestamp+= N * timeInterval)
    {
      
      let obj = {
        beginTimestamp: beginTimestamp,
        endTimestamp: endTimestamp,
        //other data
      }
      for(let j = 0; j < data.length; ++j)
      {
        
        if(beginTimestamp <= data[j].timestamp && data[j].timestamp < endTimestamp)
        {

            // add items to object
        }
      }
      resultData.push(obj)
    }