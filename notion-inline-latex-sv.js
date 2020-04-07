// right-padding for inline math mode
var style = document.createElement('style');
style.innerHTML = '.katex{padding-right:0!important;}';
document.head.appendChild(style);

// declare/init vars
let timer; // timer identifier
let startUpWaitTime = 3000; // ms after startup (adjust as needed)
let pageChangeWaitTime = 1500; // ms after page changed (adjust as needed)
let backupRender;
let backupRenderWaitTime = 6000;

// render inline LaTeX
function renderInlineLaTeX() {
    renderMathInElement(document.body, {
        delimiters: [
            // LaTeX delimiters (uncomment/add as needed)
            {
                left: "$$",
                right: "$$",
                display: true
            },
            // { left: "\\[", right: "\\]", display: true  },
            // { left: "\\(", right: "\\)", display: false },
            {
                left: "$",
                right: "$",
                display: false
            }
        ]
    });
    console.log("Inline LaTeX is rendered.");
}

let url = window.location.href;

['click', 'popstate'].forEach(evt =>
    window.addEventListener(evt, function() {
        requestAnimationFrame(() => {
            if (url !== location.href) {
                renderOnPageChange();
            }
            url = location.href;
        });
    }, true)
);

function renderOnLoad() {
    console.log("Rendering inline LaTeX on startup...");
    clearTimeout(timer);
    timer = setTimeout(renderInlineLaTeX, startUpWaitTime);
    backupRendering();
}

function renderOnPageChange() {
    console.log("Rendering inline LaTeX on navigation...");
    clearTimeout(timer);
    timer = setTimeout(renderInlineLaTeX, pageChangeWaitTime);
    backupRendering();
}

function backupRendering() {
    clearTimeout(backupRender);
    backupRender = setTimeout(function() {
        console.log("Rerendering just in case...");
        renderInlineLaTeX();
    }, backupRenderWaitTime);
}

// on startup...
window.addEventListener("DOMContentLoaded", renderOnLoad);