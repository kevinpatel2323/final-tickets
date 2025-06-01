# IPL Ticket Monitor

This project monitors IPL ticket sales and triggers alerts (phone calls and siren sound) when sales go live.

## Railway Deployment

### 1. Prerequisites
- [Railway account](https://railway.app/)
- [Railway CLI](https://docs.railway.app/develop/cli) (`npm install -g @railway/cli`)

### 2. Deploy Steps

```bash
# Install dependencies
npm install

# Login to Railway
railway login

# Initialize Railway project
railway init

# Deploy
railway up
```

### 3. Set Environment Variables
After deploying, go to your Railway project dashboard and set the following variables in the **Variables** section:

- `SIREN_PATH` (optional, see below)
- `TWILIO_ACCOUNT_SID`
- `TWILIO_AUTH_TOKEN`
- `TWILIO_PHONE_NUMBER`
- `PHONE_NUMBERS` (comma-separated, e.g. `+919712323801,+919428123696`)
- `API_URL`

You can use the `.env.example` file as a reference for required variables.

#### Siren Sound File Note
Railway does not support uploading arbitrary files directly. If you want to play a siren sound, you must:
- Commit the siren MP3 file to your repo (not recommended for large files or copyright content), **or**
- Use a different alert method (e.g., just phone calls or a different notification)

If you do not set `SIREN_PATH` or the file is missing, the siren will not play, but phone calls will still work.

---

## Local Development

1. Copy `.env.example` to `.env` and fill in your values.
2. Run with `npm start`.

---

## License
MIT 