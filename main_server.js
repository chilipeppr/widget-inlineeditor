// Zipwhip main_server.js

// You should right-click and choose "Run" inside Cloud9 to run this
// Node.js server script. Then choose "Preview" to load the main HTML page
// of the script in a new tab.

var http = require('http');
var url = require('url');
var qs = require('querystring');
var path = require('path');
var fs = require('fs');
var AWS = require("aws-sdk");
var babel = require("babel-core");

var mimeTypes = {
  "html": "text/html",
  "jpeg": "image/jpeg",
  "jpg": "image/jpeg",
  "png": "image/png", 
  "js": "text/javascript",
  "css": "text/css"
};

http.createServer(function(req, res) {

    var uri = url.parse(req.url).pathname;
    console.log("URL being requested:", uri);

    if (uri == "/") {

        res.writeHead(200, {
            'Content-Type': 'text/html'
        });

        var finalHtml = `
        <p><a href="widget.html">widget.html</a></p>
        
        <p>This server dishes up Ajax calls as well.</p>
        `;

        res.end(finalHtml);

    }
    else if (uri == "/slingshot") {
        
        // /slingshot?url=http://...
        // we need to retrieve the file asked for, likely from github,
        // and return the correct header
        var url_parts = url.parse(req.url, true);
        var query = url_parts.query;
        var slingshoturl = query.url;
        console.log("doing slingshot. slingshoturl:", slingshoturl);
        
        var contenttype = "";
        if (slingshoturl.match(/\.js$/)) {
            contenttype = "application/json";
        }
        
        res.writeHead(200, {
            'Content-Type': contenttype
        });
        
        var axios = require('axios');
        axios.get(slingshoturl)
          .then(function (response) {
            //console.log(response);
            console.log("completed slingshot get. resposne:", response);
            res.end(response.data)
          })
          .catch(function (response) {
            console.log("Error on slingshot get. response:", response);
          });

    }
    else if (uri == "/docs") {
        res.writeHead(200, {
            'Content-Type': 'text/html'
        });

        getDocs(function(html) {
            res.end(html);
        });

    }
    else if (uri == "/get") {
        console.log("get code repo from id. ");
        var url_parts = url.parse(req.url, true);
        var query = url_parts.query;
        var id = query.id;
        getCodeRepoDb(id, function(err, data) {
            if (err) {
                var json = {
                    success: false,
                    desc: "Error getting code repo data for id:" + id,
                    err: err
                }

                res.writeHead(200, {
                    'Content-Type': 'application/json'
                });
                res.end(JSON.stringify(json));
                console.log('error getting code repo for id:' + id);
            }
            else {
                var json = {
                    success: true,
                    desc: "Got code repo data for id:" + id,
                    id: id,
                    info: data.Item.info
                }

                res.writeHead(200, {
                    'Content-Type': 'application/json'
                });
                res.end(JSON.stringify(json));
                console.log('done getting code repo for id:' + id);
            }
        });
    }
    else if (uri == "/save") {
        console.log("save code. ");

        if (req.method == 'POST') {
            var body = '';
            req.on('data', function(data) {
                body += data;
                // 1e6 === 1 * Math.pow(10, 6) === 1 * 1000000 ~~~ 1MB
                if (body.length > 1e6) {
                    // FLOOD ATTACK OR FAULTY CLIENT, NUKE REQUEST
                    req.connection.destroy();
                }
            });
            req.on('end', function() {

                //console.log("body:", body);
                var POST = qs.parse(body);
                // use POST
                console.log("done with POST:"); //, POST);

                var info = POST;
                
                // we need to try to transpile the frontend js
                try {
                    var convertedJscript = babel.transform(info.js, {
                        // plugins: ["transform-es2015-modules-amd"],
                        // plugins: ["transform-es2015-modules-systemjs"],
                        // plugins: ["transform-es2015-modules-umd"],
                    //   presets: ['babel-preset-es2015']
                        "presets": ["react", "es2015"]
                    });
                    info.transpiledjs = convertedJscript.code;
                    
                    // also transpile examplejs
                    var transpiledExampleJs = babel.transform(info.examplejs, {
                        "presets": ["react", "es2015"]
                    });
                    info.transpiledexamplejs = transpiledExampleJs.code;
                    
                    // write to amazon dynamodb
                    putCodeRepoDb(POST.id, info, function(err, data) {
                        if (err) {
                            var json = {
                                success: false,
                                desc: "Error saving code repo data",
                                err: err
                            }
    
                            res.writeHead(200, {
                                'Content-Type': 'application/json'
                            });
                            res.end(JSON.stringify(json));
                            console.log('error saving code repo');
                        }
                        else {
                            var json = {
                                success: true,
                                desc: "Saved code repo data",
                            }
    
                            res.writeHead(200, {
                                'Content-Type': 'application/json'
                            });
                            res.end(JSON.stringify(json));
                            console.log('done saving code repo');
                        }
                    });
                } catch (e) {
                    
                    // error occurred transpiling
                    // still try to write it but with error
                    // write to amazon dynamodb
                    putCodeRepoDb(POST.id, info, function(err, data) {
                        if (err) {
                            var json = {
                                success: false,
                                desc: "Error saving code repo data",
                                err: err,
                                errorTranspiling: true,
                                transpileErrorMsg: e
                            }
    
                            res.writeHead(200, {
                                'Content-Type': 'application/json'
                            });
                            res.end(JSON.stringify(json));
                            console.log('error saving code repo');
                        }
                        else {
                            var json = {
                                success: true,
                                desc: "Saved code repo data",
                                errorTranspiling: true,
                                transpileErrorMsg: e
                            }
    
                            res.writeHead(200, {
                                'Content-Type': 'application/json'
                            });
                            res.end(JSON.stringify(json));
                            console.log('done saving code repo');
                        }
                    });
                    
                    // res.writeHead(200, {
                    //     'Content-Type': 'application/json'
                    // });
                    // res.end(JSON.stringify({success:false, err:e}));
                    console.error("Error transpiling.", e);
                }
                
                

            });
        }

    }
    else if (uri == "/savetranspiled") {
        console.log("save override transpiled code. ");

        if (req.method == 'POST') {
            var body = '';
            req.on('data', function(data) {
                body += data;
                // 1e6 === 1 * Math.pow(10, 6) === 1 * 1000000 ~~~ 1MB
                if (body.length > 1e6) {
                    // FLOOD ATTACK OR FAULTY CLIENT, NUKE REQUEST
                    req.connection.destroy();
                }
            });
            req.on('end', function() {

                //console.log("body:", body);
                var POST = qs.parse(body);
                // use POST
                console.log("done with POST:", POST);

                // var info = POST;
                
                // read from the db first, then override the data
                getCodeRepoDb(POST.id, function(err, data) {
                    
                    // data.Item.info 
                    var info = data.Item.info;
                    info.transpiledjs = POST.transpiledjs;
                    
                    // write to amazon dynamodb
                    putCodeRepoDb(POST.id, info, function(err, data) {
                        if (err) {
                            var json = {
                                success: false,
                                desc: "Error saving code repo data",
                                err: err
                            }
    
                            res.writeHead(200, {
                                'Content-Type': 'application/json'
                            });
                            res.end(JSON.stringify(json));
                            console.log('error saving code repo');
                        }
                        else {
                            var json = {
                                success: true,
                                desc: "Saved code repo data",
                            }
    
                            res.writeHead(200, {
                                'Content-Type': 'application/json'
                            });
                            res.end(JSON.stringify(json));
                            console.log('done saving code repo');
                        }
                    });
                });

            });
        }

    }
    else if (uri.match(/^\/(widget|favicon|bundle.css)/)) {
        // this is trying to just load a base item like favicon or 
        // widget.js or widget.css or widget.html
        var filename = path.join(process.cwd(), unescape(uri));
        var stats;

        try {
            stats = fs.lstatSync(filename); // throws if path doesn't exist
        }
        catch (e) {
            res.writeHead(404, {
                'Content-Type': 'text/plain'
            });
            res.write('404 Not Found\n');
            res.end();
            return;
        }

        if (stats.isFile()) {
            // path exists, is a file
            var mimeType = mimeTypes[path.extname(filename).split(".").reverse()[0]];
            res.writeHead(200, {
                'Content-Type': mimeType
            });

            var fileStream = fs.createReadStream(filename);
            fileStream.pipe(res);
        }
        else if (stats.isDirectory()) {
            // path exists, is a directory
            res.writeHead(200, {
                'Content-Type': 'text/plain'
            });
            res.write('Index of ' + uri + '\n');
            res.write('TODO, show index?\n');
            res.end();
        }
        else {
            // Symbolic link, other?
            // TODO: follow symlinks?  security?
            res.writeHead(500, {
                'Content-Type': 'text/plain'
            });
            res.write('500 Internal server error\n');
            res.end();
        }
    }
    else {
        
        // see if this is an ID in our database
        // extract id
        console.log("seeing if possible id in db");
        if (uri.match(/\/(.*?)(\/|$|\.js)/)) {
            var possibleId = RegExp.$1;
            console.log("we have a possible code repo id:", possibleId);
            getCodeRepoDb(possibleId, function(err, data) {
                
                // we may have data
                if (err) {
                    console.log("err back from dynamodb. no data.");
                    // maybe just return widget.html
                } else {
                    // we got ourselves some code
                    console.log("got code so now branch on uri:", uri);
                    var isMatch = uri.match(/frontend\/object(.js)*$/);
                    console.log("debug does it match object.js:", isMatch);
                    
                    // see if they want just the javascript for
                    // the widget, or see if they want to "show" the final result
                    // or load the editor for this code?
                    /*if (uri.match(/\.js$/)) {
                        // they want just the javascript
                        
                    }
                    else*/ 
                    if (uri.match(/repos$/)) {
                        // they want a list of the repos they own
                        getAllCodeRepoDb(function(err, json) {
                            res.writeHead(200, {
                                'Content-Type': 'application/json'
                            });
                            res.end(JSON.stringify(json));
                            console.log('done retrieving code repo list');
                        })
                    }
                    else if (uri.match(/frontend\/object(.js)*$/)) {
                        // they want just the transpiled javascript for the object code
                        // for the frontend, i.e. just the React class
                        console.log("they want the raw transpiled js for the main object. uri:", uri);
                        
                        var js = data.Item.info.transpiledjs;
                        res.writeHead(200, {
                            'Content-Type': 'application/javascript'
                        });
                        res.write(js);
                        res.end();
                        
                    } 
                    else if (uri.match(/frontend\/css$/)) {
                        // they want just the css for this object
                        console.log("they want the frontend CSS for the main object. uri:", uri);
                        
                        var css = data.Item.info.css;
                        res.writeHead(200, {
                            'Content-Type': 'text/css'
                        });
                        res.write(css);
                        res.end();
                        
                    } 
                    else if (uri.match(/(show|frontend)$/)) {
                        // they want to "show" the result
                        
                        var html = showResult(data.Item.info);
                        res.writeHead(200, {
                            'Content-Type': 'text/html'
                        });
                        res.write(html);
                        res.end();
                        
                    } 
                    else if (uri.match(/backend/)) {
                        // they want to execute the RESTful call to the backend code
                        
                        var bjs = data.Item.info.backendjs;
                        // console.log("The backend code we are about to eval:", bjs);
                        var _eval = require('eval');
                        var backend = _eval(bjs, "eval_code", null, true /*, filename, scope, includeGlobals */);
                        // console.log("backendObj:", backend);
                        try {
                            console.log("About to execute backend code (lambda):");
                            backend.onHttpsRequest({uri:uri, req:req}, function(result) {
                                res.writeHead(200, {
                                    'Content-Type': result.contentType
                                });
                                res.write(result.body);
                                res.end();
                                
                            });
                        } catch(e) {
                            res.writeHead(200, {
                                'Content-Type': "text/html"
                            });
                            res.write("Error executing backend code. err: " + e);
                            res.end();
                        }
                        
                    } 
                    else {
                        // they want to edit the code
                        console.log("we are in the else of the branch since we did not recognize anything else in the url");
                        
                        // return widget.html but insert hidden field
                        // indicating we have good code repo record so 
                        // the page should retrieve it via ajax
                        var html = fs.readFileSync('widget.html')+'';
                        // swap the hidden field to have a true repo id
                        html = html.replace(/insert-original-coderepo-id-here/, possibleId);
                        // swap in the iframe src
                        if (html.match(/(<iframe name="result".*?>)/)) {
                            var iframe = RegExp.$1;
                            var newiframe = iframe.replace(/>$/, "");
                            newiframe += ' src="' + data.Item.id + '/show">';
                            html = html.replace(iframe, newiframe);
                        }
                        res.writeHead(200, {
                            'Content-Type': 'text/html'
                        });
                        res.write(html);
                        res.end();
                    }
                }
            });
        } else {
            console.log("did not match regexp for possible code repo id. uri:", uri);
        }

    }

}).listen(process.env.PORT);

