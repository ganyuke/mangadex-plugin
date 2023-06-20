const supportLanguages = require('./support_languages');
const parseMangaDexApi = require('./parse_api');

const baseURL = 'https://api.mangadex.org/manga?includes[]=cover_art&availableTranslatedLanguage[]={0}&title={1}&offset={2}';

class SearchController extends Controller {

    load() {
        let str = localStorage['hints'];
        let hints = [];
        if (str) {
            let json = JSON.parse(str);
            if (json.push) {
                hints = json;
            }
        }
        this.data = {
            list: [],
            focus: false,
            hints: hints,
            text: '',
            loading: false,
            hasMore: false,
        };
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

    makeURL(searchQuery, resultOffset) {
        return baseURL.replace('{0}', this.getLanguage()).replace('{1}', encodeURIComponent(searchQuery)).replace('{2}', resultOffset);
    }

    onSearchClicked() {
        this.findElement('input').submit();
    } 

    onTextChange(text) {
        this.data.text = text;
    }

    async onTextSubmit(text) {
        let hints = this.data.hints;
        if (text.length > 0) {
            if (hints.indexOf(text) < 0) {
                this.setState(()=>{
                    hints.unshift(text);
                    while (hints.length > 30) {
                        hints.pop();
                    }
    
                    localStorage['hints'] = JSON.stringify(hints);
                });
            }
            
            this.setState(()=>{
                this.data.loading = true;
            });
            try {
                let list = await this.request(this.makeURL(text, 0));
                this.key = text;
                this.page = 0;
                this.setState(()=>{
                    this.data.list = list;
                    this.data.loading = false;
                    this.data.hasMore = list.length > 0;
                });
            } catch(e) {
                showToast(`${e}\n${e.stack}`);
                this.setState(()=>{
                    this.data.loading = false;
                });
            }
        }
    }

    onTextFocus() {
        this.setState(()=>{
            this.data.focus = true;
        });
    }

    onTextBlur() {
        this.setState(()=>{
            this.data.focus = false;
        });
    }

    async onPressed(index) {
        await this.navigateTo('book', {
            data: this.data.list[index]
        });
    }

    onHintPressed(index) {
        let hint = this.data.hints[index];
        if (hint) {
            this.setState(()=>{
                this.data.text = hint;
                this.findElement('input').blur();
                this.onTextSubmit(hint);
            });
        }
    }

    async onRefresh() {
        let text = this.key;
        if (!text) return;
        try {
            this.setState(()=>{
                this.data.loading = true;
            });
            let list = await this.request(this.makeURL(text, 0));
            this.page = 0;
            this.setState(()=>{
                this.data.list = list;
                this.data.loading = false;
                this.data.hasMore = list.length > 0;
            });
        } catch(e) {
            showToast(`${e}\n${e.stack}`);
            this.setState(()=>{
                this.data.loading = false;
            });
        }
    }

    async onLoadMore() {
        let page = this.page + 1;
        try {
            this.setState(()=>{
                this.data.loading = true;
            });
            let list = await this.request(this.makeURL(this.key, page * 10));
            this.page = page;
            this.setState(()=>{
                for (let item of list) {
                    this.data.list.push(item);
                }
                this.data.loading = false;
                this.data.hasMore = list.length > 0;
            });
        } catch(e) {
            showToast(`${e}\n${e.stack}`);
            this.setState(()=>{
                this.data.loading = false;
            });
        }
    }

    async request(url) {
        let res = await fetch(url, {
            headers: {
                'User-Agent': 'Kinoko (MangadexPlugin/v0.0.1)',
                'Accept-Language': 'en-US,en;q=0.9',
            }
        });

        let apiResponse = await res.json();

        return this.parseData(apiResponse);
    }

    parseData(apiJSON) {
        return parseMangaDexApi(apiJSON, this.getLanguage());
    }
}

module.exports = SearchController;