const axios = require('axios');
const twilio = require('twilio');
require('dotenv').config();

// Required environment variables:
// TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER, PHONE_NUMBERS (comma-separated), API_URL

// Twilio configuration
const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
const TWILIO_PHONE_NUMBER = process.env.TWILIO_PHONE_NUMBER;

// Phone numbers to call
const PHONE_NUMBERS = process.env.PHONE_NUMBERS ? process.env.PHONE_NUMBERS.split(',') : [];

const client = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);

const API_URL = process.env.API_URL;

const HEADERS = {
  'accept': '*/*',
  'accept-language': 'en-GB,en-US;q=0.9,en;q=0.8',
  'platform': 'district_web',
  'priority': 'u=1, i',
  'referer': 'https://www.district.in/events/tata-ipl-2025-finals-match-in-ahmedabad-june03',
  'sec-ch-ua': '"Chromium";v="136", "Brave";v="136", "Not.A/Brand";v="99"',
  'sec-ch-ua-mobile': '?0',
  'sec-ch-ua-platform': '"macOS"',
  'sec-fetch-dest': 'empty',
  'sec-fetch-mode': 'cors',
  'sec-fetch-site': 'same-origin',
  'sec-gpc': '1',
  'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36',
  'x-app-type': 'ed_web',
  'x-device-id': 'ad08590c-3b63-4843-8287-81f396395154',
  'Cookie': 'your_cookie_string_here'
};

let alarmTriggered = false;

// Function to make phone calls to multiple numbers
async function makePhoneCalls() {
  console.log(`📞 Making phone calls to ${PHONE_NUMBERS.length} numbers...`);
  
  const callPromises = PHONE_NUMBERS.map(async (phoneNumber) => {
    try {
      const call = await client.calls.create({
        twiml: '<Response><Say voice="alice">IPL ticket sale is now live! Rush to book your tickets immediately! The sale has started, go to the website now!</Say></Response>',
        to: phoneNumber,
        from: TWILIO_PHONE_NUMBER,
      });
      
      console.log(`✅ Phone call initiated to ${phoneNumber}: ${call.sid}`);
      return { phoneNumber, success: true, callSid: call.sid };
    } catch (error) {
      console.error(`❌ Error calling ${phoneNumber}:`, error.message);
      return { phoneNumber, success: false, error: error.message };
    }
  });

  const results = await Promise.all(callPromises);
  
  const successful = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;
  console.log(`📊 Call Summary: ${successful} successful, ${failed} failed`);
  
  return results;
}

// Main alert function that triggers phone calls
async function triggerAlert() {
  console.log('🔥🔥🔥 SALE IS LIVE! Triggering phone call alerts... 🔥🔥🔥');
  await makePhoneCalls();
  console.log('🎯 All phone alerts have been triggered!');
}

async function checkSale() {
  try {
    const res = await axios.get(API_URL, { headers: HEADERS });

    console.log("saleCalendar", res.data.data.saleCalendar.sale.isLive);

    const isLiveCalendar = res.data.data.saleCalendar.sale.isLive;
    const isLiveCalendarTime = res.data.data.saleCalendar.sale.start_utc_timestamp;
    console.log(`[${new Date().toISOString()}] Calendar isLive: ${isLiveCalendar}`);

    if ((isLiveCalendar || isLiveCalendarTime != 0) && !alarmTriggered) {
      alarmTriggered = true;
      await triggerAlert();
      return;
    }

    console.log("sales", res.data.data.sales[res.data.data.sales.length - 1].isLive);

    const isLiveSales = res.data.data.sales[res.data.data.sales.length - 1].isLive;
    const isLiveSalesStartTime = res.data.data.sales[res.data.data.sales.length - 1].start_utc_timestamp;

    console.log(`[${new Date().toISOString()}] Sales isLive: ${isLiveSales}`);

    if ((isLiveSales || isLiveSalesStartTime != 0) && !alarmTriggered) {
      alarmTriggered = true;
      await triggerAlert();
    }
  } catch (error) {
    console.error('Error fetching API:', error.message);
  }
}

console.log('🎯 IPL Ticket Monitor Started');
console.log('📞 Will call:', PHONE_NUMBERS.join(', '));
console.log('⏰ Checking every 5 seconds...\n');

setInterval(checkSale, 5000);
