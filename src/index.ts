/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `npm run dev` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `npm run deploy` to publish your worker
 *
 * Bind resources to your worker in `wrangler.jsonc`. After adding bindings, a type definition for the
 * `Env` object can be regenerated with `npm run cf-typegen`.
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */

import { env } from "cloudflare:workers";
import { Post} from "./types";

export default {
	async fetch(request, env, ctx): Promise<Response> {
	


		try {
			try {
				let key = request.headers.get("secret")
				if (key != env.API_TOKEN) throw "who are you?"
			} catch (error) {
				throw "who are you?"
			}

			let data=await request.formData()
			//console.log("method:\n",request.method)
			console.log("headers:\n",request.headers)
			console.log("data:\n",data)
			// create post data (from postybirb data)
			let post = new Post(data)

			// upload files to temp bucket
			await post.uploadImagesToBucket()

			// send to discord
			let discordPost = await post.dispatchToDiscord()

			return new Response("check discord!");
		} catch (error) {
			console.error(error)
			return new Response(error?.toString());
		}
		

	},
} satisfies ExportedHandler<Env>;
