// arguments

const cssFilesGlobals = ["https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@100;300;400;500;700;900&display=swap"];

// methods

const loadFacebookSDK = () => {
	const d = document, s = 'script', id = 'facebook-jssdk';
	const fjs = d.getElementsByTagName(s)[0];
	if (d.getElementById(id)) return;
	const js = d.createElement(s); 
	js.id = id;
	js.async = String(true);
	js.src = "https://connect.facebook.net/en_US/sdk.js#xfbml=1&version=v9.0";
	fjs.parentNode.insertBefore(js, fjs);
};

const loadDisqus = () => {
	const d = document, s = d.createElement('script');
	s.async = String(true); 
	s.src = 'https://css-art-holberton.disqus.com/embed.js';
	s.setAttribute('data-timestamp', +new Date());
	(d.head || d.body).appendChild(s);
};

const addZoomEvent = (element) => {
	if (element instanceof HTMLElement) {
		let active = true;
		const addZoom = () => {
			if (active) {
				element.classList.toggle("smart_thumbnail");
				active = false;
			};
			setTimeout(() => active = true, 300);
		}
		element.addEventListener("click", addZoom);
	}
};

const PromiseFileReader = (typeRead, ...arg) => new Promise((resolve, reject) => {
	const reader = new FileReader();
	reader.onload = resolve;
	reader.onerror = reject;
	reader[typeRead](...arg);
});

const loadTextFile = (src) => new Promise((resolve, reject) => {
	if (typeof src === "string") fetch(src)
		.then(response => response.blob())
		.then(blob => PromiseFileReader("readAsText", blob))
		.then(({target}) => {
			if (target instanceof FileReader && typeof target.result === "string" && target.result.length > 0)
				resolve(target.result);
			else 
				reject();
		})
		.catch(err => console.error(err));
});
const loadCSS = parent => src => {
	loadTextFile(src)
		.then(result => {
			const localStyle = document.createElement("style");
			if (localStyle instanceof HTMLStyleElement) {
				localStyle.innerHTML = result;
				parent.appendChild(localStyle);
			}
		})
		.catch(err => console.error(err));
};

const globals = Object.freeze({ loadCSS, });

const runMain = ({main}) => (main instanceof Function && main(globals));

const allPages = () => {
	cssFilesGlobals.forEach(loadCSS(document.head));
	loadFacebookSDK();
	loadDisqus();
};

class FactoryArtCss extends HTMLElement {
	constructor() {
		super();
		this.attachShadow({ mode: 'open' });
		this.loadCSS = loadCSS(this.shadowRoot);
		this.shadowRoot.innerHTML = `
		<style>	
			.thumbnail {
				z-index: 1;
				cursor: zoom-out;
				transition: all 200ms ease;
			}
			.thumbnail.smart_thumbnail {
				transform: scale(-0.5, 0.5);
				cursor: zoom-in;
			}
		</style>
		`
	}
	static get observedAttributes() {
		return ["cssart", "view"]
	}
	attributeChangedCallback(nameAtr, oldValue, newValue) {
		if (this[nameAtr] instanceof Function) 
			this[nameAtr](oldValue, newValue);
	}
	cssart(oldValue, newValue) {
		this.loadCSS(`./template/css-art-${newValue}/main.css`);
		loadTextFile(`./template/css-art-${newValue}/main.html`)
			.then(result => this.shadowRoot.innerHTML += result)
			.finally(() => this.load())
	}
	view(oldValue, newValue) {
		const size = Number(newValue) * 0.0066;
		this.shadowRoot.host.style.cssText = `
			--view: calc((100vmin - (var(--size) * 2)) * ${size});
		`;
	}
	load() {
		addZoomEvent(this.shadowRoot.querySelector(".thumbnail"));
	}
}
window.customElements.define('holberton-school-art-css', FactoryArtCss);

// load Dom
document.addEventListener("DOMContentLoaded", () => {
	switch(location.pathname) {
		case "/": case "":
			import("./js/index.js").then(runMain);
			break;
		case "/tweets.html": case "/tweets":
			import("./js/tweets.js").then(runMain);
			break;
		default:
			import("./js/404.js").then(runMain);
			break;
	}
	allPages();
});
