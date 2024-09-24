(() => {
	const srcPath = document.currentScript.src;
	const srcBasePath = srcPath.split('/').slice(0, -1).join('/');
	const syntaxFont = new FontFace(
		'FontWithASyntaxHighlighter',
		`url('${srcBasePath}/FontWithASyntaxHighlighter-Regular.woff2') format('woff2')`
	);
	document.fonts.add(syntaxFont);
})();

class TextareaCodeBlock extends HTMLElement {
	constructor() {
		super();

		this.attachShadow({ mode: 'open' });
		const slotElement = document.createElement('slot');
		const styleElement = document.createElement('style');
		styleElement.innerHTML = `
			::slotted(textarea) {
				color-scheme: dark;
				font-family: 'FontWithASyntaxHighlighter', monospace;
				box-sizing: border-box;
				width: 100%;
				padding: 2em;
				resize: none;
			}
		`;
		this.shadowRoot.append(styleElement, slotElement);
	}

	connectedCallback() {
		const textarea = this.querySelector('textarea');
		if (textarea) {
			this.processTextarea();
		}
	}

	processTextarea() {
		const textarea = this.querySelector('textarea');
		if (!textarea) {
			throw Error('No slotted textarea element found');
		}
		textarea.readOnly = true;

		// get the lines (will be used for other processing)
		let lines = textarea.value.split('\n');

		// remove any empty lines (usually from the start and end tags)
		lines = lines.filter((line) => line.trim().length > 0);

		// set the number of rows based on the number of lines
		const numOfLines = lines.length;
		textarea.rows = numOfLines;

		// trim the common leading space across all lines
		const lineLeadingSpace = (line) => line.match(/^\s+/)[0].length;
		let commonLead = lineLeadingSpace(lines.at(0));
		lines.forEach((line) => {
			const leadingSpaceForLine = lineLeadingSpace(line);
			commonLead = Math.min(commonLead, leadingSpaceForLine);
		});
		lines = lines.map((line) => line.slice(commonLead));

		// update the textarea with the updated lines
		textarea.value = lines.join('\n');
	}
}

customElements.define('code-block', TextareaCodeBlock);
