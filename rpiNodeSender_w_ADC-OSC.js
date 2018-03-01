var osc = require('node-osc');

//Because I'm on a specific network, I'm using my current IP oscAddress
//If you were running this locally, you would use 127.0.0.1
/*
var client = new osc.Client('128.122.6.143', 3333);
client.send('/oscAddress', 200, function () {
  client.kill();
});
*/

//LEDs
var Gpio = require('onoff').Gpio,
ledRed = new Gpio(17, 'out'),
ledBlue = new Gpio(27, 'out'),
ledYellow = new Gpio(22, 'out')
;


//
//ADC reading example
//

var ads1x15 = require('node-ads1x15');
var chip = 0; //0 for ads1015, 1 for ads1115

//Simple usage (default ADS address on pi 2b or 3):
var adc = new ads1x15(chip);

// Optionally i2c address as (chip, address) or (chip, address, i2c_dev)
// So to use  /dev/i2c-0 use the line below instead...:

//    var adc = new ads1x15(chip, 0x48, 'dev/i2c-0');

var channel0 = 0; //channel 0, 1, 2, or 3...
var channel1 = 1;
var samplesPerSecond = '250'; // see index.js for allowed values for your chip
var progGainAmp = '4096'; // see index.js for allowed values for your chip

//somewhere to store our reading
var tempReading  = 0;
var potReading = 0;

setInterval(readADC, 100);

function readADC(){
//Read the second ADC pin (potentometer) with the same code:
  if(!adc.busy)
  {
    adc.readADCSingleEnded(channel1, progGainAmp, samplesPerSecond, function(err, data) {
      if(err)
      {
        //logging / troubleshooting code goes here...
        console.log("Reading for LED set state threw an error");
        throw err;
      }
      // if you made it here, then the data object contains your reading!
      potReading = scale(data,-50,3220,0,127);
      console.log ("Raw Data Reading: " + data);
      console.log("Scaled Reading: " + potReading);

      if(data<1000){
        ledRed.writeSync(0);
        ledBlue.writeSync(0);
        ledYellow.writeSync(1);
      }
      else if(data>2000){
        ledRed.writeSync(0);
        ledBlue.writeSync(1);
        ledYellow.writeSync(0);
      }
      else{
        ledRed.writeSync(1);
        ledBlue.writeSync(0);
        ledYellow.writeSync(0);
      }

      //);
     }    // any other data processing code goes here...



    );
  }


  var client = new osc.Client('128.122.6.143', 3333);
  client.send('/oscAddress', potReading, function () {
    //client.kill();
  });

}

/*
client.send('/oscAddress', 100, function () {
  //client.kill();
});
*/


function scale(inputY,yMin,yMax,xMin,xMax){
  //courtesy of stack stackoverflow
  //https://stackoverflow.com/questions/14224535/scaling-between-two-number-ranges
  //
  var percent = (inputY - yMin) / (yMax - yMin);
  var output = percent * (xMax - xMin) + xMin;
  return output;
}
