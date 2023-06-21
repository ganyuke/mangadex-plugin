# MangaDex Plugin
A plugin to search content on MangaDex on [Kinoko](https://github.com/gsioteam/kinoko).

## TODO:
- [x] Unbreak everything.
- [?] Figure out why some images fail to download with `Failed to decode image` and `android.graphics.ImageDecoder$DecodeException: Failed to create image decoder with message 'unimplemented'Input contained an error.`.
    - I just looked at the same manga chapter which did that and that one's not broken anymore. I have no clue why.
- [x] Uncomment favorites & history interaction logic.
- [x] Check if downloading actually works.
- [x] Figure out why sliding left on the first page of a chapter goes to the next chapter instead of the previous.
    - Switched the API to fetch descending instead of ascending. But now I have to also fix loading all the chapters.
- [ ] Load all chapters available, instead of the default 100 allowed by the API.
- [x] Decide what to do with all those chapter subtitles.
    - Must credit scanlation groups.
- [ ] Handle rate-limits for AtHome.
- [ ] Add settings to configure:
    - [ ] NSFW settings
    - [ ] Language
    - [ ] Image quality