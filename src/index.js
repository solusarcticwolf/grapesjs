import TemplateManager, { PagesApp, SettingsApp } from './manager';
import commands from './commands';
import storage from './storage';
import en from './locale/en';

export default (editor, opts = {}) => {
    const options = {
        ...{
            // default options
            // Database name
            dbName: 'gjs',

            // Collection name
            objectStoreName: 'projects',

            // Load first template in storage
            loadFirst: true,

            // Add uuid as path parameter to store path for rest-api
            uuidInPath: true,

            // Indexeddb version schema
            indexeddbVersion: 5,

            // When template or page is deleted
            onDelete(res) {
                console.log('Deleted:', res)
            },

            // When error onDelete
            onDeleteError(err) {
                console.log(err)
            },

            // On screenshot error
            onScreenshotError(err) {
                console.log(err)
            },

            // Quality of screenshot image from 0 to 1, more quality increases the image size
            quality: .01,

            // Content for templates modal title
            mdlTitle: 'Project Manager',

            // Show when no pages yet pages
            nopages: '<div style="display:flex;align-items:center;padding:50px;margin:auto;">No Projects Yet</div>',

            // Firebase API key
            apiKey: '',

            // Firebase Auth domain
            authDomain: '',

            // Cloud Firestore project ID
            projectId: '',

            // Enable support for offline data persistence
            enableOffline: true,

            // Firebase app config
            firebaseConfig: {},

            // Database settings (https://firebase.google.com/docs/reference/js/firebase.firestore.Settings)
            settings: { timestampsInSnapshots: true },

            // Show estimated project statistics
            size: false,

            // Send feedback when open is clicked on current page
            currentPageOpen() {
                console.log('Current page already open')
            },

            i18n: {},
        },
        ...opts,
    };

    editor.I18n.addMessages({
        en,
        ...options.i18n,
    });

    // Init and add dashboard object to editor
    editor.TemplateManager = new TemplateManager(editor, options);
    editor.PagesApp = new PagesApp(editor, options);
    editor.SettingsApp = new SettingsApp(editor, options);

    // Load commands
    commands(editor, options);

    // Load storages
    storage(editor, options);

    // Load page with index zero
    editor.on('load', () => {
        const cs = editor.Storage.getCurrentStorage();
        cs.loadAll(res => {
            const firstPage = res[0];
            if (firstPage && options.loadFirst) {
                cs.setId(firstPage.id);
                cs.setName(firstPage.name);
                cs.setThumbnail(firstPage.thumbnail);
                cs.setIsTemplate(firstPage.template);
                editor.load();
            } else {
                cs.setId(editor.runCommand('get-uuidv4'));
                cs.setName(`Default-${cs.currentId.substr(0, 7)}`);
                options.components && editor.setComponents(options.components);
                options.style && editor.setStyle(options.style);
            }
        });
    });
};