#!/usr/bin/env node 

let args = process.argv.slice(2);
//console.dir(args);
const Marked = require('marked');
const path = require('path');
const fs = require('fs'); 

let mdLinks = {};

mdLinks.getDirectoryList = (myPath, files) => {
    fs.readdirSync(myPath).forEach(function(file){
        let subpath = path.join(myPath , file);
        if(fs.lstatSync(subpath).isDirectory()){
            mdLinks.getDirectoryList(subpath, files);
        } else {
            if(file.indexOf('.md') > -1) {
                files.push(path.join(myPath,file));
            }
        }
    });
};

//Obtiene los archivos y directorios de un directorio recursivamente y los retorna como un array
mdLinks.getAllDirectoryContent = (myPath) => {
	return new Promise(function (resolve, reject){
        try{
            resolve(files);
        }
        catch(err){
            reject(err); 
        } 
	});
}

//Verifica si el parametro tiene algún contenido
mdLinks.verifyEntryPath = (path) => {
    if(path !== undefined){
        return true;
    }else{
        return false;
    }
};


mdLinks.convertToAbsolutePath = (ruta) => { // Convierte de inmediato la ruta relativa a absoluta... Woooo!!!!
    return path.resolve(ruta); 
}

//Lee un archivo y lo retorna.
mdLinks.leerArchivo  = (myFile) => {
	return fs.readFileSync(myFile, 'utf8');
};


//Recorta un string a un largo
mdLinks.truncate = (texto, largo)=>{
    if(texto === ''){
        return texto;
    }else{
        if (texto.length > largo)
            return texto.substring(0,largo) + '...';
        else
            return texto;
    }
}

mdLinks.markdownLinkExtractor = (markdown) => {
    //Function markdownLinkExtractor(markdown) {
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
    

//Obtiene los links de un string.
mdLinks.getLinks = (dataFile, fileName, option) => {
    let validate = false;
    if(option !== undefined && option.validate !== undefined){
         validate = option.validate;
    }
    let lineArray = dataFile.split('\n');
    let links = [];
    for(let i=0;i<lineArray.length;i++){
        let link = mdLinks.markdownLinkExtractor(lineArray[i]);
        //Aquí debería verificar el link
        if(link.length > 0){
            link[0]["linea"] = i;
            link[0]['fileName'] = fileName;
            if(validate === true){
                link[0]['valid'] = '--';
            }else{
                link[0]['valid'] = '';
            }

            links.push(link);
        }
    }
    return links;
}

//Obtiene todos los link de un archivo y los despliega en formato para consola.
mdLinks.getAllLinksFromFile = (filePath, option) => {
    return new Promise(function (resolve, reject){
        resolve(mdLinks.getLinks(mdLinks.leerArchivo(filePath),filePath,option));
    });
}


mdLinks.mdLinks = (path, option) =>{

    return new Promise(function (resolve, reject){
        if(mdLinks.verifyEntryPath(path)){
            if(fs.lstatSync(path).isDirectory()){
                let files = [];
                mdLinks.getDirectoryList(path,files);
                totalArrayResult = [];
                files.forEach(function(file){
                    totalArrayResult = totalArrayResult.concat(mdLinks.getLinks(mdLinks.leerArchivo(file),file,option));
                });
                resolve(totalArrayResult);
            }else{
                mdLinks.getAllLinksFromFile(path,option)
                .then(function(links){
                    resolve(links);
                });
            }
        }else{
            resolve([]);
        }
    });
}

console.log('Cargando...');
let option;
if(args.indexOf('--validate') > -1)
{
    option = { validate: true };
}else{
    option = undefined;
}
mdLinks.mdLinks(args[0],option)
.then(function(link){
    link.forEach(function(link){
        //console.log(link);
        console.log(`${link[0].fileName}:${link[0].linea} ${link[0].href} ${link[0].valid} ${link[0].text}`);
    });    
    console.log('Listo');
});

module.exports = mdLinks;