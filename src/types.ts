import {env} from "cloudflare:workers"
import * as Conversion from "./conversions"
import * as Build from "./templates"

// postybirb stuff

export class Post {  

    title:string | File | null
    description:string | File | null
    rating:string | File | null
    tags:string | File | null
    images:Array<PostImage> = []
    color:string|null = null

    /**
     * Turns postybirb data into a post
     * @param POSTY_BIRB_FORM_DATA 
     */
    constructor(POSTY_BIRB_FORM_DATA:FormData) {
        // validate
        try {
            this.validateFormData(POSTY_BIRB_FORM_DATA)
        } catch (error) {
            throw (error)
        }

        // metadata
        this.title = POSTY_BIRB_FORM_DATA.get("title")
        this.description = POSTY_BIRB_FORM_DATA.get("description")
        this.rating = POSTY_BIRB_FORM_DATA.get("rating")
        this.tags= POSTY_BIRB_FORM_DATA.get("tags")

        // files
        try {
            let files = POSTY_BIRB_FORM_DATA.getAll("file")
            files.forEach((file,index) => {
                
                if(!(file instanceof File)) throw "given file is not a File" // ensure file is File

                // create temp object
                let tempImage = new PostImage(file)

                // sources
                let sources = POSTY_BIRB_FORM_DATA.getAll(`sourceUrls[${index}]`)
                sources.forEach(source=>{
                    if(!(typeof source === "string")) throw "source is not a string" // ensure file is File
                    tempImage.sources.push(Conversion.identifySource(source))
                })
                // alt text
                let altText = POSTY_BIRB_FORM_DATA.get(`altText[${index}]`)
                if(!(typeof altText === "string")) throw "altText is not a string" // ensure file is File
                tempImage.altText = altText
        
                // thumbnail

                this.images.push(tempImage)
            })
        } catch (error) {
            throw (error)
        }

    }

    /**
     * Check if the form data is valid as per:
     * https://github.com/mvdicarlo/postybirb/blob/main/docs/CUSTOM_WEBSITE.md
     * 
     * Throws error if not.
     * @param FORM_DATA - Form data from the request
     */
    validateFormData(FORM_DATA:FormData){
        // post stuffs
        if(!FORM_DATA.has("title")) throw "'title' field is missing from form data!"
        if(!FORM_DATA.has("description")) throw "'description' field is missing from form data!"
        if(!FORM_DATA.has("tags")) throw "'tags' field is missing from form data!"
        if(!FORM_DATA.has("rating")) throw "'rating' field is missing from form data!"

        // files (at least one needed)
        if(!FORM_DATA.has("file")) throw "'file' field is missing from form data!"
    }

    async uploadImagesToBucket(){
        for (let index = 0; index < this.images.length; index++) {
            await this.images[index].uploadImageToBucket()
        }
    }

    async dispatchToDiscord(){
        
        let body; 
        body = Build.DiscordEmbed(this)
        
        console.log(body)

        const url = `${env.CHANNEL_WEBHOOK}?with_components=true`;
        const options = {method: 'POST', headers: {'content-type': 'application/json'}, body };

        try {
            const response = await fetch(url, options);
            const data = await response.text()
            console.log("discords' response",data)
        } catch (error) {
            throw error
        }
    }
}

// image stuff

export class PostImage {
    name:string
    type:string
    altText:string|null = null
    image:Promise<Uint8Array<ArrayBufferLike>>
    thumbnail:Promise<Uint8Array<ArrayBufferLike>>|undefined = undefined
    previewURL:string|undefined = undefined;
    sources:Array<ImageSource> = []
    spoiled:boolean = false
    contentWarning:string|null = null

    constructor(IMAGE_FILE:File){
        this.name = IMAGE_FILE.name
        this.type = IMAGE_FILE.type
        this.image = IMAGE_FILE.bytes()
    }

    async uploadImageToBucket(){
        let UUID = crypto.randomUUID()
        let key = `POSTY-${UUID}`
        await env.TEMP_BUCKET.put(key, await this.image , {
          httpMetadata: {
					contentType: this.type,
                    
				},
            customMetadata:{ext: this.type}
        });
        this.previewURL=`${env.BUCKET_URL}${key}`
    }

    imageComponent():any{
        let component:any = {
            "media": {
            "url": `${this.previewURL}${this.type=="image/gif"?".gif":""}`
            },
            "spoiler": this.spoiled,
            
        }

        if(this.altText) component["description"]=this.altText

        return component
    }

    sourceComponent():any{
        if (this.sources.length==0) return {}
        
        let component:any = {
            "type": 1,
            "components": []
        }
        
        for (let index = 0; index < this.sources.length; index++) {
            let temp:any = {
                "type": 2,
                "style": 5,
                "label": this.sources[index].title,
                "url": this.sources[index].link,
            }

            // if emote
            if (this.sources[index].emote) {
                let emote = this.sources[index].emote
                temp["emoji"] = emote
            }

            component.components.push(temp)
        }
        
        return component
    }
}

export type ImageSource = {
    title:string,
    link:string,
    emote:{
        id: string,
        name: string,
    }|null
}