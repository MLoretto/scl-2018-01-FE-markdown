let args = process.argv.slice(2);
console.dir(args);
const Marked = require('marked');
// Función necesaria para extraer los links usando marked
// (tomada desde biblioteca del mismo nombre y modificada para el ejercicio)

// Recibe texto en markdown y retorna sus links en un arreglo
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

function truncate(string, largo){
   if (string.length > largo)
      return string.substring(0,largo)+'...';
   else
      return string;
};

if(args.length === 0 || args[0] === ""){
	console.log('Tiene que poner el path del archivo a revisar.');	
}else{
let fs = require('fs');
 
fs.readFile(args[0], 'utf8', function(err, contents) {
	let linksExtractor = markdownLinkExtractor(contents);
	for(let i=0; i < linksExtractor.length; i++){
		console.log("Numero:" + i + " " + linksExtractor[i].href + " " + truncate(linksExtractor[i].text,50));	
	}
});	
}


