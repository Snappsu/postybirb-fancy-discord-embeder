// if you have any transforms you want to do,
// i think this is a good spot for it


import {ImageSource} from "./types"

const hostRegex = /^(?:https?:\/\/)?(?:[^@\n]+@)?(?:www\.)?([^:\/\n?]+)\.\w+/gm

// here, you can have my source identification <3
/**
 * does some transforms on an image source depending
 * on some hard-coded criteria
 * @param SOURCE - url to the image source
 * @returns - new ImageSource data to use
 */
export function identifySource(SOURCE:string):ImageSource{
    let title = "unkn site"
    let link = SOURCE;
    let emote = null
    let match = [...SOURCE.matchAll(hostRegex)];
    if([match].length != 0 ){
        title = [...match][0][1]
    } 

    // --- custom conversions ---
    switch(title){
        case "furaffinity":
            title = "fur aff";
            emote = { 
                id: "1554015312217641012",
                name: "furaffinity" 
            }
            break;

        // frick x specifically 
        case "twitter":
        case "x":
            link = link.replace("x.com","fixupx.com")
            title = "twitter";
            emote = { 
                id: "1554015267535978496",
                name: "twitter" 
            }
            break;

        case "itaku":
            emote = { 
                id: "1554015287668383816",
                name: "itaku" 
            }
            break; 

        case "bsky":
            emote = { 
                id: "1554015243775123506",
                name: "bsky" 
            }
            break;

        case "e621":
            emote = { 
                id: "1554064786545840163",
                name: "e621" 
            }
            break;
    }

    return {title,link,emote}
}