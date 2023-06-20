const bookFetch = require('./book_fetch');

/**
 * @property {String}key need override the key for caching
 * @method load need override,
 * @method checkNew need override
 */
class MangaProcesser extends Processor {

    // The key for caching data
    get key() {
        return this.data.link;
    }

    /**
     * 
     * Start load pictures
     * 
     * @param {*} state The saved state.
     */
    async load(state) {
        try {
            let root_url = this.data.link;
            this.loading = true;
            if (state && state.urls) {
            } else {
                // Retrieve the Manga-At-Home URLs from MangaDex
                let mangaAtHome = await this.fetch(root_url);
                let urls = [];

                // Stop parsing JSON if MangaDex's API returns an error.
                if (mangaAtHome['result'] === 'error') {
                    showToast(`MangaDex API returned error:` + mangaAtHome['errors'][0]['title']);
                    return;
                }

                // Construct the image URLs
                for (let i = 0, t = mangaAtHome['chapter']['data'].length; i < t; i++) {
                    urls.push(mangaAtHome['baseUrl'] + "/data/" + mangaAtHome['chapter']['hash'] + "/" + mangaAtHome['chapter']['data'][i]);
                }

                state = {
                    index: 0,
                    urls: urls,
                }
            }

            const that = this;
            function normalizeImages() {
                let imgs = state.urls;
                for (let i = 0, t = imgs.length; i < t; ++i) {
                    let img = imgs[i];
                    /**
                     * @property {String} url The picture url.
                     * @property {Object*} headers The picture headers.
                     */
                    that.setDataAt({
                        url: img,
                    }, i);
                }

            }

            this.save(false, state);
            if (this.disposed) return;
            normalizeImages()

            this.save(true, state);
            this.loading = false;
        } catch (e) {
            console.log(`err ${e}\n${e.stack}`);
            this.loading = false;
        }
    }

    async fetch(url) {
        console.log(`request ${url}`);
        let res = await fetch(url, {
            headers: {
                'User-Agent': 'Kinoko (MangadexPlugin/v0.0.1)',
                'Accept-Language': 'en-US,en;q=0.9',
            }
        });
        let apiResponse = await res.json();
        return apiResponse;
    }

    // Called in `dispose`
    unload() {

    }

    // Check for new chapter
    async checkNew() {
        let url = this.data.link;
        let data = await bookFetch(url);
        var item = data.list[data.list.length - 1];
        /**
         * @property {String}title The last chapter title.
         * @property {String}key The unique identifier of last chpater.
         */
        return {
            title: item.title,
            key: item.link,
        };
    }
}

module.exports = MangaProcesser;