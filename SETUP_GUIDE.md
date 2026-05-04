# Just Us App — Setup Guide
### Step-by-step. No coding experience needed.

---

## What you're building

A private website for two people with:
- Shared to-do list with WhatsApp alerts when tasks are checked off
- Daily song suggestion based on your zodiac signs
- Daily 10 AM WhatsApp message: your local weather + world headlines + song

This takes about 45–60 minutes to set up. Go step by step.

---

## Accounts you need to create (all free)

1. **Supabase** — stores your data (database)
2. **Twilio** — sends WhatsApp messages
3. **OpenWeatherMap** — gets weather for your location
4. **GNews** — gets daily headlines
5. **Anthropic** — AI that generates your daily song suggestion
6. **Vercel** — hosts your website for free
7. **GitHub** — stores your code (Vercel reads from here)

---

## STEP 1: Install Node.js

Node.js lets you run the app on your computer.

1. Go to https://nodejs.org
2. Click the button that says **"LTS"** (the green one)
3. Download and install it like any normal app
4. When it asks about anything during installation, click Next/Accept

To confirm it worked:
- On Mac: open **Terminal** (search for it in Spotlight)
- On Windows: open **Command Prompt** (search for it in Start menu)
- Type this and press Enter:
  ```
  node --version
  ```
  You should see something like `v20.0.0`. If you do, you're good.

---

## STEP 2: Create a GitHub account and upload the code

GitHub is like Google Drive for code.

1. Go to https://github.com and create a free account
2. After logging in, click the **+** button (top right) → **New repository**
3. Name it: `just-us-app`
4. Leave everything else default
5. Click **Create repository**

Now upload your code:
1. Open Terminal (Mac) or Command Prompt (Windows)
2. Navigate to where you downloaded this project folder. Example:
   ```
   cd Downloads/just-us-app
   ```
3. Run these commands one by one, pressing Enter after each:
   ```
   git init
   git add .
   git commit -m "first commit"
   git branch -M main
   git remote add origin https://github.com/YOUR-USERNAME/just-us-app.git
   git push -u origin main
   ```
   (Replace YOUR-USERNAME with your actual GitHub username)

Your code is now on GitHub.

---

## STEP 3: Set up Supabase (your database)

1. Go to https://supabase.com and click **Start your project**
2. Sign up with GitHub (easiest)
3. Click **New project**
4. Fill in:
   - **Project name**: `just-us-app`
   - **Database password**: make up a strong password and save it somewhere
   - **Region**: pick the closest one to you (e.g., US East)
5. Click **Create new project** — wait about 2 minutes

**Run the database setup:**
1. In your Supabase project, click **SQL Editor** in the left sidebar
2. Click **New query**
3. Open the file `supabase/schema.sql` from this project on your computer
4. Copy ALL the text in that file
5. Paste it into the SQL editor
6. Click **Run**
7. You should see "Success" messages

**Get your Supabase keys:**
1. Click **Settings** (gear icon) in the left sidebar
2. Click **API**
3. You'll see:
   - **Project URL** → copy this (starts with `https://`)
   - **anon public** key → copy this
   - **service_role** key → copy this (click to reveal)
4. Save all three somewhere safe — you'll need them soon

**Enable real-time:**
1. Click **Database** in the left sidebar
2. Click **Replication**
3. Make sure the `tasks` table has real-time enabled (toggle it on if not)

---

## STEP 4: Set up Twilio WhatsApp

