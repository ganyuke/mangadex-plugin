// Shared function to normalize the data from MangaDex's `/manga` API endpoint.
function parseMangaDexApi(apiJSON, language) {
    // Stop parsing JSON if MangaDex's API returns an error.
    if (apiJSON['result'] === 'error') {
        console.log("we've enoucntered an error")
        console.log(apiJSON['result'])
        return;
    }

    let results = [];

    let books = apiJSON['data'];
    
    for (let book of books) {
        let item = {
            link: `https://api.mangadex.org/manga/${book['id']}`,
            title: book['attributes']['title'][language],
            picture: ''
        };
        for (let relation of book['relationships']) {
            if (relation.type === "cover_art") {
                item.picture = `https://uploads.mangadex.org/covers/${book['id']}/${relation['attributes']['fileName']}.256.jpg`;
                break;
            }
        };
        for (let altTitle of book['attributes']['altTitles']) {
            if (language in altTitle) {
                item.subtitle = altTitle[language];
                break;
            }
        };

        results.push(item);
    }

    return results;
}

module.exports = parseMangaDexApi;