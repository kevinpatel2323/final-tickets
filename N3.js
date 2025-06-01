const axios = require('axios');
const twilio = require('twilio');
const player = require('play-sound')();
const path = require('path');
require('dotenv').config();

// Required environment variables:
// SIREN_PATH, TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER, PHONE_NUMBERS (comma-separated), API_URL
//
// Example: PHONE_NUMBERS='+919712323801,+919428123696'
//
// Set these in Railway dashboard after deploy.

// Audio configuration
const SIREN_PATH = process.env.SIREN_PATH;

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
  'Cookie': 'x-device-id=ad08590c-3b63-4843-8287-81f396395154; insider-cookie-detection=enabled; cachedCity=online; skip_online_overlay=true; x-access-token=1748542787192940804_3489540834694769336_40c8197dd1a9b41e7fd60a646d9e2a365b7818bd3c790d5e5238dc9385724048; x-refresh-token=1748542787192944744_4606995575716020930_4673e84925a475e05404cd1847fd2da672f5c13243e2156f761db781bef21640; location=%7B%22id%22%3A11%2C%22title%22%3A%22Ahmedabad%22%2C%22lat%22%3A23.033938956712916%2C%22long%22%3A72.57696301365426%2C%22subtitle%22%3A%22Gujarat%22%2C%22cityId%22%3A11%2C%22cityName%22%3A%22Ahmedabad%22%2C%22pCityId%22%3A%221%22%2C%22pCityKey%22%3A%22ahmedabad%22%2C%22pCityName%22%3A%22Ahmedabad%22%2C%22pStateKey%22%3A%22gujarat%22%2C%22pStateName%22%3A%22Gujarat%22%7D; admitAd=false; utm_source=CRM; utm_medium=FinalIPL2025LandingPage; ak_bmsc=24B1E84C9CD195AC4F687FE79FC3EF31~000000000000000000000000000000~YAAQv/Q3F1Ml986WAQAAkDl/JRsY6oRvft+uAqiIfkCgMKy8GRZJh+zdjO+PwZRWiNHYr8r5dB1w9TOfcBWPx9gJLZz5uYmTtbXm5e+/iEgsfb6Nj/pOwh+9T655msrLvE1ub+soaseBVvzSyciRMGgywTKsJ2DIVvHp5ugHC7ehMcyOzXJ6aUJ44AKDIqjK2vMj9AhsTleEKKguyX34kol9WqiIQ1DCXkP7RoJToiGKygb8XL8U/yyuni/ALhYUWHwdzKCsj9Chs2SP6kpxYZloXEOY2ofe33IjsmPgYYpAjNdLYOr9VRXVGRmsnFhoHWLzFztlaUeONvFiqr7hEfLOMbLAn6m/jwEqKk2bxXSpX3MyfKPDKODojNkhqcJVCHfEe/W9vf9Xt3klugFi+sbGKNOCFnJskg==; AKA_A2=A; QueueFair-Pass-gstataipl2025qualifier2may2914324=qfqid=ERKMXrbEt4ztIpngd_2SMb&qfts=1748681045&qfa=paytminsider&qfq=gstataipl2025qualifier2may2914324&qfpt=Queued&qfh=f3c710e660daf1e25a8facad18e754f496f559df29dcecd81bbdda9507d9082c; userProfile=; _dd_s=logs=1&id=fc5d7191-fee9-4075-91f2-9ec4a93b804b&created=1748680782754&expire=1748682246010&rum=2; bm_sv=DDE8F13DAA700D25D89EB2F8155B385C~YAAQv/Q3F0my986WAQAAfs2HJRvMpCWlrg/7DR5Kt2bxFlEzT6A8EoHYv+9oYkkb1Ucaiht4I7ZdMgIt28e1fAeHgs9XrDPRRs2CKJF0VmA5zPWkp3pHmuAYKy6TjnYiY9BAGA86xmWKfYpiRwbnxDfgvg91ej4zvw8MOZ9r0gi1BUvbo1wMevsUM6rHGERuxJgSNl90S7IcHNhMRM4vvSTlR3hio8x75PWNsZxB5Khvhs66WOknM8leUsjZITN1FZVA~1'
};

let alarmTriggered = false;

// Function to play siren sound
function playSiren() {
  console.log('🚨 Playing siren sound...');
  player.play(SIREN_PATH, err => {
    if (err) {
      console.error('Error playing siren:', err);
    } else {
      console.log('✅ Siren played successfully');
    }
  });
}

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

  // Wait for all calls to complete
  const results = await Promise.all(callPromises);
  
  // Log summary
  const successful = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;
  console.log(`📊 Call Summary: ${successful} successful, ${failed} failed`);
  
  return results;
}

// Main alert function that triggers both siren and phone calls
async function triggerAlert() {
  console.log('🔥🔥🔥 SALE IS LIVE! Triggering all alerts... 🔥🔥🔥');
  
  // Play siren immediately (non-blocking)
  playSiren();
  
  // Make phone calls (async)
  await makePhoneCalls();
  
  console.log('🎯 All alerts have been triggered!');
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
      return; // Exit early to avoid duplicate triggers
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
console.log('🚨 Will play siren from:', SIREN_PATH);
console.log('⏰ Checking every 5 seconds...\n');

setInterval(checkSale, 5000);