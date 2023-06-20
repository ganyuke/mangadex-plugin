function getLanguage() {
    let lan = localStorage['cached_language'];
    if (lan) return lan;

    for (let name of supportLanguages) {
        if (navigator.language.startsWith(name)) {
            return name;
        }
    }
    return 'en';
}

function parseData(language, rawMangaResponse, rawChapterResponse) {
    let mangaJSON = JSON.parse(rawMangaResponse);
    let chapterJSON = JSON.parse(rawChapterResponse);

    // Stop parsing JSON if MangaDex's API returns an error.
    if (mangaJSON['result'] === 'error') {
        showToast(`MangaDex API returned error:` + json['errors'][0]['title']);
        return;
    }
    if (chapterJSON['result'] === 'error') {
        showToast(`MangaDex API returned error:` + json['errors'][0]['title']);
        return;
    }

    let title = mangaJSON['data']['attributes']['title'][language]
    let subtitle;
    let summary;

    for (let relation of book['relationships']) {
        if (relation.type === "cover_art") {
            item.picture = `https://uploads.mangadex.org/covers/${book['id']}/${relation['attributes']['fileName']}`;
            break;
        }
    };
    for (let altTitle of book['attributes']['altTitles']) {
        if (language in altTitle) {
            subtitle = altTitle[language];
            break;
        }
    };

    if (language in book['attributes']['description']) {
        summary = book['attributes']['description'][language];
    }


    let list = [];
    let chapters = chapterJSON['data'];
    for (let chapter of chapters) {
        let formattedTitle = chapter['attributes']['title'] !== "" ? chapter['attributes']['title'] : `Vol. ${chapter['attributes']['volume']} Ch. ${chapter['attributes']['chapter']}`
        list.push({
            title: formattedTitle,
            subtitle: null,
            link: `https://api.mangadex.org/at-home/server/${chapter['id']}`,
        });
    }
    return {
        title: title,
        subtitle: subtitle,
        summary: summary,
        list: list.reverse(),
    };
}

module.exports = async function (url) {
    const headers = {
        'User-Agent': 'Kinoko (MangadexPlugin/v0.0.1)',
        'Accept-Language': 'en-US,en;q=0.9',
    }
    let mangaResponse = await fetch(url, {headers: headers});
    let chapterResponse = await fetch(url + "/feed", {headers: headers});

    let rawMangaResponse = await mangaResponse.json();
    let rawChapterResponse = await chapterResponse.json();

    return parseData(getLanguage(), rawMangaResponse, rawChapterResponse);
}