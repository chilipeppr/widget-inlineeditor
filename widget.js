/* global $ requirejs cprequire cpdefine chilipeppr THREE */
// Defining the globals above helps Cloud9 not show warnings for those variables

// ChiliPeppr Widget/Element Javascript

requirejs.config({
    /*
    Dependencies can be defined here. ChiliPeppr uses require.js so
    please refer to http://requirejs.org/docs/api.html for info.
    
    Most widgets will not need to define Javascript dependencies.
    
    Make sure all URLs are https and http accessible. Try to use URLs
    that start with // rather than http:// or https:// so they simply
    use whatever method the main page uses.
    
    Also, please make sure you are not loading dependencies from different
    URLs that other widgets may already load like jquery, bootstrap,
    three.js, etc.
    
    You may slingshot content through ChiliPeppr's proxy URL if you desire
    to enable SSL for non-SSL URL's. ChiliPeppr's SSL URL is
    https://i2dcui.appspot.com which is the SSL equivalent for
    http://chilipeppr.com
    */
    paths: {
        // Example of how to define the key (you make up the key) and the URL
        // Make sure you DO NOT put the .js at the end of the URL
        // SmoothieCharts: '//smoothiecharts.org/smoothie',
        //AceEditor: '//cdn.jsdelivr.net/ace/1.2.3/min/ace',
        ace: '//ace.c9.io/build/src/ace',
        aceAutoCompletion: '//ace.c9.io/build/src/ext-language_tools',
        AceEditorLua: '//cdn.jsdelivr.net/ace/1.2.3/min/mode-lua',
        AceEditorCss: '//cdn.jsdelivr.net/ace/1.2.3/min/mode-css',
        AceEditorHtml: '//cdn.jsdelivr.net/ace/1.2.3/min/mode-html',
        AceEditorJavascript: '//cdn.jsdelivr.net/ace/1.2.3/min/mode-javascript',
        AceEditorJsx: '//cdn.jsdelivr.net/ace/1.2.3/min/mode-jsx',
    },
    shim: {
        // See require.js docs for how to define dependencies that
        // should be loaded before your script/widget.
        AceEditorLua: ["ace"],
        AceEditorCss: ["ace"],
        AceEditorHtml: ["ace"],
        AceEditorJavascript: ["ace"],
        AceEditorJsx: ["ace"],
        aceAutoCompletion: ["ace", "AceEditorHtml", "AceEditorCss", "AceEditorJavascript", "AceEditorJsx"]
    }
});

cprequire_test(["inline:com-chilipeppr-widget-inlineeditor"], function(myWidget) {

    // Test this element. This code is auto-removed by the chilipeppr.load()
    // when using this widget in production. So use the cpquire_test to do things
    // you only want to have happen during testing, like loading other widgets or
    // doing unit tests. Don't remove end_test at the end or auto-remove will fail.

    // Please note that if you are working on multiple widgets at the same time
    // you may need to use the ?forcerefresh=true technique in the URL of
    // your test widget to force the underlying chilipeppr.load() statements
    // to referesh the cache. For example, if you are working on an Add-On
    // widget to the Eagle BRD widget, but also working on the Eagle BRD widget
    // at the same time you will have to make ample use of this technique to
    // get changes to load correctly. If you keep wondering why you're not seeing
    // your changes, try ?forcerefresh=true as a get parameter in your URL.

    console.log("test running of " + myWidget.id);

    $('body').prepend('<div id="testDivForFlashMessageWidget"></div>');

    chilipeppr.load(
        "#testDivForFlashMessageWidget",
        "http://fiddle.jshell.net/chilipeppr/90698kax/show/light/",
        function() {
            console.log("mycallback got called after loading flash msg module");
            cprequire(["inline:com-chilipeppr-elem-flashmsg"], function(fm) {
                //console.log("inside require of " + fm.id);
                fm.init();
            });
        }
    );

    // init my widget
    myWidget.init();
    // $('#' + myWidget.id).css('margin', '20px');
    // $("body").css('padding', '20px');
    $('title').html(myWidget.name);

} /*end_test*/ );

