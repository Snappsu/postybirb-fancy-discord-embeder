import {ImageSource} from "./types"

const hostRegex = /^(?:https?:\/\/)?(?:[^@\n]+@)?(?:www\.)?([^:\/\n?]+)\.\w+/gm

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