const supportLanguages = require('./support_languages');

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

function parseData(language, mangaJSON, chapterJSON) {
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
    let subtitle = null;
    let summary = null;;
    let book = mangaJSON['data'];

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
        let volumeNum = chapter['attributes']['volume']
        let chapterNum = chapter['attributes']['chapter']
        let chapterTitle = chapter['attributes']['title']
        let formattedTitle = (volumeNum ? "Vol. " + volumeNum : "") + (chapterNum ? " Ch. " + chapterNum : "") + (chapterTitle ? " - " + chapterTitle : "")

        let scanlation_group;
        for (let relation of chapter['relationships']) {
            if (relation['type'] === 'scanlation_group') {
                scanlation_group = relation['attributes']['name'];
                break;
            }
        };

        list.push({
            title: formattedTitle,
            subtitle: scanlation_group ? `TL: ${scanlation_group}` : null,
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

module.exports = async function (url, pageNumber) {
    const headers = {
        'User-Agent': 'Kinoko (MangadexPlugin/v0.0.1)',
        'Accept-Language': 'en-US,en;q=0.9',
    }

    let rawMangaResponse = await fetch(url, { headers: headers });
    let mangaResponse = await rawMangaResponse.json();

    let rawChapterResponse = await fetch(`${url}/feed?order[createdAt]=desc&order[volume]=desc&order[chapter]=desc&includes[]=scanlation_group&translatedLanguage[]=${getLanguage()}&offset=${pageNumber ? pageNumber * 100 : 0}&limit=100`, { headers: headers });
    let chapterResponse = await rawChapterResponse.json();

    return parseData(getLanguage(), mangaResponse, chapterResponse);
}