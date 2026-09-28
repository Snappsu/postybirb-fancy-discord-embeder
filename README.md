This is the Cloudflare worker I use to make those fancy embeds you may have seen me post.
It's very bare bones and stiff right now as I *just* refactored it from my old system.

# Embed Preview
<img width="780" height="746" alt="image" src="https://github.com/user-attachments/assets/bfb8f56a-2891-4669-8ad5-c9bf54377155" />

# Setup
## `.env`
`API_TOKEN` - The secret used to access the service
`CHANNEL_WEBHOOK` - Webhook URL to where the embed should be posted

## `wrangler.jsonc`
### `r2_buckets`
Just make sure you bring one to use.
Binding your own should be fairly self explanatory.
If not, read this: https://developers.cloudflare.com/r2/api/workers/workers-api-usage/#3-bind-your-bucket-to-a-worker
### `vars`
```js
"vars": {
		"BUCKET_URL": "", //domain where image bucket can be accessed (ex: "https://temp.snapps.dev/")
		"EMBED": {
			"DEFAULT_COLOR":"", // default embed color (ex: "#7ec34e")
			"PFP":"", // image url for the pfp for the embed (ex: "https://cdn.snapps.dev/images/me.png")
			"USERNAME":"" // username for the embed (ex: "snapps but faster")
		}
	}
```

## PostyBirb
- Using v4.3 or newer, make a new custom account.
- Set `File Batch Limit` to `4`
- Set `Description Type` to `Plain Text`
- Add a custom header `secret` and set it to be whatever api secret token you want to use.
- Save
- Enjoy!
