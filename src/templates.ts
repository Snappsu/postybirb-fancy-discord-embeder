import {env} from "cloudflare:workers"
import * as Types from "./types"

/**
 * Build the embed
 * @param POST - the post to base the embed off of
 * @returns embed JSON string to be posted
 */
export function DiscordEmbed(POST: Types.Post):any {

    let images:any = []
    let sources:any = []
    let contentWarningFound = Boolean(POST.contentWarning)

    // content warning prep
    let contentWarning:any = [
        {
          "type": 10,
          "content": `:warning: **CONTENT WARNING!**${POST.contentWarning?` - ${POST.contentWarning}`:""}`
        },
        {
          "type": 14,
          "divider": true,
          "spacing": 1
        },
    ]

    // check images for info
    POST.images.forEach((image,index)=>{
        // add image components
        images.push(image.imageComponent())

        // if content warning is found
        if(image.contentWarning){
            contentWarningFound = true
            contentWarning[0].content += `\nImage ${index}: ${image.contentWarning}`
        }

        // sources
        if (image.sources.length!=0) sources.push(image.sourceComponent())
        
    })


	let template:any = {
		username: env.EMBED.USERNAME,
        avatar_url: env.EMBED.PFP,
		components: [{
			type: 17,
			accent_color: parseInt((POST.color?POST.color.slice(-6):env.EMBED.DEFAULT_COLOR.slice(-6)),16),
			components: [{
					"type": 12,
                    // images here
					"items": images
				},
				{
					"type": 10,
					"content": `## ${POST.title} - By ${env.ARTIST.NAME}\n${POST.description}`
				},
				{
					"type": 14,
					"divider": true,
					"spacing": 1
				},
                // sources
			],
			"spoiler": false
		}],
		"flags": 32768
	}

    // add sources
    // TODO: add way to label image sources for respective image number
    sources.forEach((list: any,index: number)=>{
        template.components[0].components.push(list)
    })

    // add content warning to top if found
    if (contentWarningFound) {
        template.components[0].components.unshift(contentWarning[1])
        template.components[0].components.unshift(contentWarning[0])
    }

    // return
    return JSON.stringify(template)
}
