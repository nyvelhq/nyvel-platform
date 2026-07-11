# Nyvel Platform — Deployment Guide

## Quick Start Deployment

Choose your preferred platform and follow the steps below.

---

## 🌐 **Option 1: Vercel (Recommended - Easiest)**

**Pros:** Free, automatic deploys from GitHub, SSL included, fast CDN  
**Cons:** Limited to GitHub integration  
**Cost:** Free tier available ($0/month for hobby projects)

### Step 1: Initialize Git Repository
```bash
cd /Users/ebenezeradu-gyamfi/Downloads/nyvel-platform\ 3
git init
git add .
git commit -m "Initial Nyvel platform commit"
```

### Step 2: Create GitHub Repository
1. Go to [github.com/new](https://github.com/new)
2. Repository name: `nyvel-platform`
3. Click **Create repository**
4. Copy commands and run:
```bash
git remote add origin https://github.com/YOUR_USERNAME/nyvel-platform.git
git branch -M main
git push -u origin main
```

### Step 3: Deploy to Vercel
1. Go to [vercel.com](https://vercel.com)
2. Sign up with GitHub
3. Click **New Project**
4. Select your `nyvel-platform` repository
5. Click **Deploy**
6. Wait 2-3 minutes
7. **Get your live URL!** 🎉

**Your app is now live at:** `https://nyvel-platform.vercel.app`

### Step 4: Add Password Protection

#### Option A: Netlify's Built-in Password (Easiest)
Skip this and use Netlify instead (see Option 2).

#### Option B: Custom Password in App
1. Your app now has a password screen built-in (from `PrivateAccess.jsx`)
2. Default password: `nyvel2024`
3. To change it, set environment variable in Vercel:

**In Vercel Dashboard:**
1. Project Settings → Environment Variables
2. Click **Add**
3. Name: `REACT_APP_PASSWORD`
4. Value: `your_secret_password`
5. Click **Save**
6. Redeploy (commit → push)

---

## 🎨 **Option 2: Netlify (Easy + Password Built-in)**

**Pros:** Free, easy password protection, automatic deploys  
**Cost:** Free tier available ($0/month)

### Step 1: Connect to GitHub
Same as Vercel (steps 1-2 above)

### Step 2: Deploy to Netlify
1. Go to [netlify.com](https://netlify.com)
2. Click **New site from Git**
3. Select **GitHub**
4. Choose `nyvel-platform` repository
5. Build settings:
   - **Build command:** `npm run build`
   - **Publish directory:** `build`
6. Click **Deploy site**
7. Wait 2-3 minutes

**Your app is now live at:** `https://nyvel-platform.netlify.app`

### Step 3: Add Password Protection (Easiest Method!)

**Option A: Netlify's Built-in Password (Recommended)**
1. Site settings → **Access control** → **Password protect this site**
2. Enter your password
3. Click **Save**
4. **Done!** Visitors must enter password before accessing

**Option B: Custom App-Level Password**
1. Site settings → **Build & deploy** → **Environment**
2. Add variable:
   - Key: `REACT_APP_PASSWORD`
   - Value: `your_secret_password`
3. Trigger redeploy (push to GitHub)

---

## 📦 **Option 3: GitHub Pages (Free, Simple)**

**Pros:** Completely free, hosted on GitHub  
**Cons:** No password protection without custom workaround  
**Cost:** Free ($0/month)

### Step 1: Setup Git (same as above)

### Step 2: Add gh-pages Package
```bash
npm install --save-dev gh-pages
```

### Step 3: Update `package.json`
```json
{
  "homepage": "https://YOUR_USERNAME.github.io/nyvel-platform",
  "scripts": {
    "predeploy": "npm run build",
    "deploy": "gh-pages -d build"
  }
}
```

### Step 4: Deploy
```bash
npm run deploy
```

**Your app is now live at:** `https://YOUR_USERNAME.github.io/nyvel-platform`

### Step 5: Password Protection
Use the built-in `PrivateAccess` component (already in your app).

---

## 🖥️ **Option 4: DigitalOcean (Traditional VPS)**

**Pros:** Full control, affordable, scalable  
**Cost:** $5-20/month

### Step 1: Create Droplet
1. Go to [digitalocean.com](https://digitalocean.com)
2. Click **Create** → **Droplets**
3. Choose **Ubuntu 22.04** image
4. Size: **Basic $5/month** (enough for testing)
5. Click **Create Droplet**
6. Wait for it to start

### Step 2: SSH into Server
```bash
ssh root@YOUR_DROPLET_IP
```

### Step 3: Install Node.js
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

### Step 4: Clone & Deploy Your App
```bash
git clone https://github.com/YOUR_USERNAME/nyvel-platform.git
cd nyvel-platform
npm install
npm run build
```

### Step 5: Run the App
```bash
npm install -g serve
serve -s build -l 3000
```

**Your app is now running at:** `http://YOUR_DROPLET_IP:3000`

### Step 6: Add Custom Domain (Optional)
1. Buy domain from GoDaddy, Namecheap, etc.
2. Point DNS to DigitalOcean nameservers
3. Add domain in DigitalOcean networking
4. Access via: `https://yourdomain.com`

### Step 7: Keep App Running (Use PM2)
```bash
npm install -g pm2
pm2 start "serve -s build -l 3000" --name "nyvel"
pm2 startup
pm2 save
```

---

## 🔐 **Password Protection Guide**

### How It Works
Your app includes `PrivateAccess.jsx` which:
1. Shows a login screen before the app loads
2. Stores password in browser session storage
3. Requires re-entry after browser restart

### Setting the Password

#### Method 1: Environment Variable
```bash
# In .env file
REACT_APP_PASSWORD=my_secret_password
```

#### Method 2: Default Password
Default is: `nyvel2024`

#### Method 3: In Vercel/Netlify Dashboard
1. Project Settings → Environment Variables
2. Add: `REACT_APP_PASSWORD=your_password`
3. Redeploy (git push to trigger)

### Testing Password Screen Locally
```bash
REACT_APP_PASSWORD=test npm start
```

---

## 📋 **Deployment Checklist**

Before deploying, verify:

- [ ] All code committed: `git status` shows clean
- [ ] No hardcoded secrets in code
- [ ] `.env` file NOT committed (in `.gitignore`)
- [ ] Tests pass: `npm test`
- [ ] Build works: `npm run build` succeeds
- [ ] No console errors: `npm start` and check browser console
- [ ] Dark mode works: toggle in app
- [ ] Responsive: test mobile view
- [ ] Forms work: try entering data
- [ ] Password protection enabled

---

## 🚀 **Post-Deployment**

### Verify Deployment
1. Open your live URL
2. See password screen
3. Enter password
4. Access the app
5. Test dark mode
6. Test navigation
7. Check console for errors

### Share with Others
Simply send them your URL:
```
https://nyvel-platform.vercel.app
```

They'll see:
1. **Password screen** (if protected)
2. Enter password
3. Access the app

### Monitor Performance
- **Vercel:** Dashboard shows analytics
- **Netlify:** Netlify admin panel
- **GitHub Pages:** GitHub pages settings
- **DigitalOcean:** SSH in and check logs

---

## 🔧 **Troubleshooting**

### Build Fails
```bash
# Clear cache and rebuild
rm -rf node_modules package-lock.json
npm install
npm run build
```

### App Won't Start
```bash
# Check Node.js version
node --version  # Should be 16+

# Check if port is in use
lsof -i :3000
```

### Password Not Working
1. Check env variable is set: `echo $REACT_APP_PASSWORD`
2. Rebuild: `npm run build`
3. Clear browser cache: DevTools → Storage → Clear All
4. Restart app

### Domain Not Working
1. Check DNS propagation: [dnschecker.org](https://dnschecker.org)
2. Wait up to 48 hours for DNS to propagate
3. Check SSL certificate (should be auto-generated)

---

## 📊 **Cost Comparison**

| Platform | Free? | Setup Time | Password | SSL | CDN |
|----------|-------|-----------|----------|-----|-----|
| **Vercel** | Yes | 5 min | Custom | ✅ | ✅ |
| **Netlify** | Yes | 5 min | Built-in | ✅ | ✅ |
| **GitHub Pages** | Yes | 10 min | Custom | ✅ | ✅ |
| **DigitalOcean** | No ($5/mo) | 15 min | Custom | Manual | ✅ |

---

## 🎯 **Recommended Setup**

For a **private project link** with **no cost**:
1. **Use Vercel or Netlify** (both free)
2. **Enable password protection** (built-in or custom)
3. **Share URL only with team** (only people with link can access)
4. **Optional:** Add custom domain later

---

## 📞 **Need Help?**

### Common Issues & Solutions

**Q: App shows blank page**
```bash
# Check for errors
npm run build
# Look for errors in output
```

**Q: Password screen appears but password doesn't work**
- Default password: `nyvel2024`
- Check browser console for errors
- Clear browser cache

**Q: Want to change password later?**
- Update env variable
- Git push to trigger redeploy
- Clear browser storage

**Q: How to add custom domain?**
- Vercel: Project Settings → Domains
- Netlify: Site Settings → Domain Management
- DigitalOcean: Networking → Domains

---

## 🎉 **You're Ready to Deploy!**

Choose your platform, follow the steps, and your app will be live in minutes.

**Default password:** `nyvel2024`  
**Remember to change it!**

Happy deploying! 🚀