// This is the main definition of your widget. Give it a unique name.
cpdefine("inline:com-chilipeppr-widget-inlineeditor", ["chilipeppr_ready", "aceAutoCompletion" ], function() {
    return {
        /**
         * The ID of the widget. You must define this and make it unique.
         */
        id: "com-chilipeppr-widget-inlineeditor", // Make the id the same as the cpdefine id
        name: "Widget / inlineeditor", // The descriptive name of your widget.
        desc: "This example widget gives you a framework for creating your own widget. Please change this description once you fork this inlineeditor and create your own widget. Make sure to run runme.js every time you are done editing your code so you can regenerate your README.md file, regenerate your auto-generated-widget.html, and automatically push your changes to Github.", // A description of what your widget does
        url: "(auto fill by runme.js)",       // The final URL of the working widget as a single HTML file with CSS and Javascript inlined. You can let runme.js auto fill this if you are using Cloud9.
        fiddleurl: "(auto fill by runme.js)", // The edit URL. This can be auto-filled by runme.js in Cloud9 if you'd like, or just define it on your own to help people know where they can edit/fork your widget
        githuburl: "(auto fill by runme.js)", // The backing github repo
        testurl: "(auto fill by runme.js)",   // The standalone working widget so can view it working by itself
        /**
         * Define pubsub signals below. These are basically ChiliPeppr's event system.
         * ChiliPeppr uses amplify.js's pubsub system so please refer to docs at
         * http://amplifyjs.com/api/pubsub/
         */
        /**
         * Define the publish signals that this widget/element owns or defines so that
         * other widgets know how to subscribe to them and what they do.
         */
        publish: {
            // Define a key:value pair here as strings to document what signals you publish.
            '/onExampleGenerate': 'Example: Publish this signal when we go to generate gcode.'
        },
        /**
         * Define the subscribe signals that this widget/element owns or defines so that
         * other widgets know how to subscribe to them and what they do.
         */
        subscribe: {
            // Define a key:value pair here as strings to document what signals you subscribe to
            // so other widgets can publish to this widget to have it do something.
            // '/onExampleConsume': 'Example: This widget subscribe to this signal so other widgets can send to us and we'll do something with it.'
        },
        /**
         * Document the foreign publish signals, i.e. signals owned by other widgets
         * or elements, that this widget/element publishes to.
         */
        foreignPublish: {
            // Define a key:value pair here as strings to document what signals you publish to
            // that are owned by foreign/other widgets.
            // '/jsonSend': 'Example: We send Gcode to the serial port widget to do stuff with the CNC controller.'
        },
        /**
         * Document the foreign subscribe signals, i.e. signals owned by other widgets
         * or elements, that this widget/element subscribes to.
         */
        foreignSubscribe: {
            // Define a key:value pair here as strings to document what signals you subscribe to
            // that are owned by foreign/other widgets.
            // '/com-chilipeppr-elem-dragdrop/ondropped': 'Example: We subscribe to this signal at a higher priority to intercept the signal. We do not let it propagate by returning false.'
        },
        /**
         * All widgets should have an init method. It should be run by the
         * instantiating code like a workspace or a different widget.
         */
        init: function() {
            console.log("I am being initted. Thanks.");

            
            this.setupUiFromLocalStorage();
            this.btnSetup();
            this.forkSetup();
            var that = this;
            setTimeout(function() {
                that.initAceEditor();
            }, 500);
            this.setupInfoAreaId();
            this.pointIframeToFrontend();
            this.updateLauncherUrls();
            this.populateRepoSidebar();
            
            console.log("I am done being initted.");
        },
        setupInfoAreaId: function() {
            // set the ID of this widget if we have one
            var repoid = this.getOrigCodeRepoId();
            console.log("repoid:", repoid);
            if (repoid) {
                $('#' + this.id + " .input-id").val(repoid);
                
            } else {
                $('#' + this.id + " .input-id").val("MyNewWidget");
            
            }
        },
        pointIframeToFrontend: function() {
            console.log("pointIframeToFrontend");
            var curLoc = window.location;
            curLoc += "/frontend";
            console.log("curLoc:", curLoc);
            
            var repoid = this.getOrigCodeRepoId();
            console.log("repoid:", repoid);
            if (repoid) {
                console.log("will send iframe to:", curLoc);
                // load iframe src
                document.getElementById('main-iframe').contentWindow.location = curLoc;
            } else {
                // do nothing with iframe. maybe show ("not saved yet")
            }
            
        },
        updateLauncherUrls: function() {
            // url-available-frontend
            var repoid = this.getOrigCodeRepoId();
            if (repoid) {
                var url = window.location + "/frontend";
                var urlbackend = window.location + "/backend";
                $('.url-available-frontend').html('<a href="' + url + '">' + url + '</a>');
                $('.url-available-backend').html('<a href="' + urlbackend + '">' + urlbackend + '</a>');
            } else {
                // do nothing with iframe. maybe show ("not saved yet")
                $('.url-available-frontend').html('(Save your widget first)');
                $('.url-available-backend').html('(Save your widget first)');
            }
        },
        setupInfoArea: function(data) {
            // set the ID of this widget if we have one
            
            if (data && 'info' in data) {
                console.log("setting up info area on left side. data:", data);
                var el = $('#' + this.id);
                el.find('.input-name').val(data.info.name);
                el.find('.input-desc').val(data.info.description);
                document.title = data.id + " - " + data.info.name;
            }
        },
        populateRepoSidebar: function() {
            
            $.ajax({
                type: "GET",
                url: "/repos",
            })
            .done(function(data) {
                // console.log("done getting code repos");
                // populate the list
                // console.log("data from get code repos:", data);
                var repoListEl = $('.repo-list');
                repoListEl.empty();
                data.forEach(function(item, i) {
                    // console.log("repos item:", item);
                    repoListEl.append($('<li><a href="/' + item.id + '">' + item.id + "</a></li>"));
                })
            })
            .fail(function() {
                console.log("failed getting code repo list");
            });
        },
        showRepoSidebar: function() {
            $('.main-body').css('margin-left', '450px');
            $('.sidebar').css('left', '190px');
            $('.repo-sidebar').removeClass('hidden');
        },
        hideRepoSidebar: function() {
            $('.main-body').css('margin-left', '284px');
            $('.sidebar').css('left', '24px');
            $('.repo-sidebar').addClass('hidden');
        },
        toggleRepoSidebar: function() {
            if ($('.repo-sidebar').hasClass('hidden')) {
                // it's hidden, show it
                this.showRepoSidebar();
            } else {
                this.hideRepoSidebar();
            }
        },
        saveCodeRepoTranspiledOverride: function() {
            console.log("saveCodeRepo. this:", this);
            
            // get main dom obj
            var el = $('#' + this.id);
            
            // build up the POST from all the elements
            var info = {
                id: el.find('.input-id').val(),
                user: el.find('.btn-loggedin').text().trim(),
                transpiledjs: this.aceEditors["aceeditor-transpiledjs"].getSession().getValue(),
            }
            console.log("about to saveCodeRepoTranspiledOverride. info:", info);
            
            $.ajax({
                type: "POST",
                url: "/savetranspiled",
                data: info,
                // success: this.onSaveCodeRepoSuccess.bind(this),
                // dataType: "json"
            })
            .done(function() {
                console.log("done posting code");
                
                // this is good. now we need to redirect the page so we load our new
                // url for our content
                // window.location.replace("/" + info.id);
                // reload the iframe
                document.getElementById('main-iframe').contentWindow.location.reload();
            })
            .fail(function() {
                console.log("failed posting code");
            });
        },
        saveCodeRepo: function() {
            console.log("saveCodeRepo. this:", this);
            
            // get main dom obj
            var el = $('#' + this.id);
            
            console.log("user to save under:", el.find('.btn-loggedin').text());
            
            // build up the POST from all the elements
            var info = {
                id: el.find('.input-id').val(),
                user: el.find('.btn-loggedin').text().trim(),
                name: el.find('.input-name').val(),
                description: el.find('.input-desc').val(),
                html: this.aceEditors["aceeditor-html"].getSession().getValue(),
                css: this.aceEditors["aceeditor-css"].getSession().getValue(),
                js: this.aceEditors["aceeditor-javascript"].getSession().getValue(),
                backendjs: this.aceEditors["aceeditor-backendjs"].getSession().getValue(),
                examplejs: this.aceEditors["aceeditor-example"].getSession().getValue(),
            }
            if (info.name.length == 0) info.name = " ";
            if (info.description.length == 0) info.description = " ";
            console.log("about to saveCodeRepo. info:", info);
            
            $.ajax({
                type: "POST",
                url: "/save",
                data: info,
                // success: this.onSaveCodeRepoSuccess.bind(this),
                // dataType: "json"
            })
            .done(function(response) {
                console.log("done posting code. response:", response);
                
                alert(JSON.stringify(response));
                
                // this is good. now we need to redirect the page so we load our new
                // url for our content
                window.location.replace("/" + info.id);
            })
            .fail(function() {
                console.log("failed posting code");
            });
            
        },
        getOrigCodeRepoId: function() {
            // the way to determine this is if we have the hidden field called codeRepoId
            // filled in with an id (we could also maybe analyze the url)
            var origCodeRepoId = $('#' + this.id + " .codeRepoId").val();
            console.log("origCodeRepoId:", origCodeRepoId);
            if (origCodeRepoId && origCodeRepoId.match(/insert-original-coderepo-id-here/)) {
                // there is no swapped in id, so this is a raw new load so show sample
                return null;
            } else {
                return origCodeRepoId;
            }
        },
        initAceEditor: function() {
            
            // we need to see if we have data from the database or if we need
            // to put sample data in
            var origCodeRepoId = this.getOrigCodeRepoId();
            
            if (origCodeRepoId) {
                // we have an id, get the data
                var that = this;
                $.getJSON("/get?id=" + origCodeRepoId, function(data) {
                    console.log("got data back from /get. data:", data);
                    if (data.success == true) {
                        // we got the data. yeah!
                        that.loadAce("aceeditor-html", data.info.html, "ace/mode/html");
                        that.loadAce("aceeditor-css", data.info.css, "ace/mode/css");
                        // that.loadAce("aceeditor-javascript", data.info.js, "ace/mode/javascript");
                        that.loadAce("aceeditor-javascript", data.info.js, "ace/mode/jsx");
                        that.loadAce("aceeditor-backendjs", data.info.backendjs ? data.info.backendjs : "// Backend JS", "ace/mode/javascript");
                        that.loadAce("aceeditor-transpiledjs", data.info.transpiledjs ? data.info.transpiledjs : "// (Read-Only) Transpiled JS", "ace/mode/javascript"); 
                        that.loadAce("aceeditor-example", data.info.examplejs ? data.info.examplejs : "// Example JS", "ace/mode/jsx"); 
                        that.loadAce("aceeditor-transpiledexamplejs", data.info.transpiledexamplejs ? data.info.transpiledexamplejs : "// (Read-Only) Transpiled Example JS", "ace/mode/javascript"); 
                        that.setupInfoArea(data);
                    } else {
                        // failed
                        console.log("failed to get data. fallback to sample data???");
                    }
                });
                
            } else {
                // load sample data
                var sampleContent = `<div id="MyNewWidget" class="widget">
    <div id="MyNewWidgetBody" class="panel-body"></div>
</div>
`;
                this.loadAce("aceeditor-html", sampleContent, "ace/mode/html");
                this.loadAce("aceeditor-css", "#MyNewWidget {\n}", "ace/mode/css");
                var sampleContent = `// Frontend Javascript / JSX
// Avaialble at http://app.zipwhip.com/MyNewWidget/frontend

// imports Zipwhip from '//app.zipwhip.com/Zipwhip/frontend';

class MyNewWidget { // extends Zipwhip.Widget {
    
    constructor(props) {
        // super(props);
        // import all ReactBootstrap objects
        for (var i in ReactBootstrap) {
          if (!i.match(/^_/)) window[i] = ReactBootstrap[i];
        }
    }
    
    init() {
        const panelInstance = (
            <Panel header="My New Widget">
                Panel content
            </Panel>
        );
        
        var mountNode = document.getElementById('MyNewWidgetBody');
        
        ReactDOM.render(panelInstance, mountNode);
    }
    
    onActivate() {
        
    }
    
    onDeactivate() {
        
    }
    
    onExpand() {
        
    }
    
    onCollapse() {
        
    }
}
var instance = new MyNewWidget();
instance.init();
`;
                this.loadAce("aceeditor-javascript", sampleContent, "ace/mode/jsx");
                sampleContent = `// URL of this code is 
// https://app.zipwhip.com/MyNewWidget/backend

// Backend Javascript runs in Node.js sandbox
// You must export a handler function. That function is called with (event, callback)
// You must call the callback to end the incoming request. The format of the callback
// is callback({contentType:'text/json', body:JSON.stringify(result)}); where 
// contentType is any valid browser format and the body is a string. 

module.exports = {
  onHttpsRequest: function(event, callback) {
    // console.log('Received event:', event);
    console.log("onHttpsRequest. url:", event.req.url);
    
    var that = this;
    var url = require('url');
    var url_parts = url.parse(event.req.url, true);
    var query = url_parts.query;
    
    var result = {};
    
    if ('getParam1' in query) {
        console.log("getParam1 being processed.");
    } else if ('getParam2' in query) {
        console.log("getParam2 being processed.");
    } else {
        console.log("default query being processed");
    }
    
    callback({contentType:'text/json', body:JSON.stringify(result)});
    
  },
}
`;
                this.loadAce("aceeditor-backendjs", sampleContent, "ace/mode/javascript");
                
                sampleContent = `// This code executes first
require(['MyNewWidget'], function(MyNewWidget) {
  console.log("inside require callback");
  var instance = new MyNewWidget();
  instance.init();
});                
`;
                this.loadAce("aceeditor-example", sampleContent, "ace/mode/jsx");
            }
        },
        aceCurrentSessionName: null,
        aceCurrentSession: null,
        aceEditors: {},
        aceSessions: {},
        aceIsLoaded: {},
        loadAce: function(aceid, sampleContent, aceMode) {

            // debugger;
            console.log("trying to get ace. ace:"); //, ace, " aceId:", this.aceId);
            //require("ace/mode/text_highlight_rules", function(xace) {
            if ('ace' in window && ace) { // && 'setValue' in ace) {
                console.log("got ace. ace:", ace);
                
                if (this.aceIsLoaded[aceid]) {
                    console.log("You are asking Ace to load a 2nd time, but we are already loaded.");
                    //return;
                } else { 
                    // load ace
                    var editor = ace.edit(aceid);
                    editor.setTheme("ace/theme/monokai");
                    //document.getElementById('editor').style.fontSize='13px';
                    this.aceEditors[aceid] = editor;
                    //this.setScriptFromTemporaryFile();
                    
                    editor.commands.addCommand({
                        name: 'mySave',
                        bindKey: {win: 'Ctrl-S',  mac: 'Command-S'},
                        exec: this.fileLocalSave.bind(this),
                        readOnly: false // false if this command should not apply in readOnly mode
                    });
                    
                    editor.setOptions({
                        enableBasicAutocompletion: true,
                        enableSnippets: true,
                        enableLiveAutocompletion: true
                    });
                    
                    editor.on("changeSession", function(e) {
                        console.log("got editor changeSession");
                    });
                    
                    //this.resize();
                    this.aceIsLoaded[aceid] = true;
                }
                // debugger;
                // now create the session just for this document
                //var docu = ace.createEditSession('', "ace/mode/lua");
                
                // see if we have a session already for this
                if (aceid in this.aceSessions) {
                    // we actually already have a session, cool
                    this.aceCurrentSession = this.aceSessions[this.aceSessionName];
                    
                } else {
                    // we don't have a session, so need to create one
                    if (sampleContent == null) sampleContent = "";
                    this.aceCurrentSession = new ace.EditSession(sampleContent, aceMode)
                    this.aceSessions[aceid] = this.aceCurrentSession;
                    
                }

                this.aceEditors[aceid].setSession(this.aceCurrentSession);
                //editor.getSession().setMode("ace/mode/lua");
                this.aceEditors[aceid].getSession().setTabSize(2);
                this.aceEditors[aceid].getSession().setUseSoftTabs(true);
                //this.editor.getSession().setUseWrapMode(true);
                this.aceEditors[aceid].getSession().setUndoManager(new ace.UndoManager());
                
                /*
                this.editor.getSession().on('change', function(e) {
                    // e.type, etc
                    console.log("got change on editor. e:", e);
                });
                
                this.editor.getSession().selection.on('changeSelection', function(e) {
                    console.log("got changeSelection on editor. e:", e); 
                });
                */
                
                console.log("ace session created:", this.aceCurrentSession);

            } else {
                console.log("ace is currently undefined so retry later");
                setTimeout(this.loadAce.bind(this), 100);
            }
            
            
         
        },
        fileLocalSave: function(event) {
            console.log("got fileLocalSave. event:", event);    
        },
        /**
         * Call this method from init to setup all the buttons when this widget
         * is first loaded. This basically attaches click events to your 
         * buttons. It also turns on all the bootstrap popovers by scanning
         * the entire DOM of the widget.
         */
        btnSetup: function() {

            // toggle repos button
            $('#' + this.id + ' .btn-showyourwidgets').click(this.toggleRepoSidebar.bind(this));
            
            // save button
            $('#' + this.id + ' .btn-save').click(this.saveCodeRepo.bind(this));
            
            // save override transpiled
            $('#' + this.id + ' .btn-transpilesave').click(this.saveCodeRepoTranspiledOverride.bind(this));

            // new button
            $('#' + this.id + ' .btn-new').click(function() {
                window.location.href = "widget.html";
            });

            // Chevron hide/show body
            var that = this;
            $('#' + this.id + ' .hidebody').click(function(evt) {
                console.log("hide/unhide body");
                if ($('#' + that.id + ' .panel-body').hasClass('hidden')) {
                    // it's hidden, unhide
                    that.showBody(evt);
                }
                else {
                    // hide
                    that.hideBody(evt);
                }
            });

            // Ask bootstrap to scan all the buttons in the widget to turn
            // on popover menus
            // $('#' + this.id + ' .btn').popover({
            //     delay: 1000,
            //     animation: true,
            //     placement: "auto",
            //     trigger: "hover",
            //     container: 'body'
            // });

            // Init Say Hello Button on Main Toolbar
            // We are inlining an anonymous method as the callback here
            // as opposed to a full callback method in the Hello Word 2
            // example further below. Notice we have to use "that" so 
            // that the this is set correctly inside the anonymous method
            $('#' + this.id + ' .btn-sayhello').click(function() {
                console.log("saying hello");
                // Make sure popover is immediately hidden
                $('#' + that.id + ' .btn-sayhello').popover("hide");
                // Show a flash msg
                chilipeppr.publish(
                    "/com-chilipeppr-elem-flashmsg/flashmsg",
                    "Hello Title",
                    "Hello World from widget " + that.id,
                    1000
                );
            });

            // Init Hello World 2 button on Tab 1. Notice the use
            // of the slick .bind(this) technique to correctly set "this"
            // when the callback is called
            $('#' + this.id + ' .btn-helloworld2').click(this.onHelloBtnClick.bind(this));

        },
        /**
         * onHelloBtnClick is an example of a button click event callback
         */
        onHelloBtnClick: function(evt) {
            console.log("saying hello 2 from btn in tab 1");
            chilipeppr.publish(
                '/com-chilipeppr-elem-flashmsg/flashmsg',
                "Hello 2 Title",
                "Hello World 2 from Tab 1 from widget " + this.id,
                2000 /* show for 2 second */
            );
        },
        /**
         * User options are available in this property for reference by your
         * methods. If any change is made on these options, please call
         * saveOptionsLocalStorage()
         */
        options: null,
        /**
         * Call this method on init to setup the UI by reading the user's
         * stored settings from localStorage and then adjust the UI to reflect
         * what the user wants.
         */
        setupUiFromLocalStorage: function() {

            // Read vals from localStorage. Make sure to use a unique
            // key specific to this widget so as not to overwrite other
            // widgets' options. By using this.id as the prefix of the
            // key we're safe that this will be unique.

            // Feel free to add your own keys inside the options 
            // object for your own items

            var options = localStorage.getItem(this.id + '-options');

            if (options) {
                options = $.parseJSON(options);
                console.log("just evaled options: ", options);
            }
            else {
                options = {
                    showBody: true,
                    tabShowing: 1,
                    customParam1: null,
                    customParam2: 1.0
                };
            }

            this.options = options;
            console.log("options:", options);

            // show/hide body
            if (options.showBody) {
                this.showBody();
            }
            else {
                this.hideBody();
            }

        },
        /**
         * When a user changes a value that is stored as an option setting, you
         * should call this method immediately so that on next load the value
         * is correctly set.
         */
        saveOptionsLocalStorage: function() {
            // You can add your own values to this.options to store them
            // along with some of the normal stuff like showBody
            var options = this.options;

            var optionsStr = JSON.stringify(options);
            console.log("saving options:", options, "json.stringify:", optionsStr);
            // store settings to localStorage
            localStorage.setItem(this.id + '-options', optionsStr);
        },
        /**
         * Show the body of the panel.
         * @param {jquery_event} evt - If you pass the event parameter in, we 
         * know it was clicked by the user and thus we store it for the next 
         * load so we can reset the user's preference. If you don't pass this 
         * value in we don't store the preference because it was likely code 
         * that sent in the param.
         */
        showBody: function(evt) {
            $('#' + this.id + ' .panel-body').removeClass('hidden');
            $('#' + this.id + ' .panel-footer').removeClass('hidden');
            $('#' + this.id + ' .hidebody span').addClass('glyphicon-chevron-up');
            $('#' + this.id + ' .hidebody span').removeClass('glyphicon-chevron-down');
            if (!(evt == null)) {
                this.options.showBody = true;
                this.saveOptionsLocalStorage();
            }
            // this will send an artificial event letting other widgets know to resize
            // themselves since this widget is now taking up more room since it's showing
            $(window).trigger("resize");
        },
        /**
         * Hide the body of the panel.
         * @param {jquery_event} evt - If you pass the event parameter in, we 
         * know it was clicked by the user and thus we store it for the next 
         * load so we can reset the user's preference. If you don't pass this 
         * value in we don't store the preference because it was likely code 
         * that sent in the param.
         */
        hideBody: function(evt) {
            $('#' + this.id + ' .panel-body').addClass('hidden');
            $('#' + this.id + ' .panel-footer').addClass('hidden');
            $('#' + this.id + ' .hidebody span').removeClass('glyphicon-chevron-up');
            $('#' + this.id + ' .hidebody span').addClass('glyphicon-chevron-down');
            if (!(evt == null)) {
                this.options.showBody = false;
                this.saveOptionsLocalStorage();
            }
            // this will send an artificial event letting other widgets know to resize
            // themselves since this widget is now taking up less room since it's hiding
            $(window).trigger("resize");
        },
        /**
         * This method loads the pubsubviewer widget which attaches to our 
         * upper right corner triangle menu and generates 3 menu items like
         * Pubsub Viewer, View Standalone, and Fork Widget. It also enables
         * the modal dialog that shows the documentation for this widget.
         * 
         * By using chilipeppr.load() we can ensure that the pubsubviewer widget
         * is only loaded and inlined once into the final ChiliPeppr workspace.
         * We are given back a reference to the instantiated singleton so its
         * not instantiated more than once. Then we call it's attachTo method
         * which creates the full pulldown menu for us and attaches the click
         * events.
         */
        forkSetup: function() {
            var topCssSelector = '#' + this.id;

            // $(topCssSelector + ' .panel-title').popover({
            //     title: this.name,
            //     content: this.desc,
            //     html: true,
            //     delay: 1000,
            //     animation: true,
            //     trigger: 'hover',
            //     placement: 'auto'
            // });

            var that = this;
            chilipeppr.load("http://fiddle.jshell.net/chilipeppr/zMbL9/show/light/", function() {
                require(['inline:com-chilipeppr-elem-pubsubviewer'], function(pubsubviewer) {
                    pubsubviewer.attachTo($(topCssSelector + ' .panel-heading .dropdown-menu'), that);
                });
            });

        },

    }
});