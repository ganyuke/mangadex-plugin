const supportLanguages = require('./support_languages');
const parseMangaDexApi = require('./parse_api');

class MainController extends Controller {

    load(data) {
        this.id = data.id;
        this.url = data.url;
        this.page = 0;

        var cached = this.readCache();
        let list;
        if (cached) {
            list = cached.items;
        } else {
            list = [];
        }

        this.data = {
            list: list,
            loading: false,
            hasMore: this.id === 'recently_added'
        };

        this.userAgent = "Kinoko (MangadexPlugin/v0.0.1)";

        if (cached) {
            let now = new Date().getTime();
            if (now - cached.time > 30 * 60 * 1000) {
                this.reload();
            }
        } else {
            this.reload();
        }

        this._reload = ()=>{
            this.reload();
        };
        NotificationCenter.addObserver("reload", this._reload);
    }

    unload() {
        NotificationCenter.removeObserver("reload", this._reload);
    }

    async onPressed(index) {
        await this.navigateTo('book', {
            data: this.data.list[index]
        });
    }

    onRefresh() {
        this.reload();
    }

    async onLoadMore() {
        this.setState(() => {
            this.data.loading = true;
        });
        try {
            let pageNumber = this.page + 1;
            let url = this.makeURL(pageNumber);
            let res = await fetch(url, {
                headers: {
                    'User-Agent': this.userAgent,
                    'Accept-Language': 'en-US,en;q=0.9',
                }
            });
            let text = await res.json();
            this.page = pageNumber;
            let items = this.parseData(text);
    
            this.setState(()=>{
                for (let item of items) {
                    this.data.list.push(item);
                }
                this.data.loading = false;
                this.data.hasMore = items.length > 0;
            });
        } catch (e) {
            showToast(`${e}\n${e.stack}`);
            this.setState(()=>{
                this.data.loading = false;
            });
        }
        
    }

    getLanguage() {
        let lan = localStorage['cached_language'];
        if (lan) return lan;

        for (let name of supportLanguages) {
            if (navigator.language.startsWith(name)) {
                return name;
            }
        }
        return 'en';
    }

    makeURL(pageNumber) {
        return this.url.replace('{0}', this.getLanguage()).replace('{1}', pageNumber * 16).replace('{2}', this.getDateMinusMonth());
    }

    // Calculate today's date - 1 month to replicate MangaDex's "Popular New Titles".
    getDateMinusMonth() {
        const dateNow = new Date();
        dateNow.setDate(dateNow.getDate() - 30)

        return dateNow.toISOString().split('.')[0];
    }

    async reload() {
        this.setState(() => {
            this.data.loading = true;
        });
        try {
            let url = this.makeURL(0);
            let res = await fetch(url, {
                headers: {
                    'User-Agent': this.userAgent,
                    'Accept-Language': 'en-US,en;q=0.9',
                }
            });
            let newPageJSON = await res.json();
            let items = this.parseData(newPageJSON);
            this.page = 0;
            localStorage['cache_' + this.id] = JSON.stringify({
                time: new Date().getTime(),
                items: items,
            });
            this.setState(()=>{
                this.data.list = items;
                this.data.loading = false;
                this.data.hasMore = items.length > 0;
            });
        } catch (e) {
            showToast(`${e}\n${e.stack}`);
            this.setState(()=>{
                this.data.loading = false;
            });
        }
    }

    readCache() {
        let cache = localStorage['cache_' + this.id];
        if (cache) {
            let json = JSON.parse(cache);
            return json;
        }
    }

    parseData(apiJSON) {
        let results = [];
        

        // Add a pretty header to the homepage.
        // TODO: Make localized.
        if (this.id === 'home') {
            results.push({
                header: true,
                title: "Popular New Titles",
            });
        }

        // Normalize the data returned by the MangaDex API.
        let mangadexApi = parseMangaDexApi(apiJSON, this.getLanguage())
        results = results.concat(mangadexApi);

        return results;
    }

}

module.exports = MainController;