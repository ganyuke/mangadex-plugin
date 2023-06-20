class IndexController extends Controller {
    load() {
        this.data = {
            tabs: [
                {
                    "title": "Home",
                    "id": "home",
                    "url": "https://api.mangadex.org/manga?includes[]=cover_art&order[followedCount]=desc&contentRating[]=safe&contentRating[]=suggestive&hasAvailableChapters=true&availableTranslatedLanguage[]={0}&offset={1}&createdAtSince={2}"
                },
                {
                    "title": "Recently Added",
                    "id": "recently_added",
                    "url": "https://api.mangadex.org/manga?limit=15&contentRating[]=safe&contentRating[]=suggestive&contentRating[]=erotica&order[createdAt]=desc&includes[]=cover_art&availableTranslatedLanguage[]={0}&offset={1}"
                }, 
            ]
        };
    }
}

module.exports = IndexController;