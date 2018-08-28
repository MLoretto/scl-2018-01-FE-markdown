#!/usr/bin/env node 

let args = process.argv.slice(2);
console.dir(args);
const Marked = require('marked');
const path = require('path');
const fs = require('fs'); 

let mdLinks = {};

mdLinks.getDirectoryList = (myPath, files) => {
	fs.readdirSync(myPath).forEach(function(file){
		let subpath = path.join(myPath , file);
        if(fs.lstatSync(subpath).isDirectory()){
			//console.log(myPath + '/' + subpath);
            mdLinks.getDirectoryList(subpath, files);
        } else {
            files.push(path.resolve(path.join(myPath),file));
			//console.log(myPath + '/' + file);
        }
	});
};

mdLinks.verifyEntryPath = (path) => {
    if(path !== ''){
        return true;
    }else{
        return 'Tiene ingresar el path a revisar.';
    }
};

mdLinks.convertToAbsolutePath = (ruta) => { // Convierte de inmediato la ruta relativa a absoluta... Woooo!!!!
    return path.resolve(ruta); 
}

//lee un archivo y lo retorna como una promesa.
mdLinks.leerArchivo  = (myFile) => {
	return new Promise(function (resolve, reject) {
		resolve(fs.readFileSync(myFile, 'utf8'));
	});	
};

//obtiene los archivos y directorios de un directorio y los retorna como un array
mdLinks.listarDirectorio = (myPath) => {
	return new Promise(function (resolve, reject){
		resolve(fs.readdirSync(myPath));
	});
}

mdLinks.truncate = (string, largo)=>{
    if (string.length > largo)
        return string.substring(0,largo)+'...';
    else
        return string;
}

// Hasta aca voy con test y funciones... continuara...

function markdownLinkExtractor(markdown) {
  const links = [];
  const renderer = new Marked.Renderer();
  const linkWithImageSizeSupport = /^!?\[((?:\[[^\[\]]*\]|\\[\[\]]?|`[^`]*`|[^\[\]\\])*?)\]\(\s*(<(?:\\[<>]?|[^\s<>\\])*>|(?:\\[()]?|\([^\s\x00-\x1f()\\]*\)|[^\s\x00-\x1f()\\])*?(?:\s+=(?:[\w%]+)?x(?:[\w%]+)?)?)(?:\s+("(?:\\"?|[^"\\])*"|'(?:\\'?|[^'\\])*'|\((?:\\\)?|[^)\\])*\)))?\s*\)/;
  Marked.InlineLexer.rules.normal.link = linkWithImageSizeSupport;
  Marked.InlineLexer.rules.gfm.link = linkWithImageSizeSupport;
  Marked.InlineLexer.rules.breaks.link = linkWithImageSizeSupport;

  renderer.link = function(href, title, text) {
    links.push({
      href: href,
      text: text,
      title: title,
    });
  };
  renderer.image = function(href, title, text) {
      // Remove image size at the end, e.g. ' =20%x50'
      href = href.replace(/ =\d*%?x\d*%?$/, '');
      links.push({
        href: href,
        text: text,
        title: title,
      });
  };
  Marked(markdown, {renderer: renderer});
  return links;
};


/*
if(args.length === 0 || args[0] === ""){
	console.log('Tiene ingresar el path a revisar.');	
}else{
 
fs.readdir(args[0], function(err, items) {
    console.log('Archivos:');
    //console.log(items);
 
    for (var i=0; i<items.length; i++) {
        //console.log(items[i]);
        let archivo = items[i];
        if(archivo.indexOf('md') !== -1){
            fs.readFile(archivo, 'utf8', function(err, contents) {
                let linksExtractor = markdownLinkExtractor(contents);
                for(let i=0; i < linksExtractor.length; i++){
                    console.log( archivo + ":" + i + " " + linksExtractor[i].href + " " + truncate(linksExtractor[i].text,50));	
                }
            });	        
        }
    }
});

}
*/
module.exports = mdLinks;