const Jimp = require("jimp");
const LoremIpsum = require("lorem-ipsum").LoremIpsum;
const handlebars = require('handlebars');
const fs = require('fs');
const path = require('path');

const fontsAvailable = JSON.parse(fs.readFileSync('blocks/fonts.json'));
const jsScripts = fs.readdirSync("blocks/scripts/", encoding='UTF-8');
const jsLibs = fs.readdirSync("blocks/jslibs/", encoding='UTF-8');

/**
 * @param filename - input file
 * @param vSplits - how many splits vertically
 * @param hSplit - how many splits horizontally
 * @param name - filename prefix to write resulting image slices to
 */
function sliceImage(filename, newWidth, vSplits, hSplits, path, name) {
    return Jimp.read(filename).then(image => {
        if (typeof newWidth !== 'undefined') {
            image.resize(newWidth, Jimp.AUTO);
        }
        let w = image.bitmap.width;
        let h = image.bitmap.height;
        let sliceWidth = Math.ceil(w / vSplits);
        let sliceHeight = Math.ceil(h / hSplits);
        let slack = 0.001;

        let slices = [];

        function doSlice(image, vnum, hnum) {
            let slice = image.clone()
            let x = hnum*sliceWidth;
            let y = vnum*sliceHeight;
            let width = Math.min(sliceWidth, w - x);
            let height = Math.min(sliceHeight, h - y);
            // console.log(`cropping at ${x}, ${y} width ${width}, height ${height}`)
            slice.crop(x, y, width, height);
            return {slice, width, height}
        }

        for (let i = 0; i < vSplits; i++) {
            let rowSlices = [];
            for (let j = 0; j < hSplits; j++) {
                let slice = doSlice(image, i, j);
                let src = `${name}/image-${i}-${j}.${image.getExtension()}`;
                slice.slice.write(`${path}/${src}`);
                rowSlices.push({
                    width: slice.width,
                    height: slice.height,
                    src: src
                });
            }
            slices.push(rowSlices);
        }
        return slices;
    });
}

/**
 * @param count - how many paragraphs to return
 * @return - list of plaintext LoremIpsum paragraphs
 */
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

async function generate(config) {
    if (!fs.existsSync(config.outputPath)){
        fs.mkdirSync(config.outputPath);
        if (config.imagePath) {
            fs.mkdirSync(`${config.outputPath}/${config.imagePath}`);
        }
        if (config.fontsPath) {
            fs.mkdirSync(`${config.outputPath}/${config.fontsPath}`);
        }
        if (config.jsLibsPath) {
            fs.mkdirSync(`${config.outputPath}/${config.jsLibsPath}`);
        }
        if (config.jsScriptsPath) {
            fs.mkdirSync(`${config.outputPath}/${config.jsScriptsPath}`);
        }
    }

    let scripts = [];
    if (config.jsLibs || config.jsScripts) {
        // Handle scripts
        scripts = jsLibs.slice(0, config.jsLibs).map(lib => config.jsLibsPath + "/" + lib)
            .concat(jsScripts.slice(0, config.jsScripts).map(lib => config.jsScriptsPath + "/" + lib));

        jsLibs.slice(0, config.jsLibs)
            .forEach((lib) => {
                fs.copyFileSync(path.join("blocks", "jslibs", lib), path.join(config.outputPath, config.jsLibsPath, lib))
            });
        jsScripts.slice(0, config.jsScripts)
            .forEach((lib) => {
                fs.copyFileSync(path.join("blocks", "scripts", lib), path.join(config.outputPath, config.jsScriptsPath, lib))
            });
    }

    // Generate text and fonts
    let paragraphs = [];
    let fonts = [];
    if (config.fonts) {
        copyFolderRecursiveSync("blocks/fonts", `${config.outputPath}/`);
        fonts = fontsAvailable.slice(0, config.fonts);
        paragraphs = generateParagraphs(config.fonts).map((p, i) => {
            return {
                text: p,
                font: fontsAvailable[i]
            };
        });
    }

    let imagesData = {};
    if (config.image && config.imageWidth && config.imageSplitsHorizontal && config.imageSplitsVertical) {
        imagesData = await sliceImage(config.image,
            config.imageWidth,
            config.imageSplitsHorizontal,
            config.imageSplitsVertical,
            config.outputPath,
            config.imagePath)
        .then(images => {
            var data = {
              images: images,
              imagePercentage: 99/images[0].length
            }
            return data;
        })
    }

    var data = {
        fonts: fonts,
        text: paragraphs,
        scripts: scripts,
        deferjs: config.deferJs,
        ...imagesData
    };

    
    fs.readFile('blocks/template.html', 'utf-8', function(error, source){
      var template = handlebars.compile(source);
      var html = template(data);
      fs.writeFileSync(`${config.outputPath}/index.html`, html);
    });
    
}

let config = {
    outputPath: "demo",
    image: "blocks/brave-hero.png",
    imageWidth: 4600,
    imageSplitsHorizontal: 10,
    imageSplitsVertical: 10,
    imagePath: "images",
    fontsPath: "fonts",
    fonts: 16,
    jsLibsPath: "jslibs",
    jsLibs: 25,
    jsScriptsPath: "scripts",
    jsScripts: 100,
    deferJs: false
}

generate(config);
