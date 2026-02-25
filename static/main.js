document.addEventListener("DOMContentLoaded", () => {
    // 1. Gamification & Tracking State
    const currentPath = window.location.pathname;

    let userXP = window.StorageAPI.getUserXP();
    const scoreDisplay = document.getElementById('user-score');

    function updateXPDisplay(amount) {
        userXP = window.StorageAPI.addXP(amount);
        if (scoreDisplay) {
            scoreDisplay.textContent = userXP + ' XP';
            // Simple animation
            scoreDisplay.classList.add('text-green-500', 'scale-110');
            setTimeout(() => scoreDisplay.classList.remove('text-green-500', 'scale-110'), 300);
        }
    }

    if (scoreDisplay) scoreDisplay.textContent = userXP + ' XP';

    // 2. Track page visits & XP
    if (currentPath.startsWith('/go/')) {
        const decodedPath = decodeURIComponent(currentPath);
        window.StorageAPI.trackPageVisit(decodedPath,
            () => updateXPDisplay(50), // 50 XP for completing a new lesson!
            () => updateXPDisplay(5)   // 5 XP for reviewing an old lesson!
        );
    }

    // 3. Mark links in sidebar as completed with read counts
    const sidebarLinks = document.querySelectorAll('aside a');
    const readCounts = window.StorageAPI.getReadCounts();
    sidebarLinks.forEach(link => {
        // HTMX links or Standard Links
        const href = decodeURIComponent(link.getAttribute('href') || '');
        if (readCounts[href] > 0) {
            const count = readCounts[href];
            const badge = document.createElement('span');
            badge.innerHTML = `
                <div class="flex items-center gap-1.5 ml-auto shrink-0">
                    <span class="text-[10px] font-bold text-slate-400 bg-slate-200 dark:bg-slate-700 dark:text-slate-300 px-1.5 py-0.5 rounded" title="Times Read">${count}x</span>
                    <svg class="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                </div>
            `;
            if (!link.classList.contains('flex')) {
                link.classList.add('flex', 'justify-between', 'items-center', 'w-full');
            }
            link.appendChild(badge);
        }
    });

    // Default Go code
    const defaultCode = `package main

import "fmt"

func main() {
	fmt.Println("Hello, Go!")
}
`;

    // Load any saved code for the current page
    let pageCode = window.StorageAPI.getCode(currentPath) || defaultCode;

    require(['vs/editor/editor.main'], function () {
        // Initialize Monaco Editor
        const isDark = document.documentElement.classList.contains('dark');
        window.editor = monaco.editor.create(document.getElementById('editor'), {
            value: pageCode,
            language: 'go',
            theme: isDark ? 'vs-dark' : 'vs',
            automaticLayout: true,
            minimap: { enabled: false },
            fontSize: 14,
            fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
            scrollBeyondLastLine: false,
            roundedSelection: false,
            padding: { top: 16 }
        });

        // Save progress to local storage when code changes
        window.editor.onDidChangeModelContent(() => {
            const code = window.editor.getValue();
            window.StorageAPI.saveCode(currentPath, code);

            // Live update the code snippet in the article if one is actively selected!
            if (window.currentEditingSnippetIndex !== undefined) {
                const index = window.currentEditingSnippetIndex;
                window.StorageAPI.saveSnippet(currentPath, index, code);

                const codeBlocks = document.querySelectorAll('article pre');
                if (codeBlocks[index]) {
                    const codeNode = codeBlocks[index].querySelector('code') || codeBlocks[index];
                    codeNode.textContent = code;
                    if (window.Prism) Prism.highlightElement(codeNode);
                }
            }
        });

        // Setup HTMX integration inside the require block since window.editor is set here
        const codeInput = document.getElementById('code-input');

        // Sync editor content to the hidden textarea before HTMX request
        document.body.addEventListener('htmx:configRequest', function (evt) {
            if (evt.detail.path === '/api/run') {
                codeInput.value = window.editor.getValue();
                evt.detail.parameters['code'] = window.editor.getValue();
            }
        });

        // Grant XP for practicing code
        document.body.addEventListener('htmx:afterRequest', function (evt) {
            if (evt.detail.path === '/api/run' && evt.detail.successful) {
                updateXPDisplay(10); // 10 XP for practicing code
            }
        });
    });

    // Make the pane resizable (simple implementation)
    const divider = document.querySelector('.cursor-row-resize');
    const editorContainer = document.getElementById('editor');
    const outputContainer = document.querySelector('.h-\\[40\\%\\]');
    let isResizing = false;

    divider.addEventListener('mousedown', (e) => {
        isResizing = true;
        document.body.style.cursor = 'row-resize';
    });

    document.addEventListener('mousemove', (e) => {
        if (!isResizing) return;

        const section = document.querySelector('section');
        const sectionRect = section.getBoundingClientRect();

        // Calculate new heights (accounting for action bar)
        let newEditorHeight = e.clientY - sectionRect.top - 56; // 56px is action bar height

        // Add constraints
        if (newEditorHeight < 100) newEditorHeight = 100;
        if (sectionRect.height - newEditorHeight - 56 < 100) newEditorHeight = sectionRect.height - 156;

        const percentage = (newEditorHeight / (sectionRect.height - 56)) * 100;

        editorContainer.style.height = `${percentage}%`;
        editorContainer.style.flex = 'none';

        outputContainer.style.height = `${100 - percentage}%`;
        outputContainer.style.flex = 'none';

        // Tell Monaco to resize
        window.editor.layout();
    });

    document.addEventListener('mouseup', () => {
        isResizing = false;
        document.body.style.cursor = 'default';
    });
});
