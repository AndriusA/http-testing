const Jimp = require("jimp");
const handlebars = require('handlebars');
const fs = require('fs');

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

function generate(config) {
    if (!fs.existsSync(config.outputPath)){
        fs.mkdirSync(config.outputPath);
        fs.mkdirSync(`${config.outputPath}/${config.imagePath}`);
    }

    sliceImage(config.image,
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
        console.log(data);

        fs.readFile('blocks/images-template.html', 'utf-8', function(error, source){
          var template = handlebars.compile(source);
          var html = template(data);
          fs.writeFileSync(`${config.outputPath}/index.html`, html);
        });
    })
}

let config = {
    outputPath: "demo",
    image: "blocks/brave-hero.png",
    imageWidth: 800,
    imageSplitsHorizontal: 3,
    imageSplitsVertical: 3,
    imagePath: "images",
}

generate(config);