1. Go to https://twilio.com and sign up for a free account
2. After signing in, go to **Console Dashboard**
3. Find and save your **Account SID** and **Auth Token** (they're on the dashboard)

**Set up WhatsApp Sandbox:**
1. In the left sidebar, click **Messaging** → **Try it out** → **Send a WhatsApp message**
2. Follow the instructions to join the sandbox:
   - You'll see something like: "Send 'join [keyword]' to +1 (415) 523-8886"
   - Open WhatsApp on your phone
   - Send that exact message to that number
3. Your friend does the same thing with the same keyword
4. Once joined, both of you can receive messages from the app

**Note:** The free sandbox works for testing. For permanent use, you'd upgrade to a paid Twilio number (about $1/month). The sandbox works fine for personal use as long as you interact with it periodically.

---

## STEP 5: Get OpenWeatherMap API key

1. Go to https://openweathermap.org
2. Click **Sign In** / **Create account** → create a free account
3. After logging in, click your username (top right) → **My API keys**
4. Copy the **Default** key shown there
5. Wait 10-15 minutes before using it (new keys take a bit to activate)

---

## STEP 6: Get GNews API key

1. Go to https://gnews.io
2. Click **Get started for free**
3. Create a free account
4. After logging in, go to your Dashboard
5. Copy your API key

Free plan: 100 requests per day — more than enough.

---

## STEP 7: Get Anthropic API key

1. Go to https://console.anthropic.com
2. Create an account
3. Click **API Keys** in the left sidebar
4. Click **Create Key**
5. Copy the key (starts with `sk-ant-`)
6. Add a small amount of credit ($5 is plenty for months of use)

---

## STEP 8: Deploy to Vercel

Vercel hosts your website for free.

1. Go to https://vercel.com
2. Click **Sign up** → sign up with GitHub
3. Click **Add New...** → **Project**
4. You'll see your GitHub repos — click **Import** next to `just-us-app`
5. **Before clicking Deploy**, scroll to **Environment Variables**
6. Add each of these (click **Add** for each one):

| Key | Value |
|-----|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Your Supabase service role key |
| `TWILIO_ACCOUNT_SID` | Your Twilio Account SID |
| `TWILIO_AUTH_TOKEN` | Your Twilio Auth Token |
| `TWILIO_WHATSAPP_FROM` | `whatsapp:+14155238886` |
| `OPENWEATHER_API_KEY` | Your OpenWeather API key |
| `GNEWS_API_KEY` | Your GNews API key |
| `ANTHROPIC_API_KEY` | Your Anthropic API key (starts with sk-ant-) |
| `CRON_SECRET` | Type any random string, like `mysecretjustusapp123` |
| `NEXT_PUBLIC_INVITE_CODE` | Pick a secret code you and your friend will use to sign up |

7. Click **Deploy**
8. Wait 2-3 minutes. When it says "Congratulations!", your site is live!
9. Click **Continue to Dashboard** — you'll see your site URL (like `just-us-app.vercel.app`)

---

## STEP 9: Create your accounts on the site

1. Go to your site URL (e.g., `https://just-us-app.vercel.app`)
2. Click **Create Account**
3. Fill in your info:
   - Email and password
   - Your display name
   - Your WhatsApp number (with country code, e.g., +12015551234)
   - Your city (e.g., "Newark, NJ")
   - Your zodiac sign
   - The invite code you set in Step 8
4. Check your email and click the confirmation link
5. Come back and log in

Your friend does the same thing with their own info and the same invite code.

---

## STEP 10: Set up the cron job (daily 10 AM messages)

The `vercel.json` file already tells Vercel to run the daily message at 10 AM UTC (which is 10 AM EDT when adjusted). 

**Wait** — Vercel Hobby plan cron jobs run at UTC time. 10 AM EDT = 2 PM UTC. The `vercel.json` is already set to `"0 14 * * *"` which is correct.

To confirm your cron is active:
1. In Vercel, go to your project
2. Click **Settings** → **Cron Jobs**
3. You should see one cron job listed for `/api/cron/morning`

To test it manually (before waiting for 10 AM):
1. In your browser, go to:
   ```
   https://your-site.vercel.app/api/cron/morning
   ```
   But add this header — easiest way is to use a free tool like https://reqbin.com
2. POST request to: `https://your-site.vercel.app/api/cron/morning`
3. Add header: `Authorization: Bearer mysecretjustusapp123` (use your actual CRON_SECRET)
4. Click Send — if it works, you'll get WhatsApp messages immediately

---

## Daily WhatsApp message format

Every morning at 10 AM EDT, both of you get:

```
🌅 Good morning, [your name]!
  10:00 AM ET

☁️ Your weather
📍 Newark, NJ: 68°F (feels 65°F)
Partly cloudy • 72% humidity

📰 World Headlines
1. [headline]
2. [headline]
3. [headline]

🎵 Song of the day (Libra + Pisces)
"Saturn" by SZA
Perfect for quiet reflection today.
```

---

## Task notification format

When someone checks off a task:

```
✅ Task completed!

"Pay the phone bill" was checked off by [name].

  3:42 PM ET
```

Both of you get this immediately.

---

## Troubleshooting

**"I'm not getting WhatsApp messages"**
- Make sure you joined the Twilio sandbox (sent the join message to +14155238886)
- Check your phone number is entered with the country code (+1 for US)
- Sandbox sessions expire after 24 hours of no activity — message the sandbox number again to reactivate

**"The site shows an error"**
- Check Vercel → your project → **Deployments** → click the latest → **Functions** to see error logs

**"The weather is wrong"**
- Update your city in Settings. Use a specific format like "Newark, NJ" or "Paris, France"

**"Tasks aren't updating in real-time"**
- Make sure you enabled real-time for the `tasks` table in Supabase (Step 3)

---

## Cost summary

| Service | Free tier | After free tier |
|---------|-----------|-----------------|
| Vercel | Free forever for personal projects | N/A |
| Supabase | Free (500MB, plenty for you two) | $25/month if you exceed |
| Twilio Sandbox | Free for testing | ~$1/month for a real number |
| OpenWeatherMap | 1,000 calls/day free | N/A at your usage |
| GNews | 100 calls/day free | N/A at your usage |
| Anthropic | ~$0.01 per day for song generation | Pay-as-you-go |

**Realistic total: $0–2/month.**

---

Built with Next.js · Supabase · Twilio · OpenWeatherMap · GNews · Anthropic Claude

