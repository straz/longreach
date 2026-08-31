What you need to do (needs your Cloudflare auth)

```
% cd test4/worker
% pnpm dlx wrangler login
% pnpm dlx wrangler secret put OPENROUTER_API_KEY
  # paste line 2 of ~/.config/openrouter
% pnpm dlx wrangler deploy
```

worker name: `longreach-test4`
deployed at: https://longreach-test4.longreach.workers.dev

Then set the GitHub Actions variable TEST4_PARSE_URL to the deployed …workers.dev/parse URL (or edit PROD_PARSE_URL in src/pages/Approve/parse.ts). For local dev: cp test4/.env.example test4/.env and cp test4/worker/.dev.vars.example test4/worker/.dev.vars.
