// arguments
const cssFiles = ["./css/index.css", "https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap"];
export const main = ({loadCSS}) => {
	// load css
	cssFiles.forEach(loadCSS(document.head));
	// console.log("hi, i'm main of index");
};
