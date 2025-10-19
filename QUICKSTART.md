# Truthy - Quick Start Guide

## 🎉 Setup Complete!

Your Truthy MVP is ready to run. Follow these steps to get started.

---

## Prerequisites

- Node.js 18+ installed
- A Gemini API key from [Google AI Studio](https://aistudio.google.com/apikey)

---

## Setup Steps

### 1. Configure Environment

```bash
cp .env.example .env
```

Edit `.env` and add your API key:

```bash
NEXT_PUBLIC_GEMINI_API_KEY=your_actual_api_key_here
```

⚠️ **Important**: This exposes the API key in the browser. **Only use throwaway/demo keys!** For production, implement the server-side proxy (see `docs/TODO.md`).

### 2. Run the Development Server

```bash
npm run dev
```

The app will start at **http://localhost:3000**

---

## Usage

### Main Debate Interface

1. Open **http://localhost:3000/debate**
2. Wait for both "Speaker A" and "Speaker B" indicators to turn green
3. Click **"Start Recording"**
4. Use the **Speaker A / B toggle** to switch active speakers
5. Speak factual claims into your microphone
6. Watch transcripts appear in the left panels
7. See verdict cards populate on the right

### OBS Overlay (for Livestreams)

1. Open **http://localhost:3000/overlay** in a browser
2. In OBS, add a **Browser Source**:
   - URL: `http://localhost:3000/overlay`
   - Width: 1920
   - Height: 200
3. The latest verdict will appear as a lower-third overlay

---

## Demo Tips

### Sample Claims to Try

**True/Mostly True**:
- "Violent crime in Chicago dropped 17% this year"
- "The unemployment rate in the US is around 4%"

**Mixed**:
- "Inflation has doubled" (depends on metric)

**False**:
- "Unemployment is at 15%" (easily refuted)

### Best Practices

- Use **headphones** to avoid echo
- Speak **clearly** with pauses between claims
- Keep claims **fact-based** (not opinions)
- Test **mic permissions** before starting

---

## Known Limitations (MVP)

✅ **Working**:
- Two-speaker toggle (manual switch)
- Real-time transcription
- Mock tool endpoints (realistic data)
- Verdict display with sources
- OBS overlay route

⚠️ **Not Yet Implemented**:
- Real Gemini tool calling (temporarily disabled due to SDK type issues)
- Actual Vectara/web search integration
- Database persistence
- LiveKit multi-track audio
- Automatic speaker diarization

See `docs/TODO.md` for the full post-hackathon roadmap.

---

## Troubleshooting

### "Connection Failed"
- Check that `NEXT_PUBLIC_GEMINI_API_KEY` is set in `.env`
- Verify the API key is valid at [Google AI Studio](https://aistudio.google.com/apikey)

### No Audio
- Grant microphone permissions in browser settings
- Check browser console for errors
- Try Chrome/Edge (best Web Audio support)

### Build Errors
- Run `npm install` to ensure all dependencies are installed
- Run `npx prisma generate` to generate Prisma client
- Check Node.js version: `node --version` (should be 18+)

---

## Next Steps

1. **Test the demo** with sample claims
2. **Record a demo video** (see `docs/DEMO.md` for a script)
3. **Read the architecture** in `docs/ARCHITECTURE.md`
4. **Plan integrations** using `docs/TODO.md`

---

## Documentation

- **README.md** - Full project overview
- **docs/ARCHITECTURE.md** - System design + diagrams
- **docs/DEMO.md** - Demo script for presentations
- **docs/TODO.md** - Post-hackathon roadmap
- **docs/PRD.md** - Product requirements
- **docs/TDS.md** - Technical design spec
- **docs/API.md** - Tool API documentation
- **docs/PROMPTS.md** - System prompts + guidelines

---

## Support

- **GitHub Issues**: [Report bugs](https://github.com/yourusername/truthy/issues)
- **Documentation**: See `docs/` folder
- **Questions**: Check README.md FAQ section

---

**Built with ⚖️ for informed democracies**
