// Shared function to normalize the data from MangaDex's `/manga` API endpoint.
function parseMangaDexApi(apiJSON, language) {
    let json = JSON.parse(apiJSON);
    let results = [];

    // Stop parsing JSON if MangaDex's API returns an error.
    if (json['result'] === 'error') {
        showToast(`MangaDex API returned error:` + json['errors'][0]['title']);
        return results;
    }

    let books = json['data'];
    
    for (let book of books) {
        let item = {
            link: `https://api.mangadex.org/manga/${book['id']}`,
            title: book['attributes']['title'][language],
            picture: ''
        };
        for (let relation of book['relationships']) {
            if (relation.type === "cover_art") {
                item.picture = `https://uploads.mangadex.org/covers/${book['id']}/${relation['attributes']['fileName']}`;
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

exports.parseMangaDexApi = parseMangaDexApi;