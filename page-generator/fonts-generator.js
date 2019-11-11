const LoremIpsum = require("lorem-ipsum").LoremIpsum;
const handlebars = require('handlebars');
const fs = require('fs');
const path = require('path');

const fontsAvailable = [
    {
        font_css: "fonts/roboto_condensed.css",
        font_family: "'Roboto Condensed', sans-serif;",
    },
    {
        font_css: "fonts/source_sans_pro.css",
        font_family: "'Source Sans Pro', sans-serif;",
    },
    {
        font_css: "fonts/oswald.css",
        font_family: "'Oswald', sans-serif;",
    },
    {
        font_css: "fonts/raleway.css",
        font_family: "'Raleway', sans-serif;",
    },
    {
        font_css: "fonts/roboto.css",
        font_family: "'Roboto', sans-serif;",
    },
    {
        font_css: "fonts/opensans.css",
        font_family: "'Open Sans', sans-serif;",
    },
    {
        font_css: "fonts/lato.css",
        font_family: "'Lato', sans-serif;",
    },
    {
        font_css: "fonts/montserrat.css",
        font_family: "'Montserrat', sans-serif;",
    },
    {
        font_css: "fonts/roboto_mono.css",
        font_family: "'Roboto Mono', monospace;",
    },
    {
        font_css: "fonts/roboto_slab.css",
        font_family: "'Roboto Slab', serif;",
    },
    {
        font_css: "fonts/poppins.css",
        font_family: "'Poppins', sans-serif;",
    },
    {
        font_css: "fonts/merriweather.css",
        font_family: "'Merriweather', serif;",
    },
    {
        font_css: "fonts/noto_sans.css",
        font_family: "'Noto Sans', sans-serif;",
    },
    {
        font_css: "fonts/pt_sans.css",
        font_family: "'PT Sans', sans-serif;",
    },
    {
        font_css: "fonts/ubuntu.css",
        font_family: "'Ubuntu', sans-serif;",
    },
    {
        font_css: "fonts/playfair_display.css",
        font_family: "'Playfair Display', serif;",
    },
]

const jsScripts = fs.readdirSync("blocks/scripts/", encoding='UTF-8');
const jsLibs = fs.readdirSync("blocks/jslibs/", encoding='UTF-8');

function generateParagraphs(count) {
    const lorem = new LoremIpsum({
      sentencesPerParagraph: {
        max: 16,
        min: 8
      },
      wordsPerSentence: {
        max: 20,
        min: 8
      }
    });

    return lorem.generateParagraphs(count).split('\n');
}

function copyFolderRecursiveSync( source, target ) {
    var files = [];

    //check if folder needs to be created or integrated
    var targetFolder = path.join( target, path.basename( source ) );
    if ( !fs.existsSync( targetFolder ) ) {
        fs.mkdirSync( targetFolder );
    }

    //copy
    if ( fs.lstatSync( source ).isDirectory() ) {
        files = fs.readdirSync( source );
        files.forEach( function ( file ) {
            var curSource = path.join( source, file );
            if ( fs.lstatSync( curSource ).isDirectory() ) {
                copyFolderRecursiveSync( curSource, targetFolder );
            } else {
                fs.copyFileSync( curSource, path.join(targetFolder, file) );
            }
        } );
    }
}

function generate(config) {
    if (!fs.existsSync(config.outputPath)){
        fs.mkdirSync(config.outputPath);
        fs.mkdirSync(`${config.outputPath}/${config.fontsPath}`);
        fs.mkdirSync(`${config.outputPath}/${config.jsLibsPath}`);
        fs.mkdirSync(`${config.outputPath}/${config.jsScriptsPath}`);        
    }

    copyFolderRecursiveSync("blocks/fonts", `${config.outputPath}/`);

    // Handle scripts
    let scripts = jsLibs.slice(0, config.jsLibs).map(lib => config.jsLibsPath + "/" + lib)
        .concat(jsScripts.slice(0, config.jsScripts).map(lib => config.jsScriptsPath + "/" + lib));

    jsLibs.slice(0, config.jsLibs)
        .forEach((lib) => {
            fs.copyFileSync(path.join("blocks", "jslibs", lib), path.join(config.outputPath, config.jsLibsPath, lib))
        });
    jsScripts.slice(0, config.jsScripts)
        .forEach((lib) => {
            fs.copyFileSync(path.join("blocks", "scripts", lib), path.join(config.outputPath, config.jsScriptsPath, lib))
        });

    // Generate text and fonts
    let paragraphs = generateParagraphs(config.fonts).map((p, i) => {
            return {
                text: p,
                font: fontsAvailable[i]
            };
        });
    let fonts = fontsAvailable.slice(0, config.fonts); 

    var data = {
        fonts: fonts,
        text: paragraphs,
        scripts: scripts,
        deferjs: config.deferJs
    };

    
    fs.readFile('blocks/fonts-template.html', 'utf-8', function(error, source){
      var template = handlebars.compile(source);
      var html = template(data);
      fs.writeFileSync(`${config.outputPath}/index.html`, html);
    });
    
}

let config = {
    outputPath: "demo",
    fontsPath: "fonts",
    fonts: 3,
    jsLibsPath: "jslibs",
    jsLibs: 3,
    jsScriptsPath: "scripts",
    jsScripts: 4,
    deferJs: false
}

generate(config);
