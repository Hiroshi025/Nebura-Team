'use strict';

customElements.define('compodoc-menu', class extends HTMLElement {
    constructor() {
        super();
        this.isNormalMode = this.getAttribute('mode') === 'normal';
    }

    connectedCallback() {
        this.render(this.isNormalMode);
    }

    render(isNormalMode) {
        let tp = lithtml.html(`
        <nav>
            <ul class="list">
                <li class="title">
                    <a href="index.html" data-type="index-link">nebura-control documentation</a>
                </li>

                <li class="divider"></li>
                ${ isNormalMode ? `<div id="book-search-input" role="search"><input type="text" placeholder="Type to search"></div>` : '' }
                <li class="chapter">
                    <a data-type="chapter-link" href="index.html"><span class="icon ion-ios-home"></span>Getting started</a>
                    <ul class="links">
                        <li class="link">
                            <a href="overview.html" data-type="chapter-link">
                                <span class="icon ion-ios-keypad"></span>Overview
                            </a>
                        </li>
                        <li class="link">
                            <a href="index.html" data-type="chapter-link">
                                <span class="icon ion-ios-paper"></span>README
                            </a>
                        </li>
                        <li class="link">
                            <a href="changelog.html"  data-type="chapter-link">
                                <span class="icon ion-ios-paper"></span>CHANGELOG
                            </a>
                        </li>
                        <li class="link">
                            <a href="contributing.html"  data-type="chapter-link">
                                <span class="icon ion-ios-paper"></span>CONTRIBUTING
                            </a>
                        </li>
                        <li class="link">
                            <a href="license.html"  data-type="chapter-link">
                                <span class="icon ion-ios-paper"></span>LICENSE
                            </a>
                        </li>
                                <li class="link">
                                    <a href="dependencies.html" data-type="chapter-link">
                                        <span class="icon ion-ios-list"></span>Dependencies
                                    </a>
                                </li>
                                <li class="link">
                                    <a href="properties.html" data-type="chapter-link">
                                        <span class="icon ion-ios-apps"></span>Properties
                                    </a>
                                </li>
                    </ul>
                </li>
                    <li class="chapter modules">
                        <a data-type="chapter-link" href="modules.html">
                            <div class="menu-toggler linked" data-bs-toggle="collapse" ${ isNormalMode ?
                                'data-bs-target="#modules-links"' : 'data-bs-target="#xs-modules-links"' }>
                                <span class="icon ion-ios-archive"></span>
                                <span class="link-name">Modules</span>
                                <span class="icon ion-ios-arrow-down"></span>
                            </div>
                        </a>
                        <ul class="links collapse " ${ isNormalMode ? 'id="modules-links"' : 'id="xs-modules-links"' }>
                            <li class="link">
                                <a href="modules/AdminModule.html" data-type="entity-link" >AdminModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                            'data-bs-target="#controllers-links-module-AdminModule-d0da34a2155fe2b3f88fc9a499f5f053649398afed85c574e3a003b33b8d9f9b5b629b618a40d1bc52aaebb9b1515f67130ac7ecb585c359ff614f71a638b694"' : 'data-bs-target="#xs-controllers-links-module-AdminModule-d0da34a2155fe2b3f88fc9a499f5f053649398afed85c574e3a003b33b8d9f9b5b629b618a40d1bc52aaebb9b1515f67130ac7ecb585c359ff614f71a638b694"' }>
                                            <span class="icon ion-md-swap"></span>
                                            <span>Controllers</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="controllers-links-module-AdminModule-d0da34a2155fe2b3f88fc9a499f5f053649398afed85c574e3a003b33b8d9f9b5b629b618a40d1bc52aaebb9b1515f67130ac7ecb585c359ff614f71a638b694"' :
                                            'id="xs-controllers-links-module-AdminModule-d0da34a2155fe2b3f88fc9a499f5f053649398afed85c574e3a003b33b8d9f9b5b629b618a40d1bc52aaebb9b1515f67130ac7ecb585c359ff614f71a638b694"' }>
                                            <li class="link">
                                                <a href="controllers/AdminCacheController.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >AdminCacheController</a>
                                            </li>
                                            <li class="link">
                                                <a href="controllers/AdminController.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >AdminController</a>
                                            </li>
                                            <li class="link">
                                                <a href="controllers/AdminIPBlockerController.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >AdminIPBlockerController</a>
                                            </li>
                                            <li class="link">
                                                <a href="controllers/AdminLicenceController.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >AdminLicenceController</a>
                                            </li>
                                        </ul>
                                    </li>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                        'data-bs-target="#injectables-links-module-AdminModule-d0da34a2155fe2b3f88fc9a499f5f053649398afed85c574e3a003b33b8d9f9b5b629b618a40d1bc52aaebb9b1515f67130ac7ecb585c359ff614f71a638b694"' : 'data-bs-target="#xs-injectables-links-module-AdminModule-d0da34a2155fe2b3f88fc9a499f5f053649398afed85c574e3a003b33b8d9f9b5b629b618a40d1bc52aaebb9b1515f67130ac7ecb585c359ff614f71a638b694"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-AdminModule-d0da34a2155fe2b3f88fc9a499f5f053649398afed85c574e3a003b33b8d9f9b5b629b618a40d1bc52aaebb9b1515f67130ac7ecb585c359ff614f71a638b694"' :
                                        'id="xs-injectables-links-module-AdminModule-d0da34a2155fe2b3f88fc9a499f5f053649398afed85c574e3a003b33b8d9f9b5b629b618a40d1bc52aaebb9b1515f67130ac7ecb585c359ff614f71a638b694"' }>
                                        <li class="link">
                                            <a href="injectables/CacheService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >CacheService</a>
                                        </li>
                                        <li class="link">
                                            <a href="injectables/IPBlockerService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >IPBlockerService</a>
                                        </li>
                                        <li class="link">
                                            <a href="injectables/LicenceService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >LicenceService</a>
                                        </li>
                                        <li class="link">
                                            <a href="injectables/UserService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >UserService</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                            <li class="link">
                                <a href="modules/AppModule.html" data-type="entity-link" >AppModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                            'data-bs-target="#controllers-links-module-AppModule-264f12a5a60147ebddda29d2dc6c1d3a58c6bc6770baa401ae1deeee4bca3194a984aa2ea79c0cbbe71517bd54c299b502cd328c73d28ea04580e1bfe7b313f6"' : 'data-bs-target="#xs-controllers-links-module-AppModule-264f12a5a60147ebddda29d2dc6c1d3a58c6bc6770baa401ae1deeee4bca3194a984aa2ea79c0cbbe71517bd54c299b502cd328c73d28ea04580e1bfe7b313f6"' }>
                                            <span class="icon ion-md-swap"></span>
                                            <span>Controllers</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="controllers-links-module-AppModule-264f12a5a60147ebddda29d2dc6c1d3a58c6bc6770baa401ae1deeee4bca3194a984aa2ea79c0cbbe71517bd54c299b502cd328c73d28ea04580e1bfe7b313f6"' :
                                            'id="xs-controllers-links-module-AppModule-264f12a5a60147ebddda29d2dc6c1d3a58c6bc6770baa401ae1deeee4bca3194a984aa2ea79c0cbbe71517bd54c299b502cd328c73d28ea04580e1bfe7b313f6"' }>
                                            <li class="link">
                                                <a href="controllers/AppController.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >AppController</a>
                                            </li>
                                            <li class="link">
                                                <a href="controllers/UtilsController.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >UtilsController</a>
                                            </li>
                                        </ul>
                                    </li>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                        'data-bs-target="#injectables-links-module-AppModule-264f12a5a60147ebddda29d2dc6c1d3a58c6bc6770baa401ae1deeee4bca3194a984aa2ea79c0cbbe71517bd54c299b502cd328c73d28ea04580e1bfe7b313f6"' : 'data-bs-target="#xs-injectables-links-module-AppModule-264f12a5a60147ebddda29d2dc6c1d3a58c6bc6770baa401ae1deeee4bca3194a984aa2ea79c0cbbe71517bd54c299b502cd328c73d28ea04580e1bfe7b313f6"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-AppModule-264f12a5a60147ebddda29d2dc6c1d3a58c6bc6770baa401ae1deeee4bca3194a984aa2ea79c0cbbe71517bd54c299b502cd328c73d28ea04580e1bfe7b313f6"' :
                                        'id="xs-injectables-links-module-AppModule-264f12a5a60147ebddda29d2dc6c1d3a58c6bc6770baa401ae1deeee4bca3194a984aa2ea79c0cbbe71517bd54c299b502cd328c73d28ea04580e1bfe7b313f6"' }>
                                        <li class="link">
                                            <a href="injectables/ClientListener.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >ClientListener</a>
                                        </li>
                                        <li class="link">
                                            <a href="injectables/HealthService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >HealthService</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                            <li class="link">
                                <a href="modules/AuthModule.html" data-type="entity-link" >AuthModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                            'data-bs-target="#controllers-links-module-AuthModule-bdfffd24312fc99163f30a059112629fdbe3920eea84e8266e46a11bca07bf058ede4cc57b0b42a53638441731617176eb62911d3f703efc996747f9eaee541e"' : 'data-bs-target="#xs-controllers-links-module-AuthModule-bdfffd24312fc99163f30a059112629fdbe3920eea84e8266e46a11bca07bf058ede4cc57b0b42a53638441731617176eb62911d3f703efc996747f9eaee541e"' }>
                                            <span class="icon ion-md-swap"></span>
                                            <span>Controllers</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="controllers-links-module-AuthModule-bdfffd24312fc99163f30a059112629fdbe3920eea84e8266e46a11bca07bf058ede4cc57b0b42a53638441731617176eb62911d3f703efc996747f9eaee541e"' :
                                            'id="xs-controllers-links-module-AuthModule-bdfffd24312fc99163f30a059112629fdbe3920eea84e8266e46a11bca07bf058ede4cc57b0b42a53638441731617176eb62911d3f703efc996747f9eaee541e"' }>
                                            <li class="link">
                                                <a href="controllers/AuthController.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >AuthController</a>
                                            </li>
                                            <li class="link">
                                                <a href="controllers/AuthDiscordController.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >AuthDiscordController</a>
                                            </li>
                                        </ul>
                                    </li>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                        'data-bs-target="#injectables-links-module-AuthModule-bdfffd24312fc99163f30a059112629fdbe3920eea84e8266e46a11bca07bf058ede4cc57b0b42a53638441731617176eb62911d3f703efc996747f9eaee541e"' : 'data-bs-target="#xs-injectables-links-module-AuthModule-bdfffd24312fc99163f30a059112629fdbe3920eea84e8266e46a11bca07bf058ede4cc57b0b42a53638441731617176eb62911d3f703efc996747f9eaee541e"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-AuthModule-bdfffd24312fc99163f30a059112629fdbe3920eea84e8266e46a11bca07bf058ede4cc57b0b42a53638441731617176eb62911d3f703efc996747f9eaee541e"' :
                                        'id="xs-injectables-links-module-AuthModule-bdfffd24312fc99163f30a059112629fdbe3920eea84e8266e46a11bca07bf058ede4cc57b0b42a53638441731617176eb62911d3f703efc996747f9eaee541e"' }>
                                        <li class="link">
                                            <a href="injectables/AuthService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >AuthService</a>
                                        </li>
                                        <li class="link">
                                            <a href="injectables/DiscordStrategy.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >DiscordStrategy</a>
                                        </li>
                                        <li class="link">
                                            <a href="injectables/JwtStrategy.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >JwtStrategy</a>
                                        </li>
                                        <li class="link">
                                            <a href="injectables/UserCreatedListener.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >UserCreatedListener</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                            <li class="link">
                                <a href="modules/ClientModule.html" data-type="entity-link" >ClientModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                            'data-bs-target="#controllers-links-module-ClientModule-8046af4cc934a3f249781bbd3beb5b16f1c5dc34f18e2372cea0097f0a489de7963c8fc37659d23c939d728c1942bb60d882f1bf275c9473fa83d67eacd9bf03"' : 'data-bs-target="#xs-controllers-links-module-ClientModule-8046af4cc934a3f249781bbd3beb5b16f1c5dc34f18e2372cea0097f0a489de7963c8fc37659d23c939d728c1942bb60d882f1bf275c9473fa83d67eacd9bf03"' }>
                                            <span class="icon ion-md-swap"></span>
                                            <span>Controllers</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="controllers-links-module-ClientModule-8046af4cc934a3f249781bbd3beb5b16f1c5dc34f18e2372cea0097f0a489de7963c8fc37659d23c939d728c1942bb60d882f1bf275c9473fa83d67eacd9bf03"' :
                                            'id="xs-controllers-links-module-ClientModule-8046af4cc934a3f249781bbd3beb5b16f1c5dc34f18e2372cea0097f0a489de7963c8fc37659d23c939d728c1942bb60d882f1bf275c9473fa83d67eacd9bf03"' }>
                                            <li class="link">
                                                <a href="controllers/ClientController.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >ClientController</a>
                                            </li>
                                        </ul>
                                    </li>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                        'data-bs-target="#injectables-links-module-ClientModule-8046af4cc934a3f249781bbd3beb5b16f1c5dc34f18e2372cea0097f0a489de7963c8fc37659d23c939d728c1942bb60d882f1bf275c9473fa83d67eacd9bf03"' : 'data-bs-target="#xs-injectables-links-module-ClientModule-8046af4cc934a3f249781bbd3beb5b16f1c5dc34f18e2372cea0097f0a489de7963c8fc37659d23c939d728c1942bb60d882f1bf275c9473fa83d67eacd9bf03"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-ClientModule-8046af4cc934a3f249781bbd3beb5b16f1c5dc34f18e2372cea0097f0a489de7963c8fc37659d23c939d728c1942bb60d882f1bf275c9473fa83d67eacd9bf03"' :
                                        'id="xs-injectables-links-module-ClientModule-8046af4cc934a3f249781bbd3beb5b16f1c5dc34f18e2372cea0097f0a489de7963c8fc37659d23c939d728c1942bb60d882f1bf275c9473fa83d67eacd9bf03"' }>
                                        <li class="link">
                                            <a href="injectables/ClientService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >ClientService</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                            <li class="link">
                                <a href="modules/DiscordModule.html" data-type="entity-link" >DiscordModule</a>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                        'data-bs-target="#injectables-links-module-DiscordModule-0f8f9cb66703836078461860a7f1fbba8eac4593f6d079f33530998f977b1332a0d879363a79ef8f3f06d9a1e4bc3fc0f25ed2786375853c7b99fb0288c7687a"' : 'data-bs-target="#xs-injectables-links-module-DiscordModule-0f8f9cb66703836078461860a7f1fbba8eac4593f6d079f33530998f977b1332a0d879363a79ef8f3f06d9a1e4bc3fc0f25ed2786375853c7b99fb0288c7687a"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-DiscordModule-0f8f9cb66703836078461860a7f1fbba8eac4593f6d079f33530998f977b1332a0d879363a79ef8f3f06d9a1e4bc3fc0f25ed2786375853c7b99fb0288c7687a"' :
                                        'id="xs-injectables-links-module-DiscordModule-0f8f9cb66703836078461860a7f1fbba8eac4593f6d079f33530998f977b1332a0d879363a79ef8f3f06d9a1e4bc3fc0f25ed2786375853c7b99fb0288c7687a"' }>
                                        <li class="link">
                                            <a href="injectables/ClientListener.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >ClientListener</a>
                                        </li>
                                        <li class="link">
                                            <a href="injectables/ContextInteraction.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >ContextInteraction</a>
                                        </li>
                                        <li class="link">
                                            <a href="injectables/GuildListener.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >GuildListener</a>
                                        </li>
                                        <li class="link">
                                            <a href="injectables/InteractionHandler.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >InteractionHandler</a>
                                        </li>
                                        <li class="link">
                                            <a href="injectables/MessageInteraction.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >MessageInteraction</a>
                                        </li>
                                        <li class="link">
                                            <a href="injectables/ModalInteraction.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >ModalInteraction</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                            <li class="link">
                                <a href="modules/ErrorHistoryModule.html" data-type="entity-link" >ErrorHistoryModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                            'data-bs-target="#controllers-links-module-ErrorHistoryModule-fd2663e3c82391fea406329ba1777c5dd91fa195d0033279a2664e56bbc160c9670bc484a48c7933a48d66a1494ae41bd3bf14c966092c884fd6d991b038fb6f"' : 'data-bs-target="#xs-controllers-links-module-ErrorHistoryModule-fd2663e3c82391fea406329ba1777c5dd91fa195d0033279a2664e56bbc160c9670bc484a48c7933a48d66a1494ae41bd3bf14c966092c884fd6d991b038fb6f"' }>
                                            <span class="icon ion-md-swap"></span>
                                            <span>Controllers</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="controllers-links-module-ErrorHistoryModule-fd2663e3c82391fea406329ba1777c5dd91fa195d0033279a2664e56bbc160c9670bc484a48c7933a48d66a1494ae41bd3bf14c966092c884fd6d991b038fb6f"' :
                                            'id="xs-controllers-links-module-ErrorHistoryModule-fd2663e3c82391fea406329ba1777c5dd91fa195d0033279a2664e56bbc160c9670bc484a48c7933a48d66a1494ae41bd3bf14c966092c884fd6d991b038fb6f"' }>
                                            <li class="link">
                                                <a href="controllers/ErrorHistoryController.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >ErrorHistoryController</a>
                                            </li>
                                        </ul>
                                    </li>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                        'data-bs-target="#injectables-links-module-ErrorHistoryModule-fd2663e3c82391fea406329ba1777c5dd91fa195d0033279a2664e56bbc160c9670bc484a48c7933a48d66a1494ae41bd3bf14c966092c884fd6d991b038fb6f"' : 'data-bs-target="#xs-injectables-links-module-ErrorHistoryModule-fd2663e3c82391fea406329ba1777c5dd91fa195d0033279a2664e56bbc160c9670bc484a48c7933a48d66a1494ae41bd3bf14c966092c884fd6d991b038fb6f"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-ErrorHistoryModule-fd2663e3c82391fea406329ba1777c5dd91fa195d0033279a2664e56bbc160c9670bc484a48c7933a48d66a1494ae41bd3bf14c966092c884fd6d991b038fb6f"' :
                                        'id="xs-injectables-links-module-ErrorHistoryModule-fd2663e3c82391fea406329ba1777c5dd91fa195d0033279a2664e56bbc160c9670bc484a48c7933a48d66a1494ae41bd3bf14c966092c884fd6d991b038fb6f"' }>
                                        <li class="link">
                                            <a href="injectables/ErrorHistoryService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >ErrorHistoryService</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                            <li class="link">
                                <a href="modules/HealthModule.html" data-type="entity-link" >HealthModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                            'data-bs-target="#controllers-links-module-HealthModule-af9981b7cd97d30e79dd5bb4de07e0945012691ad6cbc7762a10e35d0da930cd76557e60e7fd11e085617d298c0d1917476dd677e11c9781c30f7420388acbf2"' : 'data-bs-target="#xs-controllers-links-module-HealthModule-af9981b7cd97d30e79dd5bb4de07e0945012691ad6cbc7762a10e35d0da930cd76557e60e7fd11e085617d298c0d1917476dd677e11c9781c30f7420388acbf2"' }>
                                            <span class="icon ion-md-swap"></span>
                                            <span>Controllers</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="controllers-links-module-HealthModule-af9981b7cd97d30e79dd5bb4de07e0945012691ad6cbc7762a10e35d0da930cd76557e60e7fd11e085617d298c0d1917476dd677e11c9781c30f7420388acbf2"' :
                                            'id="xs-controllers-links-module-HealthModule-af9981b7cd97d30e79dd5bb4de07e0945012691ad6cbc7762a10e35d0da930cd76557e60e7fd11e085617d298c0d1917476dd677e11c9781c30f7420388acbf2"' }>
                                            <li class="link">
                                                <a href="controllers/HealthController.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >HealthController</a>
                                            </li>
                                        </ul>
                                    </li>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                        'data-bs-target="#injectables-links-module-HealthModule-af9981b7cd97d30e79dd5bb4de07e0945012691ad6cbc7762a10e35d0da930cd76557e60e7fd11e085617d298c0d1917476dd677e11c9781c30f7420388acbf2"' : 'data-bs-target="#xs-injectables-links-module-HealthModule-af9981b7cd97d30e79dd5bb4de07e0945012691ad6cbc7762a10e35d0da930cd76557e60e7fd11e085617d298c0d1917476dd677e11c9781c30f7420388acbf2"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-HealthModule-af9981b7cd97d30e79dd5bb4de07e0945012691ad6cbc7762a10e35d0da930cd76557e60e7fd11e085617d298c0d1917476dd677e11c9781c30f7420388acbf2"' :
                                        'id="xs-injectables-links-module-HealthModule-af9981b7cd97d30e79dd5bb4de07e0945012691ad6cbc7762a10e35d0da930cd76557e60e7fd11e085617d298c0d1917476dd677e11c9781c30f7420388acbf2"' }>
                                        <li class="link">
                                            <a href="injectables/HealthService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >HealthService</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                            <li class="link">
                                <a href="modules/JwtConfigModule.html" data-type="entity-link" >JwtConfigModule</a>
                            </li>
                            <li class="link">
                                <a href="modules/UsersModule.html" data-type="entity-link" >UsersModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                            'data-bs-target="#controllers-links-module-UsersModule-935f1b6751d854df63a74850769886e475650a0c2edf7da83bc03e044b37b6e31c4551e455748668f3f5649f460d2eb6a74a9ad92c472a038fad0f140c486796"' : 'data-bs-target="#xs-controllers-links-module-UsersModule-935f1b6751d854df63a74850769886e475650a0c2edf7da83bc03e044b37b6e31c4551e455748668f3f5649f460d2eb6a74a9ad92c472a038fad0f140c486796"' }>
                                            <span class="icon ion-md-swap"></span>
                                            <span>Controllers</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="controllers-links-module-UsersModule-935f1b6751d854df63a74850769886e475650a0c2edf7da83bc03e044b37b6e31c4551e455748668f3f5649f460d2eb6a74a9ad92c472a038fad0f140c486796"' :
                                            'id="xs-controllers-links-module-UsersModule-935f1b6751d854df63a74850769886e475650a0c2edf7da83bc03e044b37b6e31c4551e455748668f3f5649f460d2eb6a74a9ad92c472a038fad0f140c486796"' }>
                                            <li class="link">
                                                <a href="controllers/FileUploadController.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >FileUploadController</a>
                                            </li>
                                            <li class="link">
                                                <a href="controllers/PublicUserController.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >PublicUserController</a>
                                            </li>
                                        </ul>
                                    </li>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                        'data-bs-target="#injectables-links-module-UsersModule-935f1b6751d854df63a74850769886e475650a0c2edf7da83bc03e044b37b6e31c4551e455748668f3f5649f460d2eb6a74a9ad92c472a038fad0f140c486796"' : 'data-bs-target="#xs-injectables-links-module-UsersModule-935f1b6751d854df63a74850769886e475650a0c2edf7da83bc03e044b37b6e31c4551e455748668f3f5649f460d2eb6a74a9ad92c472a038fad0f140c486796"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-UsersModule-935f1b6751d854df63a74850769886e475650a0c2edf7da83bc03e044b37b6e31c4551e455748668f3f5649f460d2eb6a74a9ad92c472a038fad0f140c486796"' :
                                        'id="xs-injectables-links-module-UsersModule-935f1b6751d854df63a74850769886e475650a0c2edf7da83bc03e044b37b6e31c4551e455748668f3f5649f460d2eb6a74a9ad92c472a038fad0f140c486796"' }>
                                        <li class="link">
                                            <a href="injectables/FileUploadService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >FileUploadService</a>
                                        </li>
                                        <li class="link">
                                            <a href="injectables/UserService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >UserService</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                </ul>
                </li>
                        <li class="chapter">
                            <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ? 'data-bs-target="#controllers-links"' :
                                'data-bs-target="#xs-controllers-links"' }>
                                <span class="icon ion-md-swap"></span>
                                <span>Controllers</span>
                                <span class="icon ion-ios-arrow-down"></span>
                            </div>
                            <ul class="links collapse " ${ isNormalMode ? 'id="controllers-links"' : 'id="xs-controllers-links"' }>
                                <li class="link">
                                    <a href="controllers/AdminCacheController.html" data-type="entity-link" >AdminCacheController</a>
                                </li>
                                <li class="link">
                                    <a href="controllers/AdminController.html" data-type="entity-link" >AdminController</a>
                                </li>
                                <li class="link">
                                    <a href="controllers/AdminIPBlockerController.html" data-type="entity-link" >AdminIPBlockerController</a>
                                </li>
                                <li class="link">
                                    <a href="controllers/AdminLicenceController.html" data-type="entity-link" >AdminLicenceController</a>
                                </li>
                                <li class="link">
                                    <a href="controllers/AppController.html" data-type="entity-link" >AppController</a>
                                </li>
                                <li class="link">
                                    <a href="controllers/AuthController.html" data-type="entity-link" >AuthController</a>
                                </li>
                                <li class="link">
                                    <a href="controllers/AuthDiscordController.html" data-type="entity-link" >AuthDiscordController</a>
                                </li>
                                <li class="link">
                                    <a href="controllers/ClientController.html" data-type="entity-link" >ClientController</a>
                                </li>
                                <li class="link">
                                    <a href="controllers/ErrorHistoryController.html" data-type="entity-link" >ErrorHistoryController</a>
                                </li>
                                <li class="link">
                                    <a href="controllers/FileUploadController.html" data-type="entity-link" >FileUploadController</a>
                                </li>
                                <li class="link">
                                    <a href="controllers/HealthController.html" data-type="entity-link" >HealthController</a>
                                </li>
                                <li class="link">
                                    <a href="controllers/PublicUserController.html" data-type="entity-link" >PublicUserController</a>
                                </li>
                                <li class="link">
                                    <a href="controllers/UtilsController.html" data-type="entity-link" >UtilsController</a>
                                </li>
                            </ul>
                        </li>
                        <li class="chapter">
                            <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ? 'data-bs-target="#entities-links"' :
                                'data-bs-target="#xs-entities-links"' }>
                                <span class="icon ion-ios-apps"></span>
                                <span>Entities</span>
                                <span class="icon ion-ios-arrow-down"></span>
                            </div>
                            <ul class="links collapse " ${ isNormalMode ? 'id="entities-links"' : 'id="xs-entities-links"' }>
                                <li class="link">
                                    <a href="entities/FileEntity.html" data-type="entity-link" >FileEntity</a>
                                </li>
                                <li class="link">
                                    <a href="entities/IPBlockerEntity.html" data-type="entity-link" >IPBlockerEntity</a>
                                </li>
                                <li class="link">
                                    <a href="entities/LicenseEntity.html" data-type="entity-link" >LicenseEntity</a>
                                </li>
                                <li class="link">
                                    <a href="entities/NotificationEntity.html" data-type="entity-link" >NotificationEntity</a>
                                </li>
                                <li class="link">
                                    <a href="entities/OAuth2Credentials.html" data-type="entity-link" >OAuth2Credentials</a>
                                </li>
                                <li class="link">
                                    <a href="entities/RequestStatEntity.html" data-type="entity-link" >RequestStatEntity</a>
                                </li>
                                <li class="link">
                                    <a href="entities/SessionEntity.html" data-type="entity-link" >SessionEntity</a>
                                </li>
                                <li class="link">
                                    <a href="entities/StatusEntity.html" data-type="entity-link" >StatusEntity</a>
                                </li>
                                <li class="link">
                                    <a href="entities/TicketEntity.html" data-type="entity-link" >TicketEntity</a>
                                </li>
                                <li class="link">
                                    <a href="entities/UserEntity.html" data-type="entity-link" >UserEntity</a>
                                </li>
                            </ul>
                        </li>
                    <li class="chapter">
                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ? 'data-bs-target="#classes-links"' :
                            'data-bs-target="#xs-classes-links"' }>
                            <span class="icon ion-ios-paper"></span>
                            <span>Classes</span>
                            <span class="icon ion-ios-arrow-down"></span>
                        </div>
                        <ul class="links collapse " ${ isNormalMode ? 'id="classes-links"' : 'id="xs-classes-links"' }>
                            <li class="link">
                                <a href="classes/CreateClientDto.html" data-type="entity-link" >CreateClientDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/CreateIPBlockerDto.html" data-type="entity-link" >CreateIPBlockerDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/DeleteNotificationDto.html" data-type="entity-link" >DeleteNotificationDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/DomainError.html" data-type="entity-link" >DomainError</a>
                            </li>
                            <li class="link">
                                <a href="classes/JwtError.html" data-type="entity-link" >JwtError</a>
                            </li>
                            <li class="link">
                                <a href="classes/LicenceCreateDto.html" data-type="entity-link" >LicenceCreateDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/LicenceUpdateDto.html" data-type="entity-link" >LicenceUpdateDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/LoginUserDto.html" data-type="entity-link" >LoginUserDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/Main.html" data-type="entity-link" >Main</a>
                            </li>
                            <li class="link">
                                <a href="classes/NecordClient.html" data-type="entity-link" >NecordClient</a>
                            </li>
                            <li class="link">
                                <a href="classes/NotificationDto.html" data-type="entity-link" >NotificationDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/RegisterUserDto.html" data-type="entity-link" >RegisterUserDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/SessionSerializer.html" data-type="entity-link" >SessionSerializer</a>
                            </li>
                            <li class="link">
                                <a href="classes/TextDto.html" data-type="entity-link" >TextDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/UpdateClientDto.html" data-type="entity-link" >UpdateClientDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/UpdateIPBlockerDto.html" data-type="entity-link" >UpdateIPBlockerDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/UpdateMulterDto.html" data-type="entity-link" >UpdateMulterDto</a>
                            </li>
                        </ul>
                    </li>
                        <li class="chapter">
                            <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ? 'data-bs-target="#injectables-links"' :
                                'data-bs-target="#xs-injectables-links"' }>
                                <span class="icon ion-md-arrow-round-down"></span>
                                <span>Injectables</span>
                                <span class="icon ion-ios-arrow-down"></span>
                            </div>
                            <ul class="links collapse " ${ isNormalMode ? 'id="injectables-links"' : 'id="xs-injectables-links"' }>
                                <li class="link">
                                    <a href="injectables/AuthService.html" data-type="entity-link" >AuthService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/CacheService.html" data-type="entity-link" >CacheService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/ClientListener.html" data-type="entity-link" >ClientListener</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/ClientService.html" data-type="entity-link" >ClientService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/ContextInteraction.html" data-type="entity-link" >ContextInteraction</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/DiscordAuthGuard.html" data-type="entity-link" >DiscordAuthGuard</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/DiscordStrategy.html" data-type="entity-link" >DiscordStrategy</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/ErrorHistoryService.html" data-type="entity-link" >ErrorHistoryService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/FileUploadService.html" data-type="entity-link" >FileUploadService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/GuildListener.html" data-type="entity-link" >GuildListener</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/HealthService.html" data-type="entity-link" >HealthService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/HttpThrottlerGuard.html" data-type="entity-link" >HttpThrottlerGuard</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/InteractionHandler.html" data-type="entity-link" >InteractionHandler</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/IPBlockerMiddleware.html" data-type="entity-link" >IPBlockerMiddleware</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/IPBlockerService.html" data-type="entity-link" >IPBlockerService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/JwtStrategy.html" data-type="entity-link" >JwtStrategy</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/LicenceService.html" data-type="entity-link" >LicenceService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/Logger.html" data-type="entity-link" >Logger</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/LoggingInterceptor.html" data-type="entity-link" >LoggingInterceptor</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/MessageInteraction.html" data-type="entity-link" >MessageInteraction</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/ModalInteraction.html" data-type="entity-link" >ModalInteraction</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/RedirectIfNotAuthenticatedMiddleware.html" data-type="entity-link" >RedirectIfNotAuthenticatedMiddleware</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/RequestMetricsInterceptor.html" data-type="entity-link" >RequestMetricsInterceptor</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/UserCreatedListener.html" data-type="entity-link" >UserCreatedListener</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/UserService.html" data-type="entity-link" >UserService</a>
                                </li>
                            </ul>
                        </li>
                    <li class="chapter">
                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ? 'data-bs-target="#guards-links"' :
                            'data-bs-target="#xs-guards-links"' }>
                            <span class="icon ion-ios-lock"></span>
                            <span>Guards</span>
                            <span class="icon ion-ios-arrow-down"></span>
                        </div>
                        <ul class="links collapse " ${ isNormalMode ? 'id="guards-links"' : 'id="xs-guards-links"' }>
                            <li class="link">
                                <a href="guards/AdminGuard.html" data-type="entity-link" >AdminGuard</a>
                            </li>
                            <li class="link">
                                <a href="guards/AuthAdminGuard.html" data-type="entity-link" >AuthAdminGuard</a>
                            </li>
                            <li class="link">
                                <a href="guards/AuthenticatedGuard.html" data-type="entity-link" >AuthenticatedGuard</a>
                            </li>
                            <li class="link">
                                <a href="guards/AuthGuard.html" data-type="entity-link" >AuthGuard</a>
                            </li>
                            <li class="link">
                                <a href="guards/ClientGuard.html" data-type="entity-link" >ClientGuard</a>
                            </li>
                            <li class="link">
                                <a href="guards/ClientHeaderGuard.html" data-type="entity-link" >ClientHeaderGuard</a>
                            </li>
                            <li class="link">
                                <a href="guards/RoleGuard.html" data-type="entity-link" >RoleGuard</a>
                            </li>
                        </ul>
                    </li>
                    <li class="chapter">
                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ? 'data-bs-target="#interfaces-links"' :
                            'data-bs-target="#xs-interfaces-links"' }>
                            <span class="icon ion-md-information-circle-outline"></span>
                            <span>Interfaces</span>
                            <span class="icon ion-ios-arrow-down"></span>
                        </div>
                        <ul class="links collapse " ${ isNormalMode ? ' id="interfaces-links"' : 'id="xs-interfaces-links"' }>
                            <li class="link">
                                <a href="interfaces/CPUCore.html" data-type="entity-link" >CPUCore</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/CPUUsage.html" data-type="entity-link" >CPUUsage</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/RequestClient.html" data-type="entity-link" >RequestClient</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/RequestExtended.html" data-type="entity-link" >RequestExtended</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ValidationPipeOptions.html" data-type="entity-link" >ValidationPipeOptions</a>
                            </li>
                        </ul>
                    </li>
                    <li class="chapter">
                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ? 'data-bs-target="#miscellaneous-links"'
                            : 'data-bs-target="#xs-miscellaneous-links"' }>
                            <span class="icon ion-ios-cube"></span>
                            <span>Miscellaneous</span>
                            <span class="icon ion-ios-arrow-down"></span>
                        </div>
                        <ul class="links collapse " ${ isNormalMode ? 'id="miscellaneous-links"' : 'id="xs-miscellaneous-links"' }>
                            <li class="link">
                                <a href="miscellaneous/enumerations.html" data-type="entity-link">Enums</a>
                            </li>
                            <li class="link">
                                <a href="miscellaneous/functions.html" data-type="entity-link">Functions</a>
                            </li>
                            <li class="link">
                                <a href="miscellaneous/typealiases.html" data-type="entity-link">Type aliases</a>
                            </li>
                            <li class="link">
                                <a href="miscellaneous/variables.html" data-type="entity-link">Variables</a>
                            </li>
                        </ul>
                    </li>
                    <li class="chapter">
                        <a data-type="chapter-link" href="coverage.html"><span class="icon ion-ios-stats"></span>Documentation coverage</a>
                    </li>
                    <li class="divider"></li>
                    <li class="copyright">
                        Documentation generated using <a href="https://compodoc.app/" target="_blank" rel="noopener noreferrer">
                            <img data-src="images/compodoc-vectorise.png" class="img-responsive" data-type="compodoc-logo">
                        </a>
                    </li>
            </ul>
        </nav>
        `);
        this.innerHTML = tp.strings;
    }
});