var processCodeRepoPost = function(post) {

};

var getDocs = function(callback) {

    console.log("getDocs called");
    
    var html = `

<html>
<head>
<title>Zipwhip UI Platform Documenation</title>
<link rel="stylesheet" type="text/css" href="bundle.css">
<script src="https://cdnjs.cloudflare.com/ajax/libs/require.js/2.2.0/require.js"></script>
<script src="//ace.c9.io/build/src/ace.js"></script>
<script src="//cdn.jsdelivr.net/ace/1.2.3/min/mode-jsx.js"></script>

<style type="text/css">
.code-toggle {
    top:0;
    padding: 6px 8px;
}
button.jsfiddle {
    border-top-left-radius: 0;
    border-top-right-radius: 0;
}
</style>

</head>
<body>
<div class="zipwhip-docs">
    <div class="bs-docs-header" id="content"><div class="container"><h1>Zipwhip UI Platform Documentation</h1><p></p></div></div>

    <div class="container bs-docs-container">
        <div class="row">
            <div class="col-md-9">
                <span style="font-size: 0px;"></span>
                
                ##ContactIcon##
                
                ##ContactCard##
                
                ##ConversationCard##
                
                ##ConversationList##
                
                ##Composer##
                
                ##MessageBubble##
                
                ##MainLayout##
                
                ##LoginForm##
                
                ##PhoneUtil##
                
                ##SoboWidget##
                
                ##VerizonMbisWidget##
                
            </div>
        </div>
    </div>
    
</div>

<p>&nbsp;</p>
<p>&nbsp;</p>
<p>&nbsp;</p>

</body>
    `;
    
    // loop through all objects in code repo
    // only show ones that are visible
    // var that = this;
    getCodeRepoDb("ContactIcon", function(err, data) {
        console.log("got code repo for ContactIcon. data.Item.info:", data.Item.info);
        // got code for ContactIcon
        var example = showSnippetResult(data.Item.info);
        
        // replace ##ContactIcon with html
        html = html.replace(/##ContactIcon##/, example);
        
        getCodeRepoDb("ContactCard", function(err, data) {
            var example2 = showSnippetResult(data.Item.info);
            
            html = html.replace("##ContactCard##", example2);
            
            getCodeRepoDb("ConversationCard", function(err, data) {
                var example2 = showSnippetResult(data.Item.info);
                
                html = html.replace("##ConversationCard##", example2);
                
                getCodeRepoDb("ConversationList", function(err, data) {
                    var example2 = showSnippetResult(data.Item.info);
                    
                    html = html.replace("##ConversationList##", example2);
                    
                    getCodeRepoDb("Composer", function(err, data) {
                        var example2 = showSnippetResult(data.Item.info);
                        
                        html = html.replace("##Composer##", example2);
                        
                        getCodeRepoDb("MessageBubble", function(err, data) {
                            var example2 = showSnippetResult(data.Item.info);
                            
                            html = html.replace("##MessageBubble##", example2);
                            
                            getCodeRepoDb("MainLayout", function(err, data) {
                                var example2 = showSnippetResult(data.Item.info);
                                
                                html = html.replace("##MainLayout##", example2);
                                
                                getCodeRepoDb("LoginForm", function(err, data) {
                                    var example2 = showSnippetResult(data.Item.info);
                                    
                                    html = html.replace("##LoginForm##", example2);
                                    
                                    getCodeRepoDb("PhoneUtil", function(err, data) {
                                        var example2 = showSnippetResult(data.Item.info);
                                        
                                        html = html.replace("##PhoneUtil##", example2);
                                        
                                        getCodeRepoDb("SoboWidget", function(err, data) {
                                            var example2 = showSnippetResult(data.Item.info);
                                            
                                            html = html.replace("##SoboWidget##", example2);
                                            
                                            getCodeRepoDb("VerizonMbisWidget", function(err, data) {
                                                var example2 = showSnippetResult(data.Item.info);
                                                
                                                html = html.replace("##VerizonMbisWidget##", example2);
                                                
                                                callback(html);
                                            });
                                            
                                        });
                                        
                                    });
                                   
                                });
                                
                            });
                            
                        });
                        
                    });
                    
                });
                
            });
            
        });
    });
    
    // return html;
}

/**
 * Same as showResult() but doesn't add header/footer so that we can use
 * this method call in the docs
 */
var showSnippetResult = function(data) {
    
    var out = `

<div class="bs-docs-section">
    <h1 class="page-header">
        <a id="buttons" href="#buttons" class="anchor">
            <span class="anchor-icon">#</span>
            ` + data.name + `
        </a>
        <small></small>
    </h1>
    
    <p>` + data.description + `</p>
    
    <div class="playground">
        <div class="bs-example">
            <div>
                <div role="toolbar" class="btn-toolbar">
                    ` + data.html + `
                </div>
            </div>
        </div>
        <!--<a class="code-toggle" role="button" href="">show code</a>-->
    
        <script type="application/javascript" language="JavaScript 1.7">
            ` + data.transpiledexamplejs + `
            ` + data.transpiledjs + `
        </script>
        
        <div id="editor-` + data.id + `" style="height:300px;"></div>
        <a class="code-toggle" role="button" href="https://widget-inlineeditor-chilipeppr.c9users.io/` + data.id + `" target="_blank">Edit in Zipwhip Inline Editor</a>

        <form id="jsfiddleform-` + data.id + `" method="post" action="https://jsfiddle.net/api/post/library/pure/" target="_blank">
            <textarea style="display:none" name="html" id="html-` + data.id + `"><script src="https://cdnjs.cloudflare.com/ajax/libs/require.js/2.2.0/require.js"></script>
<link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/latest/css/bootstrap.min.css">

` + data.html + `</textarea>
            <input type="hidden" name="panel_js" value="3" />
            <textarea style="display:none" type="hidden" name="js" id="js-` + data.id + `">requirejs.config({
    paths: {
      ` + data.id + `: 'https://widget-inlineeditor-chilipeppr.c9users.io/` + data.id + `/frontend/object',
    },
    shim: {
    }
});

` + data.examplejs + `</textarea>
            <button class="btn btn-default jsfiddle" type="submit" value="Run in JSFiddle">Run in JSFiddle</button>
        </form>
        
        <script type="application/text" id="script-` + data.id + `" style="display:none;"></script>

        <script >
            setTimeout(function() {
                console.log("is ace defined? ace:", ace);
                var editor = ace.edit("editor-` + data.id + `");
                editor.setTheme("ace/theme/monokai");
                var script = "";
                /*var script = '<' + 
                    'script' + 
                    ' src="https://cdnjs.cloudflare.com/ajax/libs/require.js/2.2.0/' + 
                    'require.js"><' + 
                    '/script>\\n';
                script += '<link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/latest/css/bootstrap.min.css">\\n\\n';
                */
                script += document.getElementById('html-` + data.id + `').value;
                script = script.replace(/\\n*$/, "");
                script += '\\n\\n';
                script += document.getElementById('js-` + data.id + `').value;
                // script = script.replace(/&gt;/g, ">");
                // script = script.replace(/&lt;/g, "<");
                editor.setSession(new ace.EditSession(script, "ace/mode/jsx"));
                // editor.getSession().setMode("ace/mode/jsx");
            }, 1000);
        </script>
    
    </div>
    
</div>



    `;
    return out;
}

var showResult = function(data) {
    // Create the final HTML file
    // var convertedJscript = babel.transform(data.js, {
    // //   plugins: ["transform-react-jsx", "transform-es2015-modules-amd"],
    //   presets: ['babel-preset-es2015']
    // });
    // console.log("babel tranformed javascript:", convertedJscript);
    // var convertedJscript = '';
    
    var out = `
<html>
<head>
    <meta http-equiv="content-type" content="text/html; charset=UTF-8">
    <title>` + data.name + `</title>
    <!-- Latest compiled and minified CSS -->
    <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/latest/css/bootstrap.min.css">
    <!--<script src="https://cdnjs.cloudflare.com/ajax/libs/systemjs/0.19.27/system.js"></script>-->
    <script src="https://cdnjs.cloudflare.com/ajax/libs/require.js/2.2.0/require.js"></script>
    <!--<script src="https://cdnjs.cloudflare.com/ajax/libs/babel-core/5.8.24/browser.js"></script>-->
` + /*`
    <!-- Customized version of require.js for ChiliPeppr. Please see require.js docs for how
    ChiliPeppr's dependency system works as it's based on require.js. -->
    <script type='text/javascript' src="//i2dcui.appspot.com/js/require.js"></script>

`*/ '' + /*`
    <script src="https://fb.me/react-with-addons-15.0.1.js"></script>
    <script src="https://fb.me/react-dom-15.0.1.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/react-bootstrap/0.29.2/react-bootstrap.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/axios/0.10.0/axios.js"></script>
    `*/ '' + /*`
    
    <script>
    requirejs.config({
        baseUrl: '',
        paths: {
            // the left side is the module ID,
            // the right side is the path to
            // the jQuery file, relative to baseUrl.
            // Also, the path should NOT include
            // the '.js' file extension. This example
            // is using jQuery 1.9.0 located at
            // js/lib/jquery-1.9.0.js, relative to
            // the HTML page.
    		chilipeppr_ready: '//i2dcui.appspot.com/js/main',
    		chilipeppr_init2: '//i2dcui.appspot.com/js/app2',
    		chilipeppr_init: '//i2dcui.appspot.com/js/app',
    		google: '//www.google-analytics.com/analytics',
            jquery: '//code.jquery.com/jquery-2.1.0.min',
    		bootstrap: '//i2dcui.appspot.com/js/bootstrap/bootstrap_3_1_1.min',
    //		bootstrap: '//netdna.bootstrapcdn.com/bootstrap/3.1.1/js/bootstrap.min',
    		amplify: '//i2dcui.appspot.com/js/amplify-1.1.2/amplify',
    		jquerycookie: '//i2dcui.appspot.com/js/jquery-cookie/jquery.cookie',
    		jqueryui: '//i2dcui.appspot.com/js/jquery-ui-1.10.4/ui/jquery.ui.core',
            jqueryuiWidget: '//i2dcui.appspot.com/js/jquery-ui-1.10.4/ui/jquery.ui.widget',
            jqueryuiMouse: '//i2dcui.appspot.com/js/jquery-ui-1.10.4/ui/jquery.ui.mouse',
            jqueryuiResizeable: '//i2dcui.appspot.com/js/jquery-ui-1.10.4/ui/jquery.ui.resizable',
    		// original without ssl
    //		chilipeppr_ready: 'http://www.chilipeppr.com/js/main',
    //		chilipeppr_init2: 'http://www.chilipeppr.com/js/app2',
    //		chilipeppr_init: 'http://www.chilipeppr.com/js/app',
    //		google: 'http://www.google-analytics.com/analytics',
    //      jquery: 'http://code.jquery.com/jquery-2.1.0.min',
    //		bootstrap: 'http://netdna.bootstrapcdn.com/bootstrap/3.1.1/js/bootstrap.min',
    //		amplify: 'http://www.chilipeppr.com/js/amplify-1.1.2/amplify',
    //		jquerycookie: 'http://www.chilipeppr.com/js/jquery-cookie/jquery.cookie',
    //		jqueryui: 'http://chilipeppr.com/js/jquery-ui-1.10.4/ui/jquery.ui.core',
    //      jqueryuiWidget: 'http://chilipeppr.com/js/jquery-ui-1.10.4/ui/jquery.ui.widget',
    //      jqueryuiMouse: 'http://chilipeppr.com/js/jquery-ui-1.10.4/ui/jquery.ui.mouse',
    //      jqueryuiResizeable: 'http://chilipeppr.com/js/jquery-ui-1.10.4/ui/jquery.ui.resizable',
    
        },
    	shim: {
    		"chilipeppr_ready": ["jquery", "bootstrap", "amplify", "chilipeppr_init2"],
    		"chilipeppr_init2": ["jquery", "bootstrap", "amplify", "chilipeppr_init"],
    		"chilipeppr_init": ["jquery", "bootstrap", "amplify"],
    		"bootstrap": ["jquery"],
    		"amplify": ["jquery"],
    		"jqueryuiWidget": ['jqueryui'],
            "jqueryuiMouse": ['jqueryuiWidget'],
            "jqueryuiResizeable": ['jqueryuiMouse' ]
    	}
    });
    </script>
    `*/  /*`
    <style type='text/css'>
        ` + data.css + `
    </style>
    
    <script type="text/babel" language="JavaScript 1.7">
        ` + data.js + `
    </script>` + */
    
    `
    
</head>
<body>
` + data.html + 
    `
    <script type="application/javascript" language="JavaScript 1.7">
        ` + data.transpiledexamplejs + `
        ` + data.transpiledjs + `
    </script>
    ` + 
    `
</body>
</html>
`;
    return out;
};

var getCodeRepoDb = function(id, callback) {
    
    AWS.config.update({
      region: "us-west-2",
    //   endpoint: "http://localhost:8000"
    });
    
    var docClient = new AWS.DynamoDB.DocumentClient()
    
    var table = "coderepo";
    
    var params = {
        TableName: table,
        Key:{
            "id": id,
        }
    };
    
    docClient.get(params, function(err, data) {
        if (err) {
            console.error("Unable to read item. Error JSON:", JSON.stringify(err, null, 2));
        } else {
            console.log("GetItem succeeded:", JSON.stringify(data, null, 2));
        }
        if (callback) callback(err, data);
    });    
};

var getAllCodeRepoDb = function(callback) {
    
    console.log("getAllCodeRepoDb");
    
    AWS.config.update({
      region: "us-west-2",
    //   endpoint: "http://localhost:8000"
    });
    
    var docClient = new AWS.DynamoDB.DocumentClient();
    
    var table = "coderepo";
    
    var params = {
        TableName: table,
        // ProjectionExpression: "id, info.user",
    };
    
    // reset the scan results
    var onScanResults = [];

    var onScan = function(err, data) {
        console.log('got onScan');
        if (err) {
            console.error("Unable to scan the table. Error JSON:", JSON.stringify(err, null, 2));
            if (callback) callback(err, null);
            
        } else {
            // gather all the repos
            console.log("Scan succeeded.");
            
            data.Items.forEach(function(repo) {
               console.log("repo:", repo);
               onScanResults.push({
                   id: repo.id, 
                   name: repo.info.name, 
                   description: repo.info.description,
                   user: repo.info.user
               });
            });
    
            // continue scanning if we have more movies
            if (typeof data.LastEvaluatedKey != "undefined") {
                console.log("Scanning for more...");
                params.ExclusiveStartKey = data.LastEvaluatedKey;
                docClient.scan(params, onScan);
            } else {
                // we are done scanning
                // sort
                onScanResults.sort(function(a, b) {
                    return a.id.localeCompare(b.id);
                });
                if (callback) callback(err, onScanResults);
            }
        }
    };
    
    // onScanResults will get populated from the onScan method which can get
    // called multiple times. It will also do the callback when it knows it's done.
    docClient.scan(params, onScan);
};



var putCodeRepoDb = function(id, info, callback) {

    AWS.config.update({
        region: "us-west-2",
        //   endpoint: "http://localhost:8000"
    });

    var docClient = new AWS.DynamoDB.DocumentClient();

    var table = "coderepo";

    // var id = "sprint-callcenter-widget";
    // var year = 2015;
    // var title = "The Big New Movie";

    var params = {
        TableName: table,
        Item: {
            "id": id,
            "info": info
        }
    };

    console.log("Adding a new item...");
    docClient.put(params, function(err, data) {
        if (err) {
            console.error("Unable to add item. Error JSON:", JSON.stringify(err, null, 2));
        }
        else {
            console.log("Added item:", JSON.stringify(data, null, 2));
        }
        if (callback) callback(err, data);
    });
};